from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentRegistryResponse(BaseModel):
    id: str
    filename: str
    stored_filename: str
    file_size_bytes: int
    mime_type: str
    file_hash: str
    document_type: str
    standard_number: Optional[str] = None
    edition: Optional[str] = None
    revision: Optional[str] = None
    source_url: Optional[str] = None
    page_count: Optional[int] = None
    ingestion_status: str
    verification_status: str
    created_at: datetime
    metadata_json: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    file_hash: str
    file_size_bytes: int
    mime_type: str
    document_type: str
    ingestion_status: str
    verification_status: str
    page_count: Optional[int] = None
    metadata_json: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)
