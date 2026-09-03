from fastapi import Request
from fastapi.responses import JSONResponse
from backend.app.core.logging import logger


class ComplianceCompilerException(Exception):
    """Base exception for BIS Compliance Compiler system errors."""

    def __init__(self, message: str, code: str = "COMPLIANCE_ERROR", status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


class ProvenanceNotFoundError(ComplianceCompilerException):
    """Raised when a compliance claim cannot be substantiated by verified clause evidence."""

    def __init__(self, message: str = "Authoritative clause provenance not found"):
        super().__init__(message=message, code="PROVENANCE_NOT_FOUND", status_code=422)


class MissingProductAttributeError(ComplianceCompilerException):
    """Raised when an applicability-critical product attribute is missing."""

    def __init__(self, attribute_name: str):
        super().__init__(
            message=f"Missing applicability-critical product attribute: {attribute_name}. Clarification required.",
            code="MISSING_ATTRIBUTE_CLARIFICATION_REQUIRED",
            status_code=422,
        )


async def compliance_exception_handler(request: Request, exc: ComplianceCompilerException) -> JSONResponse:
    """Standardized error response handler for compliance exceptions."""
    logger.warning(f"Compliance exception on {request.url.path}: [{exc.code}] {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
        },
    )
