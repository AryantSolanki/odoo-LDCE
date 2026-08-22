from typing import List
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.stop import TripStop
from app.schemas.budget import BudgetBreakdown, CategoryBreakdownItem, BudgetItemDetail


def calculate_trip_budget(db: Session, trip: Trip) -> BudgetBreakdown:
    # Calculate trip duration
    total_days = max(1, (trip.end_date - trip.start_date).days + 1)
    
    transport_total = 0.0
    stay_total = 0.0
    activities_total = 0.0
    estimated_meals = 0.0
    other_expenses_total = 0.0
    
    items: List[BudgetItemDetail] = []
    
    # Process stops for transport, stay, and city-based estimated meal costs
    for stop in trip.stops:
        stop_days = max(1, (stop.end_date - stop.start_date).days)
        
        # Transport
        if stop.transport_cost > 0:
            transport_total += stop.transport_cost
            city_name = stop.city.name if stop.city else "Stop"
            items.append(BudgetItemDetail(
                id=stop.id,
                title=f"Transport to {city_name} ({stop.transport_mode})",
                category="Transport",
                amount=stop.transport_cost,
                notes=stop.notes
            ))
            
        # Stay
        stay_cost = stop_days * stop.stay_cost_per_night
        if stay_cost > 0:
            stay_total += stay_cost
            city_name = stop.city.name if stop.city else "Stop"
            items.append(BudgetItemDetail(
                id=stop.id,
                title=f"Accommodation in {city_name} ({stop_days} night(s) @ ${stop.stay_cost_per_night:.2f}/night)",
                category="Stay",
                amount=stay_cost,
                notes=stop.notes
            ))
            
        # Activities inside stop
        for act in stop.trip_activities:
            if act.cost > 0:
                activities_total += act.cost
                items.append(BudgetItemDetail(
                    id=act.id,
                    title=f"Activity: {act.title}",
                    category="Activities",
                    amount=act.cost,
                    notes=act.notes
                ))

        # Estimated Meal costs for stop duration based on city avg meal cost (3 meals/day default)
        if stop.city:
            meal_cost_for_stop = stop_days * (stop.city.avg_meal_cost * 3.0)
            estimated_meals += meal_cost_for_stop
            items.append(BudgetItemDetail(
                id=stop.id,
                title=f"Estimated Meals in {stop.city.name} ({stop_days} days @ ${stop.city.avg_meal_cost * 3:.2f}/day)",
                category="Meals",
                amount=meal_cost_for_stop,
                notes="Calculated based on city average meal cost"
            ))

    # Process custom logged expenses
    for exp in trip.expenses:
        cat_lower = exp.category.lower()
        if "transport" in cat_lower:
            transport_total += exp.amount
        elif "stay" in cat_lower or "hotel" in cat_lower or "lodging" in cat_lower:
            stay_total += exp.amount
        elif "activity" in cat_lower or "tour" in cat_lower:
            activities_total += exp.amount
        elif "meal" in cat_lower or "food" in cat_lower:
            estimated_meals += exp.amount
        else:
            other_expenses_total += exp.amount

        items.append(BudgetItemDetail(
            id=exp.id,
            title=f"Expense: {exp.description or exp.category}",
            category=exp.category.capitalize(),
            amount=exp.amount,
            notes=exp.description
        ))

    total_estimated_cost = transport_total + stay_total + activities_total + estimated_meals + other_expenses_total
    average_daily_cost = total_estimated_cost / total_days
    
    over_budget = (trip.budget_limit > 0) and (total_estimated_cost > trip.budget_limit)
    budget_difference = trip.budget_limit - total_estimated_cost if trip.budget_limit > 0 else 0.0

    # Build category breakdown percentage array
    categories: List[CategoryBreakdownItem] = []
    cat_map = [
        ("Transport", transport_total),
        ("Stay", stay_total),
        ("Activities", activities_total),
        ("Meals", estimated_meals),
        ("Other", other_expenses_total),
    ]
    
    for cat_name, amt in cat_map:
        pct = (amt / total_estimated_cost * 100.0) if total_estimated_cost > 0 else 0.0
        categories.append(CategoryBreakdownItem(
            category=cat_name,
            amount=round(amt, 2),
            percentage=round(pct, 1)
        ))

    return BudgetBreakdown(
        trip_id=trip.id,
        trip_title=trip.title,
        budget_limit=round(trip.budget_limit, 2),
        total_days=total_days,
        transport=round(transport_total, 2),
        stay=round(stay_total, 2),
        activities=round(activities_total, 2),
        meals=round(estimated_meals, 2),
        other_expenses=round(other_expenses_total, 2),
        total_estimated_cost=round(total_estimated_cost, 2),
        average_daily_cost=round(average_daily_cost, 2),
        over_budget=over_budget,
        budget_difference=round(budget_difference, 2),
        categories=categories,
        items=items
    )
