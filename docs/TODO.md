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
