from __future__ import annotations
from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
import models, schemas

async def create_client(session: AsyncSession, client_in: schemas.ClientCreate) -> models.Client:
    client = models.Client(name=client_in.name, email=client_in.email)
    session.add(client); await session.commit(); await session.refresh(client); return client

async def get_client(session: AsyncSession, client_id: int) -> Optional[models.Client]:
    res = await session.execute(select(models.Client).where(models.Client.id == client_id))
    return res.scalar_one_or_none()

async def list_clients(session: AsyncSession, skip=0, limit=20, search: Optional[str]=None, is_active: Optional[bool]=None) -> Sequence[models.Client]:
    q = select(models.Client)
    if search:
        like = f"%{search}%"
        q = q.where((models.Client.name.ilike(like)) | (models.Client.email.ilike(like)))
    if is_active is not None:
        q = q.where(models.Client.is_active == is_active)
    q = q.order_by(models.Client.created_at.desc()).offset(skip).limit(limit)
    return (await session.execute(q)).scalars().all()

async def update_client(session: AsyncSession, client: models.Client, updates: schemas.ClientUpdate) -> models.Client:
    for f, v in updates.model_dump(exclude_unset=True).items(): setattr(client, f, v)
    session.add(client); await session.commit(); await session.refresh(client); return client

async def delete_client(session: AsyncSession, client: models.Client) -> None:
    await session.delete(client); await session.commit()

async def create_asset(session: AsyncSession, asset_in: schemas.AssetCreate) -> models.Asset:
    q = await session.execute(select(models.Asset).where(models.Asset.ticker == asset_in.ticker))
    ex = q.scalar_one_or_none()
    if ex:
        if asset_in.name and ex.name != asset_in.name:
            ex.name = asset_in.name; session.add(ex); await session.commit(); await session.refresh(ex)
        return ex
    a = models.Asset(ticker=asset_in.ticker, name=asset_in.name); session.add(a); await session.commit(); await session.refresh(a); return a

async def list_assets(session: AsyncSession, skip=0, limit=100, search: Optional[str]=None) -> Sequence[models.Asset]:
    q = select(models.Asset)
    if search: q = q.where(models.Asset.ticker.ilike(f"%{search}%") | models.Asset.name.ilike(f"%{search}%"))
    q = q.order_by(models.Asset.ticker).offset(skip).limit(limit)
    return (await session.execute(q)).scalars().all()

async def get_asset(session: AsyncSession, asset_id: int) -> Optional[models.Asset]:
    return (await session.execute(select(models.Asset).where(models.Asset.id == asset_id))).scalar_one_or_none()

async def update_asset(session: AsyncSession, asset: models.Asset, updates: schemas.AssetUpdate) -> models.Asset:
    for f, v in updates.model_dump(exclude_unset=True).items(): setattr(asset, f, v)
    session.add(asset); await session.commit(); await session.refresh(asset); return asset

async def delete_asset(session: AsyncSession, asset: models.Asset) -> None:
    await session.delete(asset); await session.commit()

async def create_allocation(session: AsyncSession, allocation_in: schemas.AllocationCreate) -> models.Allocation:
    a = models.Allocation(**allocation_in.model_dump()); session.add(a); await session.commit(); await session.refresh(a); return a

async def get_allocation(session: AsyncSession, allocation_id: int) -> Optional[models.Allocation]:
    return (await session.execute(select(models.Allocation).where(models.Allocation.id == allocation_id))).scalar_one_or_none()

async def update_allocation(session: AsyncSession, allocation: models.Allocation, updates: schemas.AllocationUpdate) -> models.Allocation:
    # Permite atualizar asset_id (troca de ativo) e demais campos
    for f, v in updates.model_dump(exclude_unset=True).items():
        setattr(allocation, f, v)
    session.add(allocation); await session.commit(); await session.refresh(allocation); return allocation

async def delete_allocation(session: AsyncSession, allocation: models.Allocation) -> None:
    await session.delete(allocation); await session.commit()

async def list_allocations_for_client(session: AsyncSession, client_id: int):
    q = select(models.Allocation).options(joinedload(models.Allocation.asset)).where(models.Allocation.client_id == client_id)
    return (await session.execute(q)).scalars().all()

# === Lógica de performance e rentabilidade ===
async def compute_client_performance(session: AsyncSession, client_id: int) -> schemas.PerformanceOut:
    """Calcula a curva de rentabilidade diária acumulada de um cliente.

    A rentabilidade é calculada a partir da série de preços de fechamento armazenada
    em `daily_returns` e das alocações do cliente. Para cada data em que
    existe um fechamento registrado, calculamos o valor de mercado
    das alocações ativas naquele dia e comparamos com o valor de compra
    (custo). A rentabilidade é dada por (valorAtual - valorInicial) / valorInicial.
    """
    # Obtém alocações do cliente
    allocations = await list_allocations_for_client(session, client_id)
    if not allocations:
        return schemas.PerformanceOut(client_id=client_id, points=[])
    # Map asset_id -> list of allocations (quantity, purchase_price)
    from collections import defaultdict
    alloc_map: dict[int, list[tuple[float, float, models.Allocation]]] = defaultdict(list)
    total_initial_cost = 0.0
    for alloc in allocations:
        alloc_map[alloc.asset_id].append((alloc.quantity, alloc.purchase_price, alloc))
        total_initial_cost += alloc.quantity * alloc.purchase_price
    # Se custo total for zero, não é possível calcular retorno
    if total_initial_cost == 0:
        return schemas.PerformanceOut(client_id=client_id, points=[])
    # Coleta série de preços para todos os ativos alocados
    asset_ids = list(alloc_map.keys())
    rows = (await session.execute(
        select(models.DailyReturn).where(models.DailyReturn.asset_id.in_(asset_ids)).order_by(models.DailyReturn.date)
    )).scalars().all()
    if not rows:
        return schemas.PerformanceOut(client_id=client_id, points=[])
    # Organiza preços por data -> asset_id -> close_price
    from collections import defaultdict as dd
    prices_by_date: dict = dd(dict)
    for dr in rows:
        prices_by_date[dr.date][dr.asset_id] = dr.close_price
    # Calcula retorno acumulado para cada data
    points: list[schemas.PerformancePoint] = []
    for dt in sorted(prices_by_date.keys()):
        total_value = 0.0
        # Soma valor de cada alocação ativa no dia
        for asset_id, positions in alloc_map.items():
            price = prices_by_date[dt].get(asset_id)
            if price is None:
                # se não há preço para este ativo nesta data, ignora
                continue
            for qty, purchase_price, alloc in positions:
                # Se a data de fechamento é anterior à data de compra, ignora
                if dt < alloc.purchase_date:
                    continue
                total_value += qty * price
        # Calcula retorno
        cumulative_return = (total_value - total_initial_cost) / total_initial_cost
        points.append(schemas.PerformancePoint(date=dt, cumulative_return=cumulative_return))
    return schemas.PerformanceOut(client_id=client_id, points=points)
