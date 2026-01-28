#!/usr/bin/env python3
"""
Script to update image URLs in backend_quiz_data.json from final_quiz_data.json.

This script maps the new high-quality image URLs from final_quiz_data.json
to the corresponding questions in backend_quiz_data.json.
"""

import json
from pathlib import Path


def load_json(path: Path) -> dict:
    """Load JSON file."""
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict) -> None:
    """Save JSON file."""
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def build_image_url_map(final_data: dict) -> dict:
    """
    Build a mapping from (test_id, section, number) -> new_image_url
    """
    url_map = {}
    
    for test_id, test_data in final_data.items():
        sections = test_data.get("sections", {})
        
        # Road signs
        for sign in sections.get("road_signs", []):
            key = (test_id, "road_signs", sign.get("sign_number"))
            url_map[key] = sign.get("image_path")
        
        # Priorities
        for priority in sections.get("priorities", []):
            key = (test_id, "priorities", priority.get("priority_number"))
            url_map[key] = priority.get("image_path")
    
    return url_map


def update_backend_data(backend_data: dict, url_map: dict) -> tuple[dict, int]:
    """
    Update image URLs in backend data using the URL map.
    Returns the updated data and count of updates.
    """
    update_count = 0
    
    for test in backend_data.get("tests", []):
        test_id = test.get("test_id")
        
        for question in test.get("questions", []):
            tags = question.get("tags", {})
            section = tags.get("section")
            
            # Determine the number key based on section
            if section == "road_signs":
                number = tags.get("sign_number")
            elif section == "priorities":
                number = tags.get("priority_number")
            else:
                continue  # Skip general questions (no images to update)
            
            key = (test_id, section, number)
            new_url = url_map.get(key)
            
            if new_url and question.get("image_url") != new_url:
                old_url = question.get("image_url")
                question["image_url"] = new_url
                update_count += 1
                print(f"Updated {test_id}/{section}/{number}:")
                print(f"  Old: {old_url}")
                print(f"  New: {new_url}")
    
    return backend_data, update_count


def main():
    # Paths
    data_dir = Path(__file__).resolve().parent.parent / "data"
    final_data_path = data_dir / "final_quiz_data.json"
    backend_data_path = data_dir / "backend_quiz_data.json"
    
    print(f"Loading final_quiz_data.json from {final_data_path}")
    final_data = load_json(final_data_path)
    
    print(f"Loading backend_quiz_data.json from {backend_data_path}")
    backend_data = load_json(backend_data_path)
    
    print("\nBuilding URL map...")
    url_map = build_image_url_map(final_data)
    print(f"Found {len(url_map)} image URL mappings")
    
    print("\nUpdating backend data...")
    updated_data, update_count = update_backend_data(backend_data, url_map)
    
    if update_count > 0:
        print(f"\nSaving {update_count} updates to {backend_data_path}")
        save_json(backend_data_path, updated_data)
        print("Done!")
    else:
        print("\nNo updates needed.")


if __name__ == "__main__":
    main()
