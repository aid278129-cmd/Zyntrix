from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict


class ProvenanceClassification(str, Enum):
    """Explicit classification of product attribute & evidence origins.
    
    Invariant: PRODUCT FACT != COMPLIANCE EVIDENCE.
    A USER_CLAIM establishes product claims, but can NEVER by itself establish regulatory compliance.
    """
    USER_CLAIM = "USER_CLAIM"
    USER_CLARIFICATION = "USER_CLARIFICATION"
    DOCUMENT_EVIDENCE = "DOCUMENT_EVIDENCE"
    LAB_EVIDENCE = "LAB_EVIDENCE"
    OFFICIAL_SOURCE = "OFFICIAL_SOURCE"
    DERIVED_VALUE = "DERIVED_VALUE"


class AttributeProvenance(BaseModel):
    """Authoritative audit record of where a Product DNA property was extracted from."""

    provenance_type: ProvenanceClassification = ProvenanceClassification.USER_CLAIM
    source_document: Optional[str] = None
    page: Optional[int] = None
    source_text: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    extraction_method: str = "manual"  # manual | parsed | structured_llm | user_clarification

    def is_eligible_for_compliance_evidence(self) -> bool:
        """USER_CLAIM and USER_CLARIFICATION can NEVER establish compliance evidence."""
        return self.provenance_type in (
            ProvenanceClassification.DOCUMENT_EVIDENCE,
            ProvenanceClassification.LAB_EVIDENCE,
            ProvenanceClassification.OFFICIAL_SOURCE,
        )


class DNAAttribute(BaseModel):
    """Typed individual product attribute with provenance."""

    name: str
    value: Union[str, int, float, bool, List[str]]
    data_type: str = "string"
    unit: Optional[str] = None
    provenance: Optional[AttributeProvenance] = None


class ClarificationRequirement(BaseModel):
    """Generated clarification request when an applicability-critical attribute is missing."""

    attribute_name: str
    reason: str
    options: Optional[List[str]] = None
    criticality: str = "HIGH"  # HIGH | MEDIUM | LOW


class ProductDNACore(BaseModel):
    """Core product specification with extensible dynamic attributes."""

    product_name: str = Field(..., min_length=1, description="Official trade or technical product name")
    category: str = Field(..., min_length=1, description="General industry/standards category")
    sub_category: Optional[str] = None
    intended_use: Optional[str] = None
    materials: List[str] = Field(default_factory=list)
    electrical: bool = False
    insulated: bool = False
    
    # Dynamic domain attributes (e.g. wattage, capacity_ml, voltage, pressure_rating)
    attributes: List[DNAAttribute] = Field(default_factory=list)
    
    # Identified missing fields that block deterministic compliance mapping
    pending_clarifications: List[ClarificationRequirement] = Field(default_factory=list)


class ProductDNACreate(ProductDNACore):
    pass


class ProductDNAResponse(ProductDNACore):
    id: str

    model_config = ConfigDict(from_attributes=True)
