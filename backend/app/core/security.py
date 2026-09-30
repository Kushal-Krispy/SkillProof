from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from jose import JWTError, jwt
from app.core.config import settings

# Direct, maintained Argon2id password hasher (RFC 9106 compliant)
# Recommended parameters for interactive logins: memory 64MB, time 3, parallelism 4
hasher = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)

# Pre-computed dummy hash used to eliminate timing side-channels for non-existent users
_DUMMY_HASH = hasher.hash("nonexistent_user_timing_mitigation_password")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against an Argon2id hash."""
    try:
        return hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def verify_dummy_password(plain_password: str) -> None:
    """
    Executes an Argon2id verification against a dummy hash.
    Ensures that authentication requests for non-existent emails consume the
    exact same CPU time as existing accounts, defeating timing enumeration attacks.
    """
    try:
        hasher.verify(_DUMMY_HASH, plain_password)
    except Exception:
        pass


def get_password_hash(password: str) -> str:
    """Generates a secure Argon2id hash for the given password."""
    return hasher.hash(password)


def create_access_token(
    subject: Union[str, Any],
    role: str = "student",
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Creates a short-lived signed JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT access token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
