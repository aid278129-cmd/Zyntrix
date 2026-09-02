import re
from typing import List, Optional, Dict, Any
from backend.app.schemas.product_dna import (
    ProductDNACore,
    DNAAttribute,
    AttributeProvenance,
    ClarificationRequirement,
)
from backend.app.services.product_dna.normalizer import (
    normalize_capacity,
    normalize_electrical,
    normalize_material,
)


def extract_product_dna_from_text(
    text: str,
    source_document: Optional[str] = None,
    source_page: Optional[int] = None,
) -> ProductDNACore:
    """Extract structured Product DNA from raw user input or technical document text.
    
    Adheres strictly to the provenance and confidence model:
    - Extracted attributes have explicit confidence (0.0 to 1.0) and extraction_method.
    - Missing required attributes are NOT guessed or fabricated.
    """
    from backend.app.services.security.prompt_guard import scan_and_sanitize_untrusted_text

    scan_res = scan_and_sanitize_untrusted_text(text)
    clean_text = scan_res.sanitized_text
    raw_lower = clean_text.lower()
    attributes: List[DNAAttribute] = []
    materials: List[str] = []

    # 1. Product Name & Category detection
    product_name = "Specified Product"
    category = "General Goods"
    sub_category = None
    intended_use = None
    insulated = False
    electrical = False

    # Drinkware / Flasks / Bottles / Standards Queries
    if any(k in raw_lower for k in ["flask", "bottle", "drinkware", "cooler", "sipper", "thermos", "heat retention", "leakage test", "is 17526", "clause 4.2.1", "clause 5.2", "clause 5.4"]):
        category = "Drinkware & Food Contact Containers"
        sub_category = "Vacuum Insulated Containers"
        if "flask" in raw_lower:
            product_name = "Vacuum Insulated Flask"
        elif "bottle" in raw_lower:
            product_name = "Vacuum Insulated Bottle"
        elif "thermos" in raw_lower:
            product_name = "Vacuum Insulated Thermos"
        else:
            product_name = "Drinkware Container"

        if any(k in raw_lower for k in ["domestic", "household", "drinking", "personal"]):
            intended_use = "domestic_drinking"
        elif "commercial" in raw_lower:
            intended_use = "commercial_beverage"
        elif "general storage" in raw_lower or "chemical" in raw_lower:
            intended_use = "general_storage"

        if any(k in raw_lower for k in ["insulated", "vacuum", "double wall", "double-wall", "thermal", "heat retention", "thermos"]):
            insulated = True

    # Electrical Appliances
    elif any(k in raw_lower for k in ["kettle", "toaster", "heater", "iron", "geyser", "oven"]):
        category = "Electrical & Domestic Appliances"
        electrical = True
        if "kettle" in raw_lower:
            product_name = "Electric Kettle"
            sub_category = "Water Heating Appliances"
        elif "toaster" in raw_lower:
            product_name = "Electric Toaster"
        if "domestic" in raw_lower or "household" in raw_lower:
            intended_use = "domestic_household"

    # Material Extraction
    raw_materials = []
    if re.search(r"\b(grade\s*304|ss\s*304|304\s*stainless|stainless[-\s]*steel\s*304|18/8\s*(?:austenitic\s*)?stainless)\b", raw_lower):
        raw_materials.append("Stainless Steel Grade 304")
    elif re.search(r"\b(stainless[-\s]*steel|ss|stainless\s*liner)\b", raw_lower):
        raw_materials.append("Stainless Steel")

    if re.search(r"\b(polypropylene|pp\b|bpa-free\s*plastic)", raw_lower):
        raw_materials.append("Polypropylene")
    if re.search(r"\b(silicone|food-grade\s*silicone)", raw_lower):
        raw_materials.append("Food-grade Silicone")
    if re.search(r"\b(copper)\b", raw_lower):
        raw_materials.append("Copper")
    if re.search(r"\b(aluminum|aluminium)\b", raw_lower):
        raw_materials.append("Aluminum")

    materials = [normalize_material(m) for m in raw_materials]

    # Material attribute with provenance
    if materials:
        attributes.append(
            DNAAttribute(
                name="materials",
                value=materials,
                data_type="list",
                unit=None,
                provenance=AttributeProvenance(
                    source_document=source_document,
                    page=source_page,
                    source_text=text[:200],
                    confidence=0.95,
                    extraction_method="rule_based_parse",
                ),
            )
        )

    # 2. Capacity Extraction
    cap_match = re.search(r"(\d+(?:\.\d+)?\s*(?:ml|millilitres?|litres?|liter|l)\b)", raw_lower)
    if cap_match:
        cap_val, cap_unit = normalize_capacity(cap_match.group(1))
        if cap_val is not None:
            attributes.append(
                DNAAttribute(
                    name="capacity_ml",
                    value=cap_val,
                    data_type="integer",
                    unit=cap_unit or "ml",
                    provenance=AttributeProvenance(
                        source_document=source_document,
                        page=source_page,
                        source_text=cap_match.group(0),
                        confidence=0.98,
                        extraction_method="structured_regex",
                    ),
                )
            )

    # 3. Electrical Characteristics Extraction
    if electrical or re.search(r"(\d+\s*v(?:olts)?|\d+\s*hz|\d+\s*w(?:atts)?)", raw_lower):
        elec_info = normalize_electrical(text)
        if "voltage" in elec_info:
            attributes.append(
                DNAAttribute(
                    name="voltage",
                    value=elec_info["voltage"],
                    data_type="string",
                    unit=elec_info.get("voltage_unit", "V"),
                    provenance=AttributeProvenance(
                        source_document=source_document,
                        page=source_page,
                        source_text=text[:150],
                        confidence=0.96,
                        extraction_method="structured_regex",
                    ),
                )
            )
        if "wattage" in elec_info:
            attributes.append(
                DNAAttribute(
                    name="wattage",
                    value=elec_info["wattage"],
                    data_type="integer",
                    unit=elec_info.get("wattage_unit", "W"),
                    provenance=AttributeProvenance(
                        source_document=source_document,
                        page=source_page,
                        source_text=text[:150],
                        confidence=0.96,
                        extraction_method="structured_regex",
                    ),
                )
            )

    # 4. Insulation Flag Attribute
    if insulated:
        attributes.append(
            DNAAttribute(
                name="insulated",
                value=True,
                data_type="boolean",
                unit=None,
                provenance=AttributeProvenance(
                    source_document=source_document,
                    page=source_page,
                    source_text=text[:150],
                    confidence=0.95,
                    extraction_method="keyword_inference",
                ),
            )
        )

    # 5. Food Contact Safety Flag
    if any(k in raw_lower for k in ["food contact", "drinking", "beverage", "flask", "bottle"]):
        attributes.append(
            DNAAttribute(
                name="food_contact",
                value=True,
                data_type="boolean",
                unit=None,
                provenance=AttributeProvenance(
                    source_document=source_document,
                    page=source_page,
                    source_text=text[:150],
                    confidence=0.92,
                    extraction_method="contextual_parse",
                ),
            )
        )

    return ProductDNACore(
        product_name=product_name,
        category=category,
        sub_category=sub_category,
        intended_use=intended_use,
        materials=materials,
        electrical=electrical,
        insulated=insulated,
        attributes=attributes,
        pending_clarifications=[],
    )
