#!/usr/bin/env python3
"""
Script to update image URLs in the database from final_quiz_data.json.

This updates the Question.image_url field for road_signs questions 
with the new Wikipedia URLs from final_quiz_data.json.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add backend to path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
BASE_DIR = BACKEND_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import select, update
from app.core.database import AsyncSessionLocal
from app.models.question import Question


DATA_FILE = BASE_DIR / "data" / "final_quiz_data.json"


def load_final_quiz_data() -> dict:
    """Load the final quiz data with new image URLs."""
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def build_url_mapping(final_data: dict) -> dict[str, str]:
    """
    Build a mapping from old image path pattern to new URL.
    
    Maps: "data/individual_signs/test-XX/test-XX_sign_YY.png" -> new_url
    """
    url_map = {}
    
    for test_id, test_data in final_data.items():
        sections = test_data.get("sections", {})
        
        # Road signs have the new URLs
        for sign in sections.get("road_signs", []):
            sign_number = sign.get("sign_number")
            new_url = sign.get("image_path", "")
            
            # Only map if it's a new URL (starts with http)
            if new_url.startswith("http"):
                # Build the old path pattern
                old_path = f"data/individual_signs/{test_id}/{test_id}_sign_{sign_number:02d}.png"
                url_map[old_path] = new_url
                
    return url_map


async def update_database_urls(url_map: dict[str, str], dry_run: bool = False) -> int:
    """Update image_url in the database."""
    updated_count = 0
    
    async with AsyncSessionLocal() as session:
        # Get all questions with image URLs that match old pattern
        stmt = select(Question).where(
            Question.image_url.like("data/individual_signs/%")
        )
        result = await session.execute(stmt)
        questions = result.scalars().all()
        
        print(f"Found {len(questions)} questions with old image paths")
        
        for question in questions:
            old_url = question.image_url
            new_url = url_map.get(old_url)
            
            if new_url:
                print(f"  [{question.id}] {old_url}")
                print(f"       -> {new_url[:80]}...")
                
                if not dry_run:
                    question.image_url = new_url
                    updated_count += 1
        
        if not dry_run:
            await session.commit()
            print(f"\n✓ Updated {updated_count} questions in database")
        else:
            print(f"\n[DRY RUN] Would update {len([q for q in questions if url_map.get(q.image_url)])} questions")
    
    return updated_count


async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Update image URLs in database")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be updated without making changes")
    args = parser.parse_args()
    
    print(f"Loading data from {DATA_FILE}")
    final_data = load_final_quiz_data()
    
    print(f"Building URL mapping...")
    url_map = build_url_mapping(final_data)
    print(f"Found {len(url_map)} URL mappings for road signs")
    
    print(f"\nUpdating database{'  [DRY RUN]' if args.dry_run else ''}...")
    await update_database_urls(url_map, dry_run=args.dry_run)


if __name__ == "__main__":
    asyncio.run(main())
