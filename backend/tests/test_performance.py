import asyncio
from datetime import date

import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from backend.database import Base
from backend import models, crud, schemas


@pytest.mark.asyncio
async def test_compute_client_performance_single_asset():
    """Verifica cálculo de rentabilidade acumulada para um cliente com uma alocação.

    Criamos uma base de dados em memória, inserimos um cliente, um ativo,
    uma alocação e dois fechamentos diários. A rentabilidade deve refletir
    corretamente a variação percentual relativa ao preço de compra.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session() as session:
        # cria cliente e ativo
        client = models.Client(name="Test", email="test@example.com")
        asset = models.Asset(ticker="TEST", name="Test Asset")
        session.add_all([client, asset])
        await session.commit()
        await session.refresh(client)
        await session.refresh(asset)
        # cria alocação
        alloc = models.Allocation(
            client_id=client.id,
            asset_id=asset.id,
            quantity=1.0,
            purchase_price=100.0,
            purchase_date=date(2024, 1, 1),
        )
        session.add(alloc)
        await session.commit()
        # insere retornos diários (110 e 120)
        session.add(models.DailyReturn(asset_id=asset.id, date=date(2024, 1, 2), close_price=110.0))
        session.add(models.DailyReturn(asset_id=asset.id, date=date(2024, 1, 3), close_price=120.0))
        await session.commit()
        # calcula performance
        perf: schemas.PerformanceOut = await crud.compute_client_performance(session, client.id)
        # Devem existir dois pontos de retorno
        assert len(perf.points) == 2
        # dia 2024-01-02: retorno = (110-100)/100 = 0.1
        assert abs(perf.points[0].cumulative_return - 0.10) < 1e-6
        # dia 2024-01-03: retorno = (120-100)/100 = 0.2
        assert abs(perf.points[1].cumulative_return - 0.20) < 1e-6