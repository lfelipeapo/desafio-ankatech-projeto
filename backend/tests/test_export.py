async def test_export_clients(test_app):
    token = (await test_app.post("/api/token", data={"username":"reader@example.com","password":"reader123"})).json()["access_token"]
    r = await test_app.get("/api/clients/export", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
