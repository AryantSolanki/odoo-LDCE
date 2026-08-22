import datetime
from sqlalchemy.orm import Session
from app.database.connection import engine, SessionLocal
from app.database.base import Base
from app.models import User, City, Activity, Trip, TripStop, TripActivity, Expense
from app.auth.security import get_password_hash


def seed_database():
    print("[+] Re-creating database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        print("[+] Seeding cities...")
        paris = City(
            name="Paris",
            country="France",
            latitude=48.8566,
            longitude=2.3522,
            image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
            description="The City of Light, famous for its romance, gastronomy, art museums, and iconic Eiffel Tower.",
            avg_daily_cost=150.0,
            avg_meal_cost=30.0
        )
        tokyo = City(
            name="Tokyo",
            country="Japan",
            latitude=35.6762,
            longitude=139.6503,
            image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
            description="A dazzling ultra-modern metropolis blending neon skyscrapers, ancient historic temples, and exquisite cuisine.",
            avg_daily_cost=130.0,
            avg_meal_cost=20.0
        )
        new_york = City(
            name="New York City",
            country="United States",
            latitude=40.7128,
            longitude=-74.0060,
            image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
            description="The Big Apple, featuring Central Park, Broadway shows, world-class nightlife, and iconic skyline views.",
            avg_daily_cost=200.0,
            avg_meal_cost=35.0
        )
        rome = City(
            name="Rome",
            country="Italy",
            latitude=41.9028,
            longitude=12.4964,
            image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
            description="The Eternal City, renowned for millennia of history, ancient Colosseum ruins, and delicious authentic pasta.",
            avg_daily_cost=120.0,
            avg_meal_cost=25.0
        )
        barcelona = City(
            name="Barcelona",
            country="Spain",
            latitude=41.3851,
            longitude=2.1734,
            image_url="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
            description="Vibrant seaside city known for Gaudi architecture, sunny beaches, tapas bars, and lively night street culture.",
            avg_daily_cost=110.0,
            avg_meal_cost=22.0
        )
        london = City(
            name="London",
            country="United Kingdom",
            latitude=51.5074,
            longitude=-0.1278,
            image_url="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
            description="Historic royal capital along the Thames featuring Big Ben, the London Eye, West End theatres, and pub culture.",
            avg_daily_cost=180.0,
            avg_meal_cost=32.0
        )
        bali = City(
            name="Bali",
            country="Indonesia",
            latitude=-8.4095,
            longitude=115.1889,
            image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
            description="Tropical island paradise known for lush rice terraces, serene Hindu temples, surfing, and wellness retreats.",
            avg_daily_cost=60.0,
            avg_meal_cost=10.0
        )
        sydney = City(
            name="Sydney",
            country="Australia",
            latitude=-33.8688,
            longitude=151.2093,
            image_url="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
            description="Stunning coastal harbor city home to Bondi Beach, Sydney Opera House, and breathtaking coastal walks.",
            avg_daily_cost=160.0,
            avg_meal_cost=28.0
        )

        db.add_all([paris, tokyo, new_york, rome, barcelona, london, bali, sydney])
        db.commit()
        for c in [paris, tokyo, new_york, rome, barcelona, london, bali, sydney]:
            db.refresh(c)

        print("[+] Seeding city activities...")
        activities = [
            # Paris
            Activity(
                city_id=paris.id,
                title="Eiffel Tower Summit Access",
                description="Ascend to top of the Eiffel Tower for panoramic 360-degree views across Paris.",
                category="Sightseeing",
                cost=30.0,
                duration_hours=2.5,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1543349689-9a4d426bee8e"
            ),
            Activity(
                city_id=paris.id,
                title="Louvre Museum Timed Ticket",
                description="Explore world-famous masterpieces including the Mona Lisa and Venus de Milo.",
                category="Culture",
                cost=22.0,
                duration_hours=4.0,
                rating=4.8,
                image_url="https://images.unsplash.com/photo-1499856871958-5b9627545d1a"
            ),
            Activity(
                city_id=paris.id,
                title="Seine River Sunset Cruise",
                description="Glide past illuminated monuments with a glass of champagne along the Seine.",
                category="Experience",
                cost=45.0,
                duration_hours=1.5,
                rating=4.7,
                image_url="https://images.unsplash.com/photo-1509299349698-ab22323ae696"
            ),
            Activity(
                city_id=paris.id,
                title="Montmartre Bakery Walking Tour",
                description="Taste fresh croissants, pain au chocolat, and macarons with a local baker.",
                category="Food",
                cost=55.0,
                duration_hours=3.0,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1555507036-ab1f4038808a"
            ),

            # Tokyo
            Activity(
                city_id=tokyo.id,
                title="Senso-ji Temple & Asakusa Stroll",
                description="Visit Tokyo's oldest Buddhist temple and explore vibrant Nakamise shopping street.",
                category="Culture",
                cost=0.0,
                duration_hours=2.0,
                rating=4.8,
                image_url="https://images.unsplash.com/photo-1536098561742-ca998e48cbcc"
            ),
            Activity(
                city_id=tokyo.id,
                title="Shibuya Crossing & Skytree Observation Deck",
                description="Experience the world's busiest pedestrian crossing followed by Tokyo Skytree panorama.",
                category="Sightseeing",
                cost=25.0,
                duration_hours=3.0,
                rating=4.8,
                image_url="https://images.unsplash.com/photo-1542051841857-5f90071e7989"
            ),
            Activity(
                city_id=tokyo.id,
                title="Tsukiji Outer Market Food Tour",
                description="Sample fresh sushi, tamagoyaki, and wagyu beef skewers from market artisans.",
                category="Food",
                cost=60.0,
                duration_hours=2.5,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c"
            ),
            Activity(
                city_id=tokyo.id,
                title="teamLab Planets Immersive Art",
                description="Walk through water and interact with digital body-immersive light art installations.",
                category="Entertainment",
                cost=38.0,
                duration_hours=2.0,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1518709268805-4e9042af9f23"
            ),

            # Rome
            Activity(
                city_id=rome.id,
                title="Colosseum & Roman Forum Priority Entry",
                description="Skip-the-line access to the ancient gladiatorial arena and Senate ruins.",
                category="History",
                cost=35.0,
                duration_hours=3.0,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5"
            ),
            Activity(
                city_id=rome.id,
                title="Vatican Museums & Sistine Chapel",
                description="Marvel at Michelangelo's ceiling frescoes and Renaissance papal collections.",
                category="Culture",
                cost=40.0,
                duration_hours=3.5,
                rating=4.8,
                image_url="https://images.unsplash.com/photo-1531572753322-ad063cecc140"
            ),
            Activity(
                city_id=rome.id,
                title="Trastevere Pasta & Gelato Masterclass",
                description="Learn to make handmade tagliatelle and authentic Italian gelato from scratch.",
                category="Food",
                cost=75.0,
                duration_hours=3.0,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1551183053-bf91a1d81141"
            ),

            # Barcelona
            Activity(
                city_id=barcelona.id,
                title="Sagrada Familia Fast-Track & Tower Access",
                description="Explore Antoni Gaudi's unfinished basilica masterpiece and climb the towers.",
                category="Architecture",
                cost=36.0,
                duration_hours=2.0,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1583422409516-2895a77efded"
            ),
            Activity(
                city_id=barcelona.id,
                title="Park Guell Monumental Zone Pass",
                description="Stroll through Gaudi's whimsical mosaic park overlooking the Mediterranean Sea.",
                category="Sightseeing",
                cost=14.0,
                duration_hours=2.0,
                rating=4.7,
                image_url="https://images.unsplash.com/photo-1564221710304-0b37c8b9d729"
            ),

            # New York
            Activity(
                city_id=new_york.id,
                title="Summit One Vanderbilt Observation Deck",
                description="Experience mirrored glass rooms and panoramic views of Manhattan skyline.",
                category="Sightseeing",
                cost=48.0,
                duration_hours=2.0,
                rating=4.8,
                image_url="https://images.unsplash.com/photo-1534430480872-3498386e7856"
            ),
            Activity(
                city_id=new_york.id,
                title="Broadway Musical Show Ticket",
                description="Watch a world-renowned musical live on stage in the heart of Times Square.",
                category="Entertainment",
                cost=120.0,
                duration_hours=3.0,
                rating=4.9,
                image_url="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf"
            )
        ]

        db.add_all(activities)
        db.commit()

        print("[+] Seeding demo user and admin user...")
        demo_user = User(
            email="demo@globetrotter.com",
            hashed_password=get_password_hash("password123"),
            full_name="Alex Morgan"
        )
        admin_user = User(
            email="admin@globetrotter.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin System Director"
        )
        db.add_all([demo_user, admin_user])
        db.commit()
        db.refresh(demo_user)
        db.refresh(admin_user)


        print("[+] Seeding demo European Multi-City trip...")
        start_dt = datetime.date.today() + datetime.timedelta(days=30)
        end_dt = start_dt + datetime.timedelta(days=9)

        demo_trip = Trip(
            user_id=demo_user.id,
            title="European Grand Discovery Tour",
            description="An epic 10-day journey exploring historic Paris, romantic Rome, and sunny Barcelona.",
            start_date=start_dt,
            end_date=end_dt,
            budget_limit=2500.0,
            is_public=True
        )
        db.add(demo_trip)
        db.commit()
        db.refresh(demo_trip)

        # Add 3 stops to trip
        stop1_start = start_dt
        stop1_end = start_dt + datetime.timedelta(days=3)
        
        stop2_start = stop1_end
        stop2_end = stop2_start + datetime.timedelta(days=3)
        
        stop3_start = stop2_end
        stop3_end = end_dt

        stop1 = TripStop(
            trip_id=demo_trip.id,
            city_id=paris.id,
            order_index=0,
            start_date=stop1_start,
            end_date=stop1_end,
            transport_mode="Flight",
            transport_cost=250.0,
            stay_cost_per_night=120.0,
            notes="Hotel near Eiffel Tower. Book Paris Museum Pass in advance."
        )
        stop2 = TripStop(
            trip_id=demo_trip.id,
            city_id=rome.id,
            order_index=1,
            start_date=stop2_start,
            end_date=stop2_end,
            transport_mode="Train (High Speed)",
            transport_cost=90.0,
            stay_cost_per_night=95.0,
            notes="Stay in Trastevere neighborhood for amazing local dining."
        )
        stop3 = TripStop(
            trip_id=demo_trip.id,
            city_id=barcelona.id,
            order_index=2,
            start_date=stop3_start,
            end_date=stop3_end,
            transport_mode="Flight",
            transport_cost=110.0,
            stay_cost_per_night=105.0,
            notes="Hotel near Gothic Quarter. Don't forget sunscreen!"
        )

        db.add_all([stop1, stop2, stop3])
        db.commit()
        for s in [stop1, stop2, stop3]:
            db.refresh(s)

        # Add trip activities to stops
        paris_activities = db.query(Activity).filter(Activity.city_id == paris.id).all()
        rome_activities = db.query(Activity).filter(Activity.city_id == rome.id).all()
        barcelona_activities = db.query(Activity).filter(Activity.city_id == barcelona.id).all()

        act1 = TripActivity(
            stop_id=stop1.id,
            activity_id=paris_activities[0].id if paris_activities else None,
            title="Eiffel Tower Summit Access",
            cost=30.0,
            date=stop1_start + datetime.timedelta(days=1),
            notes="Sunset booking reserved for 6:30 PM",
            is_completed=False
        )
        act2 = TripActivity(
            stop_id=stop1.id,
            activity_id=paris_activities[1].id if len(paris_activities) > 1 else None,
            title="Louvre Museum Timed Ticket",
            cost=22.0,
            date=stop1_start + datetime.timedelta(days=2),
            notes="Morning entry at 9:30 AM",
            is_completed=False
        )
        act3 = TripActivity(
            stop_id=stop2.id,
            activity_id=rome_activities[0].id if rome_activities else None,
            title="Colosseum & Roman Forum Priority Entry",
            cost=35.0,
            date=stop2_start + datetime.timedelta(days=1),
            notes="Guided tour included",
            is_completed=False
        )
        act4 = TripActivity(
            stop_id=stop3.id,
            activity_id=barcelona_activities[0].id if barcelona_activities else None,
            title="Sagrada Familia Fast-Track",
            cost=36.0,
            date=stop3_start + datetime.timedelta(days=1),
            notes="Audio guide downloaded on phone",
            is_completed=False
        )

        db.add_all([act1, act2, act3, act4])

        # Add logged expenses
        exp1 = Expense(
            trip_id=demo_trip.id,
            category="Other",
            amount=50.0,
            date=start_dt + datetime.timedelta(days=1),
            description="Travel SIM card & Metro passes"
        )
        db.add(exp1)

        db.commit()
        print("[SUCCESS] Database seeding complete!")
        print("[INFO] Demo Login Email: demo@globetrotter.com | Password: password123")
        print(f"[INFO] Shared Trip Public Link Token: {demo_trip.public_id}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
