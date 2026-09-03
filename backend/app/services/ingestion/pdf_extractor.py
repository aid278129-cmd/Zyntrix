import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import pymupdf  # PyMuPDF
from backend.app.core.logging import logger
from backend.app.services.ingestion.ocr import is_scanned_page, extract_text_from_image_bytes


class ExtractedPage(BaseModel):
    page_number: int  # 1-indexed
    text: str
    extraction_method: str = "TEXT"  # TEXT | OCR
    char_count: int = 0
    blocks: List[Dict[str, Any]] = Field(default_factory=list)
    images_count: int = 0


class PDFExtractionResult(BaseModel):
    total_pages: int
    pages: List[ExtractedPage]
    title_metadata: Optional[str] = None
    author_metadata: Optional[str] = None
    is_mostly_scanned: bool = False


def extract_pdf_content(file_path: str, enable_ocr: bool = True) -> PDFExtractionResult:
    """Extract structured text and page provenance from a PDF document using PyMuPDF and OCR fallback."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file does not exist at {file_path}")

    doc = pymupdf.open(file_path)
    total_pages = len(doc)
    pages: List[ExtractedPage] = []
    scanned_pages_count = 0

    meta = doc.metadata or {}
    title_meta = meta.get("title") or None
    author_meta = meta.get("author") or None

    for page_idx in range(total_pages):
        page = doc[page_idx]
        page_num = page_idx + 1

        # Extract text blocks
        text = page.get_text("text") or ""
        blocks_data = page.get_text("blocks") or []
        image_list = page.get_images(full=True) or []
        image_count = len(image_list)

        extraction_method = "TEXT"

        # Check if page is scanned/image-only
        if is_scanned_page(text, image_count) and enable_ocr and image_count > 0:
            scanned_pages_count += 1
            ocr_text_accum = []
            for img_info in image_list:
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image.get("image")
                if image_bytes:
                    ocr_text, ok = extract_text_from_image_bytes(image_bytes)
                    if ok and ocr_text:
                        ocr_text_accum.append(ocr_text)

            if ocr_text_accum:
                text = "\n".join(ocr_text_accum)
                extraction_method = "OCR"

        structured_blocks = []
        for b in blocks_data:
            if len(b) >= 5 and isinstance(b[4], str) and b[4].strip():
                structured_blocks.append({
                    "bbox": [b[0], b[1], b[2], b[3]],
                    "text": b[4].strip(),
                    "block_type": b[5] if len(b) > 5 else 0,
                })

        pages.append(
            ExtractedPage(
                page_number=page_num,
                text=text.strip(),
                extraction_method=extraction_method,
                char_count=len(text.strip()),
                blocks=structured_blocks,
                images_count=image_count,
            )
        )

    doc.close()

    is_mostly_scanned = total_pages > 0 and (scanned_pages_count / total_pages) > 0.5

    logger.info(
        f"Extracted {total_pages} pages from {os.path.basename(file_path)} (Scanned pages: {scanned_pages_count})"
    )

    return PDFExtractionResult(
        total_pages=total_pages,
        pages=pages,
        title_metadata=title_meta,
        author_metadata=author_meta,
        is_mostly_scanned=is_mostly_scanned,
    )
