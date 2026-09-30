import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.challenge import ChallengeCreate, ChallengeFilter, ChallengeResponse
from app.schemas.common import PaginatedResponse
from app.services.challenge_service import (
    create_challenge,
    get_challenge_by_slug,
    get_challenges,
)

router = APIRouter(prefix="/challenges", tags=["Challenges"])


@router.get("", response_model=PaginatedResponse[ChallengeResponse])
async def list_challenges(
    difficulty: Optional[str] = Query(None, pattern=r"^(beginner|intermediate|advanced)$"),
    skill_id: Optional[uuid.UUID] = None,
    search: Optional[str] = Query(None, min_length=1, max_length=100),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    List active engineering challenges with optional filters.
    """
    filters = ChallengeFilter(
        difficulty=difficulty,
        skill_id=skill_id,
        search=search,
    )
    skip = (page - 1) * limit
    challenges, total = await get_challenges(db, filters=filters, skip=skip, limit=limit)
    return PaginatedResponse[ChallengeResponse](
        items=[ChallengeResponse.model_validate(c) for c in challenges],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{slug}", response_model=ChallengeResponse)
async def get_challenge_detail(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve full challenge details by slug.
    """
    challenge = await get_challenge_by_slug(db, slug)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge with slug '{slug}' not found",
        )
    return challenge


@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_new_challenge(
    challenge_in: ChallengeCreate,
    current_user: User = Depends(require_role("admin", "mentor")),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new challenge. Restricted to admin and mentor roles.
    """
    return await create_challenge(db, challenge_in)
