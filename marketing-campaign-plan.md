# Beauthy Swells — 4-Week Launch Campaign Plan

**Purpose:** Introduce Beauthy Swells and its browser-local virtual makeup try-on through a practical, organic-first campaign. This is a launch framework, not a forecast; no audience size, conversion baseline, budget, team capacity, geography, products, or social/email channels have been confirmed.

## Objective

Make the existing editorial site easier to discover and give visitors a clear reason to explore it: useful guidance across skin, body, style, polished appearance, dressing beautifully, and elegance, alongside the new virtual makeup try-on. Over four weeks, validate which topics and entry points earn qualified visits and meaningful engagement. Establish a simple measurement baseline rather than promise a particular reach or conversion result.

**Working success definition:** a measurable increase from the pre-campaign baseline in relevant site visits and engaged sessions, with the try-on page/tool receiving visits and completed interactions. Set numeric targets only after checking current analytics and available capacity.

## Audience and positioning

**Audience (descriptive, not demographic):** people seeking approachable guidance on skin beauty, body beauty, looking polished, dressing beautifully, and cultivating elegance; especially visitors curious about makeup experimentation without sending their photo to the site's servers.

**Positioning:** Beauthy Swells is an editorial destination for thoughtful, practical beauty and style guidance, with a browser-local virtual makeup try-on. The photo and face landmarks are processed on the visitor's device and are not uploaded or stored by Beauthy Swells. Before the MediaPipe SDK loads, the visitor must opt in to Google processing performance and utilization metrics about its APIs.[1]

**Message hierarchy:**
1. Practical inspiration for skin, body, and personal style.
2. A polished appearance can be explored through approachable guidance, not one prescriptive ideal.
3. Try makeup in the browser; the photo stays on-device, while the separate MediaPipe metrics opt-in is stated before the model loads.[1]

Avoid medical, guaranteed-result, body-shaming, or universal beauty claims. Do not imply the try-on is clinically accurate or suitable for every device/skin tone unless verified.

## Four-week schedule

Keep a sustainable cadence: **one substantial site article/update and two adaptable social/editorial snippets per week**, only on channels the owner confirms they use. Repurpose one source piece into short posts; do not create accounts or promise a newsletter. CTAs below are suggestions, subject to matching live site links and functionality.

| Week | Focus and actions | Sample content angles | Primary CTA |
|---|---|---|---|
| **1 — Set the table** | Confirm live URLs, tool readiness, the photo-processing copy, the separate MediaPipe metrics disclosure and opt-in, the model load, analytics events, and baseline. Publish a concise launch/editorial hub or update an existing relevant page. Announce the site and feature where existing owned channels are active. | “A thoughtful starting point for skin, body, and style”; “What to expect from browser-local makeup try-on”; short walkthrough distinguishing on-device image processing from the SDK metrics notice. | **Explore the guides** / **Try the virtual makeup feature** |
| **2 — Skin and body guidance** | Feature one existing or newly prepared guide; link it contextually from related pages and the launch hub. Share useful excerpts, not generic promotional claims. | “A simple routine for approaching skin beauty”; “Small ways to feel more polished in your own routine” (only if content supports it); explain how to navigate the editorial guides. | **Read the guide** / **Explore more beauty guidance** |
| **3 — Style and elegance** | Spotlight dressing and style content; connect appearance guidance to personal expression. Refresh internal links and page titles/descriptions where appropriate. | “Build a polished look around what you already wear”; “A detail-led approach to elegance”; outfit/finishing-detail checklist, if supported by site content. | **Explore style guidance** / **Find your next idea** |
| **4 — Try-on discovery and learning** | Give the virtual try-on a focused, transparent demonstration; invite optional feedback without requesting images. Review first-month metrics and decide which topic or page to continue. | “How to try a look in your browser”; “What stays on your device—and what MediaPipe metrics are sent to Google”; FAQ/short screen recording using a non-personal demo asset or UI capture. | **Try it in your browser** / **Tell us what would make the experience clearer** |

**Optional paid test (only if budget is explicitly approved):** after organic posts establish a clear message and landing page, run one small, time-boxed test of a single creative/audience/channel combination. Set a capped spend and stop rule before launch; optimize to landing-page engagement or try-on starts, not sensitive-image collection. No spend is assumed or prescribed here.

## Channel roles

- **Website (core):** canonical home for editorial guidance, the try-on entry point, privacy explanation, and durable search discovery. Add contextual internal links between related content and tool pages.
- **Search/SEO (organic):** make existing useful pages discoverable with clear titles, descriptive headings, crawlable copy, and relevant internal links. Prioritize useful editorial pages over high-volume publishing.
- **Existing social channels (if any):** discovery and conversation; adapt article excerpts and short tool demonstrations. Confirm handles/platforms before scheduling; no channel is assumed to exist.
- **Existing community participation (optional):** answer relevant beauty/style questions helpfully and transparently where permitted; do not spam links or present unverified expertise.
- **Email (not assumed):** use only if an opted-in list already exists and sending is authorized. No list-building flow or email campaign is required for this plan.

## Measurement and KPIs

First verify what analytics are installed, consent settings, and whether events can be recorded without personal imagery. Compare against a pre-launch baseline; report counts/rates, not invented targets.

| KPI | Instrumentation (privacy-preserving) |
|---|---|
| Relevant site visits and engaged sessions | Aggregate page/session analytics, with consent and retention settings reviewed. Break down by page and broad referrer/source where available. |
| Editorial content engagement | Aggregate article views, scroll-depth threshold or engaged time, and internal-link clicks; avoid recording typed free text. |
| Try-on discovery | Aggregate visits to the try-on entry page and clicks on “start/try” (event name can be implementation-specific). |
| Try-on completion/utility | If technically available, count a successful local session or user-initiated completion as a coarse event; do not transmit the image, facial landmarks, feature vectors, or derived appearance attributes. Prefer no event if completion cannot be measured without sensitive data. |
| Content contribution | Track published pieces and repurposed posts against the planned cadence; note qualitative questions/feedback without retaining personal imagery. |
| Optional paid test | Spend, impressions/clicks, landing-page engaged sessions, and try-on starts; use platform aggregate reporting and a capped budget. |

Use campaign tags on links if useful, but keep tags free of personal or sensitive information. Review which content and entry points attract relevant engagement at the end of each week. Do not treat short-run traffic changes as proof of efficacy.

## Privacy and trust guardrails

- State plainly wherever the try-on is introduced: the photo and detected face landmarks are processed on the visitor’s device and are not uploaded or stored by Beauthy Swells. MediaPipe’s notice separately says its APIs send performance and utilization metrics to Google; obtain informed consent before loading the SDK/model.[1]
- Do not add site-side collection, transmission, retention, or use of face images, landmarks, embeddings, or inferred attributes for analytics, advertising, profiling, or retargeting. Do not claim that no data leaves the device or that the try-on is wholly offline.[1]
- If campaign measurement is added, use only coarse site events and aggregate reporting. Avoid session replay or tools that might capture the image, picker, canvas, or sensitive UI state. Never label MediaPipe SDK metrics as Beauthy Swells' own analytics.
- The feature uses an explicit image-picker action; compatible mobile browsers may offer camera capture. Do not imply an image is required to browse editorial content.
- Test local image processing and metric consent across supported browsers/devices; explain limitations or failures honestly. Do not send the photo or landmarks through third-party scripts.
- Provide an easy way to decline or exit the feature and a contact/feedback path if one exists. Do not solicit face photos in feedback or social replies.

## Resource needs and assumptions

**Assumptions to validate:** the existing website is accessible to edit; relevant editorial pages and tool pages are live or will be ready during the period; an owner can publish and review content; at least one existing discovery channel may be available, but none is confirmed. The plan does not assume products, commerce, prices, email subscribers, social accounts, partnerships, geography, team size, or paid budget.

**Minimum roles/time:** one content/editorial owner to select or prepare four weekly source pieces and approve claims; one site owner/developer to verify tool/privacy behavior and analytics; optional design/video support for a simple screen demonstration. If staffing is limited, use existing articles and simple text/image excerpts, reduce cadence, and keep privacy verification ahead of promotion.

## Short asset checklist

- [ ] Confirmed live URLs for editorial areas and virtual try-on.
- [ ] One-sentence positioning and approved privacy copy distinguishing on-device photo processing from the MediaPipe metrics opt-in.
- [ ] Four source content selections or briefs covering launch, skin/body, style/elegance, and tool use.
- [ ] Reusable social excerpts and simple visuals/screenshots; no identifiable person’s face without explicit authorization.
- [ ] Tool walkthrough/demo captured without exposing real user imagery or unsupported claims.
- [ ] CTA labels and destinations checked on mobile and desktop.
- [ ] Privacy-reviewed site analytics events, MediaPipe opt-in, retention settings, baseline snapshot, and campaign link tags if used.
- [ ] Named owner and weekly 20-minute review slot to adjust topics and resolve issues.

## References

[1]: https://goo.gle/mediapipe-privacy "MediaPipe Tasks Privacy Notice"
