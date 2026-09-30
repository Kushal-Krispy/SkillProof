import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import Float, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.challenge import Challenge
    from app.models.feedback import Feedback
    from app.models.portfolio import PortfolioProject


class Submission(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "submissions"
    __table_args__ = (
        Index("ix_submissions_user_challenge", "user_id", "challenge_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("challenges.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    repository_url: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )
    deployed_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        default="submitted",
        nullable=False,
    )  # 'submitted', 'reviewing', 'evaluated', 'rejected'
    score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="submissions")
    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="submissions")
    feedback: Mapped[List["Feedback"]] = relationship(
        "Feedback",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    portfolio_projects: Mapped[List["PortfolioProject"]] = relationship(
        "PortfolioProject",
        back_populates="submission",
    )
