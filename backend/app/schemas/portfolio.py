import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PortfolioProjectBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    slug: str = Field(min_length=3, max_length=120, pattern=r"^[a-z0-9-]+$")
    summary: str = Field(min_length=10, max_length=500)
    live_demo_url: Optional[str] = Field(default=None, pattern=r"^(https?://[^\s/$.?#].[^\s]*)?$")
    repository_url: str = Field(pattern=r"^https?://[^\s/$.?#].[^\s]*$")
    is_featured: bool = False
    is_public: bool = True


class PortfolioProjectCreate(PortfolioProjectBase):
    submission_id: Optional[uuid.UUID] = None


class PortfolioProjectResponse(PortfolioProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    submission_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
