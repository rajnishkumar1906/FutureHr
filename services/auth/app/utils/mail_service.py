"""
FutureHR Auth Mail Service
--------------------------
All outgoing emails sent by the auth service live here.
Each public function is responsible for ONE email purpose so
routes stay clean and email templates are easy to find/edit.

Functions
---------
send_welcome_email          — candidate sign-up confirmation
send_login_notification     — security alert on new login
send_employee_credentials   — new employee account credentials after hire
send_password_reset         — future: password-reset link
send_account_deactivated    — when an account is disabled
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings

logger = logging.getLogger(__name__)

# ─── Shared helpers ──────────────────────────────────────────────────────────

_BRAND_HEADER = """
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;
            border:1px solid #e5e7eb;border-radius:12px;background:#ffffff">
  <div style="margin-bottom:24px">
    <h1 style="color:#4f46e5;margin:0;font-size:28px;font-weight:800">FutureHR</h1>
    <p  style="color:#6b7280;margin:4px 0 0;font-size:13px">AI-Powered Recruitment Platform</p>
  </div>
"""

_BRAND_FOOTER = """
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0"/>
  <p style="color:#9ca3af;font-size:12px;margin:0">
    © FutureHR — This is an automated email, please do not reply.
  </p>
</div>
"""

_BTN = (
    '<a href="{url}" style="display:inline-block;background:#4f46e5;color:white;'
    'padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;'
    'font-size:15px">{label}</a>'
)


def _smtp_creds():
    user = (settings.SMTP_USERNAME or "").strip()
    pwd  = (settings.SMTP_PASSWORD or "").strip().replace(" ", "")
    return user, pwd


def _send(to_addr: str, subject: str, html_body: str) -> bool:
    """Low-level SMTP sender. Returns True on success, False on failure."""
    user, pwd = _smtp_creds()
    if not user or not pwd:
        logger.warning("SMTP not configured — skipping email to %s", to_addr)
        return False

    msg = MIMEMultipart("alternative")
    msg["From"]    = user
    msg["To"]      = to_addr
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15) as srv:
            srv.ehlo()
            srv.starttls()
            srv.ehlo()
            srv.login(user, pwd)
            srv.sendmail(user, [to_addr], msg.as_string())
        logger.info("Email sent → %s | %s", to_addr, subject)
        return True
    except smtplib.SMTPAuthenticationError:
        logger.error(
            "SMTP auth failed — use a Gmail App Password "
            "(https://myaccount.google.com/apppasswords)"
        )
    except smtplib.SMTPException as exc:
        logger.error("SMTP error: %s", exc)
    except OSError as exc:
        logger.error("Network error reaching SMTP server: %s", exc)
    return False


# ─── 1. Welcome email (candidate sign-up) ────────────────────────────────────

def send_welcome_email(first_name: str, email: str) -> bool:
    """
    Sent automatically when a candidate creates an account.
    """
    body = _BRAND_HEADER + f"""
  <h2 style="color:#111827;margin:0 0 8px">Welcome, {first_name}! 🎉</h2>
  <p style="color:#374151;line-height:1.6">
    Your FutureHR candidate account has been created successfully.
    You can now browse open positions, apply, track your application status,
    and complete voice screening interviews — all in one place.
  </p>
  <ul style="color:#374151;line-height:2">
    <li>✅ Apply for open positions</li>
    <li>📊 Track your application status in real time</li>
    <li>🎙️ Complete AI-assisted voice interviews</li>
    <li>🚀 Get hired and join the team</li>
  </ul>
  <p style="margin:24px 0">
    {_BTN.format(url="http://localhost:5173/careers/status", label="View My Applications")}
  </p>
""" + _BRAND_FOOTER

    return _send(email, "Welcome to FutureHR — Account Created", body)


# ─── 2. Login notification (security alert) ──────────────────────────────────

def send_login_notification(first_name: str, email: str) -> bool:
    """
    Optional security email sent when a user logs in.
    Call this from the login route if you want login alerts.
    """
    body = _BRAND_HEADER + f"""
  <h2 style="color:#111827;margin:0 0 8px">New Sign-In Detected</h2>
  <p style="color:#374151;line-height:1.6">
    Hi <strong>{first_name}</strong>, a new sign-in to your FutureHR account was just recorded.
  </p>
  <p style="color:#374151;line-height:1.6">
    If this was you, no action is needed. If you did not sign in,
    please change your password immediately.
  </p>
  <p style="margin:24px 0">
    {_BTN.format(url="http://localhost:5173/careers/login", label="Go to My Account")}
  </p>
  <p style="color:#9ca3af;font-size:13px">
    If you did not request this, please contact support.
  </p>
""" + _BRAND_FOOTER

    return _send(email, "FutureHR — New Sign-In to Your Account", body)


# ─── 3. Employee credentials (sent on hire) ──────────────────────────────────

def send_employee_credentials(
    first_name: str,
    email: str,
    temp_password: str,
    job_title: str = "",
) -> bool:
    """
    Sent when a candidate is hired and an employee account is created.
    Includes temporary password and link to the employee portal.
    """
    role_line = f"<p style='color:#374151'>Position: <strong>{job_title}</strong></p>" if job_title else ""
    body = _BRAND_HEADER + f"""
  <h2 style="color:#111827;margin:0 0 8px">Congratulations — You're Hired! 🎊</h2>
  <p style="color:#374151;line-height:1.6">
    Hi <strong>{first_name}</strong>, we are thrilled to welcome you to the FutureHR team.
    Your employee account has been created.
  </p>
  {role_line}
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;
              padding:20px;margin:20px 0">
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;font-weight:600;
              text-transform:uppercase;letter-spacing:.05em">Your Login Credentials</p>
    <p style="margin:0 0 4px;color:#111827"><strong>Email:</strong> {email}</p>
    <p style="margin:0;color:#111827"><strong>Temporary Password:</strong>
       <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px">{temp_password}</code>
    </p>
  </div>
  <p style="color:#ef4444;font-size:13px">
    ⚠️ Please change your password after first login.
  </p>
  <p style="margin:24px 0">
    {_BTN.format(url="http://localhost:5173/login", label="Access Employee Portal")}
  </p>
""" + _BRAND_FOOTER

    return _send(email, "FutureHR — You're Hired! Your Employee Account Is Ready", body)


# ─── 4. Password reset ───────────────────────────────────────────────────────

def send_password_reset(first_name: str, email: str, reset_link: str) -> bool:
    """
    Sent when a user requests a password reset.
    The reset_link should be a short-lived signed URL.
    """
    body = _BRAND_HEADER + f"""
  <h2 style="color:#111827;margin:0 0 8px">Reset Your Password</h2>
  <p style="color:#374151;line-height:1.6">
    Hi <strong>{first_name}</strong>, we received a request to reset your FutureHR password.
    Click the button below — this link expires in 30 minutes.
  </p>
  <p style="margin:24px 0">
    {_BTN.format(url=reset_link, label="Reset Password")}
  </p>
  <p style="color:#9ca3af;font-size:13px">
    If you did not request a password reset, you can safely ignore this email.
  </p>
""" + _BRAND_FOOTER

    return _send(email, "FutureHR — Password Reset Request", body)


# ─── 5. Account deactivated ──────────────────────────────────────────────────

def send_account_deactivated(first_name: str, email: str) -> bool:
    """
    Sent when an admin deactivates a user account.
    """
    body = _BRAND_HEADER + f"""
  <h2 style="color:#111827;margin:0 0 8px">Your Account Has Been Deactivated</h2>
  <p style="color:#374151;line-height:1.6">
    Hi <strong>{first_name}</strong>, your FutureHR account has been deactivated
    by an administrator. If you believe this is a mistake, please contact HR.
  </p>
""" + _BRAND_FOOTER

    return _send(email, "FutureHR — Account Deactivated", body)
