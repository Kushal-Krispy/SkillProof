import uuid
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.challenge import Challenge
from app.schemas.challenge import ChallengeCreate, ChallengeFilter


async def get_challenges(
    db: AsyncSession,
    filters: Optional[ChallengeFilter] = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[List[Challenge], int]:
    query = select(Challenge).where(Challenge.is_active == True).options(selectinload(Challenge.primary_skill))

    if filters:
        if filters.difficulty:
            query = query.where(Challenge.difficulty == filters.difficulty)
        if filters.skill_id:
            query = query.where(Challenge.primary_skill_id == filters.skill_id)
        if filters.search:
            search_pattern = f"%{filters.search}%"
            query = query.where(
                Challenge.title.ilike(search_pattern) | Challenge.summary.ilike(search_pattern)
            )

    count_query = select(func.count()).select_from(query.subquery())
    total_count = await db.scalar(count_query) or 0

    query = query.order_by(Challenge.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    challenges = list(result.scalars().all())

    return challenges, total_count


async def get_challenge_by_slug(db: AsyncSession, slug: str) -> Optional[Challenge]:
    stmt = (
        select(Challenge)
        .where(Challenge.slug == slug.lower())
        .options(selectinload(Challenge.primary_skill))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_challenge_by_id(db: AsyncSession, challenge_id: uuid.UUID) -> Optional[Challenge]:
    stmt = (
        select(Challenge)
        .where(Challenge.id == challenge_id)
        .options(selectinload(Challenge.primary_skill))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_challenge(db: AsyncSession, challenge_in: ChallengeCreate) -> Challenge:
    existing = await get_challenge_by_slug(db, challenge_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Challenge with slug '{challenge_in.slug}' already exists",
        )

    db_challenge = Challenge(
        slug=challenge_in.slug.lower(),
        title=challenge_in.title,
        difficulty=challenge_in.difficulty,
        summary=challenge_in.summary,
        description_markdown=challenge_in.description_markdown,
        estimated_hours=challenge_in.estimated_hours,
        primary_skill_id=challenge_in.primary_skill_id,
        is_active=True,
    )
    db.add(db_challenge)
    await db.flush()
    await db.refresh(db_challenge)
    return db_challenge
