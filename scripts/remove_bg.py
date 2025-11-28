#!/usr/bin/env python3
"""Remove backgrounds from mascot images using rembg"""

import os
from pathlib import Path
from PIL import Image
from rembg import remove

# Input and output directories
INPUT_DIR = Path("attached_assets/generated_images")
OUTPUT_DIR = Path("attached_assets/mascot_transparent")

# Mascot images to process
MASCOT_IMAGES = [
    "robot_mascot_waving_hello.png",
    "robot_mascot_thinking_pose.png", 
    "robot_mascot_holding_brake_pads.png",
    "robot_mascot_holding_oil_filter.png",
    "robot_mascot_holding_spark_plugs.png",
    "robot_mascot_holding_car_battery.png",
    "robot_mascot_holding_tire.png",
    "robot_mascot_holding_brake_rotor.png",
    "gauge-eyed_junkyard_robot_mascot.png",
]

def process_image(input_path: Path, output_path: Path) -> bool:
    """Remove background from a single image"""
    try:
        print(f"Processing: {input_path.name}...")
        
        # Open image
        with Image.open(input_path) as img:
            # Remove background
            output = remove(img)
            
            # Save as PNG with transparency
            output.save(output_path, "PNG")
            
        print(f"  ✓ Saved: {output_path.name}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 50)
    print("Removing backgrounds from mascot images...")
    print("=" * 50)
    print()
    
    processed = 0
    failed = 0
    skipped = 0
    
    for image_name in MASCOT_IMAGES:
        input_path = INPUT_DIR / image_name
        output_path = OUTPUT_DIR / image_name
        
        if not input_path.exists():
            print(f"⚠ Skipping (not found): {image_name}")
            skipped += 1
            continue
            
        if process_image(input_path, output_path):
            processed += 1
        else:
            failed += 1
    
    print()
    print("=" * 50)
    print(f"Done! Processed: {processed}, Failed: {failed}, Skipped: {skipped}")
    print(f"Transparent images saved to: {OUTPUT_DIR}")
    print("=" * 50)

if __name__ == "__main__":
    main()
