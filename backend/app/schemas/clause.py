from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ClauseBase(BaseModel):
    clause_number: str = Field(..., description="Clause number e.g. 4.2.1")
    title: str
    section: Optional[str] = None
    text_content: str
    page_number: Optional[int] = None
    version: str = "1.0"
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class ClauseCreate(ClauseBase):
    standard_id: str


class ClauseResponse(ClauseBase):
    id: str
    standard_id: str

    model_config = ConfigDict(from_attributes=True)
