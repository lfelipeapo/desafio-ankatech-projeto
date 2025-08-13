async def test_login_admin(test_app):
    resp = await test_app.post("/api/token", data={"username": "admin@example.com", "password": "admin123"})
    assert resp.status_code == 200
    assert resp.json()["access_token"]
