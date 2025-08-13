import pytest
from datetime import date

from backend.pricing import get_current_price, get_previous_close


@pytest.mark.asyncio
async def test_allocation_daily_variation_and_profit(monkeypatch, test_app):
    """Testa cálculo de daily_change_pct e profit_pct em listagem de alocações.

    Utiliza monkeypatch para simular preços atual e anterior, evitando
    dependência de chamadas externas. O endpoint deve calcular:
    - daily_change_pct = (current - previous) / previous
    - profit_pct = (current - purchase_price) / purchase_price
    """
    # stubs para preços
    async def fake_get_current_price(symbol: str) -> float:
        return 120.0

    async def fake_get_previous_close(symbol: str) -> float:
        return 115.0

    # aplica monkeypatch nas funções usadas em api
    monkeypatch.setattr("backend.api.get_current_price", fake_get_current_price)
    monkeypatch.setattr("backend.api.get_previous_close", fake_get_previous_close)
    # autentica admin
    tok = (await test_app.post("/api/token", data={"username": "admin@example.com", "password": "admin123"})).json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}
    # cria cliente, ativo e alocação
    c = await test_app.post("/api/clients", json={"name": "Dana", "email": "dana@example.com"}, headers=h)
    cid = c.json()["id"]
    a = await test_app.post("/api/assets", json={"ticker": "MSFT", "name": "Microsoft"}, headers=h)
    aid = a.json()["id"]
    alloc = await test_app.post(
        "/api/allocations",
        json={
            "client_id": cid,
            "asset_id": aid,
            "quantity": 2.0,
            "purchase_price": 100.0,
            "purchase_date": "2024-01-01",
        },
        headers=h,
    )
    assert alloc.status_code == 201
    # consulta alocações
    resp = await test_app.get(f"/api/clients/{cid}/allocations", headers=h)
    assert resp.status_code == 200
    data = resp.json()
    assert data and isinstance(data, list)
    # como definimos current=120 e prev=115:
    exp_daily = (120.0 - 115.0) / 115.0
    exp_profit = (120.0 - 100.0) / 100.0
    assert abs(data[0]["daily_change_pct"] - exp_daily) < 1e-6
    assert abs(data[0]["profit_pct"] - exp_profit) < 1e-6