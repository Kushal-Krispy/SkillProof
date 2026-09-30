import uuid
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.submission import Submission


class PortfolioProject(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "portfolio_projects"
    __table_args__ = (
        UniqueConstraint("user_id", "slug", name="uq_user_portfolio_project_slug"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    submission_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("submissions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        index=True,
    )
    summary: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    live_demo_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    repository_url: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )
    is_featured: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    is_public: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="portfolio_projects")
    submission: Mapped["Submission | None"] = relationship("Submission", back_populates="portfolio_projects")
