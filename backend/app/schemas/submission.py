import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from app.schemas.challenge import ChallengeResponse


class SubmissionBase(BaseModel):
    challenge_id: uuid.UUID
    repository_url: str = Field(pattern=r"^https?://[^\s/$.?#].[^\s]*$")
    deployed_url: Optional[str] = Field(default=None, pattern=r"^(https?://[^\s/$.?#].[^\s]*)?$")
    notes: Optional[str] = Field(default=None, max_length=2000)


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionResponse(SubmissionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    status: str
    score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    challenge: Optional[ChallengeResponse] = None
