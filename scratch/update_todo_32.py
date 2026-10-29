import re

with open('docs/TODO.md', 'r', encoding='utf-8') as f:
    content = f.read()

done_block = """## Done

- `#32` **2026-10-30** Enterprise Next.js 15 App Router Production Migration & UX Refinements:
  - **Identified User Specifications & "Big Brother" Architecture**:
    - The client's senior consultant provided a full enterprise specification mandating an audit and migration from legacy static HTML/JS to a native Next.js 15 (App Router), Tailwind CSS, and TypeScript architecture.
    - User uploaded 4 screenshots showcasing:
      1. Image 1: The old live production view with boots and card overlay.
      2. Image 2: The old progress bar and product details overlay that needed removal.
      3. Image 3: The exact approved design: a clean full-view product image card without any progress bar or bottom overlay card.
      4. Image 4: The modal with dual actions: "Add to Bag" (without price) and "Buy Now" (bypassing the bag and launching instant checkout).
  - **Implemented Clean Solution**:
    - *Native Next.js 15 App Router Production*:
      - Safely archived legacy `index.html`, `admin.html`, and `admin/` to `legacy_html/`.
      - Built and verified Next.js 15 App Router with `npm run build` (compiled clean with exit code 0).
      - Deployed to Vercel production with `framework: nextjs`, verified live headers (`x-powered-by: Next.js`, `x-matched-path: /`, HTTP 200).
    - *Hero Section Reels Slider (`src/components/storefront/HeroReelsSlider.tsx`)*:
      - Clean full-view product image card with rounded corners (`rounded-2xl`), subtle border, and soft drop shadow matching Image 3.
      - 5-second automatic horizontal leftward reels swipe.
      - Hover pause: pauses timer when user hovers mouse pointer over card so it doesn't slip away.
      - Completely removed top progress bar and floating bottom product name/price card.
    - *Sailor-Style Product Detail Modal (`src/components/storefront/ProductDetailModal.tsx`)*:
      - Coordinate-based mouse pointer hover image zoom (`scale(2.1)`) matching Sailor brand experience.
      - Colorways / Editions selector showing only names on pills (no duplicate prices).
      - Dual CTAs: "Add to Bag" (no price) and "Buy Now" (direct bypass to instant checkout modal with payment method selection).
    - *Mediasoft BD Multichannel Help Widget (`src/components/storefront/MediasoftWidget.tsx`)*:
      - Fixed at Bottom-Left corner (`bottom: 30px; left: 30px;`).
      - 2-second rotating brand icons (WhatsApp, Support, Messenger, Email, Call).
      - 250px rightward expansion on hover with Mediasoft gradient and white "Help" text.
      - 6 customer communication channels + Customer Support desk modal.
    - *Zero Emojis Enforcement*:
      - Replaced all emojis across headers, badges, modals, and toasts with clean SVG vector icons and luxury typography.
  - **Production Live**: `https://auvare-store.vercel.app` & `/admin`.

- `#31`"""

content = re.sub(r'## Done\s*\n\s*- `#31`', done_block, content, count=1)

with open('docs/TODO.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("TODO updated successfully.")
