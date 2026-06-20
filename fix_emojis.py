#!/usr/bin/env python3
"""Replace emoji characters with GameIcons SVG component references."""
import os, re, json

REPLACE_MAP = {
    # Single-char emoji replacements -> icon component names
    '\u26e9': 'SHRINE',      # ⛩
    '\U0001f479': 'OGRE',    # 👹
    '\u26d4': 'NO_ENTRY',    # ⛔
    '\U0001f6e1': 'SHIELD',  # 🛡
    '\u26a0': 'WARNING',     # ⚠
    '\U0001fa99': 'COIN',    # 🪙
    '\U0001f4a5': 'SPARKLE', # ✨
    '\U0001faaa': 'JIZO_STATUE', # 🪬
    '\u2600': 'SUN',         # ☀
    '\U0001f305': 'DUSK',    # 🌅
    '\U0001f306': 'TWILIGHT',# 🌆
    '\U0001f311': 'MOON',    # 🌑
    '\U0001f33e': 'TILE_GRASS',    # 🌾
    '\U0001f30a': 'TILE_WATER',    # 🌊
    '\U0001f6e4': 'TILE_ROAD',     # 🛤
    '\U0001f3e0': 'TILE_BUILDING', # 🏠
    '\U0001f333': 'TILE_TREE',     # 🌳
    '\u26f0': 'TILE_MOUNTAIN',    # ⛰
    '\U0001f309': 'TILE_BRIDGE',   # 🌉
    '\U0001f359': 'RICEBALL',  # 🍙
    '\U0001f33f': 'HERB',       # 🌿
    '\U0001f48a': 'MEDICINE',   # 💊
    '\U0001f514': 'BELL',       # 🔔
    '\U0001f56f': 'CANDLE',     # 🕯
    '\U0001f5fa': 'MAP',        # 🗺
    '\U0001f9ed': 'COMPASS',    # 🧭
    '\U0001fa9e': 'MIRROR',     # 🪞
    '\U0001f4e6': 'PACKAGE',    # 📦
    '\U0001f98a': 'FOX',        # 🦊
    '\U0001f4aa': 'STRONG',     # 💪
    '\u2726': 'STAR',           # ✦
    '\u2727': 'STAR',           # ✧
}

def replace_in_text(text, fname):
    """Replace emoji chars in text with component references."""
    replacements = []
    
    for ch, icon_name in REPLACE_MAP.items():
        if ch in text:
            replacements.append((ch, icon_name))
    
    # For TSX/TSX files, we need to replace in JSX context
    # For data files, we might replace with string references
    
    result = text
    for ch, icon_name in replacements:
        result = result.replace(ch, icon_name)
    
    return result, replacements

def main():
    src_dir = r'C:\Users\ASUS\Desktop\occult-child-master\src'
    total_replacements = 0
    
    for root, dirs, files in os.walk(src_dir):
        for fname in files:
            if not fname.endswith(('.tsx', '.ts')):
                continue
            fpath = os.path.join(root, fname)
            
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content, replaces = replace_in_text(content, fname)
            
            if new_content != content:
                # Write backup
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                total_replacements += len(replaces)
                print(f"  {fname}: {len(replaces)} replacements")
    
    print(f"\nTotal replacements: {total_replacements}")

if __name__ == '__main__':
    main()
