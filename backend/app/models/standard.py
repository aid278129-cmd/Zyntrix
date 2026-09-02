from typing import Optional, List
from datetime import date
from sqlalchemy import String, Text, Boolean, Date, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base


class Standard(Base):
    """Authoritative Indian Standard (IS) catalog entry."""

    __tablename__ = "standards"

    standard_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # e.g. IS 17526:2021
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    
    # BIS Scheme: Scheme I (ISI Mark), Scheme II (CRS), Scheme IV, etc.
    scheme: Mapped[str] = mapped_column(String(50), default="Scheme I")
    is_mandatory_qco: Mapped[bool] = mapped_column(Boolean, default=False)
    qco_notification_number: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    
    version: Mapped[str] = mapped_column(String(50), default="current")
    effective_from: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")  # ACTIVE | WITHDRAWN | REVISED

    clauses: Mapped[List["Clause"]] = relationship(
        "Clause", back_populates="standard", cascade="all, delete-orphan"
    )
