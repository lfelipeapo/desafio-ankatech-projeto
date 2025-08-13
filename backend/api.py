from __future__ import annotations
from typing import List, Optional
import os, sys
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

# Adiciona o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import crud, schemas
from database import get_session
from auth import read_required, admin_required, get_token_for_form
from pricing import yahoo_search, get_current_price, get_previous_close
from sqlalchemy.exc import IntegrityError
from models import DailyReturn

router = APIRouter(prefix="/api", tags=["invest"])

@router.post("/token", response_model=schemas.Token, tags=["auth"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> JSONResponse:
    token = await get_token_for_form(form_data)
    resp = JSONResponse(content=token.model_dump())
    # Cookie HttpOnly configurável via env
    cookie_secure = os.environ.get("SECURE_COOKIE", "false").lower() == "true"
    cookie_samesite = os.environ.get("COOKIE_SAMESITE", "lax").lower()
    cookie_domain = os.environ.get("COOKIE_DOMAIN") or None
    resp.set_cookie(
        key="access_token",
        value=token.access_token,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,  # lax|strict|none
        max_age=60*60*2,
        path="/",
        domain=cookie_domain,
    )
    return resp

@router.get("/clients", response_model=List[schemas.ClientOut])
async def list_clients(skip: int = Query(0, ge=0), limit: int = Query(20, gt=0, le=100), search: Optional[str] = None, is_active: Optional[bool] = None, session=Depends(get_session), _: schemas.User = Depends(read_required)) -> List[schemas.ClientOut]:
    clients = await crud.list_clients(session, skip, limit, search, is_active)
    return list(clients)  # type: ignore[return-value]

@router.post("/clients", response_model=schemas.ClientOut, status_code=status.HTTP_201_CREATED)
async def create_client(client_in: schemas.ClientCreate, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> schemas.ClientOut:
    return await crud.create_client(session, client_in)

@router.get("/clients/{client_id}", response_model=schemas.ClientOut)
async def get_client(client_id: int, session=Depends(get_session), _: schemas.User = Depends(read_required)) -> schemas.ClientOut:
    client = await crud.get_client(session, client_id)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/clients/{client_id}", response_model=schemas.ClientOut)
async def update_client(client_id: int, updates: schemas.ClientUpdate, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> schemas.ClientOut:
    client = await crud.get_client(session, client_id)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return await crud.update_client(session, client, updates)

@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_client(client_id: int, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> Response:
    client = await crud.get_client(session, client_id)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    await crud.delete_client(session, client)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/prices/{symbol}")
async def get_prices(symbol: str) -> dict:
    """Retorna preço atual e fechamento anterior de um ticker.

    Usado como fallback no frontend quando o WebSocket estiver indisponível
    ou sob rate‑limit. Erros externos são tratados como valores nulos.
    """
    try:
        cur = await get_current_price(symbol)
    except Exception:
        cur = None
    try:
        prev = await get_previous_close(symbol)
    except Exception:
        prev = None
    return {"current": cur, "previous": prev}

@router.post("/assets", response_model=schemas.AssetOut, status_code=status.HTTP_201_CREATED)
async def create_asset(asset_in: schemas.AssetCreate, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> schemas.AssetOut:
    return await crud.create_asset(session, asset_in)

@router.get("/assets", response_model=List[schemas.AssetOut])
async def list_assets(skip: int = Query(0, ge=0), limit: int = Query(100, gt=0, le=500), search: Optional[str] = None, session=Depends(get_session), _: schemas.User = Depends(read_required)) -> List[schemas.AssetOut]:
    assets = await crud.list_assets(session, skip, limit, search)
    return list(assets)  # type: ignore[return-value]

@router.get("/assets/search")
async def search_assets(q: str) -> list[dict]:
    """Busca sugestões de ativos pelo Yahoo Finance.

    Consulta o serviço de busca do Yahoo Finance com o parâmetro `q` e
    retorna uma lista de dicionários contendo `symbol` e `shortname`.
    Em caso de erro na consulta externa, retorna uma lista vazia ao
    invés de lançar exceção.
    """
    try:
        return await yahoo_search(q)
    except Exception:
        return []

@router.get("/assets/{asset_id}", response_model=schemas.AssetOut)
async def get_asset(asset_id: int, session=Depends(get_session), _: schemas.User = Depends(read_required)) -> schemas.AssetOut:
    asset = await crud.get_asset(session, asset_id)
    if not asset: raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put("/assets/{asset_id}", response_model=schemas.AssetOut)
async def update_asset(asset_id: int, updates: schemas.AssetUpdate, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> schemas.AssetOut:
    asset = await crud.get_asset(session, asset_id)
    if not asset: raise HTTPException(status_code=404, detail="Asset not found")
    return await crud.update_asset(session, asset, updates)

@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_asset(asset_id: int, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> Response:
    asset = await crud.get_asset(session, asset_id)
    if not asset: raise HTTPException(status_code=404, detail="Asset not found")
    await crud.delete_asset(session, asset)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/clients/{client_id}/allocations", response_model=List[schemas.AllocationOut])
async def list_allocations(client_id: int, session=Depends(get_session), _: schemas.User = Depends(read_required)) -> List[schemas.AllocationOut]:
    client = await crud.get_client(session, client_id)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    allocations = await crud.list_allocations_for_client(session, client_id)
    out: list[schemas.AllocationOut] = []
    for alloc in allocations:
        # Protege contra falhas externas (rate-limit/HTTP) sem quebrar a rota
        try:
            current = await get_current_price(alloc.asset.ticker) if alloc.asset else None
        except Exception:
            current = None
        try:
            prev = await get_previous_close(alloc.asset.ticker) if alloc.asset else None
        except Exception:
            prev = None
        # Fallback: se não houver preço atual, use fechamento anterior para manter cálculo estável
        eff_current = current if current is not None else prev
        daily_change_pct = None
        if prev and prev != 0 and eff_current is not None:
            daily_change_pct = (eff_current - prev) / prev
        # Rentabilidade acumulada desde a compra: (preço_ref - preço_compra) / preço_compra
        profit = None
        if eff_current is not None and alloc.purchase_price:
            profit = (eff_current - alloc.purchase_price) / alloc.purchase_price
        out.append(
            schemas.AllocationOut(
                id=alloc.id,
                client_id=alloc.client_id,
                asset_id=alloc.asset_id,
                quantity=alloc.quantity,
                purchase_price=alloc.purchase_price,
                purchase_date=alloc.purchase_date,
                current_price=current,
                daily_change_pct=daily_change_pct,
                profit_pct=profit,
            )
        )
    return out

@router.post("/allocations", response_model=schemas.AllocationOut, status_code=status.HTTP_201_CREATED)
async def create_allocation(allocation_in: schemas.AllocationCreate, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> schemas.AllocationOut:
    try:
        alloc = await crud.create_allocation(session, allocation_in)
    except IntegrityError:
        # Chave única: (client_id, asset_id, purchase_date)
        raise HTTPException(status_code=409, detail="Allocation already exists for this client, asset and date")
    return schemas.AllocationOut(**allocation_in.model_dump(), id=alloc.id)

@router.put("/allocations/{allocation_id}", response_model=schemas.AllocationOut)
async def update_allocation(allocation_id: int, updates: schemas.AllocationUpdate, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> schemas.AllocationOut:
    allocation = await crud.get_allocation(session, allocation_id)
    if not allocation: raise HTTPException(status_code=404, detail="Allocation not found")
    allocation = await crud.update_allocation(session, allocation, updates)
    return schemas.AllocationOut(id=allocation.id, client_id=allocation.client_id, asset_id=allocation.asset_id, quantity=allocation.quantity, purchase_price=allocation.purchase_price, purchase_date=allocation.purchase_date)

@router.delete("/allocations/{allocation_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_allocation(allocation_id: int, session=Depends(get_session), _: schemas.User = Depends(admin_required)) -> Response:
    allocation = await crud.get_allocation(session, allocation_id)
    if not allocation: raise HTTPException(status_code=404, detail="Allocation not found")
    await crud.delete_allocation(session, allocation)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/clients/{client_id}/performance", response_model=schemas.PerformanceOut)
async def get_client_performance(client_id: int, session=Depends(get_session), _: schemas.User = Depends(read_required)) -> schemas.PerformanceOut:
    client = await crud.get_client(session, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    # Repassa cálculo ao módulo crud
    return await crud.compute_client_performance(session, client_id)

@router.get("/clients/{client_id}/positions")
async def export_positions(client_id: int, format: str = "csv", session=Depends(get_session), _: schemas.User = Depends(read_required)) -> StreamingResponse:
    import csv
    from io import StringIO, BytesIO
    from openpyxl import Workbook
    client = await crud.get_client(session, client_id)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    allocations = await crud.list_allocations_for_client(session, client_id)
    rows = [(
        "asset_id",
        "ticker",
        "quantity",
        "purchase_price",
        "current_price",
        "profit_pct",
        "daily_change_pct",
    )]
    for a in allocations:
        try:
            cur = await get_current_price(a.asset.ticker) if a.asset else None
        except Exception:
            cur = None
        try:
            prev = await get_previous_close(a.asset.ticker) if a.asset else None
        except Exception:
            prev = None
        # Fallback para exportação: quando não houver preço atual (ex.: rate-limit), usa fechamento anterior
        eff_current = cur if cur is not None else prev
        profit = ((eff_current - a.purchase_price) / a.purchase_price) if eff_current is not None and a.purchase_price else None
        daily = None
        if prev and prev != 0 and eff_current is not None:
            daily = (eff_current - prev) / prev
        rows.append(
            (
                a.asset_id,
                a.asset.ticker if a.asset else "",
                a.quantity,
                a.purchase_price,
                cur,
                profit,
                daily,
            )
        )
    if format == "xlsx":
        wb = Workbook(); ws = wb.active; ws.title = "positions"; 
        for row in rows: ws.append(list(row))
        b = BytesIO(); wb.save(b); b.seek(0)
        headers = {"Content-Disposition": "attachment; filename=positions.xlsx"}
        return StreamingResponse(b, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)
    out = StringIO(); w = csv.writer(out); [w.writerow(r) for r in rows]; out.seek(0)
    headers = {"Content-Disposition": "attachment; filename=positions.csv"}
    return StreamingResponse(out, media_type="text/csv", headers=headers)

@router.get("/clients/export")
async def export_clients(session=Depends(get_session), _: schemas.User = Depends(read_required)) -> StreamingResponse:
    import csv
    from io import StringIO
    clients = await crud.list_clients(session, 0, 1000)
    out = StringIO(); w = csv.writer(out)
    w.writerow(["id","name","email","is_active","created_at"])
    for c in clients: w.writerow([c.id, c.name, c.email, c.is_active, c.created_at.isoformat()])
    out.seek(0); headers = {"Content-Disposition": "attachment; filename=clients.csv"}
    return StreamingResponse(out, media_type="text/csv", headers=headers)

def create_app() -> FastAPI:
    app = FastAPI(title="Investment API", version="1.0.0")
    origins_env = os.environ.get("FRONTEND_ORIGINS")
    if origins_env:
        origins = [o.strip() for o in origins_env.split(",") if o.strip()]
    else:
        origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )
    app.include_router(router)
    return app
