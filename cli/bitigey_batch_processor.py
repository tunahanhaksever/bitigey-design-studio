#!/usr/bin/env python3
"""
Bitigey Design Studio - CLI Batch Image Processor & Project Automation
Developed by Tunahan Haksever
"""

import os
import sys
import json
import argparse
from pathlib import Path

def process_image(input_path: str, output_path: str, brightness: float = 1.0, contrast: float = 1.0, width: int = None, height: int = None):
    """
    Simulates / processes image transformations with metadata preservation.
    """
    print(f"[*] Processing {input_path} -> {output_path}")
    print(f"    Parameters: Brightness={brightness}, Contrast={contrast}, Dimensions={width}x{height}")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Try using PIL if installed, otherwise create manifest log
    try:
        from PIL import Image, ImageEnhance
        img = Image.open(input_path)
        
        if brightness != 1.0:
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(brightness)
            
        if contrast != 1.0:
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(contrast)
            
        if width and height:
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            
        img.save(output_path, quality=95)
        print(f"[+] Successfully exported: {output_path}")
    except ImportError:
        print("[!] Pillow (PIL) not found. Generating batch execution plan json.")
        with open(f"{output_path}.json", "w", encoding="utf-8") as f:
            json.dump({
                "source": input_path,
                "target": output_path,
                "brightness": brightness,
                "contrast": contrast,
                "dimensions": {"width": width, "height": height},
                "generator": "Bitigey Design Studio CLI by Tunahan Haksever"
            }, f, indent=2)

def main():
    parser = argparse.ArgumentParser(description="Bitigey Design Studio CLI Image Batch Processor by Tunahan Haksever")
    parser.add_argument("--input", "-i", type=str, required=True, help="Input directory or image file path")
    parser.add_argument("--output", "-o", type=str, default="./dist", help="Output directory")
    parser.add_argument("--brightness", type=float, default=1.0, help="Brightness multiplier (1.0 default)")
    parser.add_argument("--contrast", type=float, default=1.0, help="Contrast multiplier (1.0 default)")
    parser.add_argument("--width", type=int, help="Target width")
    parser.add_argument("--height", type=int, help="Target height")
    
    args = parser.parse_args()
    
    in_path = Path(args.input)
    if in_path.is_file():
        out_file = os.path.join(args.output, in_path.name)
        process_image(str(in_path), out_file, args.brightness, args.contrast, args.width, args.height)
    elif in_path.is_dir():
        for file in in_path.iterdir():
            if file.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp"]:
                out_file = os.path.join(args.output, file.name)
                process_image(str(file), out_file, args.brightness, args.contrast, args.width, args.height)
    else:
        print(f"[-] Invalid input path: {args.input}")
        sys.exit(1)

if __name__ == "__main__":
    main()
