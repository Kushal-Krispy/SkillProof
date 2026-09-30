import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.submission_service import (
    create_submission,
    get_submission_by_id,
    get_submissions_by_user,
)

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_challenge_solution(
    submission_in: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a project solution (GitHub/GitLab repository URL) for an active challenge.
    """
    submission = await create_submission(db, current_user.id, submission_in)
    return submission


@router.get("/my", response_model=List[SubmissionResponse])
async def list_my_submissions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List submissions created by the authenticated user.
    """
    skip = (page - 1) * limit
    return await get_submissions_by_user(db, current_user.id, skip=skip, limit=limit)


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission_detail(
    submission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get detailed submission info. Enforces ownership: students can only access their own submissions.
    """
    submission = await get_submission_by_id(db, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    # Object-level permission check (IDOR mitigation)
    if submission.user_id != current_user.id and current_user.role not in ["admin", "mentor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you do not own this submission",
        )

    return submission
