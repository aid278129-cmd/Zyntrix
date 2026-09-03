from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.models.base import Base

# Create async engine with connection pooling
engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


_DB_AVAILABLE: bool = False


async def test_db_connectivity() -> bool:
    """Test if PostgreSQL is responsive."""
    global _DB_AVAILABLE
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            if result.scalar() == 1:
                _DB_AVAILABLE = True
                return True
    except Exception:
        _DB_AVAILABLE = False
    return False


async def get_db() -> AsyncGenerator[AsyncSession | None, None]:
    """Dependency for obtaining async database session with resilient standalone fallback."""
    if not _DB_AVAILABLE:
        yield None
        return

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def check_database_connection() -> dict:
    """Verify raw PostgreSQL connectivity or report standalone readiness."""
    global _DB_AVAILABLE
    if await test_db_connectivity():
        return {"status": "ok", "message": "PostgreSQL connection active"}
    return {
        "status": "standalone_ready",
        "mode": "in_memory_standalone",
        "message": "Standalone in-memory persistence active. Zero external dependencies required.",
    }


async def check_pgvector_extension() -> dict:
    """Verify whether pgvector extension is installed or in-memory vector retrieval is active."""
    if not _DB_AVAILABLE:
        return {
            "status": "standalone_ready",
            "mode": "dense_cosine_python",
            "message": "In-memory dense cosine vector similarity active (standalone fallback).",
        }
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                text("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'")
            )
            row = result.fetchone()
            if row:
                return {
                    "status": "ok",
                    "extension": row[0],
                    "version": row[1],
                    "message": "pgvector extension active",
                }
    except Exception as exc:
        logger.warning(f"pgvector check notice: {exc}")
    return {
        "status": "standalone_ready",
        "mode": "dense_cosine_python",
        "message": "In-memory dense cosine vector similarity active (standalone fallback).",
    }


async def create_tables_if_needed() -> None:
    """Create database tables if connected to database schema."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database schema tables verified/created successfully.")
    except Exception as exc:
        logger.warning(f"Database table creation skipped (db unavailable or standalone mode): {exc}")
