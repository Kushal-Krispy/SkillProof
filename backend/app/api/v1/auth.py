from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limiter import check_login_rate_limit
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse
from app.services.user_service import authenticate_user, create_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new student or mentor account.
    Passwords are automatically hashed using Argon2id.
    Validates email format, username regex, and minimum password complexity.
    """
    user = await create_user(db, user_in)
    return user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    response: Response,
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate with email and password.
    Enforces rate limiting per IP and email identifier.
    Returns signed short-lived JWT access token in response body AND sets an
    HttpOnly, SameSite, Secure session cookie so credentials are never stored in localStorage.
    Returns generic authentication error without revealing if email exists.
    """
    # 1. Enforce login rate limit
    check_login_rate_limit(request, identifier=login_data.email)

    # 2. Authenticate user
    user = await authenticate_user(db, login_data)
    if not user:
        # Generic error message defeats account enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently inactive",
        )

    access_token = create_access_token(subject=user.id, role=user.role)

    # 3. Set HttpOnly Cookie (mitigating XSS token theft)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path=settings.COOKIE_PATH,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    """
    Terminates the user session by clearing the HttpOnly access token cookie.
    """
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path=settings.COOKIE_PATH,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve profile details of the currently authenticated user.
    Enforces that private data can only be accessed by the verified token owner.
    """
    return current_user
