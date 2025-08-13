async def test_client_crud(test_app):
    token = (await test_app.post("/api/token", data={"username":"admin@example.com","password":"admin123"})).json()["access_token"]
    h = {"Authorization": f"Bearer {token}"}
    r = await test_app.post("/api/clients", json={"name":"Alice","email":"alice@example.com"}, headers=h)
    assert r.status_code == 201
    cid = r.json()["id"]
    r = await test_app.get(f"/api/clients/{cid}", headers=h); assert r.status_code==200
    r = await test_app.put(f"/api/clients/{cid}", json={"name":"Alice B"}, headers=h); assert r.status_code==200
    r = await test_app.get("/api/clients", headers=h); assert r.status_code==200
