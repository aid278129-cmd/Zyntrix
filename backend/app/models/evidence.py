from typing import Optional
from sqlalchemy import String, Text, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base


class Evidence(Base):
    """Extracted evidence snippet from uploaded reports or authoritative standards."""

    __tablename__ = "evidence"

    document_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("documents.id"), nullable=True)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_text: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Validation status: SUPPORTED | UNVERIFIED | CONTRADICTED | INSUFFICIENT_EVIDENCE
    validation_status: Mapped[str] = mapped_column(String(50), default="UNVERIFIED")
    confidence_score: Mapped[float] = mapped_column(Float, default=1.0)
    
    provenance_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
