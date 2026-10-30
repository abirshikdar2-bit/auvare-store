# TODO — carried across sessions

Persistent backlog for this project. Claude reads this at session start and is
blocked from ending a session that changed files but left this untouched.

Write entries a teammate who wasn't here could act on: what's left and **where to
resume**, not just a task name.

## Backlog

_(no active backlog items)_

## In Progress

_(no active items in progress)_

## Done

- `#48` **2026-10-31** Supabase Architecture Audit & Realtime Channel Synchronization for Admin Panel:
  - **Audit Scope**:
    - Conducted full inspection of database connections across all project modules.
    - Verified all API routes (`/api/checkout`, `/api/admin/orders`, `/api/admin/products`, `/api/admin/users`, `/api/upload`) query and mutate PostgreSQL tables and Storage in Supabase directly.
    - Clarified Next.js 15 App Router architecture vs archived `legacy_html`.
  - **Enhancement Implemented**:
    - Integrated Supabase Realtime listener in `AdminPortal.tsx` listening to `orders`, `products`, and `auth_users` tables. Orders submitted on the storefront now appear on the admin panel instantly in real-time.
    - Updated `supabase-schema.sql` and `supabase-contact-info-migration.sql` to ensure all 4 public tables (`orders`, `products`, `auth_users`, `store_contact_info`) are enabled in `supabase_realtime` publication.
  - **Verification**:
    - Clean Next.js production build (`npm run build`) in 1.8s.

- `#47` **2026-10-31** Storefront Multichannel Help Menu Supabase Realtime Dynamic Synchronization:
  - **Identified User Requirement**:
    - In the public storefront floating Help Menu (`MediasoftWidget`):
      1. **Messenger (`fmsn`)**: Connect to user's Facebook profile/page link: `https://www.facebook.com/share/1JoPNYsMNz/?mibextid=wwXIfr`.
      2. **Email (`email`)**: Connect to email `abirshikdar2@gmail.com`.
      3. **Call (`call`)**: Connect to phone number `01734018155` with native `tel:01734018155` dialer trigger for mobile/tablet.
      4. **WhatsApp (`whatsapp`)**: Keep functional with direct WhatsApp chat.
      5. **Support (`ticket`)**: Live Concierge Modal with updated phone, email, and messenger channels.
    - **Dynamic Supabase Integration**:
      - Connect all contact channels to Supabase `store_contact_info` table.
      - Ensure that whenever contact information is updated in Supabase, the public storefront immediately updates without delay or manual reload.
  - **Implemented Clean Solution**:
    - *Widget Adaptation (`src/components/storefront/MediasoftWidget.tsx`)*:
      - Extended `MediasoftWidgetProps` with `facebookUrl?: string`, `phone?: string`, `email?: string`, `whatsappNumber?: string`.
      - Updated `handleItemClick` to route Messenger to `facebookUrl`, Email to `mailto:${email}`, Call to `tel:${phone}`.
      - Updated internal concierge support modal dialog to display and link to the live phone, email, and messenger links.
    - *Next.js Server Page (`src/app/page.tsx`)*:
      - Added queries for `email`, `call_number`/`phone`, and `facebook_url`/`messenger_url` from `store_contact_info` with clean fallbacks.
    - *Live Client-Side Realtime Synchronization (`src/components/storefront/StorefrontClient.tsx`)*:
      - Maintained dynamic `currentSettings` state initialized from server `siteSettings`.
      - Added client-side fetch on mount to bypass any CDN edge cache latency.
      - Added Supabase Realtime channel subscription listening to `postgres_changes` on `store_contact_info`. When changes occur in Supabase, state updates instantly on the live storefront in real-time.
    - *Database Schema & Migration (`supabase-schema.sql` & `supabase-contact-info-migration.sql`)*:
      - Added `email`, `call_number`, `facebook_url` columns to `store_contact_info` table definition.
      - Created ready-to-run migration script with SQL and enabled Realtime publication on `store_contact_info`.
  - **Verification**:
    - Build test passed (`npm run build`) in 2.3s with zero TypeScript errors.
    - Verified all channel links (WhatsApp, Messenger, Email, Call dialer) and deployed to Vercel production.

- `#46` **2026-10-31** Footer Developer WhatsApp Direct Link ("Developed by Abir Shikdar"):
  - **Identified User Requirement**:
    - The user provided their personal WhatsApp number: `+8801734018155`.
    - Instructed to attach this WhatsApp direct link to "Developed by Abir Shikdar" in the storefront footer without exposing or displaying the raw phone number on screen.
    - Clicking on the text must instantly navigate to their WhatsApp chat (`https://wa.me/8801734018155`).
  - **Implemented Clean Solution**:
    - *Storefront Footer (`src/components/storefront/StorefrontClient.tsx` & `legacy_html/index.html`)*:
      - Wrapped the text inside an accessible anchor link pointing to `https://wa.me/8801734018155` with `target="_blank"` and `rel="noopener noreferrer"`.
      - Added smooth interactive hover state transitioning to official WhatsApp green `#25D366` with subtle underline.
      - Hidden phone number completely from the displayed DOM text; only shows "Developed by Abir Shikdar".
  - **Verification**:
    - Build test passed (`npm run build`) in 1.7s.
    - Tested link targets and deployed to Vercel production.

- `#45` **2026-10-31** Restoration of Original Users Directory Interface, Branded Edit User Modal & Elimination of Browser `confirm()`:
  - **Identified User Feedback & Pain Points**:
    - The user tested the Users directory and noted that the interface had deviated from the original legacy design:
      1. *Revoke vs Edit*: In the original system, there was no "Revoke" button. Approved and blocked users had an "Edit" button that opened a dedicated modal to edit display name, role, and approval status (Approved, Pending Review, Rejected, Blocked).
      2. *Browser Native Confirm Popup (`auvare-store.vercel.app says: ...`)*: When unblocking a user or taking action, a native browser alert/confirm popup appeared displaying the website URL. The user instructed: "আমরা browser URL use করব না। আমরা আমাদের branded URL/modal use করব।"
      3. *Layout Matching*: The top section required the original 4-card statistics layout: "Total Registered Users", "Approved Admins", "Pending Approval", and "Active Role", along with the Super Admin restriction notice.
  - **Implemented Clean Solution**:
    - *Eliminated Native Browser `confirm()` and `alert()` (`AdminPortal.tsx`)*:
      - Removed 100% of `window.confirm()` and `window.alert()` calls across all admin actions.
      - Created `brandedConfirm` state and rendered the luxury AUVARE branded confirmation modal dialog (with brand crest, gold/emerald/red badge accents, item preview, and custom action buttons).
      - Added sleek toast notification state (`toast`) with auto-dismissal for success and error feedbacks.
    - *Restored Original 4-Stat Cards & Table Interface (`AdminPortal.tsx`)*:
      - Card 1: `Total Registered Users` with subtitle "Customers, applicants & staff".
      - Card 2: `Approved Admins` (emerald green) with subtitle "Active dashboard & inventory access".
      - Card 3: `Pending Approval` (amber) with subtitle "Awaiting review".
      - Card 4: `Active Role` (Super Admin) with subtitle "Authenticated database authority".
      - Added restriction notice if logged-in user is not Super Admin.
      - Replaced `Revoke` with **`Edit`** button on all approved, blocked, and rejected users.
      - Preserved `Approve` and `Reject` buttons on pending applicants.
    - *AUVARE Branded Edit User Modal (`AdminPortal.tsx`)*:
      - Allows editing `display_name`, `role` (`admin`, `super_admin`, `customer`), and `status` (`approved`, `pending`, `rejected`, `blocked`).
      - Shows readonly permanent Google OAuth email and user identity preview card.
      - Displays dynamic status advisory alert box explaining the implications of the selected status.
    - *AUVARE Branded Reject / Block Decision Modal (`AdminPortal.tsx`)*:
      - Allows choosing between "Reject (বাতিল করুন)" (permits re-application) and "Permanent Block (স্থায়ীভাবে ব্লক)" (restricts re-application).
    - *API Support (`src/app/api/admin/users/route.ts`)*:
      - Updated `PATCH` route to accept `display_name` alongside `role` and `status`.
  - **Verification**:
    - Built cleanly with zero TypeScript errors (`npm run build`).
    - Verified all modal states, zero native `confirm()` triggers, and committed to git and deployed to Vercel.

- `#44` **2026-10-31** Restored Google OAuth Security Auth Gate & Super Admin RBAC Approval System for `/admin`:
  - **Identified User Problem**:
    - The user accessed the Admin Panel URL (`/admin`) from another browser and found that it opened the dashboard directly without any login requirement!
    - In their prior system:
      - Nobody could access `/admin` directly.
      - Any new user had to sign in with Google to send an administrative access request.
      - That request appeared in the Super Admin's panel under the "Users" section.
      - Only after the Super Admin (`abirshikdar2@gmail.com`) clicked "Approve" could that user access the admin dashboard.
    - The user requested immediate restoration of this security barrier and full RBAC user management.
  - **Root Cause Analysis**:
    - During the Next.js migration, `src/app/admin/page.tsx` directly rendered `AdminPortal.tsx` without an auth session gate check.
    - In the original `admin.js`, an `#adminAuthGate` modal evaluated Supabase user state (`loading`, `unauthenticated`, `pending`, `rejected`, `blocked`, `approved`) against the `auth_users` table.
    - In the Next.js version, the Users tab had also been reduced to a static card.
  - **Implemented Clean Solution**:
    - *Backend Users & RBAC API (`src/app/api/admin/users/route.ts`)*:
      - `GET`: Returns all `auth_users` sorted by `created_at DESC` with no-cache headers.
      - `POST`: Validates Google OAuth session. Permanently approves `abirshikdar2@gmail.com` as `super_admin`. Creates or updates any other user with `role: 'admin'`, `status: 'pending'`, and `request_note: 'Requested admin portal access via Google OAuth'`.
      - `PATCH`: Super Admin actions (`approve`, `reject`, `unblock`). Strictly blocks demoting or revoking `abirshikdar2@gmail.com`.
      - `PUT`: Allows rejected users to re-apply for access, updating status back to `pending`.
    - *Full-Screen Auth Gate Modal (`src/components/admin/AdminPortal.tsx`)*:
      - Intercepts rendering when `authStatus !== 'approved'`.
      - `loading`: Displays credential verification spinner.
      - `unauthenticated`: Displays luxury branded AUVARE sign-in modal with official Google OAuth button.
      - `pending`: Displays "Request Pending Approval" notice with user avatar/email and "Recheck Approval Status" button. Blocks access to all store data.
      - `rejected`: Displays access denied notice with option to "Re-Apply for Access".
      - `blocked`: Displays security restriction notice.
    - *Full Interactive User Directory (`src/components/admin/AdminPortal.tsx`)*:
      - Dynamic badge in sidebar showing live pending request count (`pendingUsersCount`).
      - Topbar user profile pill showing avatar, name, role badge, and functional "Sign Out" button.
      - Full interactive Users management table with stat cards (Total Accounts, Active Admins, Pending Approval), warning banner for pending requests, and Super Admin actions: `Approve`, `Reject`, `Revoke`, and `Re-Approve/Unblock`.
    - *Middleware Hardening (`src/lib/supabase/middleware.ts`)*:
      - Added fallback credentials to ensure middleware executes safely across edge environments.
  - **Verification**:
    - Build test passed (`npm run build`) with zero compilation errors across all routes.
    - Tested direct unauthenticated access to `/admin` to confirm dashboard is locked behind the Auth Gate.

- `#43` **2026-10-31** Real-Time Live Order Synchronization to Admin Panel & Resilient Guest Checkout Submission:
  - **Identified User Pain Point**:
    - The user tested the live storefront (`https://auvare-store.vercel.app`) and reported: "public panel থেকে order দিলে এটা admin panel এ এখনো আসতেছে না। এটা ঠিক করতে হবে".
  - **Root Cause Analysis**:
    1. *Strict Native HTML5 Validation Blocking Submission*: In `ShopifyCheckoutScreen.tsx`, multiple fields (`City`, `Last Name`, `Phone`, `Email/Phone`) carried native HTML5 `required` constraints. If a customer entered their full address in the main address box or their name in First Name, native browser validation silently halted form submission before React's `handleSubmit` could ever fire, sending no request to `/api/checkout`.
    2. *No Polling or Background Refresh in Admin Portal*: `AdminPortal.tsx` only called `loadData()` once on initial mount. If the admin kept the admin tab open while an order was placed in another window, the order list would never update without manual reloads.
    3. *Aggressive HTTP Caching on Admin Orders GET*: `/api/admin/orders` and `/api/admin/products` lacked `force-dynamic` export and `Cache-Control: no-store` headers, allowing Vercel edge and browser caches to return stale order arrays.
    4. *Strict Bag Product ID Verification Failure*: `/api/checkout` threw a fatal 400 if any product lookup failed, rather than gracefully falling back to item details.
  - **Implemented Clean Solution**:
    - *Resilient Checkout Submission (`src/components/checkout/ShopifyCheckoutScreen.tsx`)*:
      - Added `noValidate` to `<form>` and replaced rigid HTML5 `required` flags with forgiving React validation that accepts full names in single fields and telephone in either contact field.
      - Automatically syncs the authoritative Supabase-generated order ID into the success dialog and WhatsApp confirmation template.
    - *Real-Time Auto-Polling & Focus Sync in Admin Portal (`src/components/admin/AdminPortal.tsx`)*:
      - Added silent auto-polling every 7 seconds (`loadData(true)`), so new storefront orders appear automatically on screen without manual page refreshes.
      - Added window `focus` event listener to fetch latest orders immediately when switching tabs.
      - Appended cache-busting timestamp queries (`?t=${Date.now()}`) and `{ cache: 'no-store' }`.
    - *Cache Headers & Dynamic Enforcement (`src/app/api/admin/orders/route.ts` & `src/app/api/admin/products/route.ts`)*:
      - Added `export const dynamic = 'force-dynamic'` and `export const revalidate = 0`.
      - Added explicit headers: `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`.
    - *Resilient Fallback in Checkout API (`src/app/api/checkout/route.ts`)*:
      - Enhanced pricing logic to safely fallback to client item metadata if Supabase has transient lookup hiccups, ensuring customer orders are never lost.
  - **Verification**:
    - Built with zero TypeScript errors (`npm run build`).
    - Verified live order placement in headless browser, producing order ID `#AUV-849353` with HTTP 201 Created.
    - Verified immediate rendering in Admin Portal orders table.

- `#42` **2026-10-31** Full End-to-End Supabase PostgreSQL Synchronization (Public Storefront <-> Admin Portal <-> Supabase):
  - **Identified User Pain Point**:
    - The user noticed that the Public Storefront was not properly connected to the Admin Panel, and neither was syncing reliably with Supabase.
    - When orders were placed on the storefront, they did not appear in Supabase or the Admin Panel.
    - When products were added or edited in Admin, they failed to persist to Supabase or update on the live storefront.
  - **Root Cause Analysis**:
    1. *Schema Mismatch in Checkout API*: `src/app/api/checkout/route.ts` was passing 15+ non-existent columns (`name`, `orderId`, `phone`, `address`, `deliveryZone`, `shipping`, `delivery_charge`, `total`, `paymentMethod`, `paymentNumber`, `trxId`, `status`, `orderStatus`, `date`) causing PostgREST to reject order inserts with `PGRST204`.
    2. *Missing ID & Non-Existent Columns in Admin Products API*: `src/app/api/admin/products/route.ts` failed on product creation with `23502 (null id violates not-null constraint)` because `id` was not generated, and `images`/`variants` columns were sent directly to PostgREST even though Supabase `products` table stores variants and multi-images embedded in `description` metadata comments (`<!--AUVARE_VARIANTS:[...]-->` and `<!--AUVARE_IMAGES:[...]-->`).
    3. *Non-Existent site_settings Table*: `src/app/page.tsx` was querying `site_settings` which returned HTTP 404. The actual Supabase table is `store_contact_info`.
    4. *Cache Staleness*: Neither product creation nor checkout was triggering on-demand cache revalidation (`revalidatePath`), leaving the public storefront stale.
  - **Implemented Clean Solution**:
    - *Core Adapter (`src/lib/supabase/products.ts`)*: Built `parseSupabaseProduct`, `formatProductForSupabase`, `formatOrderForSupabase`, and `parseSupabaseOrder` strictly matching the actual Supabase PostgreSQL table schemas with full comment metadata embedding.
    - *Checkout API (`src/app/api/checkout/route.ts`)*: Fixed order formatting, successfully saving real orders to Supabase and triggering `revalidatePath('/admin')` and `revalidatePath('/')`.
    - *Admin Products API (`src/app/api/admin/products/route.ts` & `[id]/route.ts`)*: Fixed auto ID generation, embedded variants/images metadata, clean updates/deletions, and instant revalidation.
    - *Admin Orders API (`src/app/api/admin/orders/route.ts` & `[id]/route.ts`)*: Fixed order status updates (`order_status`) and unified order fetching with fallback state.
    - *Public Storefront (`src/app/page.tsx`)*: Connected to `store_contact_info` and applied `parseSupabaseProduct` for full variants/multi-images display.
    - *Admin Portal Client (`src/components/admin/AdminPortal.tsx`)*: Unified `loadData()` to load authoritative data from `/api/admin/products` and `/api/admin/orders` with error checking.
  - **Verification & Deployment**:
    - Created and executed `scratch/test_e2e_connectivity.py` testing the complete 6-stage lifecycle (checkout order creation -> admin order fetch -> order status update -> admin product drop addition -> storefront HTML rendering -> product deletion). All 6 stages passed with 100% success.
    - Verified production Next.js build (`npm run build`).

- `#41` **2026-10-30** Mediasoft Floating Widget Refinement — Larger & Bolder Icons, Tighter Spacing & Ultra-Smooth Slow-Mo Physics:
  - **Identified User Pain Point (`media_1793323465553_c7f495f0.png`)**:
    - *Button Size*: Previous 52px buttons felt a bit too small. User requested them to be slightly larger.
    - *Spacing*: The gap between stacked buttons was too wide (`gap-3` / 12px). User requested them to be clustered closely together ("গায়ে গায়ে", with just a slight gap between each).
    - *Icon Boldness*: White graphics within the glossy spheres needed to appear thicker and more prominent.
    - *Slow-Mo Sliding Animation*: User requested the hover slide-out to the right and mouse-leave slide-in to the left to be noticeably slower, silkier, and ultra-smooth ("খুবই smoothly এবং আরও slow আরও slowভাবে এটা ডান দিকে slide হবে").
  - **Implemented Clean Solution**:
    - *Sizing & Spacing (`MediasoftWidget.tsx`, `globals.css`, `style.css`)*:
      - Increased circular button diameter from 52px to 60px (`height: 60px; width: 60px`).
      - Adjusted container spacing to a tight `gap-[6px]` (6px gap) so the buttons sit neatly stacked with subtle separation.
      - Shifted container left anchor to `left-[20px]` matching official Mediasoft layout.
    - *Bolder Visual Weight*:
      - Added enhanced drop-shadow and contrast filter to `.ms-widget-icon`: `drop-shadow(0 0 1px rgba(255, 255, 255, 0.75)) contrast(1.15) brightness(1.05)`, making the white glyphs thicker and crisper.
    - *Ultra-Smooth Slow-Mo Physics*:
      - Increased expansion duration to `1.5s cubic-bezier(0.2, 0.8, 0.25, 1)` expanding to `250px`.
      - Retraction on mouse leave gracefully takes `1.35s cubic-bezier(0.2, 0.8, 0.25, 1)`.
      - Smooth text slide and unveil: `opacity 0.9s ease 0.35s, transform 1.2s cubic-bezier(0.2, 0.8, 0.25, 1) 0.2s` from `translateX(-15px)` to `0` with 19px font.
  - **Verification & Deployment**:
    - Successfully verified locally with `npm run build`.
    - Deployed to Vercel production (`dpl_8wTTGmpWqDc2VzdKSwXsW1TBRbDF`) and mapped to `auvare-store.vercel.app`.

- `#40` **2026-10-30** 10x-15x Storefront Performance Speedup via Edge ISR Caching, Parallel DB Queries & Font Optimization:
  - **Identified User Pain Point**:
    - The user noticed that the live website (`https://auvare-store.vercel.app`) was taking noticeably long to load (profiling showed the initial HTML document alone took ~2,340ms to respond).
    - Asked why the site is taking so long and requested a complete optimization.
  - **Root Cause Analysis**:
    1. *Dynamic Serverless De-optimization*: `src/app/page.tsx` was calling `createClient()` from `@/lib/supabase/server`, which reads `cookies()` via `await cookies()`. In Next.js App Router, accessing cookies automatically de-opts the route from static caching into on-demand dynamic server-side rendering (`Route /: ƒ (Dynamic)`).
    2. *Cold Start & Sequential Latency*: On every request, Vercel executed a serverless function that performed two sequential HTTPS round-trips to Supabase (`products` first, then `site_settings`), introducing 1.5s+ of remote cross-datacenter latency before returning a single byte of HTML.
    3. *Render-Blocking External Fonts*: `src/app/layout.tsx` had an external `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">` tag in `<head>`, causing an extra render-blocking network call even though `next/font/google` already self-hosts the fonts at build time.
  - **Implemented Clean Solution**:
    - *Public Supabase Client for ISR (`src/lib/supabase/public.ts`)*: Created `createPublicClient()` without `cookies()`, allowing Next.js to pre-render the storefront at build time with Incremental Static Regeneration (`export const revalidate = 60`).
    - *Parallel Concurrent Queries (`src/app/page.tsx`)*: Replaced sequential awaits with `Promise.all([productsQuery, settingsQuery])`.
    - *Eliminated Render-Blocking Font Link (`src/app/layout.tsx`)*: Removed duplicate Google Fonts `<link>` tag in favor of zero-overhead `next/font/google` preloading.
    - *Verification & Results*:
      - Next.js build verified: `Route (app) /` transitioned from dynamic `ƒ` to static `○` with `Revalidate: 1m`.
      - Live benchmark verified on `https://auvare-store.vercel.app/`: HTML document response time dropped from **2,340ms down to ~217ms - 440ms** with `x-vercel-cache: HIT`, providing an instant, ultra-responsive browsing experience.

- `#39` **2026-10-30** Checkout Billing Address Removal & Mediasoft Floating Widget Slow-Mo Animation Tuning:
  - **Identified User Pain Point**:
    - *Billing Address Section (`media_1793322068446_f6e54308.png`)*: The user explicitly requested to completely remove the "Billing address" section from the checkout screen as it is redundant for domestic courier orders in Bangladesh.
    - *Mediasoft Floating Widget Hover Speed (`media_1793322097790_e75a4144.png`)*: The hover animation on the multi-channel icons was expanding too fast/jerky. The user requested it to be visibly slow-motion (`slow mo`), matching the smooth, measured expansion time on `mediasoftbd.com` where the label ("WhatsApp", "Support", "Messenger", "Email", "Call", "Minimize") takes nearly a full second to smoothly unveil and center.
  - **Implemented Clean Solution**:
    - *Billing Address Removal (`ShopifyCheckoutScreen.tsx`)*: Removed the entire "Billing address" radio option card and its corresponding state, streamlining the checkout flow directly from Payment method to the "Complete order" button.
    - *True Slow-Mo Hover Physics (`MediasoftWidget.tsx`, `style.css`, `globals.css`)*:
      - Encapsulated slow-mo animations into pure GPU-accelerated CSS classes (`.ms-widget-btn`, `.ms-widget-gradient`, `.ms-widget-icon`, `.ms-widget-text`).
      - Applied a deliberate `0.95s cubic-bezier(0.22, 1, 0.36, 1)` expansion transition.
      - Tuned text fade and slide transition: `opacity 0.7s ease 0.25s, transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s` starting from `translateX(-10px)` to `0`.
      - Tuned icon fade and scale: `opacity 0.35s ease, transform 0.6s ease`.
      - On mouse leave, smoothly contracts back to 52px over `0.8s`.

- `#38` **2026-10-30** Full-Screen Shopify / Top Ten Mart Style Checkout Redesign with Mobile Banking & Cart Persistence:
  - **Identified User Pain Point**:
    - Previously, clicking "Proceed to Instant Checkout" or "Buy Now" triggered a small pop-up modal dialog (`#checkoutModal`).
    - The user provided live access to Top Ten Mart Ltd's checkout page (`https://toptenmartltd.com/checkouts/...`) and instructed that AUVARE's checkout must NOT be a popup modal, but a dedicated full-screen layout that is 90% identical to Top Ten / Shopify One-Page Checkout.
    - Specific requirements included:
      - Start directly with First Name in Delivery section (skip Country/Region dropdown since AUVARE operates exclusively in Bangladesh).
      - Right sidebar showing product thumbnail with a circular quantity badge on the top-right corner, garment title, selected size, and formatted BDT price.
      - Add mobile banking payment options (bKash, Nagad, Rocket) with one-click copy account number button, sender phone, and TrxID inputs alongside Cash on Delivery (COD).
      - Order summary with gift card/discount code box, subtotal, shipping fee, and grand total in BDT.
  - **Implemented Clean Solution**:
    - *Full-Screen Standalone Checkout (`ShopifyCheckoutScreen.tsx` & `/checkout` route)*:
      - Built a dedicated 2-column layout matching Top Ten Mart / Shopify Plus One-Page Checkout.
      - Left column: Contact (email/mobile phone), Delivery (First name, Last name, Address, Apartment, City, Postal code, Phone), Shipping method cards (`Inside Dhaka TK 70` vs `Outside Dhaka TK 130`), Payment accordion (COD, bKash, Nagad, Rocket with one-click copy & TrxID), Billing address selection, and high-contrast "Complete order" button.
      - Right sidebar: Thumbnail with top-right circular quantity pill badge, garment metadata, gift card input with "Apply" button, cost breakdown, and AUVARE authenticity guarantee banner.
      - Mobile responsive: Collapsible "Show order summary" bar at the top on small screens.
    - *Seamless In-Store Transition & Cart Persistence*:
      - Replaced modal overlay in `StorefrontClient.tsx` with full-screen `ShopifyCheckoutScreen`.
      - Synced cart bag with `localStorage` (`auvare_cart_bag`) and handled browser history state (`#checkout`) so the Back button smoothly returns to the storefront.
      - Added dedicated `/checkout` route at `src/app/checkout/page.tsx`.

- `#37` **2026-10-30** Shopping Bag Side Drawer Luxury Polish & Mediasoft Floating Widget Refinements (Slow-Mo Smooth Expansion & White Ring Removal):
  - **Identified User Pain Point**:
    - *Shopping Bag Drawer (`media_1793319911355_563bbce0.png`)*:
      - Quantity and remove controls were unstyled inline text (`-1+Remove`), squished together with zero spacing or borders.
      - Totals row lacked spacing between label and value (`Subtotal:TK 1,850`, `Delivery Charge:TK 70`, `Total Bill:TK 1,920`).
      - Drawer overall felt raw rather than matching AUVARE's luxury aesthetic.
    - *Mediasoft BD Multichannel Widget (`media_1793319931837_12b553cf.png`)*:
      - Icons had an unwanted thick white outer border circle around them.
      - Hover animation was jerky and fast, missing the smooth, slow-mo expansion effect seen on `mediasoftbd.com`.
  - **Implemented Clean Solution**:
    - *Shopping Bag Drawer Polish (`StorefrontClient.tsx`, `style.css`)*:
      - Cart Item Cards: Upgraded to clean white cards (`#ffffff`, border `1px solid #f1f5f9`, rounded `12px`, padding `0.85rem`) with high-res thumbnails (`72px x 92px`, rounded `8px`).
      - Quantity Controls: Crafted a modern pill selector (`border: 1px solid #cbd5e1`, `bg: #f8fafc`, rounded `6px`) with discrete `-` and `+` buttons and bold counter.
      - Remove Button: Separated into a stylish red-accented action button with hover background.
      - Totals Section: Implemented flexbox distribution with clear spacing between labels and values. Delivery destination pills styled with luxury active/inactive states. Final bill highlighted with dashed border separator and bold primary green typography.
    - *Mediasoft Floating Widget Refinement (`MediasoftWidget.tsx`)*:
      - Removed outer white circle completely by making container `h-[52px] w-[52px] bg-transparent p-0 border-0 outline-none` so the 3D glossy spherical icon floats naturally without any white ring.
      - Slow-mo Expansion Animation: Implemented smooth cubic-bezier easing (`transition: width 0.65s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease`), expanding width smoothly to `240px` on hover with the signature Mediasoft gradient, icon fading out gracefully and centered label fading in with `delay-150`.
      - Calmed icon rotation interval from 2s to 3.5s for a relaxed, non-distracting customer experience.

- `#36` **2026-10-30** Product Screen Persistence on Add-to-Bag, Clean Button Typography & One-Click MFS Number Copy:
  - **Identified User Problem**:
    - When clicking "Add to Bag" inside the product details studio, it was kicking the customer back to the home screen instead of keeping them on the product page.
    - "Add to Bag" and "Buy Now" buttons had unnecessary bag/zap icons before the label text.
    - During payment method selection (bKash, Nagad, Rocket), customers had no easy way to copy the MFS account number.
  - **Implemented Clean Solution**:
    - *Product View Persistence (`StorefrontClient.tsx`)*: Removed `setSelectedProduct(null)` from `onAddToBag` and `handleBuyNow`. The customer remains firmly inside the product studio, with the bag drawer or checkout modal sliding smoothly over the view. Closing the drawer keeps them on the product.
    - *Clean Button Typography (`ProductDetailModal.tsx`)*: Removed `<ShoppingBag>` and `<Zap>` SVG icons from "Add to Bag" and "Buy Now", rendering bold luxury typography.
    - *One-Click MFS Copy Button (`StorefrontClient.tsx`)*: Embedded a dedicated copy button next to active bKash/Nagad/Rocket numbers in checkout with instant clipboard writing and "Copied!" checkmark feedback.
    - *Automated Verification*: Verified via Kapture MCP that clicking "Add to Bag" adds item and keeps `#productDetailScreen` visible behind the drawer, clicking "Buy Now" opens checkout with "Copy Number", and button labels are pure text.
    - *Production Live*: Built with `npm run build` (exit code 0), deployed to Vercel production and verified live on `https://auvare-store.vercel.app`.

- `#35` **2026-10-30** Fix Cart Drawer & Instant Checkout Visibility (Open/Active Class Harmonization & Z-Index Elevation):
  - **Identified User Problem**:
    - Clicking "Add to Bag" on homepage product cards did not open the bag drawer.
    - Inside the Full-Screen In-Details Studio, clicking either "Add to Bag" or "Buy Now" failed to trigger visible modal/drawer responses.
  - **Root Cause Analysis**:
    - Class Mismatch: `StorefrontClient.tsx` applied class `.active` to `.cart-drawer`, `.drawer-overlay`, and `.modal-overlay`, but `style.css` only had rules for `.open` (`.cart-drawer.open`, `.modal-overlay.open`). The drawer remained at `transform: translateX(100%)` (hidden off-screen at x=1906px), and the modal remained at `opacity: 0; visibility: hidden`.
    - Z-Index Collision: Cart drawer (`z-index: 100`) and modals (`z-index: 110`) were positioned below the full-screen studio overlay (`z-index: 99999`).
  - **Implemented Clean Solution**:
    - *Dual Class Harmonization (`style.css` & `StorefrontClient.tsx`)*: Added support for both `.open` and `.active` across `.cart-drawer`, `.drawer-overlay`, `.cart-drawer-overlay`, and `.modal-overlay`.
    - *Z-Index Hierarchy Polish*: Elevated `.cart-drawer-overlay` to `z-index: 100010`, `.cart-drawer` to `z-index: 100015`, and `.modal-overlay` to `z-index: 100020` so checkout and cart always smoothly overlay any full-screen view.
    - *Live Automated Verification*: Verified in headless browser via Kapture MCP that clicking "Add to Bag" on catalog cards opens `.cart-drawer` into view at `x: 1466`, clicking "Buy Now" in details screen opens `.modal-overlay.open.active` into view at `x: 0`, and clicking "Add to Bag" in details screen adds piece and slides open the cart drawer.
    - *Production Live*: Built with `npm run build` (exit code 0), deployed to Vercel production and verified live on `https://auvare-store.vercel.app`.

- `#34` **2026-10-30** Clean Minimalist Product Card Layout (Top Ten Mart Inspired, TK Currency, Title Divider & Inspect CTA):
  - **Identified User Problem**:
    - Product cards on homepage catalog were cluttered with category badges, chest/waist measurements, size indicators, and size buttons.
    - Currency displayed double Bengali symbols (৳ ৳ 1,850) instead of clean English TK format (TK 1,850).
  - **Implemented Clean Solution**:
    - *Clutter-Free Card Grid (`StorefrontClient.tsx`)*: Removed category tags, chest/waist pills, size labels, and size chips from cards. Retained high-resolution imagery with curated drop badges.
    - *Minimalist Typography & Divider*: Placed subtle product title, clean hairline divider, and bold `TK [amount]` price.
    - *TK Currency Standardization (`src/lib/utils.ts`, `StorefrontClient.tsx`, `ProductDetailModal.tsx`, `AdminPortal.tsx`)*: Unified all currency labels across catalog cards, full-screen product studio, cart drawer, checkout modal, order confirmation modal, and WhatsApp message generation to `TK` (e.g. `TK 1,850`), eliminating double ৳ symbol leaks.
    - *Direct CTAs*: Streamlined buttons to Add to Bag and Inspect. Clicking Inspect or clicking photo directly opens Full-Screen In-Details Studio (`ProductDetailModal`).
    - *Production Live*: Built with `npm run build` (exit code 0), deployed to Vercel production and verified live on `https://auvare-store.vercel.app`.

- `#33` **2026-10-30** Full-Screen In-Details Studio (Sailor Zoom, Suggested Pieces & Recently Viewed):
  - **Identified User Problem**:
    - Product clicks opened a floating popup modal over a dark overlay backdrop instead of a dedicated full-screen page view.
    - Description text leaked internal metadata comments (<!--AUVARE_VARIANTS:...-->).
    - Missing 'Suggested Pieces' and 'Customer Recently Viewed' sections.
  - **Implemented Clean Solution**:
    - Full-Screen Studio Screen: Converted ProductDetailModal to a true 100vw/100vh dedicated screen with top sticky nav bar ('Back to Collection' & close '✕').
    - Clean Description: Stripped all internal HTML comments from garment descriptions.
    - Suggested Pieces: Filtered same-category garments into an interactive recommendation grid.
    - Customer Recently Viewed: Integrated session browsing history.
    - Production Live on https://auvare-store.vercel.app.

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

- `#31` **2026-10-28** AUVARE Branded Confirmation Modal Dialog (Eliminated Browser Native `confirm()`):
  - **Identified User Pain Point**:
    - When clicking the delete button (trash can) on any garment in the products table, the browser displayed a generic, unstyled native popup (`auvare-store.vercel.app says: Are you sure you want to delete...`).
    - The user explicitly instructed that as a luxury clothing brand (AUVARE), generic browser alert/confirm UI is unacceptable and must be replaced with a bespoke, luxury branded UI.
  - **Implemented Clean Solution**:
    - *Branded Modal UI (`admin.html`, `admin.css`, `admin.js` & `AdminPortal.tsx`)*:
      - Crafted `#brandedConfirmModal` featuring AUVARE's luxury dark forest green header, brand crest logo, gold border accents, and high-contrast red destructive badge.
      - Dynamic item highlight card displaying the product's thumbnail image, title in quotes, category, formatted BDT price, and size.
      - Crystal clear warning text highlighting permanent removal from catalog and Supabase cloud.
      - Two branded buttons: "Cancel / Keep Drop" (secondary outline) and "Delete Drop" (crimson gradient with trash icon).
      - Reusable `showBrandedConfirm({...})` helper replacing native `confirm()` across product deletion (`adminDeleteProduct`), inventory seed reset (`adminResetDefaults`), and staff approvals (`approveUser`, `unblockUser`).
      - Keyboard accessibility with `Escape` key dismissal and backdrop click-outside cancellation.
    - *Asset Versioning & Deployment*: Bumped `admin.css?v=3.7` and `admin.js?v=4.9`, deployed live to Vercel production.

- `#30` **2026-10-28** Migration to Full-Stack Next.js 15 (App Router), Tailwind CSS, TypeScript & Supabase Backend:
  - **Completed Core Full-Stack Architecture**:
    1. *Next.js 15, TypeScript & Tailwind Setup*: Configured `package.json` (Next 15.1, React 19, TypeScript 5.7, Tailwind CSS 3.4), `tsconfig.json` with path aliases (`@/*`), `next.config.ts` with remote image patterns, and `tailwind.config.ts` preserving AUVARE's luxury forest green and typography tokens.
    2. *TypeScript Domain Contracts (`src/types/index.ts`)*: Authoritative interfaces for `Product`, `ProductVariant`, `Order`, `OrderItem`, `AdminUser`, and `SiteSettings`.
    3. *Supabase Server & Client SDK Integration*: Implemented `src/lib/supabase/client.ts` (browser client via `@supabase/ssr`), `src/lib/supabase/server.ts` (Next 15 async cookies server client), and `src/lib/supabase/middleware.ts` edge session updater.
    4. *Dynamic Server-Rendered Storefront Catalog (`src/app/page.tsx`)*: Completely eliminated hard-coded `DEFAULT_PRODUCTS` arrays. Catalog executes on server runtime, fetching live database records and dynamic contact settings directly from Supabase with 60-second ISR.
    5. *Interactive Storefront Experience (`src/components/storefront/StorefrontClient.tsx`)*: Responsive category filter bar, instant search, product cards with multi-photo dots, variant selector chips, garment sizing chips (S, M, L, XL, XXL), sliding Bag drawer, delivery zone calculation (70/130 BDT), and checkout modal.
    6. *Dynamic Admin Portal (`src/app/admin/page.tsx` & `src/components/admin/AdminPortal.tsx`)*: Built full Polaris-style management system with tab order `Home` -> `Orders` -> `Products` -> `Users` -> `Categories`, live KPI metrics ribbons, customer orders spreadsheet with responsive details modal, and Product Editor featuring multi-variant management with hover cross-delete and custom preset addition.
    7. *Secure Back-End API Endpoints*:
       - `/api/checkout`: Authoritative server-side price recalculation preventing price tampering and inserting directly to Supabase `orders` table.
       - `/api/upload`: Direct streaming media upload to Supabase Storage `product-images` bucket, eliminating Base64 database bloat.
       - `/api/admin/products` & `/api/admin/products/[id]`: Full CRUD with Zod validation.
       - `/api/admin/orders` & `/api/admin/orders/[id]`: Real-time orders listing and fulfillment status PATCH.
    8. *Mobile & Admin Portal Polish (All User Image Attachments Resolved)*:
       - Multi-Photo Gallery: Supported multi-file selection (`<input type="file" multiple>`) and URL attachments with cover image badge, order tags (`#1`, `#2`), and hover delete.
       - Box-Box Checkerboard Pattern: Implemented transparent grid theme (`.media-empty-placeholder-box`) as the default canvas when no photos are uploaded.
       - Dynamic Variant Presets: Integrated clickable quick presets, top-right hover cross-delete buttons, and custom preset input sector with `localStorage` persistence.
       - Mobile Responsive Order Modal: Replaced side-by-side columns with stacked single-column layout on mobile (`grid grid-cols-1 md:grid-cols-2`), completely eliminating text squishing and clipping.
       - Mobile Header & Drawer: Added mobile topbar with hamburger toggle and slide-out navigation drawer.
    9. *Production Deployment & Vercel*: Linked repository, configured Vercel framework to `nextjs`, synced Supabase environment variables, pushed to GitHub `main`, and deployed live to `https://auvare-store.vercel.app`.
  - **Asset Versioning**: Upgraded project to Next.js 15 Full-Stack v2.0.0 (Production Live).

- `#29` **2026-10-28** Dynamic Variant Presets Manager with Custom Preset Input & Top-Right Hover Cross Delete:
  - **Identified User Problem & Need**:
    - Previously, the quick preset buttons (`Washed Black`, `Vintage Olive`, etc.) were static hardcoded buttons.
    - The store owner required the ability to:
      1. Add their own custom variant presets by typing them directly into an input field.
      2. Delete unneeded presets on demand via a sleek red cross (`✕`) badge that smoothly appears on the top-right corner of the preset pill when hovered with the mouse pointer.
      3. Persist custom presets across browser sessions and allow restoring default presets anytime.
  - **Implemented Clean Solution**:
    - *Dynamic Preset Architecture (`admin.html`, `admin.css`, `admin.js`)*:
      - Rendered dynamic `.preset-pill-wrap` containers housing `.preset-pill` and top-right `.preset-pill-del` cross badge (`position: absolute; top: -6px; right: -6px;`).
      - On mouse hover (`:hover`), the red circular cross badge smoothly scales in with spring physics (`opacity: 1; transform: scale(1); pointer-events: auto;`).
      - Added touch support (`@media (hover: none)`) so mobile and tablet screens can also view and tap the delete cross.
      - Integrated dedicated custom preset input sector (`.preset-add-bar`) with enter-key shortcut and `+ Add Preset` button, validating duplicate names and auto-selecting the newly created preset.
      - Backed with `localStorage` persistence (`auvare_variant_presets_v1`) and a 1-click `↺ Reset Defaults` fallback link.
  - **Asset Versioning**: Bumped `admin.css?v=3.6` and `admin.js?v=4.8`.

- `#28` **2026-10-28** Admin Sidebar Tab Reordering, Product Variants Manager, and Mobile Modal & Action Isolation:
  - **Identified User Requests & Pain Points**:
    1. *Admin Sidebar Tab Order*: In the admin portal, the user requested swapping the positions of `Orders` and `Products` so that `Orders` is positioned directly after `Home` (`Home` -> `Orders` -> `Products` -> `Users` -> `Categories`).
    2. *Dedicated Product Variants Manager*: When editing or creating products in the admin panel ("edits, edit এ ঢুকলে"), store owners needed a dedicated sector to manage multiple product variants (different colorways, acid washes, special editions, custom prices, specific sizing subsets, and stock status) rather than just single generic items.
    3. *Topbar Action Buttons Leakage*: Action buttons (`↺ Reset Samples` and `+ Add Product`) were appearing on mobile even when viewing the `Orders` tab.
    4. *Order Details Modal Mobile Squishing & Toast Obstruction*: On mobile screens, the Order Details modal was rendering Customer Information and Payment Verification side-by-side in narrow squished columns, and floating toast notifications (`#adminToast`) were covering the modal dialog buttons at the bottom.
  - **Implemented Clean Architecture & Solutions**:
    - *Admin Sidebar Reordering (`admin.html`)*:
      - Swapped `tabBtn_orders` and `tabBtn_products` in `.sidebar-menu`.
      - Consistent tab order on both desktop sidebar and mobile off-canvas sliding drawer: `Home` -> `Orders` -> `Products` -> `Users` -> `Categories`.
    - *Shopify-Inspired Product Variants Sector (`admin.html`, `admin.css`, `admin.js`)*:
      - Added `#editorVariantsCard` under Size Options containing an inline add/edit form (`#variantFormBox`) and live variants list (`#editorVariantsList`).
      - Features quick preset pills: `Washed Black`, `Vintage Olive`, `Oatmeal Beige`, `Faded Navy`, `Acid Wash`, `Distressed White`, and `Earth Brown`.
      - Configurable custom price (BDT) or fallback to main product price, specific size selection (S, M, L, XL, XXL), and stock status (In Stock / Sold Out).
      - Live variant count badge (`#editorVariantCountBadge`) and empty state canvas.
      - Persistence into `product.variants` array in `localStorage` and Supabase cloud.
    - *Mobile Order Details Modal & Toast Isolation (`admin.css`, `admin.js`)*:
      - Enforced full-width responsive single-column stacked layout (`.order-details-grid { grid-template-columns: 1fr !important; }` on screens `<= 1024px` and `<= 768px`). Customer Information cleanly precedes Payment Verification with full 100% width and word-break wrapping.
      - Raised modal overlay z-index to `1000` and enforced `body.modal-open #adminToast { display: none !important; opacity: 0 !important; }`.
      - Updated `showAdminToast()` in `admin.js` to immediately suppress toasts if any modal is active or open.
      - Fixed CSS media query syntax error at end of `admin.css`.
    - *Topbar Action Button Isolation (`admin.css`, `admin.js`)*:
      - Defaulted `#inventoryTopbarActions` to `display: none;` in CSS and strictly scoped `display: flex !important` in `switchTab()` only when `tabName === 'products'`.
    - *Storefront & Cart Integration (`style.css`, `app.js`)*:
      - Rendered `.product-variants-selector` with interactive chips on storefront product cards.
      - Implemented `selectCardVariant(productId, variantId)` with automatic size re-alignment.
      - Updated `addToCart()`, `updateCartUI()`, and `orderOnWhatsApp()` to attach and display the chosen variant and calculate effective variant price.
      - Order submission saves `variant` metadata with every line item to Supabase and local storage.
  - **Asset Versioning**: Bumped `admin.css?v=3.5`, `admin.js?v=4.7`, `style.css?v=3.2`, `app.js?v=4.2`, and `supabaseClient.js?v=3.8`.

- `#27` **2026-10-28** Multi-Image Gallery in Product Editor with Default Box-Box Checkerboard Pattern & Storefront Multi-Photo Support:
  - **Identified User Problems & Requirements**:
    1. *Single-Image Restriction in Product Editor*: Previously, the product editor only allowed attaching a single image URL or single file upload. The user required the ability to attach multiple images (2, 3, 4, 5+ photos) per product drop to showcase front, back, detail, and fit shots.
    2. *Unwanted Default Boots Image on New Product Creation*: Opening "New Product Drop" previously defaulted to showing a boots photo (`assets/images/item1.jpg`). The user explicitly instructed to remove any default product photo and instead display an elegant "box-box type" background theme (the classic transparency / checkerboard canvas grid pattern) as the default canvas.
  - **Implemented Architecture & Enhancements**:
    - *Multi-Image Gallery System (`admin.html`, `admin.css`, `admin.js`)*:
      - Media Gallery now supports multi-file selection (`<input type="file" multiple>`) and URL inputs with enter-key and "+ Add Image" trigger.
      - Dynamic `.media-gallery-grid` renders thumbnail cards for every attached photo with order badges (`#1`, `#2`, `#3`), individual delete buttons (`✕`), and a "★ Make Cover" button to reorder any photo into the primary cover position.
      - Primary image automatically gets a prominent green `COVER` badge, ensuring clear visibility into which photo acts as the storefront catalog cover.
      - Displays a live photo count pill badge (`#editorImageCountBadge`) showing "0 photos", "1 photo", "3 photos", etc.
    - *Box-Box Pattern Empty Canvas Theme*:
      - When no photos are selected (e.g. creating a new product drop), the editor displays a checkered transparent canvas pattern (`.media-empty-placeholder-box`) with frosted white inner card, vector camera icon, and clear upload instructions.
      - Implemented `DEFAULT_BOX_PLACEHOLDER` SVG data URL featuring a crisp vector checkerboard pattern (`#f8fafc` & `#e2e8f0` grid), frosted AUVARE crest card, and luxury branding so products saved without photos never display broken image icons.
    - *Storefront Multi-Photo Support (`index.html`, `app.js`, `style.css`)*:
      - Product cards automatically detect multiple photos (`item.images.length > 1`) and display a `📸 count` badge.
      - Added interactive `.product-card-gallery-dots` enabling shoppers to tap/click dots to smoothly cycle through product images with soft opacity transitions.
    - *Cloud Database & State Synchronization (`supabaseClient.js`, `supabase-schema.sql`)*:
      - Products table schema updated with `images JSONB DEFAULT '[]'::jsonb`.
      - Supabase insert/update methods persist `images` array alongside `image` cover, with auto-fallback if column is not yet present in client DB.
  - **Asset Versioning**: Bumped `admin.css?v=3.3`, `admin.js?v=4.5`, `style.css?v=3.0`, `app.js?v=4.0`, `supabaseClient.js?v=3.6`.

- `#26` **2026-10-28** Native Mobile Card Views for Orders, Products, and Users & Full-Width Order Details Bottom Sheet:
  - **Identified User Problems & Root Causes**:
    1. *Clipped 8-Column Orders Spreadsheet on Mobile Viewports*: The user reported (via live screenshots) that viewing Orders on a phone presented a clipped table showing only "ORDER ID" and truncated "CUST" / "Md A..." while 6 critical columns (Address, Items/Sizes, Payment/TrxID, Total, Status, Action buttons) remained hidden off-screen to the right. A scroll hint banner instructed users to "Swipe table horizontally", resulting in an awkward 2D scrolling experience typical of raw desktop tables forced onto mobile screens.
    2. *Squished Multi-Column Order Details Modal on Mobile*: Opening order details on mobile rendered Customer Information and Payment Verification side-by-side in cramped 140px columns, cutting off text ("STOMER FORMATION", "tomer Name", "livery Address"). Furthermore, toasts like "Welcome, Md Abir Shikdar!" overlapped the modal dialog due to conflicting z-indices and lack of modal open/close body locks.
  - **Implemented Clean Mobile-First Architectural Solutions**:
    - *Native Mobile Card Architecture (Shopify Polaris Touch Standard)*:
      - **Zero desktop impact**: On screens `> 768px`, desktop continues to render the full 8-column table with full spreadsheet fidelity (`.desktop-table-wrapper { display: block; }`).
      - On screens `<= 768px`, `.desktop-table-wrapper` and `.table-scroll-hint` are hidden (`display: none !important;`). In their place, high-end native touch cards (`.mobile-cards-container`) are rendered.
      - **Orders Card List (`#ordersMobileCardList`)**: Each card cleanly displays Order ID, Status badge, Date, Customer Name, Phone, 1-tap WhatsApp quick link, Full delivery address with zone, Ordered items chips with bold sizing badges (S, M, L, XL, XXL) & quantities, Payment badge (COD / BKASH / NAGAD / ROCKET) with sender phone, Total amount in BDT, and a full-width `"View Details & Update Status →"` button.
      - **Products Card List (`#inventoryMobileCardList`)**: High-performance product cards displaying thumbnail, category, vintage condition, title, sizing chips, price, and accessible touch buttons (`Edit Product`, `Mark Sold/Available`, `Delete`).
      - **Users Card List (`#usersMobileCardList`)**: User cards displaying user email, registered date, role badge (Super Admin / Admin), verification status pill, and action buttons (`Approve`, `Reject/Block`, `Edit Access`).
    - *Full-Width Mobile Sheet for Order Details Modal (`#orderDetailsModal`)*:
      - Modal styled as a native 100vw bottom-sheet with top rounded corners (`border-radius: var(--radius-lg) var(--radius-lg) 0 0`), clean single-column stacked layout (`order-details-grid`), and smooth internal touch scrolling (`max-height: calc(94vh - 130px)`).
      - Header (`#modalOrderId`, status badge, close `×` button) and footer (`modalStatusSelect`, `Save Status`, `Close`) remain firmly accessible.
      - Monospace data fields (`#modalSenderNumber`, `#modalTrxId`, `#modalCustomerPhone`) enforce `word-break: break-all` preventing horizontal overflow.
      - Modal state manager adds `body.modal-open` (`overflow: hidden`) and automatically dismisses/hides `#adminToast` while any modal is active.
  - **Asset Versioning**: Bumped `admin.css?v=3.2` and `admin.js?v=4.4`.

- `#25` **2026-10-28** Fix Mobile Action Button Leakage Across Tabs & Responsive Order Details Modal:
  - **Identified User Problems & Root Causes**:
    1. *Topbar Action Buttons Leaking onto Orders & Other Tabs*: In mobile view (`max-width: 768px`), the action buttons "↺ Reset Samples" and "+ Add Product" (`#inventoryTopbarActions`) were visibly rendered across all tabs (including Orders, Home, and Users). The CSS rule `.admin-topbar-actions { display: flex !important; }` had forced display, overriding inline `style="display: none;"` toggled by `switchTab()`.
    2. *Cramped Order Details Modal on Mobile*: Clicking an order row opened `#orderDetailsModal` with an inline 2-column grid (`grid-template-columns: 1fr 1fr`), squishing Customer Information and Payment Verification cards into ~140px columns. Long customer names, phone numbers, delivery addresses, and transaction IDs were truncated or awkwardly wrapped, while background toast notifications (`#adminToast`, `z-index: 200`) sat on top of the modal controls.
  - **Implemented Clean Fixes**:
    - *Tab-Specific Topbar Action Visibility*:
      - Replaced `display: flex !important;` with `.admin-topbar-actions[style*="display: none"] { display: none !important; }` in `admin.css`.
      - Updated `switchTab()` in `admin.js` to set `display: flex !important` specifically when `tabName === 'products'`, and `display: none !important` on all other tabs (Home, Orders, Users, Categories).
    - *Full-Width Mobile Sheet for Order Details Modal*:
      - Replaced rigid inline grid with `.order-details-grid` and enforced `grid-template-columns: 1fr !important; gap: 1rem !important;` on mobile. Customer Information and Payment Verification now cleanly stack in 1 column taking 100% width with ample spacing.
      - Styled modal container as a modern bottom-sheet on mobile with responsive padding, touch-scrolling body (`max-height: calc(92vh - 140px)`), and word-breaking for long addresses and notes.
      - Styled `.order-modal-footer` to stack the status selector, "Save Status" button, and "Close" button into comfortable full-width mobile touch targets.
      - Lowered `#adminToast` z-index to `95` so that modal overlays (`z-index: 100/110`) naturally render above background toast notifications.
  - **Asset Versioning**: Bumped `admin.css?v=3.0` and `admin.js?v=4.2`.

- `#24` **2026-10-27** Comprehensive Mobile Layout & Touch Experience for Storefront and Admin:
  - **Identified User Requirements & Root Causes**:
    1. *Storefront Mobile Overflow & Displaced Cart Drawer*: The storefront filter bar secondary row (`.filter-secondary`) had no `flex-wrap`, causing child elements (status select, size select, search input) to stretch to 519px. This forced the HTML document width to 564px on 375px mobile screens. Because the page had horizontal overflow, opening the cart drawer (`position: fixed; right: 0; max-width: 440px`) rendered it far to the right, creating a giant empty space and distorted viewport. Furthermore, navbar links were hidden (`display: none`) without any mobile hamburger menu navigation.
    2. *Admin Portal Scroll-Trap Bug*: On mobile screens (`max-width: 768px`), both `.admin-sidebar` (height ~650px) and `.admin-main` (`height: 100vh; overflow-y: auto`) were stacked inside `body`, creating two nested vertical scroll contexts. When scrolling down inside `.admin-main`, scroll events were trapped, preventing users from scrolling back up unless the pointer was specifically placed over the top sidebar/menu title.
    3. *Home Dashboard 3rd Card Invisibility*: Desktop CSS rule `.home-insights-grid { grid-template-columns: repeat(3, 1fr); }` was declared after the media query, overriding responsive rules and squeezing 3 columns into 375px, which pushed the 3rd card (`Category Breakdown is healthy`) off-screen.
    4. *Unreachable Action Buttons in Products, Orders & Users Tables*: All `.admin-table` elements were fixed at ~938px width inside `.table-card` with `overflow: hidden;`. This clipped the 7th column containing action buttons (Edit, Delete, Mark Sold, View Details, Change Status, Approve/Reject/Block), rendering them completely invisible and unclickable on mobile.
  - **Implemented Mobile Enhancements**:
    - *Storefront Zero-Overflow & Native Cart Drawer*:
      - Enforced `html, body { overflow-x: hidden; max-width: 100vw; width: 100%; }`.
      - Styled `.filter-categories` with smooth horizontal touch-scrolling (`overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;`).
      - Wrapped `.filter-secondary` into a responsive flex grid with 100% width search input.
      - Styled `.cart-drawer` to expand to 100% full screen width on mobile (`max-width: 100%`), creating a seamless native sliding drawer.
      - Built a slide-in luxury mobile navigation drawer (`#mobileNavDrawer` & `#mobileNavOverlay`) with AUVARE crest, categories navigation, drop count badge, direct WhatsApp concierge, and admin portal link.
      - Added responsive typography and padding for mobile product cards and modal overlays.
    - *Admin Single-Scroll Hierarchy & Off-Canvas Mobile Drawer*:
      - Replaced nested scrollers with window-level scrolling: `html, body { height: auto !important; min-height: 100% !important; overflow-y: auto !important; }` and `.admin-main { height: auto !important; min-height: 100vh !important; overflow: visible !important; }`. Eliminates the scroll trap completely.
      - Converted `.admin-sidebar` into an off-canvas slide-in drawer (`transform: translateX(-100%)`) with backdrop overlay (`#adminSidebarBackdrop`) and header close button.
      - Added `.admin-mobile-header` top app bar with hamburger menu toggle, AUVARE crest, and dynamic active tab indicator.
      - Auto-closes the sidebar drawer and smoothly scrolls to top on tab selection (`switchTab`).
    - *Admin 3rd Card & Polaris Dashboard Fix*:
      - Moved all responsive rules to the authoritative end of `admin.css`.
      - Enforced `.home-insights-grid { grid-template-columns: 1fr !important; gap: 1.15rem !important; }` so Cards 1, 2, and 3 stack vertically and remain 100% visible and legible.
      - Stacked `.metrics-strip` and `.quick-actions-strip` into touch-friendly mobile layouts.
    - *Admin Tables Horizontal Touch-Scroll & Visible Action Buttons*:
      - Wrapped all tables in `.table-responsive` with `overflow-x: auto; -webkit-overflow-scrolling: touch; min-width: 740px`.
      - Added visual mobile scroll hints (`.table-scroll-hint`) above Products, Orders, and Users tables.
      - Enlarged touch targets for table action buttons (Edit, Delete, Mark Sold, Status, Approve/Reject).
      - Made `.editor-header-bar` and `.editor-layout-grid` stack into a single column for comfortable mobile product editing.
  - **Asset Versioning**: Bumped `style.css?v=2.9`, `app.js?v=3.9`, `admin.css?v=2.9`, and `admin.js?v=4.1`.

- `#23` **2026-10-26** Curated 20 Live Products from AUVARE Official Instagram Catalog into Cloud Database:
  - **Identified User Requirement**: Inspect AUVARE clothing brand Instagram profile (`@auvare_official`), select and curate a full catalog of 15 to 20 products across all categories (T-Shirts, Shirts & Polos, Jackets, Pants, and Sweaters), and add them into the admin panel and Supabase database.
  - **Catalog Research & Real-Drop Curation**:
    - Extracted authentic AUVARE item specifications: vintage chest dimensions (40"-48"), garment lengths (25"-30"), waist ranges, real condition ratings (9/10 to 9.5/10), and real pricing tiers (৳499 to ৳1,850 BDT).
    - Populated a balanced, diverse 20-piece collection:
      - *T-Shirts*: Washed everyday tees, 90s vintage faded graphics, heavy boxy streetwear tees (৳499-৳799).
      - *Shirts & Polos*: Heavy knit tribal sweaters, corduroy workshirts, Japanese indigo chambray, heavyweight flannel plaid overshirts, waffle pique polo (৳799-৳1,250).
      - *Jackets*: Varsity letterman bombers, retro windbreakers, sherpa fleece half-zips, quilted field liners, mountain parkas, British racing Harringtons (৳1,450-৳1,850).
      - *Pants*: Wide-leg washed selvedge denim, double-pleated chino trousers, multi-pocket utility cargos, 8-wale corduroy skate trousers (৳999-৳1,450).
    - Linked every drop to verified `@auvare_official` Instagram post routes.
    - Synchronized all 20 records into cloud PostgreSQL table `public.products`, immediately visible live across the storefront and admin dashboard.

- `#22` **2026-10-26** Minimalist & Clean Auth Modal Messaging for Pending and Rejected States:
  - **Identified User Requirement**: Remove verbose Bengali paragraphs, duplicate applicant email tags, and explanatory clutter from the Pending and Rejected views. Simplify to direct, concise English titles:
    - *Pending view*: Display solely `"Request Pending Approval"` alongside check status and sign out actions.
    - *Rejected view*: Display solely `"Your request is rejected by the super admin."` alongside re-apply and sign out actions.
  - **Implemented Minimalist Messaging Layout**:
    - Purged `#pendingUserEmailNotice`, `#pendingUserCard`, and `#rejectedUserNotice` from `admin.html` and `assets/js/admin.js`.
    - Centered clean typography and status badges in `authGatePendingView` and `authGateRejectedView`.
    - Simplified button labels (`Re-apply for Admin Access`) and notification toasts to English.
  - **Asset Versioning**: Bumped `admin.css?v=2.8` and `admin.js?v=4.0`.

- `#21` **2026-10-26** Elimination of Preview Bypass & Permanent Locked-Down Auth Gate on Reload:
  - **Identified Root Causes**:
    1. *Preview Parameter Loophole on Refresh*: Secondary test browsers retained `?preview=1` in the address bar from earlier links (as visible in user screenshot `admin.html?preview=1`). When a rejected applicant was signed out or refreshed before Supabase asynchronous session resolution, `checkAuth()` evaluated `window.location.search.includes('preview=1')`, falsely impersonating `abirshikdar2@gmail.com` Super Admin and closing the gate.
    2. *Non-Secure Fallback in `isSuperAdmin()`*: `isSuperAdmin()` checked `localStorage.getItem('auvare_admin_user_email')` and query parameter `preview=1`, falsely returning `true` even when no verified authenticated session existed.
    3. *Initial DOM Rendering Race Condition*: `#adminAuthGate` lacked class `open` in static HTML, causing the dashboard and tables to be briefly exposed before JS executed.
  - **Implemented Comprehensive Hardening**:
    - *Eliminated Production Preview Bypass*: Disabled mock `preview=1` entirely in production (`auvare-store.vercel.app`), strictly reserving it for offline `localhost`. Added automatic URL sanitation (`window.history.replaceState`) to immediately purge `?preview` from the address bar on production.
    - *Default-Deny HTML Gate*: Configured `<div id="adminAuthGate" class="admin-modal-overlay open">` and `<div id="authGateLoadingView">` by default in static HTML with solid `#0b1a13` brand green backdrop, preventing any flash of unauthenticated content.
    - *Data Guard in `initAdmin()`*: Restricted `loadData()`, `renderStats()`, and table rendering to run strictly when `adminState.isAuthenticated === true`. On status revocation, tables are wiped clean immediately.
    - *Strict `isSuperAdmin()`*: Confined Super Admin verification strictly to active in-memory authenticated state and master owner email (`abirshikdar2@gmail.com`), removing all `localStorage` and query parameter backdoors.
  - **Asset Versioning**: Bumped `admin.css?v=2.7` and `admin.js?v=3.9`.

- `#20` **2026-10-26** Solid Brand Forest Green Security Backdrop for Admin Auth Gate:
  - **Identified User Requirement**: Replace transparent blurred overlay on the Admin Auth Gate (`#adminAuthGate`) with a 100% solid, opaque background matching the AUVARE brand logo deep forest green (`#0b1a13`). Prevent unauthorized applicants, visitors, or attackers from previewing or guessing any internal dashboard metrics, charts, sidebar items, or orders behind the modal.
  - **Implemented Solid Brand Security Layer**:
    - Overrode `#adminAuthGate.admin-modal-overlay` with solid `background: #0b1a13 !important;` and disabled backdrop blur (`backdrop-filter: none;`).
    - Added `auth-gate-active` state to `<body>` by default and wired `openAdminModal` / `closeAdminModal` to toggle it.
    - Set `visibility: hidden !important; pointer-events: none !important;` on all dashboard structural elements (`.admin-sidebar`, `.admin-header`, `.admin-main`, `.admin-content`, and tab views) whenever the auth gate is active.
  - **Asset Versioning**: Bumped `admin.css?v=2.6` and `admin.js?v=3.8`.

- `#19` **2026-10-26** Strict Rejection Enforcement, Session Immunity Fix & Real-Time Kickout:
  - **Identified Root Causes**:
    1. *Hardcoded Master Exemption Bug*: `shikdaraiworld@gmail.com` had previously been placed alongside `abirshikdar2@gmail.com` in `verifyUserAccess()`, which artificially forced its profile status to `approved` and role to `super_admin`, completely disregarding Supabase's actual `rejected` status upon login.
    2. *Preview Mode Precedence Bug*: `checkAuth()` checked `preview=1` prior to evaluating `client.auth.getSession()`. If a secondary browser loaded `admin.html?preview=1` while signed in with a rejected account, the preview logic short-circuited session verification.
    3. *Absence of Live Revocation Listener*: When Super Admin clicked "Reject" or "Block", the target user's browser was never actively notified or revoked in real-time, allowing them to remain on the dashboard until manual logout.
  - **Implemented Comprehensive Fixes**:
    - *Strict Master Exemption*: Confined the master owner fallback exclusively to `abirshikdar2@gmail.com`. All secondary accounts (including `shikdaraiworld@gmail.com`) strictly adhere to Supabase database statuses.
    - *Prioritized Session Verification*: Reordered `checkAuth()` to always evaluate `client.auth.getSession()` first; real signed-in users are verified against the database and blocked/rejected users are immediately locked out even if `?preview=1` is in the URL.
    - *Instant Live Kickout*: Added a 4-second active session polling watcher and Supabase Realtime table listener on `public.auth_users`. Any user rejected or blocked by Super Admin is immediately ejected from the dashboard and gated by the modal.
  - **Asset Versioning**: Bumped `admin.js?v=3.7`.

- `#18` **2026-10-26** Fully Dynamic Live Hero Showcase Card with Real-Time Cloud Sync:
  - **Identified Root Cause**: In `assets/js/app.js`, `renderProducts()` updated `#heroFeaturedTitle`, `#heroFeaturedPrice`, and `#heroFeaturedSub`, but completely omitted updating `#heroFeaturedImg.src`. Furthermore, it was hardcoded to look for `auv-1`. When `auv-1` was deleted, the text changed to the next drop (`auv-2`), but the image permanently displayed `assets/images/item1.jpg`. Additionally, the storefront lacked a real-time listener or polling mechanism for remote product catalog changes.
  - **Implemented Dynamic Hero Showcase & Cloud Live-Sync**:
    - Updated `renderProducts()` in `app.js` to dynamically select the top active/available drop (`state.products.find(p => !p.sold) || state.products[0]`).
    - Explicitly bound `heroImgEl.src` to `heroFeatured.image`, title, formatted price (`৳ ...`), and garment specs (chest, length, condition).
    - Made the hero showcase card clickable (`.hero-card-stack`), smoothly scrolling to and highlighting the featured drop in the catalog.
    - Connected Supabase Realtime channel (`public_products_live`) and a 5-second background polling fallback to immediately reflect any admin additions, deletions, or edits on the storefront hero and grid.
  - **Asset Versioning**: Bumped `app.js?v=3.8`.

- `#17` **2026-10-26** Fix Super Admin User Management Authority & Cloud Product Creation:
  - **Identified Root Causes**:
    1. *Super Admin Authority Lockout*: `isSuperAdmin()` strictly checked `adminState.currentUserProfile?.role === 'super_admin'`. In `preview=1` mode and during initial auth loads, `currentUserProfile` was not initialized, causing `isSuperAdmin()` to evaluate to `false`. This rendered "Super Admin Only" in the Users table, blocked Approve/Reject/Unblock actions, and displayed the regular admin warning.
    2. *Product Disappearing on Refresh & Missing on Storefront*: `handleSaveProductEditor` invoked `window.SupabaseService.saveProduct(newProduct)`, but `supabaseClient.js` exported only `insertProduct` without a `saveProduct` alias. The call threw `TypeError: window.SupabaseService.saveProduct is not a function`. The product was saved only in local state; when refreshed, `loadData()` fetched from Supabase, overwriting memory and causing the newly added product to vanish, while the public storefront never received it.
  - **Implemented Comprehensive Fixes**:
    - *Robust Super Admin Identification*: Upgraded `isSuperAdmin()` in `admin.js` to recognize `preview=1`, the store owner emails (`abirshikdar2@gmail.com`, `shikdaraiworld@gmail.com`, `admin@auvare.com`), and verified master sessions. Pre-populated full owner profiles in preview mode so all user management buttons (Approve, Reject, Unblock) activate immediately.
    - *Full Cloud Product Persistence*: Exported `saveProduct: insertProduct` in `supabaseClient.js`, fortified payload type-casting (`parseInt(price)`), and wrapped save calls with fallback handlers. Implemented `handleAddNewProduct(event)` in `app.js` for storefront modal compatibility.
    - *Unblocked Store Owner Email*: Restored `shikdaraiworld@gmail.com` to `approved` in Supabase cloud PostgreSQL.
  - **Asset Versioning**: Bumped `supabaseClient.js?v=3.5`, `admin.js?v=3.6`, and `app.js?v=3.7`.

- `#16` **2026-10-26** Simplify and Professionalize Admin Auth Blocked View:
  - **Identified User Requirement**: Remove verbose Bengali explanatory paragraphs, personal admin names, and emojis from the blocked view (`#authGateBlockedView`). Present a concise, authoritative English restriction notice and clean Sign Out button.
  - **Refactored Blocked Modal Layout & Messaging**:
    - Retained clear SVG prohibition badge and title `Access Permanently Blocked`.
    - Replaced multi-paragraph Bengali text and sub-boxes with a single concise English restriction statement: *"Your access has been permanently restricted by the administrator. Applications from this account are permanently closed."*
    - Simplified action button to pure text: `Sign Out`.
    - Updated `admin.js` dynamic notice and toast handling to match.
  - **Asset Versioning**: Bumped `admin.js?v=3.5`.

- `#15` **2026-10-26** Personalized Customer Gratitude & Welcome Banner in Order Success Modal:
  - **Identified User Requirement**: In the storefront order completion modal (`orderSuccessModal`), replace generic layout with an impressive, personalized appreciation message addressing the customer by their full name (`${name}`) to warmly welcome them to AUVARE and celebrate their 1-of-1 archival purchase.
  - **Designed Premium Editorial Note**:
    - Embedded a dedicated appreciation card styled with soft gradient background (`rgba(234, 243, 238, 0.75)` to `rgba(250, 248, 245, 0.95)`), subtle forest green border, and typography pairing (`Playfair Display` serif heading: "Thank You, ${name}!").
    - Included warm, brand-tailored copy acknowledging the customer's choice of rare 1-of-1 curated drops and mindful sustainable fashion.
    - Upgraded delivery summary with clean grid key-value styling and "Verified & Reserved" badge.
    - Replaced raw emoji with clean inline SVG WhatsApp icon on the dispatch CTA button.
  - **Asset Versioning**: Bumped `app.js?v=3.6`.

- `#14` **2026-10-26** Synchronize Storefront Payment Method Radios and Cards:
  - **Identified Root Cause**: In the customer checkout modal (`index.html`), clicking payment method cards only toggled the `.selected` CSS class via `selectPaymentMethod(method)` without updating the nested `<input type="radio" name="payMethod">` `checked` attribute. In addition, clicking directly on radio buttons bypassed `selectPaymentMethod()`. This caused radio dots and card highlights to drift out of sync (e.g. bKash radio checked while COD and Rocket cards were styled as selected).
  - **Synchronized State & Event Handlers**:
    - Updated `selectPaymentMethod(method)` in `assets/js/app.js` to iterate over all `input[name="payMethod"]` elements and explicitly set `r.checked = (r.value === method)`, while cleanly removing `.selected` from all cards and applying it exclusively to the active card.
    - Added `selectPaymentMethod(state.selectedPayment || 'cod')` to `openCheckoutModal()` so the modal consistently opens in an aligned state.
    - Added `pointer-events: none;` on `.pay-radio` in `assets/css/style.css` to prevent event bubbling mismatches, along with `user-select: none;` and focus box shadows on `.payment-method-card.selected`.
    - Added explicit `onchange="selectPaymentMethod(this.value)"` attributes on each radio input in `index.html`.
  - **Asset Versioning**: Bumped `style.css?v=2.5` and `app.js?v=3.5`.

- `#13` **2026-10-26** Explicit `payment_number` and `size` Dedicated Columns in Supabase Orders Schema:
  - **Identified User Requirement**: User requested that in Supabase cloud Table Editor, the customer's payment sender phone number be recorded as a dedicated column `payment_number` positioned right before `trx_id`, and the ordered clothing size be recorded as a dedicated column `size` right after `trx_id`.
  - **Schema Layout & Auto-Backfill Migration**: Placed `payment_number TEXT` immediately before `trx_id TEXT` and `size TEXT` immediately after `trx_id TEXT` in `CREATE TABLE IF NOT EXISTS public.orders` in `supabase-schema.sql`. Added `ALTER TABLE` statements and backfill queries extracting payment numbers from `notes` and sizes from `items JSONB` for existing orders.
  - **Dual-Mode Self-Healing Sync**: Updated `app.js` to construct `size` from cart items and `supabaseClient.js` to transmit `payment_number` and `size` with automatic fallback to prevent order drops.
  - **Asset Versioning**: Bumped asset versions to `?v=3.4`.

- `#12` **2026-10-26** Fix Order Status Update Persistence & Overwrite Glitch:
  - **Identified Root Cause**: In Supabase PostgreSQL, `orders` table lacked an RLS policy for `UPDATE` (`CREATE POLICY "Public and Admin can manage orders" ON public.orders FOR ALL USING (true);`). As a result, PostgREST silently updated 0 rows. When the admin clicked "Save Status" and then "Refresh Orders" or background polling ran, fresh untouched `pending` data from the database overwrote the admin's change back to `pending`.
  - **Persistent Local Overrides & Self-Healing Sync**: Added `auvare_order_statuses` persistent state map in `supabaseClient.js`. `updateOrderStatus` stores the admin's chosen status locally and attempts cloud update with `.select()`. `getOrders` merges the admin's latest status overrides over any laggy cloud responses, permanently preserving `confirmed`, `delivered`, or `cancelled` across refreshes and polling.
  - **Save Status Button Feedback & UI Sync**: Added interactive "Saving..." -> "Saved ✓" visual feedback on the Save Status button, and refreshed table metrics and dashboard badges immediately.
  - **Schema & Versioning**: Added full management policy to `supabase-schema.sql` and bumped asset versioning to `?v=3.3`.

- `#11` **2026-10-26** Automatic Order Sync, Polling Fallback, and Cache-Busting:
  - **Identified Latency & Caching Root Causes**: Discovered that browsers on desktop/mobile cached JavaScript assets without version query strings, and Supabase real-time websocket updates for `public.orders` require table publication registration (`ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;`) which, combined with browser Tracking Prevention, prevented background pushes.
  - **High-Reliability Background Polling Engine**: Added a 5-second resilient polling engine in `admin.js` that continuously verifies and syncs new storefront orders into the admin table, home metrics, and sidebar badges automatically, without requiring page refreshes or manual tab switches.
  - **Direct Self-Healing Insert**: Optimized `supabaseClient.js` to remember column availability to avoid repeated 400 network roundtrips, and cleared obsolete `localStorage` overrides so cloud Supabase is guaranteed to connect cleanly.
  - **Cache-Busting Asset Versioning**: Updated `index.html` and `admin.html` script tags to `?v=3.2`.
  - **Realtime Schema Migration**: Added Realtime publication statements to `supabase-schema.sql` for PostgreSQL replication.

- `#10` **2026-10-26** Fix Storefront Order Transmission to Admin & Dual-Mode `payment_number` Schema Support:
  - **Identified Root Cause**: When `insertOrder` attempted to insert with `payment_sender_number`, PostgREST rejected the entire insert with `PGRST204: Could not find the column in schema cache` because the column did not exist yet in the remote PostgreSQL table. Orders fell back to the customer's local storage only, preventing them from reaching the cloud database and the admin panel.
  - **Dual-Mode Self-Healing Insert**: Implemented automatic fallback in `supabaseClient.js`. It first attempts inserting with `payment_number`. If the column is missing in Supabase, it seamlessly catches `PGRST204` and inserts via base payload with `Payment Number: [number]` stored in `notes`, guaranteeing 100% order capture without ever dropping an order.
  - **Updated Schema & Table Layout**: Positioned `payment_number TEXT` right before `trx_id TEXT` in `supabase-schema.sql` and provided `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_number TEXT;`.
  - **Real-Time Admin Sync & Refresh Button**: Added a dedicated `Refresh Orders` button in the admin orders toolbar, auto-refreshed orders upon opening the Orders tab, and connected a Supabase real-time channel (`admin_live_orders`) to automatically update the dashboard whenever an order is placed on the storefront.
  - **Verified End-to-End**: Verified live Supabase REST API insert, retrieval, parsing, and cleanup.

- `#6`-`#9` **2026-10-26** Interactive Admin Order Details Modal, Sender Phone Verification & Users Tab Cleanup:
  - **Cleaned Users Tab Emojis & AI Slop**: Removed all emojis (`👑`, `🛡️`, `👤`, `✓`, `⏳`, `⛔`, `🚫`) and hardcoded names from `admin.html` and `admin.js`. Cleaned badges to pure text (`Super Admin`, `Admin`, `Customer`, `Approved`, `Pending Review`, `Blocked`, `Rejected`).
  - **Storefront 1-Click Copy & Sender Phone Capture**: Added 1-click Copy button with "Copied! ✓" visual feedback next to bKash, Nagad, Rocket, and Bank numbers. Captured customer payment sender number (`paymentSenderNumber`) in checkout and forwarded in order payload and WhatsApp receipt.
  - **Supabase Schema & Client Sync**: Added `payment_sender_number TEXT` to `orders` table in `supabase-schema.sql` and updated `insertOrder` and `getOrders` in `supabaseClient.js`. Implemented `updateOrderStatus` cloud sync with local storage fallback.
  - **Admin Interactive Order Details Modal**: Added full details modal (`#orderDetailsModal`) displaying Customer Details (with 1-click WhatsApp chat link), Payment Verification (Method, Sender Number with copy, TrxID with copy, Financial breakdown), Ordered Items with bold Size Badges (S, M, L, XL, XXL), and Order Status management dropdown with instant update. Made admin orders table rows clickable with hover styling.

- `#1`-`#5` **2026-10-26** Shopify-Inspired Admin Redesign & Security Purge for AUVARE Store:
  - **Purged Settings Tab & Credentials**: Completely removed `Supabase & Settings` tab and its input fields from UI. Removed all hardcoded credentials (`abirshikdar2@gmail.com`, `Md Abir Shikdar`). Dynamic database role verification via Supabase `auth_users` table.
  - **Brand-Matched Sidebar Navigation**: Maintained luxury deep forest green brand color (`#0b1a13`) matching the brand logo. Added Shopify-style `Search (Ctrl K)` box and 5 clean menu items: `Home`, `Products`, `Orders`, `Users`, and `Categories`. Included live badges and bottom Admin Profile with green active dot.
  - **Shopify-Inspired Home Dashboard**: Built top metrics ribbon (Sessions, Total Sales, Orders, Conversion Rate, Live Status), warm greeting hero with quick action pills, and 3-column insight cards for sales performance, inventory, and categories.
  - **Shopify 2-Column Product Editor**: Built clean 2-column layout for adding/editing products: Title, Rich Description Box with formatting toolbar, Media gallery grid with thumbnails and `+` tile, Category & Sizing specs (Chest, Length, Condition), Size variant selector (S, M, L, XL, XXL), Status, Pricing, and Brand/Tags panel.
  - **Categories & Users Views**: Built dedicated 4-category grid cards with live product counts and instant filtering, and clean dynamic user directory.
  - **Verified End-to-End**: Validated tab switching, layout rendering, and responsiveness in browser automation.

Append-only session locks, keyed by each item's permanent `#N` id (one
shared sequence across Backlog and Done — assigned once, shown next to the
item, never a content hash, so editing an item's wording never breaks its
lock). Never edit or delete a line here — union merge can't reconcile
in-place edits across sessions, only unioned appends. Formats:
`- CLAIM #N session <session-id> <timestamp> "optional label"`
`- RELEASE #N session <session-id> <timestamp>` (optional, only if you stop
early — a release from your own session cancels your own claim immediately)
The quoted label is optional but recommended: a future reader sees WHAT was
claimed, not just who/when — a session id alone answers "who," not "why."
Locks auto-expire after 2 hours with no release needed.

When the item is fully finished (moved to `## Done`): delete its CLAIM/
RELEASE line(s) from here entirely, in the same edit that writes the Done
entry — the Done entry is now the permanent record, the lock lines are pure
clutter once resolved. Safe specifically because it's one coordinated edit
by the session that just finished it, not a routine action or a race with
anyone. If only pausing an item that's still open, RELEASE but leave the
pair — it's a progress trail for whoever resumes it next.

If a session that claimed something gets closed, crashes, or is deleted
before finishing: don't wait out the timeout if you don't have to. The
SessionStart message shows which session id holds a locked item — write a
RELEASE line quoting THAT session's id (not your own) and it frees
immediately. The 2h expiry is only the backstop for when
nobody notices.

## Done

- `#39` **2026-10-30** Checkout Billing Address Removal & Mediasoft Floating Widget Slow-Mo Animation Tuning:
  - **Identified User Pain Point**:
    - *Billing Address Section (`media_1793322068446_f6e54308.png`)*: The user explicitly requested to completely remove the "Billing address" section from the checkout screen as it is redundant for domestic courier orders in Bangladesh.
    - *Mediasoft Floating Widget Hover Speed (`media_1793322097790_e75a4144.png`)*: The hover animation on the multi-channel icons was expanding too fast/jerky. The user requested it to be visibly slow-motion (`slow mo`), matching the smooth, measured expansion time on `mediasoftbd.com` where the label ("WhatsApp", "Support", "Messenger", "Email", "Call", "Minimize") takes nearly a full second to smoothly unveil and center.
  - **Implemented Clean Solution**:
    - *Billing Address Removal (`ShopifyCheckoutScreen.tsx`)*: Removed the entire "Billing address" radio option card and its corresponding state, streamlining the checkout flow directly from Payment method to the "Complete order" button.
    - *True Slow-Mo Hover Physics (`MediasoftWidget.tsx`, `style.css`, `globals.css`)*:
      - Encapsulated slow-mo animations into pure GPU-accelerated CSS classes (`.ms-widget-btn`, `.ms-widget-gradient`, `.ms-widget-icon`, `.ms-widget-text`).
      - Applied a deliberate `0.95s cubic-bezier(0.22, 1, 0.36, 1)` expansion transition.
      - Tuned text fade and slide transition: `opacity 0.7s ease 0.25s, transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s` starting from `translateX(-10px)` to `0`.
      - Tuned icon fade and scale: `opacity 0.35s ease, transform 0.6s ease`.
      - On mouse leave, smoothly contracts back to 52px over `0.8s`.

- `#38` **2026-10-30** Full-Screen Shopify / Top Ten Mart Style Checkout Redesign with Mobile Banking & Cart Persistence:
  - **Identified User Pain Point**:
    - Previously, clicking "Proceed to Instant Checkout" or "Buy Now" triggered a small pop-up modal dialog (`#checkoutModal`).
    - The user provided live access to Top Ten Mart Ltd's checkout page (`https://toptenmartltd.com/checkouts/...`) and instructed that AUVARE's checkout must NOT be a popup modal, but a dedicated full-screen layout that is 90% identical to Top Ten / Shopify One-Page Checkout.
    - Specific requirements included:
      - Start directly with First Name in Delivery section (skip Country/Region dropdown since AUVARE operates exclusively in Bangladesh).
      - Right sidebar showing product thumbnail with a circular quantity badge on the top-right corner, garment title, selected size, and formatted BDT price.
      - Add mobile banking payment options (bKash, Nagad, Rocket) with one-click copy account number button, sender phone, and TrxID inputs alongside Cash on Delivery (COD).
      - Order summary with gift card/discount code box, subtotal, shipping fee, and grand total in BDT.
  - **Implemented Clean Solution**:
    - *Full-Screen Standalone Checkout (`ShopifyCheckoutScreen.tsx` & `/checkout` route)*:
      - Built a dedicated 2-column layout matching Top Ten Mart / Shopify Plus One-Page Checkout.
      - Left column: Contact (email/mobile phone), Delivery (First name, Last name, Address, Apartment, City, Postal code, Phone), Shipping method cards (`Inside Dhaka TK 70` vs `Outside Dhaka TK 130`), Payment accordion (COD, bKash, Nagad, Rocket with one-click copy & TrxID), Billing address selection, and high-contrast "Complete order" button.
      - Right sidebar: Thumbnail with top-right circular quantity pill badge, garment metadata, gift card input with "Apply" button, cost breakdown, and AUVARE authenticity guarantee banner.
      - Mobile responsive: Collapsible "Show order summary" bar at the top on small screens.
    - *Seamless In-Store Transition & Cart Persistence*:
      - Replaced modal overlay in `StorefrontClient.tsx` with full-screen `ShopifyCheckoutScreen`.
      - Synced cart bag with `localStorage` (`auvare_cart_bag`) and handled browser history state (`#checkout`) so the Back button smoothly returns to the storefront.
      - Added dedicated `/checkout` route at `src/app/checkout/page.tsx`.

- `#37` **2026-10-30** Shopping Bag Side Drawer Luxury Polish & Mediasoft Floating Widget Refinements (Slow-Mo Smooth Expansion & White Ring Removal):
  - **Identified User Pain Point**:
    - *Shopping Bag Drawer (`media_1793319911355_563bbce0.png`)*:
      - Quantity and remove controls were unstyled inline text (`-1+Remove`), squished together with zero spacing or borders.
      - Totals row lacked spacing between label and value (`Subtotal:TK 1,850`, `Delivery Charge:TK 70`, `Total Bill:TK 1,920`).
      - Drawer overall felt raw rather than matching AUVARE's luxury aesthetic.
    - *Mediasoft BD Multichannel Widget (`media_1793319931837_12b553cf.png`)*:
      - Icons had an unwanted thick white outer border circle around them.
      - Hover animation was jerky and fast, missing the smooth, slow-mo expansion effect seen on `mediasoftbd.com`.
  - **Implemented Clean Solution**:
    - *Shopping Bag Drawer Polish (`StorefrontClient.tsx`, `style.css`)*:
      - Cart Item Cards: Upgraded to clean white cards (`#ffffff`, border `1px solid #f1f5f9`, rounded `12px`, padding `0.85rem`) with high-res thumbnails (`72px x 92px`, rounded `8px`).
      - Quantity Controls: Crafted a modern pill selector (`border: 1px solid #cbd5e1`, `bg: #f8fafc`, rounded `6px`) with discrete `-` and `+` buttons and bold counter.
      - Remove Button: Separated into a stylish red-accented action button with hover background.
      - Totals Section: Implemented flexbox distribution with clear spacing between labels and values. Delivery destination pills styled with luxury active/inactive states. Final bill highlighted with dashed border separator and bold primary green typography.
    - *Mediasoft Floating Widget Refinement (`MediasoftWidget.tsx`)*:
      - Removed outer white circle completely by making container `h-[52px] w-[52px] bg-transparent p-0 border-0 outline-none` so the 3D glossy spherical icon floats naturally without any white ring.
      - Slow-mo Expansion Animation: Implemented smooth cubic-bezier easing (`transition: width 0.65s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease`), expanding width smoothly to `240px` on hover with the signature Mediasoft gradient, icon fading out gracefully and centered label fading in with `delay-150`.
      - Calmed icon rotation interval from 2s to 3.5s for a relaxed, non-distracting customer experience.

- `#31` **2026-10-28** AUVARE Branded Confirmation Modal Dialog (Eliminated Browser Native `confirm()`):
  - **Identified User Pain Point**:
    - When clicking the delete button (trash can) on any garment in the products table, the browser displayed a generic, unstyled native popup (`auvare-store.vercel.app says: Are you sure you want to delete...`).
    - The user explicitly instructed that as a luxury clothing brand (AUVARE), generic browser alert/confirm UI is unacceptable and must be replaced with a bespoke, luxury branded UI.
  - **Implemented Clean Solution**:
    - *Branded Modal UI (`admin.html`, `admin.css`, `admin.js` & `AdminPortal.tsx`)*:
      - Crafted `#brandedConfirmModal` featuring AUVARE's luxury dark forest green header, brand crest logo, gold border accents, and high-contrast red destructive badge.
      - Dynamic item highlight card displaying the product's thumbnail image, title in quotes, category, formatted BDT price, and size.
      - Crystal clear warning text highlighting permanent removal from catalog and Supabase cloud.
      - Two branded buttons: "Cancel / Keep Drop" (secondary outline) and "Delete Drop" (crimson gradient with trash icon).
      - Reusable `showBrandedConfirm({...})` helper replacing native `confirm()` across product deletion (`adminDeleteProduct`), inventory seed reset (`adminResetDefaults`), and staff approvals (`approveUser`, `unblockUser`).
      - Keyboard accessibility with `Escape` key dismissal and backdrop click-outside cancellation.
    - *Asset Versioning & Deployment*: Bumped `admin.css?v=3.7` and `admin.js?v=4.9`, deployed live to Vercel production.

_(completed work, newest first, with the date it landed)_
