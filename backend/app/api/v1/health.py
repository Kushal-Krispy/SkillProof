from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.schemas.common import HealthResponse, ReadinessResponse

router = APIRouter(tags=["Health & Readiness"])


@router.get("/health", response_model=HealthResponse, summary="Liveness Probe")
async def liveness_check():
    """
    Returns 200 OK if the web server process is alive and responding.
    Used by container orchestrators (Kubernetes/Docker) for liveness probes.
    """
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=settings.ENVIRONMENT,
    )


@router.get("/ready", response_model=ReadinessResponse, summary="Readiness Probe")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Verifies that the database connection is live and able to process queries.
    Returns 200 if connected, or 503 Service Unavailable if the database is down.
    """
    try:
        result = await db.execute(text("SELECT 1"))
        val = result.scalar()
        if val != 1:
            raise Exception("Unexpected query result")

        return ReadinessResponse(
            status="ready",
            database="connected",
            details={
                "environment": settings.ENVIRONMENT,
                "database_driver": settings.DATABASE_URL.split("://")[0],
            },
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "database": "disconnected",
                "error": str(e),
            },
        )
