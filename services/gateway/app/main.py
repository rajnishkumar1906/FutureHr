from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
from .config import settings

app = FastAPI(title="FutureHR API Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "content-encoding",
    "content-length",
}


def get_service_url(path: str):
    if path.startswith("/api/auth"):
        return settings.AUTH_SERVICE_URL
    if path.startswith("/api/hrms"):
        return settings.HRMS_SERVICE_URL
    if path.startswith("/api/ai-recruitment"):
        return settings.AI_RECRUITMENT_SERVICE_URL
    return None


def filter_response_headers(headers):
    return {
        key: value
        for key, value in headers.items()
        if key.lower() not in HOP_BY_HOP_HEADERS
    }


@app.get("/")
def root():
    return {"message": "FutureHR API Gateway"}


@app.get("/health")
async def health_check():
    health_status = {"gateway": "healthy"}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.AUTH_SERVICE_URL}/health")
            health_status["auth"] = response.json().get("status", "unreachable")
    except Exception:
        health_status["auth"] = "unreachable"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.HRMS_SERVICE_URL}/health")
            health_status["hrms"] = response.json().get("status", "unreachable")
    except Exception:
        health_status["hrms"] = "unreachable"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.AI_RECRUITMENT_SERVICE_URL}/health")
            health_status["ai_recruitment"] = response.json().get("status", "unreachable")
    except Exception:
        health_status["ai_recruitment"] = "unreachable"

    return health_status


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
)
async def proxy(request: Request, path: str):
    full_path = f"/api/{path}"
    service_url = get_service_url(full_path)

    if not service_url:
        return JSONResponse(status_code=404, content={"error": "Service not found"})

    url = f"{service_url}{full_path}"

    headers = dict(request.headers)
    headers.pop("host", None)

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                params=request.query_params,
                cookies=request.cookies,
                content=await request.body(),
            )

            proxy_response = Response(
                content=response.content,
                status_code=response.status_code,
                headers=filter_response_headers(response.headers),
                media_type=response.headers.get("content-type"),
            )

            for header_name, header_value in response.headers.items():
                if header_name.lower() == "set-cookie":
                    proxy_response.headers.append("set-cookie", header_value)

            return proxy_response
    except httpx.TimeoutException:
        return JSONResponse(
            status_code=504,
            content={"error": "Upstream service timed out"},
        )
    except httpx.RequestError as exc:
        return JSONResponse(
            status_code=503,
            content={"error": "Upstream service unavailable", "detail": str(exc)},
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": "Gateway proxy error", "detail": str(exc)},
        )
