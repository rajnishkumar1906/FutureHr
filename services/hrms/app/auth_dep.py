from fastapi import Request, HTTPException, status
from jose import JWTError, jwt
from .config import settings


def _decode(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return {}


def get_current_user(request: Request) -> dict:
    """
    Validates JWT from Authorization header or cookie.
    Also accepts X-Internal-Key header for service-to-service calls (e.g. ai-recruitment → hrms).
    """
    # Service-to-service internal key bypass
    internal_key = request.headers.get("X-Internal-Key", "")
    if internal_key and internal_key == settings.INTERNAL_API_KEY:
        return {"email": "internal-service", "role": "internal", "id": None}

    token = None

    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]

    if not token:
        cookie_val = request.cookies.get("access_token", "")
        if cookie_val.startswith("Bearer "):
            token = cookie_val[7:]

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = _decode(token)
    if not payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return {
        "email": payload["sub"],
        "role": payload.get("role"),
        "id": payload.get("id"),
    }
