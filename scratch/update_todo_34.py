with open('docs/TODO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

item_34_lines = [
    '- `#34` **2026-10-30** Clean Minimalist Product Card Layout (Top Ten Mart Inspired, TK Currency, Title Divider & Inspect CTA):\n',
    '  - **Identified User Problem**:\n',
    '    - Product cards on homepage catalog were cluttered with category badges, chest/waist measurements, size indicators, and size buttons.\n',
    '    - Currency displayed double Bengali symbols (৳ ৳ 1,850) instead of clean English TK format (TK 1,850).\n',
    '  - **Implemented Clean Solution**:\n',
    '    - *Clutter-Free Card Grid (`StorefrontClient.tsx`)*: Removed category tags, chest/waist pills, size labels, and size chips from cards. Retained high-resolution imagery with curated drop badges.\n',
    '    - *Minimalist Typography & Divider*: Placed subtle product title, clean hairline divider, and bold `TK [amount]` price.\n',
    '    - *TK Currency Standardization (`src/lib/utils.ts`, `StorefrontClient.tsx`, `ProductDetailModal.tsx`, `AdminPortal.tsx`)*: Unified all currency labels across catalog cards, full-screen product studio, cart drawer, checkout modal, order confirmation modal, and WhatsApp message generation to `TK` (e.g. `TK 1,850`), eliminating double ৳ symbol leaks.\n',
    '    - *Direct CTAs*: Streamlined buttons to Add to Bag and Inspect. Clicking Inspect or clicking photo directly opens Full-Screen In-Details Studio (`ProductDetailModal`).\n',
    '    - *Production Live*: Built with `npm run build` (exit code 0), deployed to Vercel production and verified live on `https://auvare-store.vercel.app`.\n',
    '\n'
]

lines[18:18] = item_34_lines

with open('docs/TODO.md', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Updated docs/TODO.md successfully!')

