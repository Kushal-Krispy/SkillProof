import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SkillBase(BaseModel):
    name: str = Field(min_length=2, max_length=64)
    category: str = Field(pattern=r"^(backend|frontend|database|devops|security|data_science|mobile)$")
    description: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class UserSkillCreate(BaseModel):
    skill_id: uuid.UUID
    proficiency_level: str = Field(default="beginner", pattern=r"^(beginner|intermediate|advanced)$")


class UserSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    skill_id: uuid.UUID
    proficiency_level: str
    created_at: datetime
    skill: Optional[SkillResponse] = None
