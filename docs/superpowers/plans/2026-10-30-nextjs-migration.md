# Full-Stack Next.js 15 Migration & Feature Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Goal & Architecture

Fully execute the enterprise Next.js 15 migration specification mandated by the user's senior consultant ("বড় ভাই"). Convert the AUVARE storefront and administration from static HTML/CSS/JS files into a production-grade **Next.js 15 (App Router), TypeScript, Tailwind CSS, and Supabase** application running live on Vercel.

Ensure every single feature perfected on the platform is preserved and faithfully implemented:
1. **Zero Hardcoded Data**: All products, variants, orders, and site settings loaded dynamically from Supabase database.
2. **Zero Emojis / Slop**: Clean, luxury typography with authentic SVG icons only.
3. **Hero Reels-Style Auto-Swipe Slider**: 5-second automatic leftward swipe transitions between top curated drops.
4. **Sailor-Style Product Detail with Image Zoom**: Interactive 2x coordinate-based mouse pointer zoom on product garments.
5. **Colorway Variant Selection**: Name-only pills (no redundant prices on pills); dynamic price update in main display.
6. **Dual CTA**: "Add to Bag" and direct "Buy Now" instant checkout bypass.
7. **Mediasoft BD Multichannel Widget**: Bottom-Left corner (`bottom: 30px; left: 30px;`), 2s icon rotation, 250px rightward expansion with Mediasoft gradient on hover, and 6-channel expandable options list.
8. **Admin Management Portal (`/admin`)**: Secure, full CRUD for products, variants, orders, and branded delete confirmation dialogs.

---

## File Structure & Responsibilities

```
src/
├── app/
│   ├── layout.tsx             # Root HTML layout with Playfair & Plus Jakarta Sans typography
│   ├── globals.css            # Tailwind directives, animations & bespoke Mediasoft widget styles
│   ├── page.tsx               # Server Component fetching live drops & settings from Supabase (ISR)
│   ├── admin/
│   │   └── page.tsx           # Admin Portal route with server-side/client auth guards
│   └── api/
│       ├── checkout/route.ts  # Server-side order creation with price recalculation
│       ├── upload/route.ts    # Media upload to Supabase Storage
│       └── admin/
│           ├── products/      # Product CRUD API handlers
│           └── orders/        # Order fulfillment API handlers
├── components/
│   ├── storefront/
│   │   ├── StorefrontClient.tsx     # Main catalog orchestration, filters & drawers
│   │   ├── HeroReelsSlider.tsx      # 5-second Reels auto-swipe hero presentation
│   │   ├── ProductDetailModal.tsx   # Sailor-style 2x mouse-pointer image zoom & variant selector
│   │   └── MediasoftWidget.tsx      # Exact Mediasoft BD multichannel widget (Bottom-Left)
│   └── admin/
│       └── AdminPortal.tsx          # Full CRUD management portal with branded confirm dialog
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client
│   │   ├── server.ts          # Server Component Supabase client
│   │   └── middleware.ts      # Edge session cookie updater
│   └── utils.ts               # Formatting and utility functions
└── types/
    └── index.ts               # Authoritative TypeScript domain interfaces
```

---

## Bite-Sized Implementation Tasks

### Task 1: Mediasoft BD Multichannel Help Widget Component
- [ ] Create `src/components/storefront/MediasoftWidget.tsx` integrating the exact Mediasoft BD base64 brand assets (WhatsApp, Ticket/Support, Messenger, Email, Call, Minimize).
- [ ] Implement 2000ms rotating icon interval in inactive state.
- [ ] Position at Bottom-Left (`bottom: 30px; left: 30px;`) with `align-items: flex-start` to smoothly expand to 250px towards the right on hover.
- [ ] Implement Mediasoft blue-cyan gradient (`linear-gradient(90deg, rgb(44, 35, 185) 0px, rgb(37, 37, 180) 17%, rgb(0, 212, 255) 100%)`) on hover with bold white text "Help".
- [ ] Implement click handler displaying the 6 stacked options vertically with rightward 250px hover expansion.
- [ ] Wire "Support" option to trigger the AUVARE Customer Support modal.
- [ ] Wire "Minimize" option to collapse and resume 2-second rotation.

### Task 2: Hero Section Reels-Style Auto-Swipe Slider Component
- [ ] Create `src/components/storefront/HeroReelsSlider.tsx`.
- [ ] Receive top drops from server-fetched products.
- [ ] Implement 5000ms automatic timer cycling smoothly from product to product.
- [ ] Implement smooth horizontal slide animation mimicking Instagram Reels / stories.
- [ ] Overlay product badge, title, measurements (`Chest: ... • L: ... • 9.5/10`), and formatted BDT price.
- [ ] Add click event to trigger the full Product Detail Modal for the current active garment.
- [ ] Exclude running top progress bar line as explicitly requested by user.

### Task 3: Sailor-Style Product Detail Modal with Mouse Pointer Image Zoom
- [ ] Create `src/components/storefront/ProductDetailModal.tsx`.
- [ ] Implement coordinate-based mouse pointer hover zoom (`transform: scale(2)`) on the product image canvas matching the Sailor clothing store UX.
- [ ] Display SKU, Category badge, Title, Condition rating (`9.5/10`).
- [ ] Render Colorway / Edition variant pills showing **only variant names** (no prices on pills).
- [ ] Dynamically update the main price display based on selected variant.
- [ ] Render size selector pills (`S`, `M`, `L`, `XL`, `XXL`).
- [ ] Implement dual CTA buttons:
  - **Add to Bag**: Adds item to cart with selected size/variant and opens Bag drawer.
  - **Buy Now**: Bypasses bag and immediately triggers the checkout modal for instant order placement.
- [ ] Add collapsible accordion for Garment Details and Measurements Guide.

### Task 4: Storefront Client Orchestration & Zero Emojis / Slop Audit
- [ ] Update `src/components/storefront/StorefrontClient.tsx` to integrate `HeroReelsSlider`, `ProductDetailModal`, and `MediasoftWidget`.
- [ ] Clean out all emoji characters (e.g. 🧥, 🛍️, 🇧🇩) and replace with clean Lucide vector icons or SVG icons.
- [ ] Implement Bag drawer with inside/outside Dhaka delivery calculation (৳70 / ৳130).
- [ ] Implement Checkout modal supporting COD, bKash, Nagad, Rocket with transaction ID and sender phone number inputs.
- [ ] Connect checkout submission to `/api/checkout` with server-side validation.

### Task 5: Admin Management Portal Audit & Feature Parity
- [ ] Verify `src/components/admin/AdminPortal.tsx` has complete parity with `admin.html`:
  - Branded luxury confirmation modal dialog (no browser native `confirm()`).
  - Variant preset manager with custom preset input and hover top-right red cross delete (`✕`).
  - Multi-photo upload gallery with cover image badge and checkerboard placeholder canvas.
  - Real-time orders dashboard with status updater (Pending -> Confirmed -> Shipped -> Delivered -> Cancelled).
  - Customer order details modal with single-column responsive stacking.
  - Zero emojis across all alerts and badges.

### Task 6: Vercel Configuration & Build Validation
- [ ] Update `vercel.json` to configure pure Next.js build runtime.
- [ ] Update Vercel project settings via API to set `framework = "nextjs"` and clear `outputDirectory`.
- [ ] Run `npm run build` and ensure compilation passes with zero errors and all static/dynamic routes generated.
- [ ] Run `npm run type-check` to verify TypeScript compliance.

### Task 7: Production Deployment & Live Verification
- [ ] Commit all Next.js full-stack changes to Git repository.
- [ ] Push to `origin main`.
- [ ] Deploy Next.js build to Vercel production.
- [ ] Assign production alias `auvare-store.vercel.app`.
- [ ] Verify live at `https://auvare-store.vercel.app` using Kapture MCP to confirm Next.js headers, SSR catalog, Reels slider, image zoom, and Mediasoft widget.
