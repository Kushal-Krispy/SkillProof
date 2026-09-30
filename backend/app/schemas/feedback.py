import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class FeedbackBase(BaseModel):
    submission_id: uuid.UUID
    evaluator_type: str = Field(default="ai", pattern=r"^(ai|peer|instructor)$")
    score: float = Field(ge=0.0, le=100.0)
    rubric_scores: Optional[Dict[str, Any]] = None
    strengths: str = Field(min_length=5)
    improvements: str = Field(min_length=5)
    summary: str = Field(min_length=10)


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackResponse(FeedbackBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
