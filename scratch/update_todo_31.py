with open('docs/TODO.md', 'r', encoding='utf-8') as f:
    content = f.read()

target = "## Done\n\n"
new_entry = """## Done

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

"""

content = content.replace(target, new_entry)
with open('docs/TODO.md', 'w', encoding='utf-8') as f:
    f.write(content)
print("TODO updated for #31.")

