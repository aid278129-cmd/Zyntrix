from typing import List, Optional
from backend.app.schemas.product_dna import (
    ProductDNACore,
    ClarificationRequirement,
    DNAAttribute,
    AttributeProvenance,
)


def detect_missing_attributes(dna: ProductDNACore) -> List[ClarificationRequirement]:
    """Detect missing attributes required for deterministic applicability & compliance reasoning.
    
    Zero-Guessing Policy:
    If an applicability-critical attribute is missing (e.g. material grade, operating voltage),
    the system creates a structured ClarificationRequirement rather than guessing.
    """
    clarifications: List[ClarificationRequirement] = []
    attr_names = {a.name for a in dna.attributes}

    # Category: Drinkware & Food Contact Containers
    if dna.category == "Drinkware & Food Contact Containers":
        # 1. Check if capacity is specified
        if "capacity_ml" not in attr_names:
            clarifications.append(
                ClarificationRequirement(
                    attribute_name="capacity_ml",
                    reason="Required to determine testing limits and standard scope boundary (up to 1000ml)",
                    options=["500 ml", "750 ml", "1000 ml", "Over 1000 ml"],
                    criticality="MEDIUM",
                )
            )

        # 2. Check if specific stainless steel grade or material is specified
        materials_str = " ".join(dna.materials).lower()
        if "stainless_steel" in materials_str and "304" not in materials_str and "316" not in materials_str:
            clarifications.append(
                ClarificationRequirement(
                    attribute_name="material_grade",
                    reason="IS 17526:2021 Clause 4.2.1 mandates Grade 304 or superior for food contact parts",
                    options=["Grade 304 (18/8)", "Grade 316", "Other Stainless Steel"],
                    criticality="HIGH",
                )
            )

        # 3. Check intended domestic vs commercial use if ambiguous
        if not dna.intended_use:
            clarifications.append(
                ClarificationRequirement(
                    attribute_name="intended_use",
                    reason="Mandatory QCO distinguishes domestic vacuum flasks from industrial coolers",
                    options=["Domestic / Personal Drinking", "Commercial Dispensing"],
                    criticality="HIGH",
                )
            )

    # Category: Electrical & Domestic Appliances
    elif dna.category == "Electrical & Domestic Appliances":
        if "voltage" not in attr_names:
            clarifications.append(
                ClarificationRequirement(
                    attribute_name="voltage",
                    reason="Required to verify single-phase 230V AC safety scope under IS 302-1",
                    options=["230V AC, 50Hz (Standard Indian Mains)", "110V AC"],
                    criticality="HIGH",
                )
            )
        if "wattage" not in attr_names:
            clarifications.append(
                ClarificationRequirement(
                    attribute_name="wattage",
                    reason="Required for heating element endurance and thermal cut-out threshold checks",
                    options=["1000W", "1500W", "2000W"],
                    criticality="MEDIUM",
                )
            )

    return clarifications


def apply_clarification_response(
    dna: ProductDNACore,
    attribute_name: str,
    raw_value: str,
    source_type: str = "USER",
) -> ProductDNACore:
    """Safely apply user clarification answer to update Product DNA while preserving provenance history.
    
    Attribute extraction_method is marked as 'user_clarification' to differentiate from system parsing.
    """
    from backend.app.services.product_dna.normalizer import (
        normalize_capacity,
        normalize_material,
    )

    clean_name = attribute_name.strip()
    val: any = raw_value.strip()

    # Normalization according to attribute type
    if clean_name == "capacity_ml":
        cap_val, cap_unit = normalize_capacity(str(raw_value))
        val = cap_val if cap_val is not None else raw_value
        unit = "ml"
    elif clean_name == "material_grade":
        norm_mat = normalize_material(str(raw_value))
        val = norm_mat
        if norm_mat not in dna.materials:
            dna.materials.append(norm_mat)
        unit = None
    elif clean_name == "intended_use":
        val = "domestic_drinking" if "domestic" in str(raw_value).lower() else "commercial_beverage"
        dna.intended_use = val
        unit = None
    else:
        unit = None

    # Update existing attribute or add new
    existing_attr = next((a for a in dna.attributes if a.name == clean_name), None)
    new_prov = AttributeProvenance(
        source_document="user_clarification_session",
        page=None,
        source_text=f"User clarified {clean_name}: '{raw_value}'",
        confidence=1.0,
        extraction_method="user_clarification",
    )

    if existing_attr:
        existing_attr.value = val
        existing_attr.unit = unit or existing_attr.unit
        existing_attr.provenance = new_prov
    else:
        dna.attributes.append(
            DNAAttribute(
                name=clean_name,
                value=val,
                data_type="integer" if isinstance(val, int) else "string",
                unit=unit,
                provenance=new_prov,
            )
        )

    # Re-evaluate remaining clarifications
    dna.pending_clarifications = detect_missing_attributes(dna)
    return dna
