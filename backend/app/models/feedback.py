import uuid
from datetime import datetime
from typing import Any, Dict, TYPE_CHECKING
from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.submission import Submission


class Feedback(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "feedback"

    submission_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    evaluator_type: Mapped[str] = mapped_column(
        String(32),
        default="ai",
        nullable=False,
    )  # 'ai', 'peer', 'instructor'
    score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    rubric_scores: Mapped[Dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
    )
    strengths: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    improvements: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    submission: Mapped["Submission"] = relationship(
        "Submission",
        back_populates="feedback",
    )
