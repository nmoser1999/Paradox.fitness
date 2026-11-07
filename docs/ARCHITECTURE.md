# Architecture and engineering decisions

## Runtime

The site uses Astro 7, strict TypeScript, Tailwind 4 through the official Vite plugin, and build-time image processing. It produces static HTML, CSS, and small JavaScript modules. No application server, React runtime, database, or paid CMS is required for the current scope.

Node 24 is the selected runtime. Dependencies are pinned in `package.json`, with transitive versions locked in `package-lock.json`. Use `npm ci` for reproducible installs. The installed versions and engine requirements are authoritative; do not downgrade Node to the older global Node 20 installation.

## Source boundaries

The `coach` export in `src/data/site.ts` holds the provided public name, **Nicho Moser**, and short form, **Nicho**. Page introductions, portrait descriptions, and search/social metadata use the full name; navigation, form labels, and follow-up copy use the short form. Runtime messages and FAQ copy read the same values.

```text
src/data/site.ts         business facts, offers, contact details, FAQs
src/pages/               page-specific content and routes
src/components/          header, footer, CTA, shared SVG icons, FAQ, inquiry form, consent panel
src/layouts/Base.astro   metadata, schema, shared layout and consent initialization
src/styles/global.css   shared styling, default panorama composition, responsive styles
src/styles/appearance.css  eight independent palettes and homepage compositions
src/lib/design.ts       typed design catalog and preference validation
src/lib/appearance.ts   independent selectors, persistence, and shareable URLs
src/lib/inquiry.ts      inquiry normalization and usability validation
src/lib/contact.ts      progressive enhancement of native form submission
src/lib/metrics-policy.ts  analytics allowlists and URL/campaign sanitization
src/lib/analytics.ts    consent-aware events and bounded CTA attribution
src/lib/consent.ts      provider loading and preference controls
scripts/                post-build headers/review packaging and output checks
tests/                  validation and privacy boundary tests
public/                 favicon and legacy-route redirects
```

The real app renders design selectors in the shared layout on every page. Palettes alter color tokens across the site; layouts alter homepage composition plus shared display type and framing. Browser-local preferences preserve both choices across navigation, and validated query parameters override them for shared links. A small hashed head script applies appearance before first paint. The default remains Grove/panorama. No analytics consent is needed for functional appearance preferences. `ColorModeToggle.astro`, `src/lib/color-mode.ts`, and `src/styles/color-mode.css` add an independent browser-aware light/dark mode. Its toggle sits to the left of the desktop CTA and is hidden at widths of 800px and below. A separate local-storage override persists manual choices and synchronizes tabs; the footer reset restores the live browser preference. The head bootstrap applies the resolved mode before paint, while CSS media queries provide a no-JavaScript fallback.

The entire design header is hidden at viewport widths of 800px and below. On larger screens, **Hide header** dismisses the entire bar for the current page and moves keyboard focus to the main content without scrolling. Refreshing restores it. Visibility is not stored, and dismissal does not change the selected palette/layout or URL. Without JavaScript, the desktop header remains visible and its dismiss button remains disabled.

`SelectControl.astro` shares the dropdown wrapper and decorative SVG chevron between design controls and inquiry fields. Native selects retain their labels, names, options, keyboard behavior, and focus indicators. The chevron inherits the text color and ignores pointer events; reserved end padding keeps labels clear of it. Form arrows sit 16px inside the control, while desktop design controls use 12px. Forced-colors mode restores the system arrow.

The original concept explorer is retained in the root files as an archive. `ENABLE_DESIGN_REVIEW=true` packages that archive under `/design/`; it does not control the real app’s selectors.

`ArrowIcon.astro` is the shared decorative SVG for CTA arrows. Internal actions use a right arrow; external destinations use an upward diagonal arrow. Icons inherit the current palette and stay fixed on hover and keyboard focus. Button color and focus outlines provide interaction feedback. Icons are hidden from assistive technology. Form label updates preserve the icon instead of replacing the button markup.

`InstagramIcon.astro` supplies the footer's decorative camera glyph as a local inline SVG. It inherits the palette, stays fixed on hover, and adds no external requests or dependencies. The visible Instagram label and new-tab announcement supply the link's accessible name.

`DirectionsLink.astro` renders every Google Maps link in the app: the shared footer, contact panel, and in-person studio panel. It uses the full-color Maps pin from [Google's official Maps page](https://www.google.com/maps/about/), served locally as `public/icons/google-maps.webp`. The label and fixed-size icon share a centered flex row with a consistent gap and no hover motion. The accessible link name identifies Google Maps and the new tab; the image is decorative. Asset source: `https://www.gstatic.com/marketing-cms/assets/images/1b/21/a9543d8e4eb694200ddba538d536/googlemaps-pin.webp=n-w64-h73-fcrop64=1,0000110cffffeef4-rw`.

## Conversion flow

```text
In-person CTA → /contact-us-1/?service=in-person
             → native HTML form, optionally enhanced with TypeScript
             → Netlify Forms accepts/stores inquiry
             → /thanks/ and a separate owner email notification

Online CTA → existing Trainerize checkout URL
           → subscription managed by Trainerize
```

The real form exists in build output for Netlify detection. JavaScript adds service preselection, callback requirements, pending state, error focus, retry preservation, and successful-response tracking. The form still submits natively when JavaScript is unavailable. Local preview refuses to present submissions as stored leads; live delivery must be verified on Netlify.

`parseInquiry` validates normal browser usage. It is **client-side code**, not server security. Netlify owns the submission intake and spam filtering. If future requirements demand hard server-side schemas, custom rate limits, sensitive information, attachments, or guaranteed acknowledgement, introduce a server endpoint with explicit validation, persistence, and delivery monitoring. Never put an email provider secret in client code.

## Privacy and script loading

No provider code loads until explicit stored consent and a valid configured provider ID exist. Unknown analytics event names, properties, and free-form values are discarded. Page telemetry omits query strings/fragments and collapses unknown paths to a fixed 404 label. Only approved UTM values are forwarded. Inquiry contents never enter custom analytics events.

The consent choice is stored in `localStorage` under `paradox-analytics-v1`. Consented CTA attribution uses an allowlisted placement value in `sessionStorage`; no form contents are stored there. On withdrawal, known analytics cookies are cleared and the document reloads to unload the provider code. If storage is blocked, analytics stay disabled.

Clarity is optional. It is not initialized on form, confirmation, privacy, or future `/app` routes, or initial URLs with queries/fragments. The page body is marked for text masking. Enable strict masking in the provider account as well. Future private UI must not reuse the marketing analytics layout.

## Build/deployment safety

- Indexing is off by default, including an `X-Robots-Tag` header and robots rule. Production launch requires an explicit environment change and rebuild.
- The post-build script hashes inline scripts/styles and generates the Content Security Policy. There is no blanket inline-script permission.
- Generated-output checks verify each inline script/style hash against its own CSP directive and reject inline event/style attributes. The browser feature policy permits no camera, microphone, or geolocation access and avoids experimental feature declarations.
- Netlify's injected public badge must be disabled in project settings because its iframe uses inline code outside the build's hash policy. See [security header troubleshooting](SECURITY_HEADERS.md).
- Hashed Astro assets receive immutable caching; document HTML is not given a year-long immutable policy.
- No SPA catch-all sends unknown URLs to the homepage. Netlify serves the genuine generated 404 page.
- Existing `/contact-us-1/`, `/in-person/`, and `/online-group-membership/` paths are retained. The old referral path redirects to `/referrals/`.
- Environment values are build-time configuration. Changing a Netlify value requires a new deploy.
- CI validates both normal and design-review build modes. GitHub and Netlify account operations remain the owner’s responsibility.

## Adding features later

For a member portal, introduce an identity provider and protected server-side endpoints or a separately deployed app. Validate sessions and ownership for every private read/write. A hidden component or a noindex static route is not an auth wall; private data must never be embedded in public build output.

For an LLM chatbot, keep the model key on the server, lazily load the UI, verify sessions where required, enforce quotas/timeouts/spending limits, and use approved business information. Give users a route to Nicho Moser. Define conversation retention and access before storing anything. Auth, storage, and model inference need their own operating budget; free marketing hosting does not imply free model usage.

Prefer small additions with a clear boundary over installing a general application stack before it is needed. Reassess the static architecture when actual feature requirements warrant it.
