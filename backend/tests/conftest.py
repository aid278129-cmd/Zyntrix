import pytest
import sys
import os
from pathlib import Path
from httpx import AsyncClient, ASGITransport

# Ensure repository root is in sys.path
repo_root = Path(__file__).resolve().parent.parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from backend.app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
