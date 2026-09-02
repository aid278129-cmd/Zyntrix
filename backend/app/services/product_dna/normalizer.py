import re
from typing import Tuple, Optional, Any, Dict


def normalize_capacity(raw_val: str) -> Tuple[Optional[int], Optional[str]]:
    """Normalize volume/capacity expressions to milliliters (ml).
    e.g. '750 ml', '750mL', '0.75 litre', '0.75L', '1 L' -> (750, 'ml')
    """
    raw = raw_val.strip().lower()
    
    # Match litres e.g. "0.75 litre", "0.75l", "1.5 litres"
    litre_match = re.search(r"([\d\.]+)\s*(?:litres?|liter|l)\b", raw)
    if litre_match:
        try:
            litres = float(litre_match.group(1))
            ml = int(round(litres * 1000))
            return ml, "ml"
        except ValueError:
            pass

    # Match ml e.g. "750 ml", "750ml", "1000 ml"
    ml_match = re.search(r"(\d+)\s*(?:ml|millilitres?|milliliter)\b", raw)
    if ml_match:
        try:
            return int(ml_match.group(1)), "ml"
        except ValueError:
            pass

    # Bare number check if context suggests capacity
    bare_num = re.search(r"^(\d+)$", raw)
    if bare_num:
        return int(bare_num.group(1)), "ml"

    return None, None


def normalize_electrical(raw_val: str) -> Dict[str, Any]:
    """Normalize electrical voltage/frequency/wattage expressions.
    e.g. '230 volts AC', '230V a.c.', '230 V, 50 Hz, 1500W'
    """
    res: Dict[str, Any] = {}
    raw = raw_val.strip()

    # Voltage: "230V", "230 volts", "220-240 V"
    volt_match = re.search(r"(\d+(?:-\d+)?)\s*(?:v|volts|v\.a\.c\.)", raw, re.I)
    if volt_match:
        res["voltage"] = volt_match.group(1)
        res["voltage_unit"] = "V"

    # Current type AC / DC
    if re.search(r"(?:a\.c\.|a\.c|ac|\balternating current\b)", raw, re.I):
        res["current_type"] = "AC"
    elif re.search(r"(?:d\.c\.|d\.c|dc|\bdirect current\b)", raw, re.I):
        res["current_type"] = "DC"

    # Frequency: "50 Hz", "50Hz", "60 Hz"
    freq_match = re.search(r"(\d+)\s*(?:hz|hertz)", raw, re.I)
    if freq_match:
        res["frequency"] = int(freq_match.group(1))
        res["frequency_unit"] = "Hz"

    # Power/Wattage: "1500W", "1500 watts"
    watt_match = re.search(r"(\d+)\s*(?:w|watts|kw)", raw, re.I)
    if watt_match:
        res["wattage"] = int(watt_match.group(1))
        res["wattage_unit"] = "W"

    return res


def normalize_material(raw_material: str) -> str:
    """Normalize common raw material strings to canonical technical tokens."""
    mat = raw_material.strip().lower()
    
    # Stainless steel variants
    if "304" in mat and ("steel" in mat or "ss" in mat or "stainless" in mat):
        return "stainless_steel_grade_304"
    if "316" in mat and ("steel" in mat or "ss" in mat or "stainless" in mat):
        return "stainless_steel_grade_316"
    if "stainless" in mat or "ss" in mat:
        return "stainless_steel"

    # Polymers & Plastics
    if "polypropylene" in mat or re.search(r"\bpp\b", mat):
        return "polypropylene"
    if "silicone" in mat:
        return "silicone_food_grade"
    if "copper" in mat:
        return "copper"
    if "aluminum" in mat or "aluminium" in mat:
        return "aluminum"

    # Return clean snake_case representation
    clean = re.sub(r"[^a-z0-9]+", "_", mat).strip("_")
    return clean or mat
