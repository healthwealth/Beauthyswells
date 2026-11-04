# Beauthy Swells — implementation plan

**Mode:** Extension. Preserve the existing Electric Bloom visual identity, beauty skills, virtual makeup try-on, story, trends, route, contact fields, and email-draft behavior; add the live Shopify shop and hosted-checkout flow without a production backend.

## Design and product decisions

Reuse the rose, berry, plum, and warm-paper palette, Bodoni Moda/DM Sans typography, fine borders, and editorial spacing. Add a compact route into the new studio from the existing navigation and hero actions. The studio offers three makeup areas—lip, cheek, and eye—with generic shade swatches, an intensity control, before/after comparison, and reset. No products, prices, medical promises, or availability are invented.

Visitors may use the site's existing sample portrait or choose/take a selfie with the browser's image picker. The image is decoded and rendered in the browser; no photo, facial landmarks, or derived face data are uploaded, saved to local storage, or sent to Beauthy Swells. The page loads the MediaPipe Vision SDK and model only after the visitor selects an image, checks an explicit metrics disclosure, and starts the preview. The disclosure says the image input stays on-device while MediaPipe sends performance and utilization metrics about its APIs to Google, and links to its privacy notice. This implements the informed-consent requirement in the official notice.[2]

Use Face Landmarker in `IMAGE` mode to locate facial features and draw makeup-tint overlays on a canvas. The published model yields normalized face landmarks and Google documents `detect(image)` for still-image inputs.[1][3] This is a visual color preview, not a product match, skin assessment, or promise of a real-world result. Show clear loading, unsupported/network failure, invalid/oversized file, and face-not-detected messages; keep keyboard focus and touch targets usable.

## Implementation shape

The site remains a static, client-side application; no backend, database, accounts, image storage, analytics events, or server secrets are added. Pin the verified `@mediapipe/tasks-vision` package version `1.1.1`; lazily import its module from jsDelivr and its official Face Landmarker task model from Google Storage.[1][3][4] Keep all project-local asset URLs relative for the embedded Preview proxy. Avoid `getUserMedia`; the file input's `capture="user"` hint lets compatible mobile browsers offer a front-camera capture while preserving browser-native permission and file handling.

## Project structure

- `index.html`: existing single-page content plus the Beauty Skill Studio ritual builder, makeup studio and consent notice, and the `#shop` catalog, filters, accessible bag panel, and Shopify checkout link.
- `styles.css`: existing design tokens plus responsive guide, ritual builder, makeup studio, catalog, product-card, filter, cart, consent, loading, and error-state styles.
- `script.js`: existing beauty-guide interactions, a client-side ritual composed from guide tips, and the virtual makeup try-on; keep image and landmark processing in the browser.
- `shopify-store.js`: browser-side Storefront API catalog pagination, loaded-product search/type filtering, variant selection, anonymous cart mutations, quantity controls, and checkout handoff.
- `scripts/storefront-config.mjs`: validates the managed store hostname and serializes only the public Storefront token and API version.
- `scripts/build.mjs`: builds the static `dist/` output and generates its public Shopify configuration from managed environment values.
- `scripts/dev-server.mjs`: serves the static page and public Shopify configuration for Preview without writing credentials into source files.
- `manus-routes.json`: stays on the existing `/` route; the studio is an in-page anchor, not a new page route.
- `marketing-campaign-plan.md`: separate owner-facing, four-week campaign plan; not copied into the public static build.
- `dist/`: generated static output, including the public Storefront configuration; ignored by Git and unchanged in serving model.

## Existing-UI decision record

**Mode:** Extension. **Preserve:** the Electric Bloom rose/berry identity, typography, hero, current anchors, existing navigation destinations, trend content, contact fields, and mail-draft behavior. **Improve:** add a face-aware local makeup preview with explicit SDK-metrics consent, large shade controls, intensity, compare, reset, and accessible status states. **Remove:** nothing from the existing site; do not add a streaming camera, account, upload endpoint, or photo persistence. **Protected contracts:** route `/`, established anchors, and inquiry-form behavior remain unchanged. **Design read + dials:** match the existing visual language at Brand Fidelity 10; avoid unrelated layout or motion changes. **Highest-risk change:** the photo and facial landmarks are sensitive; gate the SDK/model behind the visitor's explicit metrics opt-in and keep image/landmark handling in memory in the browser. **Rollback/fallback:** show an on-page error if the SDK/model is unavailable, leave other site journeys usable, and remove the isolated studio and its handlers without changing the underlying static app.

## Interactive beauty ritual builder

Extend the existing Beauty Skill Studio with a small client-side ritual builder in the same blush, berry, warm-paper, Bodoni Moda, and DM Sans visual system. Visitors can select any combination of the existing skin, body, and elegant-dressing tracks and choose a ritual size of one, two, or three steps. Build an ordered sequence by composing tips from the existing `beautyGuides` data; let visitors mark each step complete, announce progress accessibly, and reset or rebuild the ritual. Keep this state in memory for the current page visit; do not add accounts, tracking, time/health claims, new product promises, or a backend. Preserve the guide tabs, try-on consent flow, shop Coming soon guard, current route/anchors, and contact form.

## Existing Shopify store integration

## Hairstyles for your face

Add Hair as a fourth area in the virtual makeup studio. Four generated transparent hairstyle overlays (sleek bob, long waves, soft curls, elegant updo) plus "No hairstyle" appear as thumbnail swatches. After the visitor opts in and the on-device face landmarks are found, the chosen hairstyle is scaled to the face width (landmarks 234/454), anchored just above the forehead landmark (10), and rotated with the eye line (33/263); it layers over any makeup preview. Visitors can fine-tune hairstyle size and hairline position; Reset clears it. Photos stay in the browser, as before. Also add a fourth "Hair" track to the Beauty Skill Studio with face-framing tips and a Hair focus in the ritual builder.

**Mode:** Extension of the existing static site; do not migrate it to Hydrogen or add a server by default. The owner chose **Connect an existing store** in the WebDev Shopify integration card. Match the selected `beautyswells` store to the authorized Shopify Connector account using the card identifiers and connector metadata; never infer the storefront domain from the Admin URL or guess an account.

Use Storefront API `2026-10` with the managed Storefront domain and browser-safe public access token.[7][8] The Admin credential is never used in frontend code. The read-only product audit returned 50 products with images, 49 marked available, and no `onlineStoreUrl` for those 50, so do not invent or construct product-page links. Instead, build a live, cursor-paginated catalog showing Shopify-sourced names, types, images, and variant IDs, prices, and availability from the Storefront Product and ProductVariant models.[9][17] Add search/type filters and accessible load-more behavior.

Keep the initial variant query bounded; when Shopify reports more than 20 variants for a product, load the next set on demand using that product's own cursor. Preserve the selected option while new variants load and expose loading/error feedback accessibly.

For purchase flow, use Shopify's official Storefront Cart API: user-triggered `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, and `cartLinesRemove` mutations; show Shopify-calculated `CartCost.subtotalAmount` and use `Cart.checkoutUrl` for hosted checkout.[10–16] Persist only the anonymous cart ID in browser `localStorage`, not customer identity or address. Cart creation occurs only after the visitor chooses Add to bag; this does not create or place an order. Render line IDs, quantities, and variant merchandise with the documented CartLine shape.[18] No product, price, inventory, discount, or order is changed by the site integration.

**Project structure:** `index.html` adds the `#shop` catalog, product grid, search/type filters, and accessible bag panel. `styles.css` extends the Electric Bloom design with responsive product cards and cart controls. `shopify-store.js` calls the Storefront Product and Cart APIs in the browser, handles cursors, variants, cart state, and user-visible loading/error states; `script.js` retains the try-on and beauty-guide behavior. `scripts/storefront-config.mjs`, `scripts/build.mjs`, and `scripts/dev-server.mjs` validate managed settings and provide the public-only configuration in both Preview and static `dist/`. Keep `dist/` out of Git and `manus-routes.json` on the existing single `/` route. Existing try-on, beauty guide, and contact form remain intact. No production server, database, customer account, or Admin token is introduced.

## Current shop availability

Keep live Shopify product browsing, search, type filters, product pagination, and per-product variant pagination available. Shopify's hosted checkout reported that the store is not set up to receive orders, so the customer-facing shop stays browse-only until the owner confirms checkout readiness. A `SHOPPING_ENABLED = false` guard in `shopify-store.js` replaces add-to-bag and bag controls with disabled “Coming soon” states, keeps the bag panel and checkout link hidden, and skips cart restore/create/line mutations. Re-enable purchase actions only after the owner confirms the store is ready to accept orders.

## Sources

[1]: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js "Face Landmarker guide for Web"
[2]: https://goo.gle/mediapipe-privacy "MediaPipe Tasks Privacy Notice"
[3]: https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/tasks/web/vision/README.md "MediaPipe Tasks Vision Web README"
[4]: https://registry.npmjs.org/@mediapipe/tasks-vision/latest "MediaPipe Tasks Vision package metadata"
[5]: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker "Face Landmarker overview and models"
[6]: https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/face_mesh.md "MediaPipe Face Mesh landmark coordinate and effect-rendering notes"
[7]: https://shopify.dev/docs/api/usage/authentication "Shopify API authentication and public Storefront access tokens"
[8]: https://shopify.dev/docs/api/storefront/2026-10 "Shopify Storefront API 2026-10"
[9]: https://shopify.dev/docs/api/storefront/2026-10/objects/Product "Storefront Product fields"
[10]: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart "Shopify Storefront Cart overview"
[11]: https://shopify.dev/docs/api/storefront/2026-10/objects/Cart "Storefront Cart and hosted checkout URL"
[12]: https://shopify.dev/docs/api/storefront/2026-10/mutations/cartCreate "Storefront cartCreate mutation"
[13]: https://shopify.dev/docs/api/storefront/2026-10/mutations/cartLinesAdd "Storefront cartLinesAdd mutation"
[14]: https://shopify.dev/docs/api/storefront/2026-10/mutations/cartLinesUpdate "Storefront cartLinesUpdate mutation"
[15]: https://shopify.dev/docs/api/storefront/2026-10/mutations/cartLinesRemove "Storefront cartLinesRemove mutation"
[16]: https://shopify.dev/docs/api/storefront/2026-10/objects/CartCost "Storefront CartCost and subtotal"
[17]: https://shopify.dev/docs/api/storefront/2026-10/objects/ProductVariant "Storefront ProductVariant fields"
[18]: https://shopify.dev/docs/api/storefront/2026-10/objects/CartLine "Storefront CartLine fields"
