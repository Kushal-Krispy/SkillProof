import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.skill import Skill
    from app.models.submission import Submission


class Challenge(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "challenges"

    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    difficulty: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )  # 'beginner', 'intermediate', 'advanced'
    summary: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    description_markdown: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    primary_skill_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("skills.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    estimated_hours: Mapped[int] = mapped_column(
        Integer,
        default=4,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    primary_skill: Mapped["Skill | None"] = relationship(
        "Skill",
        back_populates="challenges",
    )
    submissions: Mapped[List["Submission"]] = relationship(
        "Submission",
        back_populates="challenge",
        cascade="all, delete-orphan",
    )
