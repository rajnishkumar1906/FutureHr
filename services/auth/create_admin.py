"""
Run this once to create the Management Admin account.

Usage:
    cd "D:\AI FULL STACK\FutureHr\services\auth"
    python create_admin.py

Edit the CONFIG section below before running.
"""

import asyncio
import asyncpg
import smtplib
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pwdlib import PasswordHash

# ══════════════════════════════════════════════
#   CONFIGURE THESE BEFORE RUNNING
# ══════════════════════════════════════════════
ADMIN_EMAIL     = "rajnishkalamfan@gmail.com"
ADMIN_PASSWORD  = "Admin@123"
ADMIN_FIRST     = "Admin"
ADMIN_LAST      = "User"

SMTP_HOST       = "smtp.gmail.com"
SMTP_PORT       = 587
SMTP_USER       = "rajnishk71249@gmail.com"
SMTP_PASSWORD   = "dkjz wbtm mylm dwdl"

DATABASE_URL    = (
    "postgresql://neondb_owner:npg_F9P4jZxTRsUn"
    "@ep-quiet-feather-ao5bz0i8.c-2.ap-southeast-1.aws.neon.tech"
    "/neondb?sslmode=require"
)
# ══════════════════════════════════════════════


def send_welcome_email(to_email: str, password: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your FutureHR Admin Account"
    msg["From"]    = f"FutureHR <{SMTP_USER}>"
    msg["To"]      = to_email

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
      <h2 style="color:#4f46e5;margin-bottom:4px;">Welcome to FutureHR</h2>
      <p style="color:#6b7280;margin-top:0;">Your Management Admin account has been created.</p>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">LOGIN URL</p>
        <a href="http://localhost:5173/admin" style="color:#4f46e5;font-weight:bold;">http://localhost:5173/admin</a>

        <hr style="border:none;border-top:1px solid #f3f4f6;margin:16px 0;">

        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">EMAIL</p>
        <p style="margin:0 0 16px;font-weight:bold;color:#111827;">{to_email}</p>

        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">TEMPORARY PASSWORD</p>
        <p style="margin:0;font-family:monospace;font-size:18px;font-weight:bold;color:#4f46e5;letter-spacing:2px;">{password}</p>
      </div>

      <p style="font-size:12px;color:#9ca3af;">Please change your password after your first login.</p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD.replace(" ", ""))
            server.sendmail(SMTP_USER, to_email, msg.as_string())
    except smtplib.SMTPAuthenticationError:
        raise RuntimeError(
            "SMTP authentication failed. Make sure SMTP_USER and SMTP_PASSWORD are correct.\n"
            "Generate an App Password at: https://myaccount.google.com/apppasswords"
        )
    except smtplib.SMTPConnectError:
        raise RuntimeError(f"Could not connect to {SMTP_HOST}:{SMTP_PORT}. Check your internet connection.")
    except smtplib.SMTPRecipientsRefused:
        raise RuntimeError(f"Recipient address '{to_email}' was refused by the SMTP server.")
    except smtplib.SMTPException as e:
        raise RuntimeError(f"SMTP error: {e}")
    except OSError as e:
        raise RuntimeError(f"Network error while sending email: {e}")


async def main():
    # ── Validate config ──────────────────────────────────────
    if not ADMIN_EMAIL or "@" not in ADMIN_EMAIL:
        print("❌  ADMIN_EMAIL is not a valid email address.")
        sys.exit(1)

    if len(ADMIN_PASSWORD) < 6:
        print("❌  ADMIN_PASSWORD must be at least 6 characters.")
        sys.exit(1)

    # ── Connect to database ──────────────────────────────────
    print("Connecting to database...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
    except asyncpg.InvalidPasswordError:
        print("❌  Database authentication failed. Check the DATABASE_URL credentials.")
        sys.exit(1)
    except asyncpg.CannotConnectNowError as e:
        print(f"❌  Database is not ready: {e}")
        sys.exit(1)
    except OSError as e:
        print(f"❌  Could not reach the database host: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌  Unexpected database connection error: {e}")
        sys.exit(1)

    # ── Hash password ────────────────────────────────────────
    try:
        ph     = PasswordHash.recommended()
        hashed = ph.hash(ADMIN_PASSWORD)
    except Exception as e:
        print(f"❌  Failed to hash password: {e}")
        await conn.close()
        sys.exit(1)

    # ── Upsert admin user ────────────────────────────────────
    action = None
    try:
        existing = await conn.fetchrow(
            "SELECT id, role FROM users WHERE email = $1", ADMIN_EMAIL
        )

        if existing:
            if existing["role"] == "Management Admin":
                await conn.execute(
                    "UPDATE users SET hashed_password = $1, is_active = true WHERE email = $2",
                    hashed, ADMIN_EMAIL
                )
                action = "password_updated"
            else:
                await conn.execute(
                    """UPDATE users
                       SET role = 'Management Admin', hashed_password = $1, is_active = true
                       WHERE email = $2""",
                    hashed, ADMIN_EMAIL
                )
                action = "promoted"
        else:
            any_admin = await conn.fetchrow(
                "SELECT id FROM users WHERE role = 'Management Admin'"
            )
            if any_admin:
                print(
                    "⚠️   A Management Admin already exists in the database.\n"
                    "     Change ADMIN_EMAIL to their address and re-run to reset their password."
                )
                await conn.close()
                return

            row = await conn.fetchrow(
                """INSERT INTO users (email, hashed_password, first_name, last_name, role, is_active)
                   VALUES ($1, $2, $3, $4, 'Management Admin', true)
                   RETURNING id""",
                ADMIN_EMAIL, hashed, ADMIN_FIRST, ADMIN_LAST
            )
            print(f"✅  Admin account created (id={row['id']}).")
            action = "created"

    except asyncpg.UniqueViolationError:
        print("❌  A user with this email already exists but could not be updated (unique constraint).")
        await conn.close()
        sys.exit(1)
    except asyncpg.UndefinedTableError:
        print("❌  The 'users' table does not exist. Run the auth service first to initialise the database schema.")
        await conn.close()
        sys.exit(1)
    except asyncpg.PostgresError as e:
        print(f"❌  Database query failed: {e}")
        await conn.close()
        sys.exit(1)
    except Exception as e:
        print(f"❌  Unexpected error during database operation: {e}")
        await conn.close()
        sys.exit(1)
    finally:
        await conn.close()

    # ── Print result ─────────────────────────────────────────
    labels = {
        "password_updated": "Password updated for existing admin",
        "promoted":         "Existing user promoted to Management Admin",
        "created":          "Admin account created",
    }
    print(f"✅  {labels[action]}")
    print(f"   Email   : {ADMIN_EMAIL}")
    print(f"   Password: {ADMIN_PASSWORD}")

    # ── Send welcome email ───────────────────────────────────
    if SMTP_USER and SMTP_PASSWORD.strip():
        print(f"\n📧  Sending welcome email to {ADMIN_EMAIL}...")
        try:
            send_welcome_email(ADMIN_EMAIL, ADMIN_PASSWORD)
            print("✅  Email sent successfully.")
        except RuntimeError as e:
            print(f"⚠️   Email not sent — {e}")
        except Exception as e:
            print(f"⚠️   Unexpected email error: {e}")
    else:
        print("\n⚠️   SMTP not configured — skipping email. Set SMTP_USER and SMTP_PASSWORD in this script.")

    print(f"\n👉  Login at http://localhost:5173/admin")


asyncio.run(main())
