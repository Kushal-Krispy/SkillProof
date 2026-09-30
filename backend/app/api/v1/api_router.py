from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.challenges import router as challenges_router
from app.api.v1.skills import router as skills_router
from app.api.v1.submissions import router as submissions_router
from app.api.v1.portfolios import router as portfolios_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(challenges_router)
api_v1_router.include_router(skills_router)
api_v1_router.include_router(submissions_router)
api_v1_router.include_router(portfolios_router)
