import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.portfolio import PortfolioProject
from app.models.user import User
from app.schemas.portfolio import PortfolioProjectCreate, PortfolioProjectResponse

router = APIRouter(prefix="/portfolio-projects", tags=["Portfolio Projects"])


@router.get("", response_model=List[PortfolioProjectResponse])
async def list_portfolio_projects(
    user_id: Optional[uuid.UUID] = None,
    is_featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    List public portfolio projects, optionally filtered by user or featured status.
    """
    query = select(PortfolioProject).where(PortfolioProject.is_public == True)
    if user_id:
        query = query.where(PortfolioProject.user_id == user_id)
    if is_featured is not None:
        query = query.where(PortfolioProject.is_featured == is_featured)

    query = query.order_by(PortfolioProject.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("", response_model=PortfolioProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio_project(
    project_in: PortfolioProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a project showcase for the authenticated student's portfolio.
    """
    # Check unique slug per user
    existing_stmt = select(PortfolioProject).where(
        PortfolioProject.user_id == current_user.id,
        PortfolioProject.slug == project_in.slug.lower(),
    )
    result = await db.execute(existing_stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A project with slug '{project_in.slug}' already exists in your portfolio",
        )

    project = PortfolioProject(
        user_id=current_user.id,
        submission_id=project_in.submission_id,
        title=project_in.title,
        slug=project_in.slug.lower(),
        summary=project_in.summary,
        live_demo_url=str(project_in.live_demo_url) if project_in.live_demo_url else None,
        repository_url=str(project_in.repository_url),
        is_featured=project_in.is_featured,
        is_public=project_in.is_public,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project
