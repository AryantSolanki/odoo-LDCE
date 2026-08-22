from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class CategoryBreakdownItem(BaseModel):
    category: str
    amount: float
    percentage: float


class BudgetItemDetail(BaseModel):
    id: Optional[int] = None
    title: str
    category: str
    amount: float
    notes: Optional[str] = None


class BudgetBreakdown(BaseModel):
    trip_id: int
    trip_title: str
    budget_limit: float
    total_days: int
    
    # Required calculation metrics
    transport: float
    stay: float
    activities: float
    meals: float
    other_expenses: float
    
    total_estimated_cost: float
    average_daily_cost: float
    over_budget: bool
    budget_difference: float
    
    # Detailed category breakdown array for charts/frontend UI
    categories: List[CategoryBreakdownItem]
    
    # Itemized details
    items: List[BudgetItemDetail] = []

    model_config = ConfigDict(from_attributes=True)
