async def test_assets_alloc(test_app):
    admin = (await test_app.post("/api/token", data={"username":"admin@example.com","password":"admin123"})).json()["access_token"]
    h = {"Authorization": f"Bearer {admin}"}
    c = await test_app.post("/api/clients", json={"name":"Bob","email":"bob@example.com"}, headers=h)
    cid = c.json()["id"]
    a = await test_app.post("/api/assets", json={"ticker":"AAPL","name":"Apple"}, headers=h)
    aid = a.json()["id"]
    alloc = await test_app.post("/api/allocations", json={"client_id":cid,"asset_id":aid,"quantity":1,"purchase_price":100,"purchase_date":"2024-01-01"}, headers=h)
    assert alloc.status_code == 201
