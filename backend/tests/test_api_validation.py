import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.seed_service import seed_initial_data


@pytest.mark.asyncio
async def test_register_invalid_email_fails_validation(client: AsyncClient):
    payload = {
        "email": "not-an-email",
        "username": "valid_user",
        "password": "strongPassword123",
        "full_name": "Valid Name",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    assert "email" in str(response.json())


@pytest.mark.asyncio
async def test_register_short_password_fails_validation(client: AsyncClient):
    payload = {
        "email": "student@univ.edu",
        "username": "valid_user",
        "password": "short",  # Less than 8 characters
        "full_name": "Valid Name",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    assert "password" in str(response.json())


@pytest.mark.asyncio
async def test_register_success_and_login_flow(client: AsyncClient):
    register_payload = {
        "email": "jane.doe@univ.edu",
        "username": "janedoe",
        "password": "SecurePassword123!",
        "full_name": "Jane Doe",
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == "jane.doe@univ.edu"
    assert user_data["username"] == "janedoe"
    assert "hashed_password" not in user_data  # Critical security requirement
    assert "id" in user_data

    # Duplicate registration returns 409
    dup_res = await client.post("/api/v1/auth/register", json=register_payload)
    assert dup_res.status_code == 409

    # Successful login
    login_payload = {
        "email": "jane.doe@univ.edu",
        "password": "SecurePassword123!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    token = token_data["access_token"]

    # Access protected route /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "jane.doe@univ.edu"


@pytest.mark.asyncio
async def test_login_invalid_password_returns_401(client: AsyncClient):
    # Register first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "auth.test@univ.edu",
            "username": "authtester",
            "password": "Password12345",
            "full_name": "Auth Tester",
        },
    )

    # Login with wrong password
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "auth.test@univ.edu", "password": "WrongPassword"},
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


@pytest.mark.asyncio
async def test_submission_invalid_url_fails(client: AsyncClient):
    # Register and get token
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "submitter@univ.edu",
            "username": "submitter",
            "password": "Password12345",
            "full_name": "Submitter",
        },
    )
    user_id = reg.json()["id"]

    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "submitter@univ.edu", "password": "Password12345"},
    )
    token = login.json()["access_token"]

    # Invalid repo url (not http/https)
    invalid_submission = {
        "challenge_id": user_id,  # any uuid
        "repository_url": "ftp://not-a-valid-http-repo.com",
    }
    res = await client.post(
        "/api/v1/submissions",
        json=invalid_submission,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_repeatable_seed_script(db_session: AsyncSession, client: AsyncClient):
    # Run seed once
    res1 = await seed_initial_data(db_session)
    assert res1["skills_created"] > 0
    assert res1["challenges_created"] > 0

    # Run seed second time (idempotency check)
    res2 = await seed_initial_data(db_session)
    assert res2["skills_created"] == 0
    assert res2["challenges_created"] == 0

    # Check challenges listed via API
    list_res = await client.get("/api/v1/challenges")
    assert list_res.status_code == 200
    data = list_res.json()
    assert data["total"] >= 4
