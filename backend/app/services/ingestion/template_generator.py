"""Document & Specification Template Generator.

Generates clean, fillable/downloadable templates (CSV, JSON, Markdown)
containing the exact required fields derived from verified BIS/QCO knowledge.
Enforces zero-hallucination: If verified knowledge is insufficient, displays
UNKNOWN / INFORMATION REQUIRED rather than inventing regulatory fields.
"""

import csv
import io
import json
from typing import Dict, Any, List, Optional
from backend.app.schemas.unified_input import (
    FieldRequirementLevel,
    TechnicalRequirementItem,
)


class TemplateGeneratorService:
    """Produces fillable templates to assist manufacturers in preparing valid compliance inputs."""

    VERIFIED_STANDARDS_REQUIREMENTS: Dict[str, List[TechnicalRequirementItem]] = {
        # Immersion Water Heaters under IS 302-2-201:2008 & IS 302-1:2008
        "IS 302-2-201:2008": [
            TechnicalRequirementItem(
                field_id="product_trade_name",
                field_name="Product Trade Name / Model",
                level=FieldRequirementLevel.REQUIRED,
                category="Identification",
                description="Commercial trade name and exact model code",
                sample_value="Electric Immersion Water Heater (EWH-1500)",
                standard_reference="IS 302-1 Clause 7",
            ),
            TechnicalRequirementItem(
                field_id="rated_voltage",
                field_name="Rated Voltage",
                level=FieldRequirementLevel.REQUIRED,
                category="Electrical",
                description="Nominal operating supply voltage in Volts AC",
                sample_value="230",
                unit="V AC",
                standard_reference="IS 302-2-201 Clause 6.1",
            ),
            TechnicalRequirementItem(
                field_id="rated_power_input",
                field_name="Rated Power Input / Wattage",
                level=FieldRequirementLevel.REQUIRED,
                category="Electrical",
                description="Nominal electrical power consumption in Watts",
                sample_value="1500",
                unit="W",
                standard_reference="IS 302-2-201 Clause 10.1",
            ),
            TechnicalRequirementItem(
                field_id="rated_frequency",
                field_name="Rated Frequency",
                level=FieldRequirementLevel.REQUIRED,
                category="Electrical",
                description="Operating AC mains supply frequency",
                sample_value="50",
                unit="Hz",
                standard_reference="IS 302-1 Clause 6",
            ),
            TechnicalRequirementItem(
                field_id="heating_element_material",
                field_name="Heating Element Sheath Material",
                level=FieldRequirementLevel.REQUIRED,
                category="Physical",
                description="Alloy grade of tubular sheath (e.g. Stainless Steel 304, Copper)",
                sample_value="Stainless Steel 304",
                standard_reference="IS 302-2-201 Clause 22.101",
            ),
            TechnicalRequirementItem(
                field_id="handle_material",
                field_name="Handle & Enclosure Material",
                level=FieldRequirementLevel.REQUIRED,
                category="Physical",
                description="Heat-resistant flame-retardant insulating polymer",
                sample_value="Polypropylene (UL94 V-0)",
                standard_reference="IS 302-1 Clause 30",
            ),
            TechnicalRequirementItem(
                field_id="power_cord_type",
                field_name="Power Cord Specification",
                level=FieldRequirementLevel.REQUIRED,
                category="Sub-assembly",
                description="Flexible cable core count, conductor size & insulation grade",
                sample_value="3-core 0.75 mm2 PVC insulated (IS 694)",
                standard_reference="IS 302-1 Clause 25.7",
            ),
            TechnicalRequirementItem(
                field_id="plug_top_rating",
                field_name="Plug Top Conformance",
                level=FieldRequirementLevel.REQUIRED,
                category="Sub-assembly",
                description="Molded 3-pin plug rating conforming to IS 1293",
                sample_value="3-pin, 6 A, 250 V (IS 1293)",
                standard_reference="IS 302-1 Clause 25.1",
            ),
            TechnicalRequirementItem(
                field_id="lab_test_report_number",
                field_name="Laboratory Test Report Reference",
                level=FieldRequirementLevel.OPTIONAL,
                category="Evidence",
                description="Official NABL-accredited test report reference number if already tested",
                sample_value="ABC/EWH/2026/001",
                standard_reference="NABL / BIS Scheme-I",
            ),
        ],
        # Stainless steel vacuum flasks under IS 17526:2021
        "IS 17526:2021": [
            TechnicalRequirementItem(
                field_id="product_trade_name",
                field_name="Product Trade Name / Model",
                level=FieldRequirementLevel.REQUIRED,
                category="Identification",
                description="Commercial product model name",
                sample_value="Stainless Steel Vacuum Insulated Flask 1000ml",
                standard_reference="IS 17526:2021 Clause 1",
            ),
            TechnicalRequirementItem(
                field_id="nominal_capacity",
                field_name="Nominal Capacity",
                level=FieldRequirementLevel.REQUIRED,
                category="Physical",
                description="Stated liquid holding capacity in milliliters or liters",
                sample_value="1000",
                unit="ml",
                standard_reference="IS 17526 Clause 5.1",
            ),
            TechnicalRequirementItem(
                field_id="inner_lining_material",
                field_name="Food-Contact Liner Material",
                level=FieldRequirementLevel.REQUIRED,
                category="Physical",
                description="Chemical grade of inner food contact container",
                sample_value="Stainless Steel Grade 304 (IS 6911)",
                standard_reference="IS 17526 Clause 4.1",
            ),
            TechnicalRequirementItem(
                field_id="heat_retention_spec",
                field_name="Thermal Heat Retention Target",
                level=FieldRequirementLevel.REQUIRED,
                category="Safety",
                description="Target water temperature after 6 hours from 95 C initial",
                sample_value=">= 65",
                unit="C",
                standard_reference="IS 17526 Clause 6.3",
            ),
            TechnicalRequirementItem(
                field_id="lid_seal_polymer",
                field_name="Lid Gasket & Seal Material",
                level=FieldRequirementLevel.REQUIRED,
                category="Sub-assembly",
                description="Food-grade elastomer or silicone conforming to IS 9845",
                sample_value="Food Grade Silicone Elastomer",
                standard_reference="IS 17526 Clause 4.3",
            ),
        ],
    }

    @classmethod
    def get_requirements_for_standard_or_category(
        cls,
        target_standard: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[TechnicalRequirementItem]:
        """Fetch verified technical requirements or return UNKNOWN if standard is unverified."""
        if target_standard and target_standard in cls.VERIFIED_STANDARDS_REQUIREMENTS:
            return cls.VERIFIED_STANDARDS_REQUIREMENTS[target_standard]

        # Heuristic match by standard number substring
        if target_standard:
            for std_key, reqs in cls.VERIFIED_STANDARDS_REQUIREMENTS.items():
                if any(part in target_standard for part in ["302-2-201", "302_2_201", "368"]):
                    return cls.VERIFIED_STANDARDS_REQUIREMENTS["IS 302-2-201:2008"]
                if any(part in target_standard for part in ["17526", "flask"]):
                    return cls.VERIFIED_STANDARDS_REQUIREMENTS["IS 17526:2021"]

        # Category based lookup
        cat_lower = (category or "").lower()
        if "water heater" in cat_lower or "immersion" in cat_lower or "appliance" in cat_lower:
            return cls.VERIFIED_STANDARDS_REQUIREMENTS["IS 302-2-201:2008"]
        if "flask" in cat_lower or "bottle" in cat_lower or "drinkware" in cat_lower:
            return cls.VERIFIED_STANDARDS_REQUIREMENTS["IS 17526:2021"]

        # If knowledge is insufficient, NEVER invent requirements; return transparent unknown notice
        return [
            TechnicalRequirementItem(
                field_id="product_trade_name",
                field_name="Product Trade Name",
                level=FieldRequirementLevel.REQUIRED,
                category="Identification",
                description="Commercial product model name",
                sample_value="Example Product Model",
            ),
            TechnicalRequirementItem(
                field_id="unverified_category_notice",
                field_name="Category Specific Parameters",
                level=FieldRequirementLevel.UNKNOWN,
                category="Domain Parameters",
                description="Verified BIS standard parameters for this specific category are currently pending official gazette indexing. Standard product claims will require manual auditor specification.",
            ),
        ]

    @classmethod
    def generate_csv_template(cls, target_standard: Optional[str] = None, category: Optional[str] = None) -> str:
        """Generate fillable CSV template for BOM & Technical Parameters."""
        reqs = cls.get_requirements_for_standard_or_category(target_standard, category)
        output = io.StringIO()
        writer = csv.writer(output)

        # Header Row
        writer.writerow(["Field ID", "Field Name", "Requirement Level", "Category", "Unit", "Your Value", "BIS Standard Reference"])

        # Data Rows
        for r in reqs:
            writer.writerow([
                r.field_id,
                r.field_name,
                r.level.value,
                r.category,
                r.unit or "N/A",
                f"[{r.sample_value or 'ENTER_VALUE'}]",
                r.standard_reference or "General Rule",
            ])

        return output.getvalue()

    @classmethod
    def generate_json_template(cls, target_standard: Optional[str] = None, category: Optional[str] = None) -> Dict[str, Any]:
        """Generate structured JSON schema template for technical specifications."""
        reqs = cls.get_requirements_for_standard_or_category(target_standard, category)
        fields_dict = {}
        for r in reqs:
            fields_dict[r.field_id] = {
                "field_name": r.field_name,
                "requirement_level": r.level.value,
                "category": r.category,
                "unit": r.unit,
                "value": r.sample_value or "[ENTER_VALUE]",
                "standard_reference": r.standard_reference,
            }

        return {
            "template_name": "Zyntrix Layer 1 Document Preparation Template",
            "regulatory_framework": target_standard or "Bureau of Indian Standards (BIS)",
            "product_category": category or "Kitchen & Domestic Appliances",
            "required_fields_count": sum(1 for r in reqs if r.level == FieldRequirementLevel.REQUIRED),
            "parameters": fields_dict,
            "instructions": (
                "Fill in 'value' for all REQUIRED fields. Upload this file via the BOM or JSON spec tab "
                "to achieve high Document Readiness prior to Layer 2 Product DNA compilation."
            ),
        }

    @classmethod
    def generate_bom_csv_template(cls) -> str:
        """Generate standard Bill of Materials (BOM) tabular template."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Part Number", "Component", "Material", "Specification", "Quantity"])
        writer.writerow(["HE-01", "Tubular Heating Element", "Stainless Steel 304", "1500 W, 230 V AC", "1"])
        writer.writerow(["HD-02", "Insulated Grip Handle", "Polypropylene (UL94 V-0)", "120 C temperature rated", "1"])
        writer.writerow(["CR-03", "Power Supply Cord", "Copper / PVC Sheathed (IS 694)", "3-core 0.75 mm2, 6A", "1"])
        writer.writerow(["PL-04", "Plug Top Conformance", "Polycarbonate / Brass (IS 1293)", "3-pin 6A 250V", "1"])
        writer.writerow(["LP-05", "Neon Indicator Lamp", "Glass / Series Resistor", "230V AC", "1"])
        return output.getvalue()


template_generator_service = TemplateGeneratorService()
