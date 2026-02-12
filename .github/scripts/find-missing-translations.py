#!/usr/bin/env python3
"""
Script to find missing translations for documentation files.
Usage: python find-missing-translations.py <changed_files.txt> [output_file]
"""

import sys
from collections import defaultdict
from pathlib import Path


def find_missing_translations(changed_files_path, output_path=None):
    """
    Find missing translations for changed documentation files.
    
    Args:
        changed_files_path: Path to file containing list of changed files
        output_path: Optional path to write missing translations
        
    Returns:
        List of tuples (source_lang, target_lang, source_file)
    """
    # Read changed files
    with open(changed_files_path, 'r') as f:
        changed_files = [line.strip() for line in f if line.strip()]
    
    if not changed_files:
        print("No files to process")
        return []
    
    # Group by relative path
    files_by_path = defaultdict(set)
    
    for file in changed_files:
        parts = file.split('/', 2)
        if len(parts) == 3 and parts[0] == 'docs' and parts[1] in ['en', 'zh', 'ja']:
            lang = parts[1]
            rel_path = parts[2]
            files_by_path[rel_path].add(lang)
    
    # Find missing translations
    missing = []
    
    for rel_path, langs in files_by_path.items():
        # For each file, check which languages are missing
        for target_lang in ['en', 'zh', 'ja']:
            if target_lang not in langs:
                # Pick first available language as source
                source_lang = sorted(langs)[0]
                source_file = f"docs/{source_lang}/{rel_path}"
                missing.append((source_lang, target_lang, source_file))
    
    if missing:
        print(f"Found {len(missing)} missing translations:")
        for source_lang, target_lang, source_file in missing:
            print(f"  {source_file} ({source_lang}) -> docs/{target_lang}/{source_file.split('/', 2)[2]}")
    else:
        print("No missing translations found")
    
    # Write to output file if specified
    if output_path and missing:
        with open(output_path, 'w') as f:
            for source_lang, target_lang, source_file in missing:
                f.write(f"{source_lang}:{target_lang}:{source_file}\n")
        print(f"\nMissing translations written to {output_path}")
    
    return missing


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python find-missing-translations.py <changed_files.txt> [output_file]")
        sys.exit(1)
    
    changed_files_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    missing = find_missing_translations(changed_files_path, output_path)
    
    # Exit with status code indicating if translations are missing
    sys.exit(0 if not missing else 1)
