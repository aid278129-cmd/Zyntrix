"""Demonstration fixture and reset state for the Golden SIH Demo Case.

Product: ThermoSteel Domestic Vacuum Flask 750ml
Category: Drinkware & Food Contact Containers
Standard: IS 17526:2021
QCO: DPIIT Domestic Water Bottles Order 2023
Demonstrates the full 14-step compliance evaluation workflow reliably without network dependency.
"""
from typing import Dict, Any

GOLDEN_DEMO_PRODUCT = {
    "product_name": "ThermoSteel Domestic Vacuum Flask 750ml",
    "category": "Drinkware & Food Contact Containers",
    "description": "Double wall stainless steel 304 vacuum insulated flask 750 ml capacity for domestic drinking water.",
    "authoritative_mode": False,
}

GOLDEN_DEMO_INITIAL_EVIDENCE = {
    "snippet": "Laboratory test report NTH/2026/044: Product subjected to Clause 5.4 heat retention. After 6 hours water temp was 64.5 deg C. Clause 5.2 inverted 10 mins: zero leakage observed.",
    "evidence_type": "TEST_REPORT",
    "authority": "LAB_REPORT",
    "page": 2,
}

GOLDEN_DEMO_CLARIFICATION_ANSWER = {
    "attribute": "capacity_ml",
    "value": "750 ml",
}


def get_golden_demo_config() -> Dict[str, Any]:
    """Return the complete metadata configuration for the SIH Golden Demo Case."""
    return {
        "case_id": "GOLDEN-SIH-2026-DEMO",
        "title": "Golden SIH Demonstration Case: Double-Wall Vacuum Flask",
        "standard_number": "IS 17526:2021",
        "qco_regulation": "DPIIT Domestic Water Bottles (Quality Control) Order, 2023",
        "sample_protocol": "8-Flask Testing Protocol (BIS Product Manual PM/IS 17526/1)",
        "product_data": GOLDEN_DEMO_PRODUCT,
        "initial_evidence": GOLDEN_DEMO_INITIAL_EVIDENCE,
        "clarification": GOLDEN_DEMO_CLARIFICATION_ANSWER,
        "mode": "DEVELOPMENT_MODE (Interactive Demo with Official QCO 2023 Rule Base)",
    }
