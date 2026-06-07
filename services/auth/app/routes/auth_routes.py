from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from ..database import get_db_connection
from ..schemas.schemas import UserCreate, UserResponse, Token, UserLogin
from ..utils.security import verify_password, get_password_hash, create_access_token
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    conn = await get_db_connection()
    
    # Check if email exists
    db_user = await conn.fetchrow("SELECT * FROM users WHERE email = $1", user.email)
    if db_user:
        await conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if user is trying to register as Management Admin and one already exists
    if user.role == "Management Admin":
        existing_admin = await conn.fetchrow("SELECT * FROM users WHERE role = 'Management Admin'")
        if existing_admin:
            await conn.close()
            raise HTTPException(status_code=400, detail="You can't be Management Admin, one already exists!")
    
    hashed_password = await get_password_hash(user.password)
    
    new_user = await conn.fetchrow(
        """
        INSERT INTO users (email, hashed_password, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, role, is_active, created_at
        """,
        user.email, hashed_password, user.first_name, user.last_name, user.role
    )
    
    await conn.close()
    
    return dict(new_user)

@router.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    conn = await get_db_connection()
    
    user = await conn.fetchrow("SELECT * FROM users WHERE email = $1", form_data.username)
    
    if not user or not await verify_password(form_data.password, user["hashed_password"]):
        await conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"], "id": user["id"]},
        expires_delta=access_token_expires
    )
    
    is_secure = settings.COOKIE_SECURE
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=1800,
        samesite="none" if is_secure else "lax",
        secure=is_secure,
    )
    
    await conn.close()
    
    return {"access_token": access_token, "token_type": "bearer", "user": {
        "id": user["id"],
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "role": user["role"]
    }}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}


@router.get("/users")
async def get_users(role: str = None):
    """Return all users, optionally filtered by role. Used by admin for manager selection."""
    conn = await get_db_connection()
    try:
        if role:
            users = await conn.fetch(
                "SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE role = $1",
                role
            )
        else:
            users = await conn.fetch(
                "SELECT id, email, first_name, last_name, role, is_active, created_at FROM users"
            )
        return [dict(u) for u in users]
    finally:
        await conn.close()


@router.post("/internal/promote-employee")
async def promote_to_employee(data: dict):
    """Called by AI recruitment service when a candidate is hired."""
    email = data.get("email")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    password = data.get("password", "")

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    conn = await get_db_connection()
    try:
        existing = await conn.fetchrow("SELECT * FROM users WHERE email = $1", email)
        if existing:
            await conn.execute(
                "UPDATE users SET role = 'Employee', is_active = true WHERE email = $1",
                email
            )
            row = await conn.fetchrow("SELECT id FROM users WHERE email = $1", email)
            return {"message": "User promoted to Employee", "email": email, "user_id": row["id"]}
        else:
            if not password:
                import secrets
                password = secrets.token_urlsafe(10)
            hashed = await get_password_hash(password)
            row = await conn.fetchrow(
                """
                INSERT INTO users (email, hashed_password, first_name, last_name, role)
                VALUES ($1, $2, $3, $4, 'Employee')
                RETURNING id
                """,
                email, hashed, first_name, last_name
            )
            return {"message": "Employee account created", "email": email, "user_id": row["id"], "temp_password": password}
    finally:
        await conn.close()
