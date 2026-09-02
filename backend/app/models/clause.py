from typing import Optional, List
from sqlalchemy import String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base


class Clause(Base):
    """Clause-level granularity representation within an Indian Standard."""

    __tablename__ = "clauses"

    standard_id: Mapped[str] = mapped_column(String(36), ForeignKey("standards.id"), index=True, nullable=False)
    clause_number: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # e.g. "4.1", "5.2.3"
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    section: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    text_content: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Metadata for provenance & vector indexing
    version: Mapped[str] = mapped_column(String(50), default="1.0")
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)

    standard: Mapped["Standard"] = relationship("Standard", back_populates="clauses")
    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="clause", cascade="all, delete-orphan"
    )
