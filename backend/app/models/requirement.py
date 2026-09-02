from typing import Optional, List
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base


class Requirement(Base):
    """Specific measurable technical/safety requirement under a Clause."""

    __tablename__ = "requirements"

    clause_id: Mapped[str] = mapped_column(String(36), ForeignKey("clauses.id"), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # e.g. "REQ-IS17526-001"
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirement_type: Mapped[str] = mapped_column(String(50), default="MANDATORY")  # MANDATORY | CONDITIONAL | OPTIONAL
    test_method_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    clause: Mapped["Clause"] = relationship("Clause", back_populates="requirements")
    tests: Mapped[List["StandardTest"]] = relationship(
        "StandardTest", back_populates="requirement", cascade="all, delete-orphan"
    )
