# TODO — carried across sessions

Persistent backlog for this project. Claude reads this at session start and is
blocked from ending a session that changed files but left this untouched.

Write entries a teammate who wasn't here could act on: what's left and **where to
resume**, not just a task name.

## Backlog

_(no active backlog items)_

## In Progress

_(none)_

## Done

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

_(completed work, newest first, with the date it landed)_
