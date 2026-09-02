import io
from typing import Optional, Tuple
from PIL import Image
from backend.app.core.logging import logger

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False


def extract_text_from_image_bytes(image_bytes: bytes, lang: str = "eng") -> Tuple[str, bool]:
    """Extract text from raw image bytes using Tesseract OCR if available."""
    if not PYTESSERACT_AVAILABLE:
        logger.warning("pytesseract is not installed or available. Skipping OCR.")
        return "", False

    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image, lang=lang)
        return text.strip(), True
    except Exception as exc:
        logger.warning(f"OCR extraction failed: {exc}")
        return "", False


def is_scanned_page(text: str, image_count: int, min_char_threshold: int = 40) -> bool:
    """Determine if a PDF page appears to be a scanned bitmap rather than vector text."""
    clean_text = text.strip()
    return len(clean_text) < min_char_threshold and image_count > 0
