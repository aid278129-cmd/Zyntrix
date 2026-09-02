from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class StandardBase(BaseModel):
    standard_number: str = Field(..., description="IS standard number e.g. IS 17526:2021")
    title: str
    description: Optional[str] = None
    category: str
    scheme: str = "Scheme I"
    is_mandatory_qco: bool = False
    qco_notification_number: Optional[str] = None
    version: str = "current"
    status: str = "ACTIVE"


class StandardCreate(StandardBase):
    pass


class StandardResponse(StandardBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
