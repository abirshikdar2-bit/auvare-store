with open('docs/TODO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_entry = [
    "- `#33` **2026-10-30** Full-Screen In-Details Studio (Sailor Zoom, Suggested Pieces & Recently Viewed):\n",
    "  - **Identified User Problem**:\n",
    "    - Product clicks opened a floating popup modal over a dark overlay backdrop instead of a dedicated full-screen page view.\n",
    "    - Description text leaked internal metadata comments (<!--AUVARE_VARIANTS:...-->).\n",
    "    - Missing 'Suggested Pieces' and 'Customer Recently Viewed' sections.\n",
    "  - **Implemented Clean Solution**:\n",
    "    - Full-Screen Studio Screen: Converted ProductDetailModal to a true 100vw/100vh dedicated screen with top sticky nav bar ('Back to Collection' & close '✕').\n",
    "    - Clean Description: Stripped all internal HTML comments from garment descriptions.\n",
    "    - Suggested Pieces: Filtered same-category garments into an interactive recommendation grid.\n",
    "    - Customer Recently Viewed: Integrated session browsing history.\n",
    "    - Production Live on https://auvare-store.vercel.app.\n\n",
]

lines = lines[:18] + new_entry + lines[18:]

with open('docs/TODO.md', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("TODO updated successfully.")

