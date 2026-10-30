with open('docs/TODO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

item_36_lines = [
    '- `#36` **2026-10-30** Product Screen Persistence on Add-to-Bag, Clean Button Typography & One-Click MFS Number Copy:\n',
    '  - **Identified User Problem**:\n',
    '    - When clicking "Add to Bag" inside the product details studio, it was kicking the customer back to the home screen instead of keeping them on the product page.\n',
    '    - "Add to Bag" and "Buy Now" buttons had unnecessary bag/zap icons before the label text.\n',
    '    - During payment method selection (bKash, Nagad, Rocket), customers had no easy way to copy the MFS account number.\n',
    '  - **Implemented Clean Solution**:\n',
    '    - *Product View Persistence (`StorefrontClient.tsx`)*: Removed `setSelectedProduct(null)` from `onAddToBag` and `handleBuyNow`. The customer remains firmly inside the product studio, with the bag drawer or checkout modal sliding smoothly over the view. Closing the drawer keeps them on the product.\n',
    '    - *Clean Button Typography (`ProductDetailModal.tsx`)*: Removed `<ShoppingBag>` and `<Zap>` SVG icons from "Add to Bag" and "Buy Now", rendering bold luxury typography.\n',
    '    - *One-Click MFS Copy Button (`StorefrontClient.tsx`)*: Embedded a dedicated copy button next to active bKash/Nagad/Rocket numbers in checkout with instant clipboard writing and "Copied!" checkmark feedback.\n',
    '    - *Automated Verification*: Verified via Kapture MCP that clicking "Add to Bag" adds item and keeps `#productDetailScreen` visible behind the drawer, clicking "Buy Now" opens checkout with "Copy Number", and button labels are pure text.\n',
    '    - *Production Live*: Built with `npm run build` (exit code 0), deployed to Vercel production and verified live on `https://auvare-store.vercel.app`.\n',
    '\n'
]

lines[18:18] = item_36_lines

with open('docs/TODO.md', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Updated docs/TODO.md with item #36 successfully!')

