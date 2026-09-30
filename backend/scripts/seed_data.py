#!/usr/bin/env python3
"""
Seed script to populate initial skills and realistic challenges for SkillProof.
Usage:
    python3 -m scripts.seed_data
    or
    python3 scripts/seed_data.py
"""
import asyncio
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal, async_engine
from app.services.seed_service import seed_initial_data


async def main():
    print("🌱 Starting SkillProof database seeding...")
    async with AsyncSessionLocal() as session:
        result = await seed_initial_data(session)
        print(f"✅ Seeding complete!")
        print(f"   - Skills created: {result['skills_created']}")
        print(f"   - Challenges created: {result['challenges_created']}")
    await async_engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
