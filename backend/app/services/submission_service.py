import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.challenge import Challenge
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate


async def create_submission(
    db: AsyncSession,
    user_id: uuid.UUID,
    submission_in: SubmissionCreate,
) -> Submission:
    # Verify challenge exists
    challenge_stmt = select(Challenge).where(Challenge.id == submission_in.challenge_id)
    result = await db.execute(challenge_stmt)
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )

    submission = Submission(
        user_id=user_id,
        challenge_id=submission_in.challenge_id,
        repository_url=str(submission_in.repository_url),
        deployed_url=str(submission_in.deployed_url) if submission_in.deployed_url else None,
        notes=submission_in.notes,
        status="submitted",
    )
    db.add(submission)
    await db.flush()
    await db.refresh(submission)
    return submission


async def get_submissions_by_user(
    db: AsyncSession,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
) -> List[Submission]:
    stmt = (
        select(Submission)
        .where(Submission.user_id == user_id)
        .options(selectinload(Submission.challenge))
        .order_by(Submission.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_submission_by_id(
    db: AsyncSession,
    submission_id: uuid.UUID,
) -> Optional[Submission]:
    stmt = (
        select(Submission)
        .where(Submission.id == submission_id)
        .options(selectinload(Submission.challenge))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
