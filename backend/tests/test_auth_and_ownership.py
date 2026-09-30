import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.challenge import Challenge
from app.models.submission import Submission


@pytest.mark.asyncio
async def test_register_validation_rules(client: AsyncClient):
    # 1. Invalid email
    res1 = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "not_an_email_address",
            "username": "valid_user",
            "password": "Password123!",
            "full_name": "Valid Name",
        },
    )
    assert res1.status_code == 422

    # 2. Invalid username with illegal characters
    res2 = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "valid@univ.edu",
            "username": "user with spaces",
            "password": "Password123!",
            "full_name": "Valid Name",
        },
    )
    assert res2.status_code == 422

    # 3. Username too short
    res3 = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "valid@univ.edu",
            "username": "ab",
            "password": "Password123!",
            "full_name": "Valid Name",
        },
    )
    assert res3.status_code == 422

    # 4. Short password
    res4 = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "valid@univ.edu",
            "username": "validuser",
            "password": "short",
            "full_name": "Valid Name",
        },
    )
    assert res4.status_code == 422


@pytest.mark.asyncio
async def test_duplicate_account_registration(client: AsyncClient):
    payload = {
        "email": "student.dup@univ.edu",
        "username": "unique_student",
        "password": "ValidPassword123!",
        "full_name": "Original Student",
    }
    # Initial successful registration
    res1 = await client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Attempt to register with the same email
    dup_email_payload = {
        "email": "student.dup@univ.edu",
        "username": "different_username",
        "password": "AnotherPassword123!",
        "full_name": "Another Student",
    }
    res2 = await client.post("/api/v1/auth/register", json=dup_email_payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]

    # Attempt to register with the same username
    dup_username_payload = {
        "email": "different.email@univ.edu",
        "username": "unique_student",
        "password": "AnotherPassword123!",
        "full_name": "Third Student",
    }
    res3 = await client.post("/api/v1/auth/register", json=dup_username_payload)
    assert res3.status_code == 409
    assert "already exists" in res3.json()["detail"]


@pytest.mark.asyncio
async def test_generic_auth_errors_on_invalid_credentials(client: AsyncClient):
    # Register Alice
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "alice@univ.edu",
            "username": "alice",
            "password": "AlicePassword123!",
            "full_name": "Alice Developer",
        },
    )

    # 1. Non-existent email -> Returns generic 401
    res_wrong_email = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@univ.edu", "password": "AnyPassword123!"},
    )
    assert res_wrong_email.status_code == 401
    assert res_wrong_email.json()["detail"] == "Invalid email or password"

    # 2. Existing email with incorrect password -> Returns the EXACT same generic 401
    res_wrong_password = await client.post(
        "/api/v1/auth/login",
        json={"email": "alice@univ.edu", "password": "WrongPassword123!"},
    )
    assert res_wrong_password.status_code == 401
    assert res_wrong_password.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_login_sets_secure_httponly_cookie_and_logout(client: AsyncClient):
    # Register
    reg_payload = {
        "email": "cookie.user@univ.edu",
        "username": "cookieuser",
        "password": "CookiePassword123!",
        "full_name": "Cookie Tester",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # Login
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "cookie.user@univ.edu", "password": "CookiePassword123!"},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data

    # Check set-cookie header in response
    cookies = login_res.cookies
    assert settings.COOKIE_NAME in cookies
    token_value = cookies[settings.COOKIE_NAME]
    assert token_value == token_data["access_token"]

    # Verify access to /auth/me using Cookie authentication (no Bearer header)
    client.cookies.set(settings.COOKIE_NAME, token_value)
    me_res = await client.get("/api/v1/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "cookie.user@univ.edu"

    # Logout
    logout_res = await client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200
    # Cookie should be expired/cleared
    logout_cookie = logout_res.cookies.get(settings.COOKIE_NAME)
    assert logout_cookie is None or logout_cookie == '""' or logout_cookie == ""


@pytest.mark.asyncio
async def test_unauthenticated_access_is_rejected(client: AsyncClient):
    # 1. Unauthenticated request to current user profile
    res1 = await client.get("/api/v1/auth/me")
    assert res1.status_code == 401

    # 2. Unauthenticated request to submissions
    res2 = await client.get("/api/v1/submissions/my")
    assert res2.status_code == 401

    # 3. Unauthenticated attempt to submit solution
    res3 = await client.post(
        "/api/v1/submissions",
        json={
            "challenge_id": str(uuid.uuid4()),
            "repository_url": "https://github.com/student/solution",
        },
    )
    assert res3.status_code == 401


@pytest.mark.asyncio
async def test_login_rate_limiting(client: AsyncClient):
    # Attempt 5 consecutive failed logins (configured threshold)
    for _ in range(5):
        res = await client.post(
            "/api/v1/auth/login",
            json={"email": "target@univ.edu", "password": "wrongpassword"},
        )
        assert res.status_code == 401

    # The 6th attempt within the window should be blocked by the rate limiter
    blocked_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "target@univ.edu", "password": "wrongpassword"},
    )
    assert blocked_res.status_code == 429
    assert "Too many login attempts" in blocked_res.json()["detail"]
    assert "Retry-After" in blocked_res.headers


@pytest.mark.asyncio
async def test_cross_user_access_attempt_is_forbidden(
    db_session: AsyncSession,
    client: AsyncClient,
):
    # 1. Create a challenge in DB
    challenge = Challenge(
        slug="security-audit-challenge",
        title="Security Audit Challenge",
        difficulty="intermediate",
        summary="Audit security permissions",
        description_markdown="Audit IDOR and cross-user leaks.",
    )
    db_session.add(challenge)
    await db_session.commit()

    # 2. Register Student A & Login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_a@univ.edu",
            "username": "student_a",
            "password": "PasswordA123!",
            "full_name": "Student A",
        },
    )
    login_a = await client.post(
        "/api/v1/auth/login",
        json={"email": "student_a@univ.edu", "password": "PasswordA123!"},
    )
    token_a = login_a.json()["access_token"]

    # 3. Student A creates a private submission
    sub_res = await client.post(
        "/api/v1/submissions",
        json={
            "challenge_id": str(challenge.id),
            "repository_url": "https://github.com/student_a/secret_solution",
            "notes": "Student A's private work",
        },
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert sub_res.status_code == 201
    submission_id = sub_res.json()["id"]

    # 4. Register Student B & Login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "student_b@univ.edu",
            "username": "student_b",
            "password": "PasswordB123!",
            "full_name": "Student B",
        },
    )
    login_b = await client.post(
        "/api/v1/auth/login",
        json={"email": "student_b@univ.edu", "password": "PasswordB123!"},
    )
    token_b = login_b.json()["access_token"]

    # 5. CROSS-USER ACCESS ATTEMPT: Student B tries to fetch Student A's submission
    cross_res = await client.get(
        f"/api/v1/submissions/{submission_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    # Must be HTTP 403 Forbidden!
    assert cross_res.status_code == 403
    assert "Access forbidden" in cross_res.json()["detail"]

    # 6. Verify that Student A CAN fetch their own submission
    own_res = await client.get(
        f"/api/v1/submissions/{submission_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert own_res.status_code == 200
    assert own_res.json()["id"] == submission_id
