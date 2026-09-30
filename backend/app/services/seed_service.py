import uuid
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.skill import Skill
from app.models.challenge import Challenge

INITIAL_SKILLS: List[Dict[str, str]] = [
    {
        "name": "FastAPI & Python",
        "category": "backend",
        "description": "Building production-ready, asynchronous REST APIs with Pydantic and type hints.",
    },
    {
        "name": "PostgreSQL & SQLAlchemy",
        "category": "database",
        "description": "Relational data modeling, ACID transactions, migrations with Alembic, and performance optimization.",
    },
    {
        "name": "API Security & OAuth2",
        "category": "security",
        "description": "JWT lifecycle, Argon2 hashing, RBAC authorization, and OWASP Top 10 mitigation.",
    },
    {
        "name": "Distributed Systems & Caching",
        "category": "backend",
        "description": "Idempotency keys, Redis caching, rate limiting algorithms, and message queues.",
    },
    {
        "name": "Docker & Cloud Deployment",
        "category": "devops",
        "description": "Multi-stage container builds, environment orchestration, and CI/CD pipelines.",
    },
]

INITIAL_CHALLENGES: List[Dict[str, Any]] = [
    {
        "slug": "idempotent-payment-webhook-consumer",
        "title": "Idempotent Payment Webhook Consumer",
        "difficulty": "intermediate",
        "estimated_hours": 6,
        "primary_skill_name": "FastAPI & Python",
        "summary": "Design and implement an HTTP webhook receiver that handles duplicate events, concurrent retries, and network glitches without duplicate charges.",
        "description_markdown": """# Idempotent Payment Webhook Consumer

### Problem Statement
In distributed payment workflows (Stripe, Razorpay), webhooks are delivered with "at-least-once" delivery semantics. A single charge might trigger duplicate events due to network retries.

### Functional Requirements
1. **Idempotency Key Tracking:** Store event IDs with state machine (`received`, `processing`, `completed`, `failed`).
2. **Distributed Lock or Atomic Insert:** Ensure concurrent requests with the identical event ID cannot execute the fulfillment logic in parallel.
3. **Signature Verification:** Verify HMAC SHA256 webhook signatures using a shared webhook secret.
4. **Replay Attack Window:** Reject webhooks older than 5 minutes based on timestamp header.

### Evaluation Criteria
* **Correctness:** Duplicate events return 200 OK without re-executing credit balances.
* **Concurrency Safety:** Race conditions are handled at the database constraint level.
* **Code Quality:** Clear separation between signature validation, payload parsing, and ledger balance updates.
""",
    },
    {
        "slug": "token-bucket-rate-limiter",
        "title": "Token Bucket Rate Limiting Middleware",
        "difficulty": "intermediate",
        "estimated_hours": 4,
        "primary_skill_name": "Distributed Systems & Caching",
        "summary": "Implement an ASGI middleware enforcing dynamic rate limits per IP and API key using the Token Bucket algorithm.",
        "description_markdown": """# Token Bucket Rate Limiting Middleware

### Problem Statement
Protect public API endpoints against denial of service, scraping, and abusive spikes by enforcing fine-grained client request limits.

### Functional Requirements
1. **Algorithm:** Implement token bucket with capacity $C$ and refill rate $R$ tokens/second.
2. **Identification:** Extract identity from `Authorization: Bearer <key>` if present; fallback to client IP.
3. **Headers:** Return RFC 6585 compliant headers:
   * `X-RateLimit-Limit`
   * `X-RateLimit-Remaining`
   * `X-RateLimit-Reset`
4. **HTTP 429 Status:** Return standard JSON error payload with `Retry-After` header when exhausted.

### Evaluation Criteria
* Millisecond-accurate timestamp delta refills.
* Unit test coverage simulating burst traffic and sustained request rates.
""",
    },
    {
        "slug": "zero-downtime-schema-migration",
        "title": "Zero-Downtime Database Migration & Evolution",
        "difficulty": "advanced",
        "estimated_hours": 8,
        "primary_skill_name": "PostgreSQL & SQLAlchemy",
        "summary": "Execute an expand-and-contract database migration strategy across millions of simulated records without locking tables.",
        "description_markdown": """# Zero-Downtime Database Migration & Evolution

### Problem Statement
Online production systems cannot tolerate downtime or table locks when renaming or splitting high-throughput database columns.

### Functional Requirements
1. **Expand Phase:** Add nullable new columns and backwards-compatible dual-write triggers or service logic.
2. **Backfill Phase:** Batch-update historical data in chunks of 1,000 records without blocking reads.
3. **Contract Phase:** Switch read path to new column and safely drop deprecated fields with Alembic migrations.
4. **Constraint Validation:** Ensure foreign key and check constraints are validated asynchronously.

### Evaluation Criteria
* Reversible Alembic downgrade scripts.
* Zero table deadlocks under simulated concurrent traffic.
""",
    },
    {
        "slug": "rbac-security-guardrails",
        "title": "Role-Based Access Control & Scope Verifier",
        "difficulty": "beginner",
        "estimated_hours": 3,
        "primary_skill_name": "API Security & OAuth2",
        "summary": "Build a composable FastAPI dependency injection system that verifies hierarchical roles and dynamic resource scopes.",
        "description_markdown": """# Role-Based Access Control & Scope Verifier

### Problem Statement
Build an enterprise-ready authorization library that verifies whether a user holds specific permissions before accessing sensitive endpoints.

### Functional Requirements
1. **Hierarchical Roles:** Support `admin` > `mentor` > `student`.
2. **Scope Verification:** Allow endpoint annotations like `@require_scope("challenges:write")`.
3. **Object Ownership:** Guarantee students cannot modify or view submissions owned by another student (IDOR prevention).

### Evaluation Criteria
* Reusable FastAPI dependencies (`Depends`).
* Clean error reporting with HTTP 401 (unauthenticated) vs HTTP 403 (unauthorized).
""",
    },
]


async def seed_initial_data(db: AsyncSession) -> Dict[str, int]:
    skills_created = 0
    challenges_created = 0

    # 1. Seed Skills
    skill_map: Dict[str, Skill] = {}
    for s_data in INITIAL_SKILLS:
        stmt = select(Skill).where(Skill.name == s_data["name"])
        result = await db.execute(stmt)
        skill = result.scalar_one_or_none()
        if not skill:
            skill = Skill(
                name=s_data["name"],
                category=s_data["category"],
                description=s_data["description"],
            )
            db.add(skill)
            await db.flush()
            skills_created += 1
        skill_map[s_data["name"]] = skill

    # 2. Seed Challenges
    for c_data in INITIAL_CHALLENGES:
        stmt = select(Challenge).where(Challenge.slug == c_data["slug"])
        result = await db.execute(stmt)
        challenge = result.scalar_one_or_none()
        if not challenge:
            primary_skill = skill_map.get(c_data["primary_skill_name"])
            challenge = Challenge(
                slug=c_data["slug"],
                title=c_data["title"],
                difficulty=c_data["difficulty"],
                estimated_hours=c_data["estimated_hours"],
                summary=c_data["summary"],
                description_markdown=c_data["description_markdown"],
                primary_skill_id=primary_skill.id if primary_skill else None,
                is_active=True,
            )
            db.add(challenge)
            challenges_created += 1

    await db.commit()
    return {
        "skills_created": skills_created,
        "challenges_created": challenges_created,
    }
