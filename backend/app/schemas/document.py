from typing import Optional, Dict, Any
from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    stored_filename: str
    file_size_bytes: int
    mime_type: str
    document_type: str
    parsing_status: str
    page_count: Optional[int] = None
    metadata_json: Dict[str, Any] = {}
