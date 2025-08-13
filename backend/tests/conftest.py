import asyncio, pytest, sys, os
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import MetaData

# Adiciona o diretório pai ao path para importar o módulo backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop

@pytest.fixture(scope="session")
async def test_app():
    # Limpa o metadata antes de importar para evitar conflitos
    from database import Base
    Base.metadata.clear()
    
    from database import get_session
    from api import create_app
    
    database_url = "sqlite+aiosqlite:///:memory:"
    engine = create_async_engine(database_url, future=True)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async def _get_session_override():
        async with async_session() as s: 
            yield s
    
    app = create_app()
    app.dependency_overrides[get_session] = _get_session_override
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
