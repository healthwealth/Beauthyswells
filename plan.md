# Beauthy Swells — try-on implementation plan

**Mode:** Extension. Keep the existing Electric Bloom visual identity and page structure; add one virtual makeup studio without changing the existing story, trend content, anchors, form fields, or email-draft behavior.

## Design and product decisions

Reuse the rose, berry, plum, and warm-paper palette, Bodoni Moda/DM Sans typography, fine borders, and editorial spacing. Add a compact route into the new studio from the existing navigation and hero actions. The studio offers three makeup areas—lip, cheek, and eye—with generic shade swatches, an intensity control, before/after comparison, and reset. No products, prices, medical promises, or availability are invented.

Visitors may use the site's existing sample portrait or choose/take a selfie with the browser's image picker. The image is decoded and rendered in the browser; no photo, facial landmarks, or derived face data are uploaded, saved to local storage, or sent to Beauthy Swells. The page loads the MediaPipe Vision SDK and model only after the visitor selects an image, checks an explicit metrics disclosure, and starts the preview. The disclosure says the image input stays on-device while MediaPipe sends performance and utilization metrics about its APIs to Google, and links to its privacy notice. This implements the informed-consent requirement in the official notice.[2]

Use Face Landmarker in `IMAGE` mode to locate facial features and draw makeup-tint overlays on a canvas. The published model yields normalized face landmarks and Google documents `detect(image)` for still-image inputs.[1][3] This is a visual color preview, not a product match, skin assessment, or promise of a real-world result. Show clear loading, unsupported/network failure, invalid/oversized file, and face-not-detected messages; keep keyboard focus and touch targets usable.

## Implementation shape

The site remains a static, client-side application; no backend, database, accounts, image storage, analytics events, or server secrets are added. Pin the verified `@mediapipe/tasks-vision` package version `1.1.1`; lazily import its module from jsDelivr and its official Face Landmarker task model from Google Storage.[1][3][4] Keep all project-local asset URLs relative for the embedded Preview proxy. Avoid `getUserMedia`; the file input's `capture="user"` hint lets compatible mobile browsers offer a front-camera capture while preserving browser-native permission and file handling.

## Project structure

- `index.html`: existing single-page content plus navigation/hero links, the makeup studio, consent notice, file controls, and accessible status states.
- `styles.css`: existing design tokens plus responsive studio, palette, swatch, canvas, consent, loading, and error-state styles.
- `script.js`: lazy MediaPipe setup; in-memory photo lifecycle; landmark-based lip/cheek/eye overlays; shade, intensity, compare, reset, consent, and failure-state behavior.
- `manus-routes.json`: stays on the existing `/` route; the studio is an in-page anchor, not a new page route.
- `marketing-campaign-plan.md`: separate owner-facing, four-week campaign plan; not copied into the public static build.
- `dist/`: static build output copied from the tracked site assets, unchanged in serving model.

## Existing-UI decision record

**Mode:** Extension. **Preserve:** the Electric Bloom rose/berry identity, typography, hero, current anchors, existing navigation destinations, trend content, contact fields, and mail-draft behavior. **Improve:** add a face-aware local makeup preview with explicit SDK-metrics consent, large shade controls, intensity, compare, reset, and accessible status states. **Remove:** nothing from the existing site; do not add a streaming camera, account, upload endpoint, or photo persistence. **Protected contracts:** route `/`, established anchors, and inquiry-form behavior remain unchanged. **Design read + dials:** match the existing visual language at Brand Fidelity 10; avoid unrelated layout or motion changes. **Highest-risk change:** the photo and facial landmarks are sensitive; gate the SDK/model behind the visitor's explicit metrics opt-in and keep image/landmark handling in memory in the browser. **Rollback/fallback:** show an on-page error if the SDK/model is unavailable, leave other site journeys usable, and remove the isolated studio and its handlers without changing the underlying static app.

## Sources

[1]: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js "Face Landmarker guide for Web"
[2]: https://goo.gle/mediapipe-privacy "MediaPipe Tasks Privacy Notice"
[3]: https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/tasks/web/vision/README.md "MediaPipe Tasks Vision Web README"
[4]: https://registry.npmjs.org/@mediapipe/tasks-vision/latest "MediaPipe Tasks Vision package metadata"
[5]: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker "Face Landmarker overview and models"
[6]: https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/face_mesh.md "MediaPipe Face Mesh landmark coordinate and effect-rendering notes"
