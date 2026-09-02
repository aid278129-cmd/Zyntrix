from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.core.logging import logger

# Create async engine with connection pooling
engine = create_async_engine(
    settings.async_database_url,
    echo=settings.DEBUG,
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


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_database_connection() -> dict:
    """Verify raw PostgreSQL connectivity."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
            if val == 1:
                return {"status": "ok", "message": "PostgreSQL connection active"}
            return {"status": "error", "message": "Unexpected query response"}
    except Exception as exc:
        logger.warning(f"Database health check failed: {exc}")
        return {"status": "unavailable", "message": str(exc)}


async def check_pgvector_extension() -> dict:
    """Verify whether pgvector extension is installed and available in PostgreSQL."""
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
            return {
                "status": "disabled",
                "message": "pgvector extension not installed in current database schema",
            }
    except Exception as exc:
        logger.warning(f"pgvector check failed: {exc}")
        return {"status": "unavailable", "message": str(exc)}
