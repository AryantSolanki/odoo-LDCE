import datetime
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_auth_flow():
    # 1. Register
    email = f"testuser_{datetime.datetime.now().timestamp()}@example.com"
    reg_payload = {
        "email": email,
        "password": "SecretPassword123!",
        "full_name": "Test Runner"
    }
    reg_res = client.post("/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    token = reg_data["access_token"]
    assert reg_data["user"]["email"] == email

    # 2. Login
    login_payload = {
        "email": email,
        "password": "SecretPassword123!"
    }
    login_res = client.post("/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 3. Get /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email


def test_cities_and_activities():
    # Get seeded cities
    cities_res = client.get("/cities")
    assert cities_res.status_code == 200
    cities = cities_res.json()
    assert len(cities) >= 1

    city_id = cities[0]["id"]
    city_detail = client.get(f"/cities/{city_id}")
    assert city_detail.status_code == 200
    assert city_detail.json()["id"] == city_id

    # Filter activities by city
    activities_res = client.get(f"/activities?city_id={city_id}")
    assert activities_res.status_code == 200
    assert isinstance(activities_res.json(), list)


def test_trip_crud_and_validations():
    # Register & get auth token
    email = f"triptest_{datetime.datetime.now().timestamp()}@example.com"
    reg_res = client.post("/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "Trip Tester"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    today = datetime.date.today()
    start_str = (today + datetime.timedelta(days=10)).isoformat()
    end_str = (today + datetime.timedelta(days=20)).isoformat()

    # 1. Invalid trip dates (start > end)
    invalid_trip = {
        "title": "Invalid Trip",
        "start_date": end_str,
        "end_date": start_str,
        "budget_limit": 1000.0
    }
    inv_res = client.post("/trips", json=invalid_trip, headers=headers)
    assert inv_res.status_code == 422

    # 2. Create valid trip
    valid_trip = {
        "title": "Asian Vacation",
        "description": "Visiting Tokyo and Bali",
        "start_date": start_str,
        "end_date": end_str,
        "budget_limit": 3000.0,
        "is_public": False
    }
    create_res = client.post("/trips", json=valid_trip, headers=headers)
    assert create_res.status_code == 201
    trip_data = create_res.json()
    trip_id = trip_data["id"]
    assert trip_data["title"] == "Asian Vacation"

    # 3. Get cities to attach stop
    cities = client.get("/cities").json()
    city_id = cities[0]["id"]

    # 4. Add stop with dates OUTSIDE trip bounds (should fail with 400)
    invalid_stop = {
        "city_id": city_id,
        "start_date": (today + datetime.timedelta(days=5)).isoformat(),  # before trip start
        "end_date": (today + datetime.timedelta(days=12)).isoformat(),
        "transport_mode": "Flight",
        "transport_cost": 200.0,
        "stay_cost_per_night": 100.0
    }
    stop_inv_res = client.post(f"/trips/{trip_id}/stops", json=invalid_stop, headers=headers)
    assert stop_inv_res.status_code == 400

    # 5. Add valid stop
    valid_stop = {
        "city_id": city_id,
        "start_date": (today + datetime.timedelta(days=11)).isoformat(),
        "end_date": (today + datetime.timedelta(days=15)).isoformat(),
        "transport_mode": "Flight",
        "transport_cost": 250.0,
        "stay_cost_per_night": 120.0,
        "notes": "Booked hotel near center"
    }
    stop_res = client.post(f"/trips/{trip_id}/stops", json=valid_stop, headers=headers)
    assert stop_res.status_code == 201
    stop_data = stop_res.json()
    stop_id = stop_data["id"]

    # 6. Add activity outside stop bounds (should fail with 400)
    invalid_activity = {
        "title": "Early Tour",
        "date": (today + datetime.timedelta(days=10)).isoformat(),  # before stop start
        "cost": 50.0
    }
    act_inv_res = client.post(f"/stops/{stop_id}/activities", json=invalid_activity, headers=headers)
    assert act_inv_res.status_code == 400

    # 7. Add valid activity
    valid_activity = {
        "title": "City Center Tour",
        "date": (today + datetime.timedelta(days=12)).isoformat(),
        "cost": 45.0,
        "notes": "Starts at 10 AM"
    }
    act_res = client.post(f"/stops/{stop_id}/activities", json=valid_activity, headers=headers)
    assert act_res.status_code == 201
    act_id = act_res.json()["id"]

    # 8. Check Budget calculation endpoint
    budget_res = client.get(f"/trips/{trip_id}/budget", headers=headers)
    assert budget_res.status_code == 200
    budget = budget_res.json()
    assert budget["transport"] == 250.0
    assert budget["stay"] == 4 * 120.0  # 4 nights * 120
    assert budget["activities"] == 45.0
    assert budget["total_estimated_cost"] > 0
    assert "average_daily_cost" in budget
    assert "over_budget" in budget

    # 9. Check Timeline endpoint
    timeline_res = client.get(f"/trips/{trip_id}/timeline", headers=headers)
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert len(timeline["days"]) == 11  # 10 to 20 inclusive = 11 days

    # 10. Check Public Sharing
    share_res = client.post(f"/trips/{trip_id}/share", headers=headers)
    assert share_res.status_code == 200
    public_id = share_res.json()["public_id"]

    # Anonymous user access to shared trip
    shared_trip_res = client.get(f"/shared/{public_id}")
    assert shared_trip_res.status_code == 200
    assert shared_trip_res.json()["title"] == "Asian Vacation"
