import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
from ..config import settings

password_hash = PasswordHash.recommended()


async def get_password_hash(password: str) -> str:
    """Hashes a plain text password using bcrypt (run in thread pool to avoid blocking)."""
    return await asyncio.to_thread(password_hash.hash, password)


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against its hash (run in thread pool)."""
    def _verify():
        try:
            return password_hash.verify(plain_password, hashed_password)
        except (UnknownHashError, Exception):
            return False
    return await asyncio.to_thread(_verify)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a secure JWT access token (pure CPU — stays sync)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """Decodes a JWT access token and returns the email (pure CPU — stays sync)."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
