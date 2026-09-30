from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.skill import Skill, UserSkill
from app.models.user import User
from app.schemas.skill import SkillCreate, SkillResponse, UserSkillCreate, UserSkillResponse

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=List[SkillResponse])
async def list_skills(
    db: AsyncSession = Depends(get_db),
):
    """
    List all catalog skills.
    """
    stmt = select(Skill).order_by(Skill.category, Skill.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_in: SkillCreate,
    current_user: User = Depends(require_role("admin", "mentor")),
    db: AsyncSession = Depends(get_db),
):
    """
    Add a new skill to the taxonomy. Restricted to admin/mentor.
    """
    stmt = select(Skill).where(Skill.name == skill_in.name)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Skill '{skill_in.name}' already exists",
        )

    skill = Skill(
        name=skill_in.name,
        category=skill_in.category,
        description=skill_in.description,
    )
    db.add(skill)
    await db.flush()
    await db.refresh(skill)
    return skill


@router.get("/my", response_model=List[UserSkillResponse])
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List skills associated with the authenticated student.
    """
    stmt = (
        select(UserSkill)
        .where(UserSkill.user_id == current_user.id)
        .options(selectinload(UserSkill.skill))
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("/my", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
async def add_skill_to_profile(
    user_skill_in: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Associate a skill and self-assessed proficiency with the student profile.
    """
    # Check if skill exists
    skill_stmt = select(Skill).where(Skill.id == user_skill_in.skill_id)
    skill_res = await db.execute(skill_stmt)
    skill = skill_res.scalar_one_or_none()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )

    # Check unique constraint
    existing_stmt = select(UserSkill).where(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == user_skill_in.skill_id,
    )
    existing_res = await db.execute(existing_stmt)
    if existing_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Skill is already associated with this profile",
        )

    user_skill = UserSkill(
        user_id=current_user.id,
        skill_id=user_skill_in.skill_id,
        proficiency_level=user_skill_in.proficiency_level,
    )
    db.add(user_skill)
    await db.flush()
    await db.refresh(user_skill)
    user_skill.skill = skill
    return user_skill
