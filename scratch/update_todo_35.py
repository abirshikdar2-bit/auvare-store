with open('docs/TODO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

item_35_lines = [
    '- `#35` **2026-10-30** Fix Cart Drawer & Instant Checkout Visibility (Open/Active Class Harmonization & Z-Index Elevation):\n',
    '  - **Identified User Problem**:\n',
    '    - Clicking "Add to Bag" on homepage product cards did not open the bag drawer.\n',
    '    - Inside the Full-Screen In-Details Studio, clicking either "Add to Bag" or "Buy Now" failed to trigger visible modal/drawer responses.\n',
    '  - **Root Cause Analysis**:\n',
    '    - Class Mismatch: `StorefrontClient.tsx` applied class `.active` to `.cart-drawer`, `.drawer-overlay`, and `.modal-overlay`, but `style.css` only had rules for `.open` (`.cart-drawer.open`, `.modal-overlay.open`). The drawer remained at `transform: translateX(100%)` (hidden off-screen at x=1906px), and the modal remained at `opacity: 0; visibility: hidden`.\n',
    '    - Z-Index Collision: Cart drawer (`z-index: 100`) and modals (`z-index: 110`) were positioned below the full-screen studio overlay (`z-index: 99999`).\n',
    '  - **Implemented Clean Solution**:\n',
    '    - *Dual Class Harmonization (`style.css` & `StorefrontClient.tsx`)*: Added support for both `.open` and `.active` across `.cart-drawer`, `.drawer-overlay`, `.cart-drawer-overlay`, and `.modal-overlay`.\n',
    '    - *Z-Index Hierarchy Polish*: Elevated `.cart-drawer-overlay` to `z-index: 100010`, `.cart-drawer` to `z-index: 100015`, and `.modal-overlay` to `z-index: 100020` so checkout and cart always smoothly overlay any full-screen view.\n',
    '    - *Live Automated Verification*: Verified in headless browser via Kapture MCP that clicking "Add to Bag" on catalog cards opens `.cart-drawer` into view at `x: 1466`, clicking "Buy Now" in details screen opens `.modal-overlay.open.active` into view at `x: 0`, and clicking "Add to Bag" in details screen adds piece and slides open the cart drawer.\n',
    '    - *Production Live*: Built with `npm run build` (exit code 0), deployed to Vercel production and verified live on `https://auvare-store.vercel.app`.\n',
    '\n'
]

lines[18:18] = item_35_lines

with open('docs/TODO.md', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Updated docs/TODO.md with item #35 successfully!')

