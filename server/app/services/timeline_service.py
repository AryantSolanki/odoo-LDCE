import datetime
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.schemas.timeline import TimelineResponse, TimelineDay, TimelineEvent


def generate_trip_timeline(db: Session, trip: Trip) -> TimelineResponse:
    start_date = trip.start_date
    end_date = trip.end_date
    total_days = max(1, (end_date - start_date).days + 1)
    
    # Map dates to day objects
    day_map: Dict[datetime.date, TimelineDay] = {}
    current_date = start_date
    day_num = 1
    
    while current_date <= end_date:
        day_map[current_date] = TimelineDay(
            date=current_date,
            day_number=day_num,
            city_name=None,
            events=[]
        )
        current_date += datetime.timedelta(days=1)
        day_num += 1

    # Map stops into timeline
    for stop in trip.stops:
        city_name = stop.city.name if stop.city else "City"
        
        # Mark city in day_map for stop duration
        s_curr = max(start_date, stop.start_date)
        s_end = min(end_date, stop.end_date)
        
        d = s_curr
        while d <= s_end:
            if d in day_map:
                if not day_map[d].city_name:
                    day_map[d].city_name = city_name
            d += datetime.timedelta(days=1)
            
        # Arrival event on stop start date
        if stop.start_date in day_map:
            day_map[stop.start_date].events.append(TimelineEvent(
                id=f"stop-start-{stop.id}",
                event_type="stop_arrival",
                title=f"Arrive in {city_name}",
                description=f"Travel via {stop.transport_mode}. Notes: {stop.notes or 'None'}",
                city_name=city_name,
                cost=stop.transport_cost,
                time="Morning"
            ))
            
        # Departure event on stop end date
        if stop.end_date in day_map and stop.end_date != stop.start_date:
            day_map[stop.end_date].events.append(TimelineEvent(
                id=f"stop-end-{stop.id}",
                event_type="stop_departure",
                title=f"Depart from {city_name}",
                description=f"Check out of stay (${stop.stay_cost_per_night:.2f}/night)",
                city_name=city_name,
                cost=0.0,
                time="Evening"
            ))

        # Add planned trip activities to day timeline
        for act in stop.trip_activities:
            if act.date in day_map:
                day_map[act.date].events.append(TimelineEvent(
                    id=f"activity-{act.id}",
                    event_type="activity",
                    title=act.title,
                    description=act.notes or (act.activity.description if act.activity else None),
                    city_name=city_name,
                    cost=act.cost,
                    time="Flexible",
                    is_completed=act.is_completed
                ))

    # Add logged expenses to timeline
    for exp in trip.expenses:
        if exp.date in day_map:
            day_map[exp.date].events.append(TimelineEvent(
                id=f"expense-{exp.id}",
                event_type="expense",
                title=f"Expense: {exp.category}",
                description=exp.description,
                cost=exp.amount,
                time="Day"
            ))

    # Sort days by date
    days_list = [day_map[d] for d in sorted(day_map.keys())]

    return TimelineResponse(
        trip_id=trip.id,
        trip_title=trip.title,
        start_date=start_date,
        end_date=end_date,
        total_days=total_days,
        days=days_list
    )
