from __future__ import annotations
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class ClientBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class ClientOut(ClientBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True

class AssetBase(BaseModel):
    ticker: str = Field(..., max_length=32)
    name: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None

class AssetOut(AssetBase):
    id: int
    class Config: from_attributes = True

class AllocationBase(BaseModel):
    client_id: int
    asset_id: int
    quantity: float
    purchase_price: float
    purchase_date: date

class AllocationCreate(AllocationBase):
    pass

class AllocationUpdate(BaseModel):
    asset_id: Optional[int] = None
    quantity: Optional[float] = None
    purchase_price: Optional[float] = None
    purchase_date: Optional[date] = None

class AllocationOut(AllocationBase):
    id: int
    current_price: Optional[float] = None
    daily_change_pct: Optional[float] = None
    profit_pct: Optional[float] = None
    class Config: from_attributes = True

class DailyReturnBase(BaseModel):
    asset_id: int
    date: date
    close_price: float

class DailyReturnOut(DailyReturnBase):
    id: int
    class Config: from_attributes = True

class PerformancePoint(BaseModel):
    date: date
    cumulative_return: float

class PerformanceOut(BaseModel):
    client_id: int
    points: List[PerformancePoint]

class User(BaseModel):
    username: EmailStr
    full_name: str
    role: str  # admin|read
    disabled: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
