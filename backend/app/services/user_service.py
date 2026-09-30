import uuid
from typing import Optional
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.core.security import get_password_hash, verify_dummy_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username.lower()))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    # Check for existing email or username
    existing_stmt = select(User).where(
        or_(
            User.email == user_in.email.lower(),
            User.username == user_in.username.lower(),
        )
    )
    result = await db.execute(existing_stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email or username already exists",
        )

    db_user = User(
        email=user_in.email.lower(),
        username=user_in.username.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role=user_in.role or "student",
        is_active=True,
    )
    db.add(db_user)
    await db.flush()
    await db.refresh(db_user)
    return db_user


async def authenticate_user(db: AsyncSession, login_data: UserLogin) -> Optional[User]:
    user = await get_user_by_email(db, login_data.email)
    if not user:
        # Constant-time dummy verification prevents email enumeration through response timing
        verify_dummy_password(login_data.password)
        return None

    if not verify_password(login_data.password, user.hashed_password):
        return None

    return user
