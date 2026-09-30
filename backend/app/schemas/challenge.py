import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.skill import SkillResponse


class ChallengeBase(BaseModel):
    slug: str = Field(min_length=3, max_length=100, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=3, max_length=200)
    difficulty: str = Field(pattern=r"^(beginner|intermediate|advanced)$")
    summary: str = Field(min_length=10, max_length=500)
    description_markdown: str = Field(min_length=20)
    estimated_hours: int = Field(default=4, ge=1, le=100)
    primary_skill_id: Optional[uuid.UUID] = None


class ChallengeCreate(ChallengeBase):
    pass


class ChallengeResponse(ChallengeBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    primary_skill: Optional[SkillResponse] = None


class ChallengeFilter(BaseModel):
    difficulty: Optional[str] = None
    skill_id: Optional[uuid.UUID] = None
    search: Optional[str] = None
