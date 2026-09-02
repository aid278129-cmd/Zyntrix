from fastapi import APIRouter
from backend.app.api.health import router as health_router
from backend.app.api.system import router as system_router
from backend.app.api.knowledge import router as knowledge_router

api_router = APIRouter()
api_router.include_router(system_router)
api_router.include_router(knowledge_router)

__all__ = ["api_router", "health_router", "knowledge_router"]
