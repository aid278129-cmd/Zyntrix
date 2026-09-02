from typing import Optional
from sqlalchemy import String, Integer, BigInteger, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import Base


class Document(Base):
    """Uploaded technical document, standard PDF, or test report."""

    __tablename__ = "documents"

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)  # SHA-256 checksum

    # Document classification: standard | test_report | product_spec | bom | qco_order
    document_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    standard_number: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    edition: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    revision: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    page_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Ingestion State: DISCOVERED | DOWNLOADED | EXTRACTED | SEGMENTED | VALIDATED | INDEXED | FAILED | PENDING_VERIFICATION
    ingestion_status: Mapped[str] = mapped_column(String(50), default="DISCOVERED", index=True)

    # Trust / Verification State: UNVERIFIED | PROCESSING | VERIFIED | SUPERSEDED | REQUIRES_REVIEW
    verification_status: Mapped[str] = mapped_column(String(50), default="UNVERIFIED", index=True)

    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
