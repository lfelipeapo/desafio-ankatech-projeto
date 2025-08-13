from __future__ import annotations
from datetime import date, datetime
from typing import List
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
import sys
import os

# Adiciona o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import Base

class Client(Base):
    __tablename__ = "clients"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    allocations: Mapped[List["Allocation"]] = relationship(back_populates="client", cascade="all, delete-orphan")

class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = (UniqueConstraint("ticker"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    allocations: Mapped[List["Allocation"]] = relationship(back_populates="asset", cascade="all, delete-orphan")
    daily_returns: Mapped[List["DailyReturn"]] = relationship(back_populates="asset", cascade="all, delete-orphan")

class Allocation(Base):
    __tablename__ = "allocations"
    __table_args__ = (UniqueConstraint("client_id", "asset_id", "purchase_date"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), nullable=False)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    purchase_price: Mapped[float] = mapped_column(Float, nullable=False)
    purchase_date: Mapped[date] = mapped_column(Date, nullable=False)
    client: Mapped[Client] = relationship(back_populates="allocations")
    asset: Mapped[Asset] = relationship(back_populates="allocations")

class DailyReturn(Base):
    __tablename__ = "daily_returns"
    __table_args__ = (UniqueConstraint("asset_id", "date"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    close_price: Mapped[float] = mapped_column(Float, nullable=False)
    asset: Mapped[Asset] = relationship(back_populates="daily_returns")
