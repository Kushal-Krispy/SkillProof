from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.v1.api_router import api_v1_router
from app.api.v1.health import router as health_router
from app.core.config import settings
from app.core.database import async_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Check database connectivity
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        print(f"Warning: Database check at startup: {e}")
    yield
    # Shutdown: Dispose engine connection pool
    await async_engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SkillProof - Student Skill-Evidence and Verified Portfolio Platform API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root level health & readiness endpoints for direct ingress / load balancer probes
app.include_router(health_router)

# Versioned API endpoints
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "ready": "/ready",
        "api_v1": "/api/v1",
    }
