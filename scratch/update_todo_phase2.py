import io

with open('docs/TODO.md', 'r', encoding='utf-8') as f:
    content = f.read()

target = """    8. *Verification*: Passed `npm run type-check` with zero errors and `npm run build` producing optimized production bundles and static routes.
  - **Asset Versioning**: Upgraded project to Next.js 15 Full-Stack v2.0.0."""

replacement = """    8. *Mobile & Admin Portal Polish (All User Image Attachments Resolved)*:
       - Multi-Photo Gallery: Supported multi-file selection (`<input type="file" multiple>`) and URL attachments with cover image badge, order tags (`#1`, `#2`), and hover delete.
       - Box-Box Checkerboard Pattern: Implemented transparent grid theme (`.media-empty-placeholder-box`) as the default canvas when no photos are uploaded.
       - Dynamic Variant Presets: Integrated clickable quick presets, top-right hover cross-delete buttons, and custom preset input sector with `localStorage` persistence.
       - Mobile Responsive Order Modal: Replaced side-by-side columns with stacked single-column layout on mobile (`grid grid-cols-1 md:grid-cols-2`), completely eliminating text squishing and clipping.
       - Mobile Header & Drawer: Added mobile topbar with hamburger toggle and slide-out navigation drawer.
    9. *Production Deployment & Vercel*: Linked repository, configured Vercel framework to `nextjs`, synced Supabase environment variables, pushed to GitHub `main`, and deployed live to `https://auvare-store.vercel.app`.
  - **Asset Versioning**: Upgraded project to Next.js 15 Full-Stack v2.0.0 (Production Live)."""

if target in content:
    content = content.replace(target, replacement)
    with open('docs/TODO.md', 'w', encoding='utf-8') as f:
        f.write(content)
    print("TODO updated successfully.")
else:
    print("Target not found.")

