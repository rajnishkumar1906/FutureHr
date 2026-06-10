from fastapi import APIRouter, Depends, HTTPException, status, Response, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from ..database import get_db_connection
from ..schemas.schemas import UserCreate, UserResponse, Token, UserLogin
from ..utils.security import verify_password, get_password_hash, create_access_token
from ..utils.mail_service import send_welcome_email, send_employee_credentials
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, background_tasks: BackgroundTasks):
    conn = await get_db_connection()

    db_user = await conn.fetchrow("SELECT * FROM users WHERE email = $1", user.email)
    if db_user:
        await conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

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

    # Send welcome email for candidates (non-blocking background task)
    if user.role == 'Candidate':
        background_tasks.add_task(send_welcome_email, user.first_name, user.email)

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
@router.post("/promote-employee")
async def promote_to_employee(data: dict, background_tasks: BackgroundTasks):
    """Called by AI recruitment service when a candidate is hired."""
    email      = data.get("email")
    first_name = data.get("first_name", "")
    last_name  = data.get("last_name", "")
    password   = data.get("password", "")
    job_title  = data.get("job_title", "")

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
            temp_password = password
            if not temp_password:
                import secrets
                temp_password = secrets.token_urlsafe(10)
            hashed = await get_password_hash(temp_password)
            row = await conn.fetchrow(
                """
                INSERT INTO users (email, hashed_password, first_name, last_name, role)
                VALUES ($1, $2, $3, $4, 'Employee')
                RETURNING id
                """,
                email, hashed, first_name, last_name
            )
            # Email employee their credentials (non-blocking)
            background_tasks.add_task(
                send_employee_credentials, first_name, email, temp_password, job_title
            )
            return {
                "message":      "Employee account created",
                "email":        email,
                "user_id":      row["id"],
                "temp_password": temp_password,
            }
    finally:
        await conn.close()
