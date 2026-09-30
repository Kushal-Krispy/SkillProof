import uuid
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash
from app.models.user import User
from app.models.skill import Skill, UserSkill
from app.models.challenge import Challenge
from app.models.submission import Submission
from app.models.feedback import Feedback
from app.models.portfolio import PortfolioProject


@pytest.mark.asyncio
async def test_user_email_unique_constraint(db_session: AsyncSession):
    user1 = User(
        email="student@univ.edu",
        username="student_one",
        hashed_password=get_password_hash("password123"),
        full_name="Alice Student",
    )
    db_session.add(user1)
    await db_session.commit()

    # Try inserting duplicate email
    user2 = User(
        email="student@univ.edu",
        username="student_two",
        hashed_password=get_password_hash("password123"),
        full_name="Bob Student",
    )
    db_session.add(user2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_user_username_unique_constraint(db_session: AsyncSession):
    user1 = User(
        email="alice@univ.edu",
        username="coder42",
        hashed_password=get_password_hash("password123"),
        full_name="Alice Smith",
    )
    db_session.add(user1)
    await db_session.commit()

    # Try inserting duplicate username
    user2 = User(
        email="bob@univ.edu",
        username="coder42",
        hashed_password=get_password_hash("password123"),
        full_name="Bob Jones",
    )
    db_session.add(user2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_user_skills_unique_constraint(db_session: AsyncSession):
    user = User(
        email="dev@univ.edu",
        username="pythondev",
        hashed_password=get_password_hash("password123"),
        full_name="Dev User",
    )
    skill = Skill(
        name="FastAPI & AsyncIO",
        category="backend",
        description="Async web development",
    )
    db_session.add_all([user, skill])
    await db_session.commit()

    # First user_skill
    us1 = UserSkill(
        user_id=user.id,
        skill_id=skill.id,
        proficiency_level="intermediate",
    )
    db_session.add(us1)
    await db_session.commit()

    # Duplicate user_skill pair should violate uq_user_skill
    us2 = UserSkill(
        user_id=user.id,
        skill_id=skill.id,
        proficiency_level="advanced",
    )
    db_session.add(us2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_portfolio_slug_unique_per_user(db_session: AsyncSession):
    user = User(
        email="portfolio@univ.edu",
        username="portfoliodev",
        hashed_password=get_password_hash("password123"),
        full_name="Portfolio Builder",
    )
    db_session.add(user)
    await db_session.commit()

    p1 = PortfolioProject(
        user_id=user.id,
        title="Payment Webhook Service",
        slug="payment-webhook-service",
        summary="High throughput idempotent webhook consumer",
        repository_url="https://github.com/student/payment-service",
    )
    db_session.add(p1)
    await db_session.commit()

    # Duplicate slug for same user should fail
    p2 = PortfolioProject(
        user_id=user.id,
        title="Another Title Same Slug",
        slug="payment-webhook-service",
        summary="Another description",
        repository_url="https://github.com/student/payment-service-v2",
    )
    db_session.add(p2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_cascade_delete_user_removes_submissions(db_session: AsyncSession):
    user = User(
        email="cascade@univ.edu",
        username="cascadetest",
        hashed_password=get_password_hash("password123"),
        full_name="Cascade Tester",
    )
    challenge = Challenge(
        slug="webhook-challenge",
        title="Webhook Challenge",
        difficulty="intermediate",
        summary="Build webhooks",
        description_markdown="Detailed markdown specifications",
    )
    db_session.add_all([user, challenge])
    await db_session.commit()

    submission = Submission(
        user_id=user.id,
        challenge_id=challenge.id,
        repository_url="https://github.com/student/repo",
    )
    db_session.add(submission)
    await db_session.commit()
    submission_id = submission.id

    # Delete the user
    await db_session.delete(user)
    await db_session.commit()

    # Submission should be cascade deleted
    result = await db_session.execute(select(Submission).where(Submission.id == submission_id))
    assert result.scalar_one_or_none() is None
