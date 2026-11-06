# Beauthy Swells — implementation plan

**Mode:** Extension. Preserve the Shopify-free Beauty Edit, Electric Bloom identity, beauty skills, try-on, dressing guide, and existing route. Replace the draft-only inquiry handoff with real email delivery after the owner provides the destination and sender details and the protected Resend key. The owner has approved one-way server enablement; keep the database off and add no account or photo-upload service.

## Design and product decisions

Reuse the rose, berry, plum, and warm-paper palette, Bodoni Moda/DM Sans typography, fine borders, and editorial spacing. Add a compact route into the new studio from the existing navigation and hero actions. The studio offers three makeup areas—lip, cheek, and eye—with generic shade swatches, an intensity control, before/after comparison, and reset. No products, prices, medical promises, or availability are invented.

Visitors may use the site's existing sample portrait or choose/take a selfie with the browser's image picker. The image is decoded and rendered in the browser; no photo, facial landmarks, or derived face data are uploaded, saved to local storage, or sent to Beauthy Swells. The page loads the MediaPipe Vision SDK and model only after the visitor selects an image, checks an explicit metrics disclosure, and starts the preview. The disclosure says the image input stays on-device while MediaPipe sends performance and utilization metrics about its APIs to Google, and links to its privacy notice. This implements the informed-consent requirement in the official notice.[2]

Use Face Landmarker in `IMAGE` mode to locate facial features and draw makeup-tint overlays on a canvas. The published model yields normalized face landmarks and Google documents `detect(image)` for still-image inputs.[1][3] This is a visual color preview, not a product match, skin assessment, or promise of a real-world result. Show clear loading, unsupported/network failure, invalid/oversized file, and face-not-detected messages; keep keyboard focus and touch targets usable.

## Implementation shape

The Beauty Edit and its beauty tools remain static, client-side pages. The only server-side addition is a same-origin `POST /api/inquiry` handler that validates the submitted name, email, topic, and message, then sends them to the owner-configured business inbox through Resend. Keep the provider key server-side in protected configuration; do not log or persist inquiry content, and add no database, account, photo upload, or change to on-device selfie/landmark handling. Use a honeypot, same-origin checks, field bounds, and best-effort process-local throttling without claiming durable rate limits. The static build remains the public page layer; production routing sends `/api/inquiry` and an unauthenticated health path to the Node server and the remaining page/assets to static output. Preview uses the same handler in its Node server. The owner approved the one-way `features.server` enablement and it is now on; keep the database off. Pin the verified `@mediapipe/tasks-vision` package version `1.1.1`; lazily import its module from jsDelivr and its official Face Landmarker task model from Google Storage.[1][3][4] Keep all project-local asset URLs relative for the embedded Preview proxy. Avoid `getUserMedia`; the file input's `capture="user"` hint lets compatible mobile browsers offer a front-camera capture while preserving browser-native permission and file handling.

## Project structure

- `index.html`: existing single-page content plus the Beauty Skill Studio ritual builder, makeup studio and consent notice, and a non-commerce Beauty Edit hub at the preserved `#shop` anchor with filters, tool links, and the inquiry form.
- `styles.css`: existing design tokens plus responsive guide, ritual builder, makeup studio, editorial edit cards, filters, and inquiry layout; no cart controls are rendered.
- `script.js`: existing beauty-guide interactions, a client-side ritual composed from guide tips, and the virtual makeup try-on; keep image and landmark processing in the browser.
- `dressing-guide.js`: standalone client-side dressing ideas for women, men, and children; self-selected complexion/undertone/occasion, palette exploration, and in-memory saved looks.
- `dressing-guide.css`: matching editorial dressing workspace, labelled swatches, age-appropriate image panels, saved outfits, and responsive controls.
- `scripts/test-dressing.mjs`: pure outfit and real-markup DOM tests; the optional test-only DOM library is installed outside the production site.
- `sample-portraits.css`: scoped adult sample-portrait thumbnail library with selected, loading, retry, fallback, mobile, and keyboard-focus states.
- `scripts/test-portraits.mjs`: real-markup portrait-selection, stale-request, selfie, and consent-race tests using mocked image/canvas/model APIs, not real facial-analysis acceptance.
- `shopify-store.js` and `scripts/storefront-config.mjs`: retained as dormant source for possible future reactivation, but not imported, served, or copied into the current website build.
- `scripts/build.mjs`: builds the static `dist/` output from the site asset allowlist; does not read Storefront credentials or generate a Shopify config file.
- `scripts/dev-server.mjs`: serves the static Preview page/assets and route manifest plus the inquiry endpoint; provides no Shopify client or config endpoint.
- `scripts/inquiry-handler.mjs` and `scripts/server.mjs`: keep validation, provider delivery, and the production server endpoint isolated from browser code; read the protected provider key only at runtime.
- `Dockerfile`: defines the Node server container for the inquiry endpoint while the static build continues to serve the editorial pages and assets.
- `manus-routes.json`: stays on the existing `/` route; the studio is an in-page anchor, not a new page route.
- `marketing-campaign-plan.md`: separate owner-facing, four-week campaign plan; not copied into the public static build.
- `dist/`: generated static output with no Shopify client or public Storefront configuration; ignored by Git and unchanged in serving model.

## Existing-UI decision record

**Mode:** Extension. **Preserve:** the Electric Bloom rose/berry identity, typography, hero, current anchors, existing navigation destinations, trend content, inquiry fields, and validation. **Improve:** keep the face-aware local makeup preview with explicit SDK-metrics consent, large shade controls, intensity, compare, reset, and accessible status states. **Replace:** draft-only email handoff with real inquiry delivery after the owner configures a destination/provider and approves the one-way server capability. **Remove:** no streaming camera, account, photo upload endpoint, or photo persistence. **Protected contracts:** route `/`, established anchors, non-commerce Beauty Edit, and browser-only photo processing remain unchanged. **Design read + dials:** match the existing visual language at Brand Fidelity 10; avoid unrelated layout or motion changes. **Highest-risk changes:** keep visitor photos/landmarks on-device and inquiry text out of application logs/storage; disclose the email destination/provider before submission. **Fallback:** show an on-page error if the model or email provider is unavailable and leave other site journeys usable.

## Interactive beauty ritual builder

Extend the existing Beauty Skill Studio with a small client-side ritual builder in the same blush, berry, warm-paper, Bodoni Moda, and DM Sans visual system. Visitors can select any combination of the existing skin, body, and elegant-dressing tracks and choose a ritual size of one, two, or three steps. Build an ordered sequence by composing tips from the existing `beautyGuides` data; let visitors mark each step complete, announce progress accessibly, and reset or rebuild the ritual. Keep this state in memory for the current page visit; do not add accounts, tracking, time/health claims, new product promises, or a backend. Preserve the guide tabs, try-on consent flow, shop Coming soon guard, current route/anchors, and contact form.

## Hairstyles for your face

Add Hair as a fourth area in the virtual makeup studio. Four generated transparent hairstyle overlays (sleek bob, long waves, soft curls, elegant updo) plus "No hairstyle" appear as thumbnail swatches. After the visitor opts in and the on-device face landmarks are found, the chosen hairstyle is scaled to the face width (landmarks 234/454), anchored just above the forehead landmark (10), and rotated with the eye line (33/263); it layers over any makeup preview. Visitors can fine-tune hairstyle size and hairline position; Reset clears it. Photos stay in the browser, as before. Also add a fourth "Hair" track to the Beauty Skill Studio with face-framing tips and a Hair focus in the ritual builder.

## Shopify integration retained for future reference (currently dormant)

**Mode:** Extension of the existing static site; do not migrate it to Hydrogen or add a server by default. The owner chose **Connect an existing store** in the WebDev Shopify integration card. Match the selected `beautyswells` store to the authorized Shopify Connector account using the card identifiers and connector metadata; never infer the storefront domain from the Admin URL or guess an account.

Use Storefront API `2026-10` with the managed Storefront domain and browser-safe public access token.[7][8] The Admin credential is never used in frontend code. The read-only product audit returned 50 products with images, 49 marked available, and no `onlineStoreUrl` for those 50, so do not invent or construct product-page links. Instead, build a live, cursor-paginated catalog showing Shopify-sourced names, types, images, and variant IDs, prices, and availability from the Storefront Product and ProductVariant models.[9][17] Add search/type filters and accessible load-more behavior.

Keep the initial variant query bounded; when Shopify reports more than 20 variants for a product, load the next set on demand using that product's own cursor. Preserve the selected option while new variants load and expose loading/error feedback accessibly.

For purchase flow, use Shopify's official Storefront Cart API: user-triggered `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, and `cartLinesRemove` mutations; show Shopify-calculated `CartCost.subtotalAmount` and use `Cart.checkoutUrl` for hosted checkout.[10–16] Persist only the anonymous cart ID in browser `localStorage`, not customer identity or address. Cart creation occurs only after the visitor chooses Add to bag; this does not create or place an order. Render line IDs, quantities, and variant merchandise with the documented CartLine shape.[18] No product, price, inventory, discount, or order is changed by the site integration.

**Project structure:** `index.html` adds the `#shop` catalog, product grid, search/type filters, and accessible bag panel. `styles.css` extends the Electric Bloom design with responsive product cards and cart controls. `shopify-store.js` calls the Storefront Product and Cart APIs in the browser, handles cursors, variants, cart state, and user-visible loading/error states; `script.js` retains the try-on and beauty-guide behavior. `scripts/storefront-config.mjs`, `scripts/build.mjs`, and `scripts/dev-server.mjs` validate managed settings and provide the public-only configuration in both Preview and static `dist/`. Keep `dist/` out of Git and `manus-routes.json` on the existing single `/` route. Existing try-on, beauty guide, and contact form remain intact. No production server, database, customer account, or Admin token is introduced.

## Current Shopify-free Beauty Edit mode

This approved direction supersedes the earlier shopper-facing catalog and Coming soon state. Retain the existing Shopify connector and integration files in the repository for possible future reactivation, but do not load the Shopify client, read its config, issue Storefront requests, or expose the public token in the current page, Preview server, or static build. Replace the former `#shop` catalog and bag with a curated editorial hub, preserving `#shop` as a compatibility anchor and the existing `/` route. Include keyboard-operable All, Skin & body, Try-on, and Dressing filters; cards link directly to the existing Beauty Skill Studio, ritual builder, consent-gated virtual try-on, and inclusive outfit builder. Do not show a Shopify product catalog, prices, cart, bag, or checkout.

Move the existing inquiry form into the Beauty Edit hub as the non-commerce alternative to the bag. Preserve its name, email, and message inputs, whitespace-only validation, and topic selector. Replace the draft-only `mailto:` handoff with the same-origin API once the owner configures the destination inbox, verified sender, and provider; include the selected topic in the delivered inquiry, disclose the recipient/provider and that the site does not persist submissions, and show accessible success and failure states. Preserve the Electric Bloom assets and visual tokens, keyboard/touch usability, existing feature anchors, and single public page route; `manus-routes.json` remains `/`.

## Inquiry email backend (in progress; awaiting recipient, verified sender, and protected key)

Use Resend, as selected by the owner. Require an exact recipient inbox and a sender address on a domain verified with Resend. Collect the provider API key only through the protected WebDev secret-input flow; never ask for it in chat or place it in source, the static build, Git, or logs. Send the form's name, email, topic, and message from the backend using the Resend `POST /emails` API, a bearer API key, the required `User-Agent` header, and the visitor's address as `reply_to`.[19][20] Keep no database or application-side message history; the page must state that delivery goes to the configured inbox through Resend and explain that the site itself does not save the submission. Do not send live test inquiries during validation.

The owner explicitly approved the one-way server change, and `features.server: true` is stored; the managed database remains disabled. The existing `node scripts/build.mjs` → `dist` static build remains intact; the root `Dockerfile`, unauthenticated `/_app/health` deployment contract, and published routes for `/api/inquiry` and `/_app/health` to the server with other web paths routed to static output are configured. Preview returned 200 for health, route manifest, and inquiry readiness; readiness is intentionally false and the submit action remains disabled until the owner supplies the exact recipient, verified bare sender address, and protected Resend API key. No live inquiry was sent. Do not enable or provision a database.

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
[19]: https://resend.com/docs/api-reference/emails/send-email "Resend Send Email API"
[20]: https://resend.com/docs/api-reference/introduction "Resend API introduction, authentication, and response codes"

## Dressing edit for women, men, and children

**Mode:** Extension, reusing Electric Bloom's warm-paper, rose/berry palette, Bodoni Moda headings, DM Sans controls, fine borders, and existing spacing. Add an in-page `#dressing-edit` after the Beauty Skill Studio with a discoverable link in the studio. Preserve all existing navigation labels, anchors, try-on/privacy controls, contact fields, and the Shopify Coming soon guard. Design read: warm editorial personal-style tool for all ages, brand fidelity 10, restrained motion 2, density 5, visual variance 3, asset dependence 6. The narrative is a practical, encouraging wardrobe companion, viewed on phone or laptop, not a purchase flow or body assessment.

Visitors choose Women, Men, or Children, a self-selected complexion (Explore all, Fair, Light, Medium, Tan, Deep, Very deep), undertone (Not sure, Warm, Cool, Neutral), and occasion (Everyday, Work/school, Celebration). Live results combine age-appropriate outfit pieces with labelled four-colour palettes and non-prescriptive contrast suggestions. All colours are open to every complexion; depth and undertone are distinct choices, not inferred from a photograph or ethnicity. Provide multiple palette options, a reset control, and up to three looks saved only in memory for this page visit. Children's options focus on comfort, movement, washable layers, and safe footwear without adult styling, makeup, body-correction advice, or collecting child data.

Use three new AI-created editorial photographs of women, men, and children with different complexions as category inspiration, not Shopify inventory or photographs of users. These reference photographs do not change clothes or colours when controls change; label this distinction clearly. The colour swatches and outfit text update live. Do not claim a virtual clothing try-on, fit guarantee, purchasable apparel, or scientific colour diagnosis. Add `dressing-guide.js` and `dressing-guide.css` as isolated client-side modules; include them in the public static build and Preview allowlists. No production backend, account, upload, persistent personal data, or new dependency is introduced.

## Sample portraits for lip, eyes, skin, and hair

Extend the existing Virtual Studio with four AI-created, adult, front-facing sample portraits: Lip colour (light complexion), Eyes (medium olive complexion), Skin & cheeks (deep complexion), and Hair (tan complexion). Use neutral daylight, unobstructed eyes/lips/forehead/jaw, realistic skin texture, and pulled-back hair. These are fictional examples, not clients, product matches, assessments, or ranked complexion recommendations; each portrait may be used with any existing preview area.

Add a clickable thumbnail library in the preview column with plain labels, selected/busy states, keyboard focus, accessible status, and image-load failure handling. Selecting a sample switches to its suggested area and loads that image through the existing browser-only photo flow. The Skin & cheeks sample uses the existing cheek tint; do not silently add a foundation, skin smoothing, lightening, or complexion-changing effect. Preserve the original sample button as a fallback, local-selfie support, the prior photo revision guards, clear/compare/reset/drag/fit controls, and metrics-consent gate. New portraits never inherit the original image's stored face points; their hair placement is adjustable until consented on-device detection supplies their own landmarks. No new user photo processing service, backend, account, or persistence is added.

Keep the Electric Bloom palette, Bodoni/DM Sans typography, fine borders, and phone-scale controls. `script.js` holds the small portrait catalogue and selection wiring; `sample-portraits.css` styles only the library. Include the stylesheet in `index.html`, the static build and Preview allowlist. `scripts/test-portraits.mjs` checks real DOM selection/loading/error/revision/privacy flows with mocked image/canvas APIs; it does not claim visual face-detection acceptance. Portraits are stored at their exact managed asset paths and may show a generation state until the media service completes them.

## Interaction reliability repair

This records the earlier interaction-reliability pass, not the current contact-delivery design. Preserve Electric Bloom, all current section anchors, optional non-prescriptive beauty/dressing ideas, the local-selfie and metrics-consent contract, and in-memory rituals and saved outfits. The former email-draft behavior is superseded by the separately scoped inquiry backend after owner approval; the current Beauty Edit has no Shopify catalog, cart, or checkout. Use minimal causal repairs for confirmed loading/race/canvas/input/focus/reset defects. Do not create carts, send enquiries during validation, or collect child photos. Browser evidence and source-review findings distinguish verified paths from dependencies or owner-data limits; tests use fictional generated portraits, not user photos. Keep repeatable acceptance helpers under `scripts/` only if reused, with evidence outside the public build.

The hands-on Preview audit found that managed-storage images were not marked CORS-anonymous before decoding, so visible portraits tainted the canvas and prevented MediaPipe analysis. Mark remote image elements as anonymous before setting their URLs and analyze a clean copy of the original photo, not the cosmetically overlaid canvas. The mobile menu also lacked Escape dismissal; close it on Escape and restore focus to its trigger. Keep local photo processing and the consent gate unchanged; the inquiry API is separate.

The read-only interaction review also identified focus loss when a product card rerendered during option/catalog loading; this was corrected for the earlier catalog and is not needed in the current Shopify-free hub. Preserve the current filter count announcements, open saved-outfit details when sibling cards rerender, match visible guide-step labels in accessible names, and reject whitespace-only inquiries. Until the backend is configured, describe the email-app handoff conditionally; after configuration, the form must use the server endpoint and never imply delivery on failure.
