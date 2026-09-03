"""Product Category Taxonomy and Required Attribute Profiles for Indian Standards.

Defines:
1. Canonical product categories, aliases, and distinguishing features.
2. RequiredAttributeProfile specifying blocking, conditional, and optional attributes per standard.
3. Attribute status states: KNOWN | UNKNOWN | MISSING | CONFLICTING | NOT_PROVIDED | NOT_APPLICABLE_TO_THIS_RULE
"""
from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class AttributeState(str, Enum):
    KNOWN = "KNOWN"
    UNKNOWN = "UNKNOWN"
    MISSING = "MISSING"
    CONFLICTING = "CONFLICTING"
    NOT_PROVIDED = "NOT_PROVIDED"
    NOT_APPLICABLE_TO_THIS_RULE = "NOT_APPLICABLE_TO_THIS_RULE"


class RequiredAttributeProfile(BaseModel):
    """Deterministic profile specifying required product attributes for standard applicability."""
    standard_or_rule_id: str
    product_category: str
    blocking_attributes: List[str] = Field(description="Attributes strictly required to establish applicability")
    conditionally_required_attributes: Dict[str, str] = Field(
        default_factory=dict,
        description="Attribute -> Condition (e.g. 'capacity_ml' -> 'required if insulated is true')",
    )
    optional_attributes: List[str] = Field(default_factory=list)
    clarification_priority: Dict[str, str] = Field(
        default_factory=dict,
        description="Attribute -> Criticality (HIGH | MEDIUM | LOW)",
    )
    applicability_dependencies: List[str] = Field(default_factory=list)
    evidence_dependencies: List[str] = Field(default_factory=list)


class ProductCategoryDefinition(BaseModel):
    """Controlled Product Taxonomy Category Definition."""
    canonical_category_id: str
    category_name: str
    aliases: List[str] = Field(default_factory=list)
    distinguishing_attributes: List[str] = Field(default_factory=list)
    supported_rules: List[str] = Field(default_factory=list)
    supported_standards: List[str] = Field(default_factory=list)
    coverage_state: str = "COVERED"  # COVERED | PARTIAL_COVERAGE | CATALOG_NOT_COVERED


# ==========================================
# Controlled Taxonomy Registry
# ==========================================

TAXONOMY_REGISTRY: Dict[str, ProductCategoryDefinition] = {
    "CAT-DRINKWARE": ProductCategoryDefinition(
        canonical_category_id="CAT-DRINKWARE",
        category_name="Drinkware & Food Contact Containers",
        aliases=[
            "vacuum flask", "insulated bottle", "thermal thermos", "hydro flask",
            "drinkware", "water bottle", "sipper", "carafe", "insulated jug"
        ],
        distinguishing_attributes=["materials", "insulated", "capacity_ml", "intended_use"],
        supported_rules=["APP-DRINKWARE-001"],
        supported_standards=["IS 17526:2021"],
        coverage_state="COVERED",
    ),
    "CAT-ELECTRICAL": ProductCategoryDefinition(
        canonical_category_id="CAT-ELECTRICAL",
        category_name="Electrical & Domestic Appliances",
        aliases=[
            "electric kettle", "water heater", "geyser", "heating appliance",
            "toaster", "electric iron", "immersion heater"
        ],
        distinguishing_attributes=["electrical", "voltage", "wattage", "product_name"],
        supported_rules=["APP-ELECTRICAL-001"],
        supported_standards=["IS 302-2-15:2009"],
        coverage_state="COVERED",
    ),
    "CAT-GENERAL-GOODS": ProductCategoryDefinition(
        canonical_category_id="CAT-GENERAL-GOODS",
        category_name="General Goods",
        aliases=["ceramic mug", "glass tumbler", "copper jug", "earthenware pot", "wooden bowl"],
        distinguishing_attributes=["materials"],
        supported_rules=[],
        supported_standards=[],
        coverage_state="CATALOG_NOT_COVERED",
    ),
}

# ==========================================
# Required Attribute Profiles
# ==========================================

REQUIRED_ATTRIBUTE_PROFILES: Dict[str, RequiredAttributeProfile] = {
    "IS 17526:2021": RequiredAttributeProfile(
        standard_or_rule_id="IS 17526:2021",
        product_category="Drinkware & Food Contact Containers",
        blocking_attributes=["materials", "insulated"],
        conditionally_required_attributes={"capacity_ml": "Required to verify <= 1000ml scope limits and thermal test duration"},
        optional_attributes=["intended_use", "color", "stopper_type"],
        clarification_priority={
            "materials": "HIGH",
            "capacity_ml": "MEDIUM",
            "intended_use": "LOW",
        },
        applicability_dependencies=["DPIIT Domestic Water Bottles QCO 2023"],
        evidence_dependencies=["Raw Material Mill Test Certificate (IS 6911)", "Clause 5.4 Heat Retention Test Report"],
    ),
    "IS 302-2-15:2009": RequiredAttributeProfile(
        standard_or_rule_id="IS 302-2-15:2009",
        product_category="Electrical & Domestic Appliances",
        blocking_attributes=["electrical", "voltage"],
        conditionally_required_attributes={"wattage": "Required for heating element endurance check"},
        optional_attributes=["intended_use"],
        clarification_priority={
            "voltage": "HIGH",
            "wattage": "MEDIUM",
        },
        applicability_dependencies=["Electrical Appliances for Domestic Use QCO"],
        evidence_dependencies=["IS 302-1 Electrical Safety Test Report"],
    ),
}


def get_taxonomy_category(category_or_text: str) -> Optional[ProductCategoryDefinition]:
    """Find matching canonical taxonomy category using text or category name."""
    clean = category_or_text.lower().strip()
    for cat in TAXONOMY_REGISTRY.values():
        if cat.category_name.lower() == clean:
            return cat
        if any(alias in clean for alias in cat.aliases):
            return cat
    return None


def get_required_attribute_profile(standard_or_rule_id: str) -> Optional[RequiredAttributeProfile]:
    """Lookup RequiredAttributeProfile by standard or rule ID."""
    return REQUIRED_ATTRIBUTE_PROFILES.get(standard_or_rule_id)
