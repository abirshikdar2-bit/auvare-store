# TODO — carried across sessions

Persistent backlog for this project. Claude reads this at session start and is
blocked from ending a session that changed files but left this untouched.

Write entries a teammate who wasn't here could act on: what's left and **where to
resume**, not just a task name.

## Backlog

- [x] `#1` Purge Supabase & Settings tab, eliminate all hardcoded credentials and AI slop across admin codebase.
- [x] `#2` Overhaul admin sidebar navigation with AUVARE brand-matched styling and 5 clean items: Home, Products, Orders, Users, Categories.
- [x] `#3` Implement Shopify-inspired Home Dashboard view with header metrics, greeting, quick actions, and 3-card insight grid.
- [x] `#4` Implement Shopify-inspired 2-column Products view & Editor (Title, Rich Description Box, Media Grid, S-XXL sizes, Pricing & Status).
- [x] `#5` Implement Users and Categories management views, connect Supabase real-time sync, and verify entire admin experience.

## In Progress

## Done

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
