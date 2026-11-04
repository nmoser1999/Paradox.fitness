# Paradox Fitness website rebuild proposal

Prepared November 4, 2026 · Original proposal and design rationale

Implementation update: the production source now uses the selected **Grove palette + centered panorama layout**. Start with [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md) for the current implementation and launch procedure. The site is built locally; it has not been deployed to Netlify or connected to the domain/email accounts.

## Recommendation

Build a fast, static marketing website with **Astro, TypeScript, Tailwind CSS, and Netlify**, keeping the custom domain at Namecheap. Use **Netlify Forms** for inquiries emailed to **Nichomoser@pdoxfitness.com**, **Google Analytics 4** for conversion funnels, and optional **Microsoft Clarity** for consented heatmaps and recordings.

Astro is the recommended adjustment to the proposed Vite/TypeScript stack: it suits a content and conversion focused website, produces HTML ahead of time, and allows interactive components where needed. A plain Vite + TypeScript implementation is also viable. A React single-page app adds unnecessary work for this initial site. Astro supports adding React components later through its islands architecture. [Astro overview](https://docs.astro.build/en/concepts/why-astro/), [islands architecture](https://docs.astro.build/en/concepts/islands/).

The design should communicate **capable, approachable coaching for lasting strength and mobility**. Put Nicho Moser and the next step on the first screen. Lead with the in-person trial and retain a clearly visible online membership path.

Two constraints need explicit treatment:

- **Free hosting is a usage allowance.** Netlify Free can serve this site at $0, but exceeding its allowance can pause the website and its forms.
- **100 in every Lighthouse category is the target, not an unconditional promise across all devices and future third-party scripts.** Define repeatable acceptance tests and report results with the actual production integrations enabled.

Companion file: [design-directions.html](design-directions.html) is a local design comparison with **eight color palettes and eight independent layouts**, including the original three directions and five additions. It now uses the supplied photo stand-in from `assets/unnamed.jpg`. The color and layout selectors can be mixed freely; “Suggested pairing” chooses the intended layout for a palette. It is a concept preview, not the rebuilt site or a working signup form.

## 1. Current-site findings

Reviewed the homepage, in-person service page, online membership page, contact page, and the destinations of the main offers. Visually inspected the homepage and contact form in a browser. No current Lighthouse scores, analytics baseline, form delivery, or completed checkout were measured.

| Observation | Proposed improvement |
| --- | --- |
| Homepage opens with an animated abstract background and two service links; Nicho Moser and the training proposition are absent from the initial view. | A static portrait, clear outcome, Fremont location, primary trial button, and a visible online alternative. |
| The in-person offer sits behind the service link. It currently advertises a complimentary training week, with up to three sessions. | Surface the offer in the header, hero, service section, and final CTA. Confirm its eligibility and terms before publication. |
| Contact requires separate first/last names, email, phone, and a message. | One name field, email, service interest, optional phone, and optional message; require phone only when a callback is selected. |
| The online offer links to Trainerize with a seven-day trial and currently advertises $60/month afterward. | Keep the existing checkout destination and promotion parameters; label the online path consistently and state its terms clearly. |
| Embedded maps and moving backgrounds add loading work. | Use a normal directions link, intentional static imagery, and restrained motion. |

Sources: [homepage](https://www.pdoxfitness.com/), [in-person training and trial](https://www.pdoxfitness.com/in-person), [online membership and checkout link](https://www.pdoxfitness.com/online-group-membership), [contact page](https://www.pdoxfitness.com/contact-us-1).

Do not invent testimonials, certifications, results, response times, or availability. Use the provided public name, **Nicho Moser**, and confirm all offers with the owner.

## 2. Visual directions

The original three directions below use the same content, offers, forms, and navigation, so the owner can compare the design fairly. Five additions follow them. Masculinity comes through structure, typography, material colors, and confident photography. Avoid bodybuilding imagery, distressed textures, aggressive slogans, and neon accents.

| | A — Fieldwork, recommended | B — Precision | C — Foundation |
| --- | --- | --- | --- |
| Impression | Grounded, welcoming, quietly strong | Crisp, focused, contemporary | Warm, established, personal |
| Background | Warm ivory `#F4F1E9` | Deep navy `#101C2B` | Pale stone `#F4EEE5` |
| Text | Forest charcoal `#192C27` | Off-white `#F3F6F8` | Espresso `#322821` |
| Primary button | Forest `#254D3D`, white text | Ice blue `#B7D7EE`, navy text | Clay `#81462F`, white text |
| Secondary accent | Muted sage | Steel blue | Sand and bronze |
| Typography | Strong sans-serif; generous line spacing | Tight sans-serif display; precise labels | Restrained editorial serif headings; sans-serif body |
| Composition | Open split hero; natural portrait crop | Structured grid; architectural portrait frame | Editorial split hero; softer frame and dividers |
| Photography | Daylight, real training environment | Clean background, confident posture | Candid coaching, natural light |

**Why Fieldwork:** it best matches healthy, functional strength and feels accessible to people who are new to personal training. Precision is the strongest contemporary option; Foundation emphasizes a personal coaching relationship. These are design recommendations, not tested conversion results.

### Five additional directions

The original three palettes and compositions remain available. The following additions expand the local design explorer; every palette can be combined with every layout.

| Direction | Palette | Suggested layout |
| --- | --- | --- |
| Studio | Paper `#F7F8FB`, cobalt `#244EB2`, deep ink | Portrait first: photo left, bold copy right |
| Mineral | Graphite `#222927`, mineral green `#C5DBC6` | Immersive photo: wide photo hero with an overlaid introduction |
| Tide | Coastal blue `#EAF2F3`, deep teal `#185A66` | Centered panorama: centered headline, wide coach panel below |
| Cadence | Burgundy `#35252D`, apricot `#EDBD97` | Editorial offset: large serif type, tall offset portrait |
| Grove | Chalk `#EEF0E2`, olive `#45592E` | Circular portrait: wide headline and a circular coach profile |

### Owner comparison controls

The local explorer has separate, keyboard-accessible **Color palette** and **Layout** selectors at the top. `data-theme` controls colors; `data-layout` controls typography, framing, and composition. The eight options in each selector provide 64 combinations using the same content and photo. URLs retain both choices, for example `?theme=tide&layout=reverse`. Original theme-only links still select their original matching layout. During implementation, keep this tool on a **noindex review route** and preserve the selection across review pages.

Use the same Nicho Moser photo and copy in each direction. Check all states for contrast, focus visibility, and mobile layout. After selection, ship the chosen palette and layout publicly; retain the comparison only in the review environment. This comparison is for owner review, not an A/B test.

### Nicho Moser’s photo brief

Request a high-resolution original, ideally at least 1,600 pixels on its long edge, with permission to publish it. Favor approachable eye contact, simple training clothes, soft daylight, and room around the face for desktop/mobile crops. Prepare responsive AVIF/WebP versions, preserve natural skin tones, and use meaningful alt text. Never publish the placeholder as Nicho Moser’s actual portrait.

## 3. Content and CTA structure

Proposed hero copy, subject to owner review:

> Strength for the life you want to live.
>
> Personal training in Fremont and online coaching, built around strength, mobility, and consistency.

Primary CTA: **Start your free training week** → `/contact-us-1/?service=in-person`.

Secondary CTA: **Explore online coaching** → `/online-group-membership/` → existing Trainerize trial checkout.

Use “Request my training week” on the inquiry form. The thank-you message must explain that Nicho Moser will arrange the next step: submitting an inquiry does not reserve a session. Keep trial limits visible beside the offer. Only publish a response-time commitment if Nicho Moser agrees to it.

### Homepage progression

1. **Header:** logo/name, Training, Online, Meet Nicho Moser, FAQ, and a high-contrast trial button.
2. **Hero:** outcome, location, Nicho Moser’s photo, primary CTA, online alternative.
3. **Approach:** three specific benefits—strength, movement, consistency—with concise explanations.
4. **Meet Nicho Moser:** approved bio, coaching philosophy, and verified credentials.
5. **Choose your training:** in-person and online options, what is included, current pricing/commitments where approved, and distinct CTAs.
6. **What happens next:** send an inquiry, talk with Nicho Moser, arrange the first session. Describe actual operations.
7. **Client evidence:** genuine, permissioned testimonials if available; otherwise omit this section.
8. **FAQ:** experience level, location, scheduling, trial terms, online requirements, pricing, and cancellation questions using approved answers.
9. **Final CTA and footer:** inquiry link, phone/email, address, hours, directions, and privacy settings.

On mobile, use a compact persistent trial button where helpful. Reserve space so it never covers text, form errors, or the keyboard. Use one dominant CTA per section and visible hover/focus/pressed states.

### Route plan

| Route | Purpose |
| --- | --- |
| `/` | Main introduction and conversion path |
| `/in-person/` | Local service, expectations, offer terms, inquiry CTA |
| `/online-group-membership/` | Online value, terms, existing Trainerize checkout |
| `/contact-us-1/` | Accessible inquiry form; preserve the existing inbound URL |
| `/thanks/` | Submission confirmation, next steps; noindex |
| `/privacy/` | Lead handling, analytics providers, choices, retention |
| `/new-page-1/` | Preserve the referral page or redirect to a relevant replacement after owner review |
| `/404.html` | Useful navigation back to services/contact |

Inventory the sitemap and all linked URLs before implementation. Normalize trailing slashes and add specific 301 redirects for any changed routes. Do not send every old URL to the homepage.

## 4. Signup and email delivery

### Launch choice: Netlify Forms

Build the form into the generated HTML with `method="POST"`, `data-netlify="true"`, a stable form name, and `action="/thanks/"`. Enable form detection and verify that Netlify registers it after deployment. Native POST must work without JavaScript; optional TypeScript enhancement can show pending/error states. [Netlify form setup](https://docs.netlify.com/manage/forms/setup/).

**Fields:** name and email required; service interest with an “Unsure” option; phone and message optional. Require a phone number if the person explicitly requests a callback. Keep detailed health history out of this initial inquiry. Use a honeypot and Netlify spam handling; add a challenge only if observed abuse warrants the extra friction.

```text
Visitor → form POST → Netlify acceptance/storage → confirmation page
                              └→ email notification → Nicho Moser’s inbox
```

**Critical account detail:** Netlify currently requires email notification recipients to be active team members. Establish the business-owned Netlify account with **Nichomoser@pdoxfitness.com as its owner email**, verify it, and use that account for the site. This fits the single-owner free setup. Do not assume an arbitrary external address can receive native notifications. Set the input name to `email` so replies address the prospect; use a recognizable notification subject. [Notification requirements](https://docs.netlify.com/manage/forms/notifications/).

If that ownership arrangement is unsuitable, use a server-side inquiry endpoint with a transactional email provider, or a verified submission webhook and email integration. Price and test that alternative before committing to it; browser code must never contain an email API key.

### Reliability and acceptance

- Show success only after the server accepts the submission. Email arrival is a separate delivery step.
- Preserve entries on failure and allow retry; keep email and phone links as alternative contact options.
- Verify the stored lead, inbox delivery, spam folder behavior, and reply-to address using controlled test submissions during implementation.
- Check native POST, JavaScript-enhanced submission, invalid fields, offline failure, double-clicks, and mobile keyboards.
- Netlify’s submissions dashboard is the operational record. Agree a routine for checking it and spam, exporting leads, and deleting old data. Do not treat analytics counts as the lead database.

An automatic acknowledgement to the prospect is optional and requires a separately tested workflow. Native owner notifications do not imply an acknowledgement is sent. Launch does not replace Trainerize membership billing or Square invoicing.

## 5. Behavior measurement

Launch with **GA4 Standard** for sources, CTA clicks, and funnels. It is available without a software subscription. Implement a small, typed event wrapper so the provider can change later. Start without a tag manager unless there is a concrete need for one. [Google Analytics](https://marketingplatform.google.com/about/analytics/).

Add **Microsoft Clarity** if the owner wants heatmaps, scroll behavior, and recordings. It is free, but introduces another third-party script and data processor. Measure its performance impact before enabling it. [Clarity pricing](https://clarity.microsoft.com/pricing).

| Event | Trigger | Safe parameters |
| --- | --- | --- |
| `cta_click` | Trial/service CTA activated | `cta_id`, `placement`, `service` |
| `form_start` | First interaction with inquiry form | `form_id`, `service` |
| `form_error` | Validation or submission failure | `form_id`, fixed `error_code` |
| `generate_lead` | Successful form acceptance confirmed | `form_id`, `service`, `placement` |
| `online_checkout_click` | Existing Trainerize link activated | `placement`, `offer_id` |
| `contact_click` | Telephone/email link activated | `channel`, `placement` |

Mark `generate_lead` as the GA4 lead key event. With JavaScript enhancement enabled, send it once after a successful submission response, before navigating to confirmation. Avoid duplicate automatic/manual form events; never count arbitrary visits or reloads of `/thanks/` as new leads. Native submissions without analytics instrumentation remain visible in Netlify’s dashboard, which is authoritative for all accepted submissions. Do not delay or block the user’s confirmation if an analytics request fails. [GA4 event reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events).

**Two separate funnels:**

- In-person: landing/service visit → trial CTA → form start → accepted inquiry → Nicho Moser’s manually recorded consultation/client outcome.
- Online: online service visit → Trainerize checkout click → completed trial/subscription only if a supported Trainerize integration or owner report can verify it. Cross-domain measurement requires cooperation from that platform; a click is not a sale.

Create a GA4 funnel exploration broken down by device, source/medium, landing page, and CTA placement. Define lead rate as unique measured sessions with an accepted inquiry divided by eligible measured sessions, and form completion as successful form sessions divided by form-start sessions. Keep the date range and consent coverage consistent. Use actual counts alongside rates when volume is low. [Funnel explorations](https://support.google.com/analytics/answer/9327974).

**Privacy and measurement limits:** use an explicit analytics choice, load optional tags only after opt-in, and allow withdrawal. Forms must work regardless of that choice. Mask form content in Clarity; exclude future authenticated/member pages from recordings. Send no names, email addresses, phone numbers, messages, health details, or raw form values to analytics. Sanitize page URLs, query strings, and campaign values before telemetry; use allowlisted event properties. Disable advertising signals/personalization at launch. Google prohibits sending PII to Analytics. [Google’s PII guidance](https://support.google.com/analytics/answer/6366371), [Clarity consent API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2).

Consent choices, blockers, and platform boundaries mean analytics will observe a subset of activity. Reconcile trends with accepted leads and Trainerize reports. Establish a baseline, then change one major CTA variable at a time; do not promise a conversion lift without evidence.

## 6. Lighthouse, accessibility, and SEO

### Acceptance definition

Keep **100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO** as the target for every primary indexable page on mobile and desktop. Add Accessibility explicitly to the three categories named in the brief.

Pin the Lighthouse/Chrome versions, viewport, throttling, audit configuration, and deployed build. Collect five cold-load runs per page/profile and report each run plus the median. Review candidate palette/layout combinations before selection; certify the final chosen combination on the production domain. Run the real consent-denied and consent-granted paths, including enabled analytics/Clarity. A baseline without third parties is useful diagnostically, but cannot stand in for the integrated result.

If a category misses 100, document the cause and resolve it or obtain an explicit acceptance change. Do not quietly lower the target or suppress production features for the audit. Scores fluctuate with underlying conditions even when source code is unchanged. [Chrome’s scoring explanation](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring), [Lighthouse variability](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md).

`/thanks/`, review previews, and future private pages should intentionally be noindex. An indexing audit on those utility pages is not the public-page SEO acceptance test. Noindex is also not an access-control mechanism. An automated score does not guarantee search ranking or complete accessibility.

### Initial engineering budgets

These are implementation targets to validate, not measured current results:

| Resource / outcome | Target |
| --- | --- |
| First-party JavaScript | ≤20 KB compressed on marketing pages, excluding separately reported vendor tags |
| CSS | ≤30 KB compressed |
| Initial page transfer | Aim ≤500 KB before optional analytics |
| Hero portrait | Responsive source; aim ≤150 KB for mobile variant |
| Fonts | System fonts or one self-hosted subset with few weights |
| Field experience | LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile, per device class |

The field thresholds are Google’s “good” Core Web Vitals boundaries, not a formula for a Lighthouse score of 100. Field data may be unavailable initially on a low-traffic site. [Web Vitals](https://web.dev/articles/vitals).

Implementation priorities: static HTML, responsive image sizes, explicit image dimensions, eager/prioritized hero image, lazy loading below the fold, minimal scripts, hashed asset caching, and no autoplay background video or initial map/video/social embeds. Keep HTML revalidation and asset caching separate. Test any analytics loading strategy for lost early events and responsiveness.

Use semantic headings and landmarks, descriptive links, visible labels/errors, keyboard navigation, a skip link, reduced-motion support, sufficient contrast, and practical touch targets. Manually test keyboard and screen-reader form completion; run automated accessibility checks as a supplement.

For SEO, write unique titles/descriptions, one clear H1 per page, canonical URLs, Open Graph metadata, robots rules, sitemap, and accurate structured data appropriate to the business. Keep name/address/phone consistent with verified business listings. Confirm service location and hours, retain useful existing URLs, validate redirects, submit the sitemap in Search Console, and inspect indexing after launch. Do not add fabricated reviews or unsupported health claims.

## 7. Architecture and future features

```text
Namecheap domain / external DNS
             ↓
Netlify CDN → static Astro pages + optimized assets
             ├→ Netlify Forms → owner notification
             ├→ consented GA4 / optional Clarity
             └→ existing Trainerize checkout

Later: /app or app subdomain → authenticated UI
       server-side API/functions → identity checks + data + LLM provider
```

Suggested source layout:

```text
src/pages/                 public routes
src/components/            header, hero, services, form, FAQ
src/content/               approved service copy and FAQs
src/styles/                shared tokens and selected theme
src/lib/analytics.ts        typed, allowlisted events
public/                    icons, robots, redirects, headers
netlify/functions/         future server-only endpoints
netlify.toml               build and hosting configuration
```

Use a lockfile, supported Node LTS, strict TypeScript checks, and a production build in CI. Build with `npm run build`, publish `dist`, and use review deploys for changes. Keep service URLs, offers, contact details, and content separate from layout so editing them is straightforward. A CMS is optional later if Nicho Moser needs frequent self-service editing; source-managed content is the simpler launch choice.

**Future auth:** choose a maintained identity provider when requirements are known. Validate sessions and authorization on every protected server endpoint. Hiding components or gating a static page in JavaScript does not protect data; never ship private content in public HTML/JS bundles. Introduce server rendering or a separate app only where required.

**Future chatbot:** lazy-load the UI when opened; send requests through a server-side endpoint; keep provider keys in server environment variables. Verify sessions, enforce per-user limits and a monthly spending cap, and ground answers in approved business information. Give users a clear path to Nicho Moser. Keep conversations outside marketing analytics and define retention before storing them. Auth/database/LLM usage may introduce ongoing costs and requires a separate scope. The initial rebuild does not implement a member portal or chatbot.

Set HTTPS, appropriate security headers, and a Content Security Policy compatible with the chosen integrations. Test the form and consent controls with those headers enabled. Do not blanket-rewrite missing paths to the homepage as an SPA fallback.

## 8. Costs and the limits of free hosting

| Item | Launch operating cost | Notes |
| --- | --- | --- |
| Netlify Free | $0 within allowance | Custom domain and SSL supported; 300 monthly credits on current credit-based Free. |
| Netlify Forms | No form-submission charge on current credit-based plans | Account/traffic limits still matter. |
| Namecheap domain | Actual annual registration/renewal quote | User supplies domain; renewal price depends on TLD and account. |
| Existing business mailbox | Existing provider’s fee, if any | Website hosting does not supply or replace mailbox hosting. |
| GA4 Standard | $0 software subscription | Implementation/maintenance effort remains. |
| Optional Clarity | $0 software subscription | Consent and performance verification required. |
| Future auth / data / LLM | Separate usage-dependent budget | Not included in the $0 marketing-site assumption. |

Sources: [Netlify Free features](https://www.netlify.com/pricing/), [April 2026 forms pricing change](https://www.netlify.com/changelog/2026-04-14-pricing-updates-april-2026/), [Google Analytics](https://marketingplatform.google.com/about/analytics/), [Clarity](https://clarity.microsoft.com/pricing).

Current credit rates include 15 per production deployment, 20 per GB transferred, and 2 per 10,000 web requests. **Illustrative estimate:** four production deployments + 3 GB delivery + 50,000 requests = 60 + 60 + 10 = **130 credits/month**, excluding other metered services. This is a sizing example, not a traffic forecast. Preview builds do not have the production deployment charge, but preview traffic still consumes delivery resources. Confirm the actual account’s plan; legacy accounts can differ. [Credit usage documentation](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/).

Free-plan exhaustion can pause the site **and stop form submissions** until the allowance resets or the plan is upgraded. Use an owner-controlled account for this business, review usage alerts, do frequent iteration locally/on previews, and reserve production deploys for releases. Reassess if usage approaches the cap. A fallback host would also need a replacement for Netlify Forms. [Paused-project behavior](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/).

Removing the reported $20/month Squarespace website subscription saves **$240/year in website subscription fees**, before domain/email differences, implementation, and maintenance. A custom rebuild trades a bundled editor/support product for code ownership and ongoing developer responsibility.

## 9. Domain migration and launch

Prefer retaining **www.pdoxfitness.com** as the primary public address if the supplied Namecheap domain is the same domain. A registrar transfer is separate from changing hosting. If a different domain is supplied, treat it as a domain migration: retain the old domain and redirects, update canonical URLs and business profiles, and use the relevant Search Console migration workflow.

1. Export/copy approved Squarespace content, original images, route inventory, current DNS records, and any needed form history. Record a rollback path.
2. Create the business-owned source repository and Netlify project. Confirm account ownership, plan, recipient email, form registration, and usage notifications.
3. Build and review on a preview URL. Prevent preview indexing; use access protection where available rather than relying on noindex for confidentiality.
4. Complete form, checkout-link, consent, accessibility, mobile, and Lighthouse acceptance checks before DNS cutover.
5. Add the custom domain to Netlify. At Namecheap, change only the website records using the values Netlify currently supplies: typically `www` CNAME and an appropriate apex ALIAS/A configuration. Keep external DNS if that avoids unnecessary changes. [Netlify external DNS setup](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).
6. Preserve and verify MX, SPF, DKIM, DMARC, verification TXT records, and existing mail-related hosts. Identify who bills for **Nichomoser@pdoxfitness.com** before canceling anything. Test incoming and outgoing mailbox mail independently of form notifications.
7. Verify TLS, HTTP→HTTPS, apex→primary-host redirects, canonical URLs, all retained routes, and the form on the real domain. Test Trainerize checkout navigation without making an unintended purchase.
8. Confirm inbox delivery and stored test leads, deploy rollback, analytics events, and live Lighthouse results. Configure Search Console and submit the sitemap.
9. Cancel only the Squarespace **website subscription** after the new site and email are verified and the rollback window is agreed. Preserve domain/email subscriptions that are still needed.

## 10. Implementation sequence and owner inputs

| Phase | Deliverable | Completion gate |
| --- | --- | --- |
| 1. Confirm scope and copy | URL inventory, approved offers, portrait/bio, measurement plan | Owner validates business facts and primary CTA |
| 2. Compare designs | Responsive shared content with independent palette/layout controls | Owner selects combination; keyboard/contrast review passes |
| 3. Build conversion flows | Final static pages, form, confirmation, existing checkout links | Stored inquiry and inbox/reply-to tests pass |
| 4. Verify | Consent, event dashboard, redirects, accessibility, Lighthouse reports | Acceptance evidence covers actual production integrations |
| 5. Launch and handoff | Domain cutover, rollback notes, editing and lead-handling guide | Site/mail/analytics work on custom domain; owner has accounts |

Planning estimate: **6–10 working days of implementation and review**, depending on content readiness and feedback; not a fixed delivery or price commitment. Domain propagation and owner response time can extend calendar duration. Review conversion data after enough traffic accumulates, rather than assuming a short calendar window supplies a useful sample.

Needed before implementation/launch:

- Nicho Moser’s portrait, approved name/bio/credentials, logo assets, and permissioned testimonials if used.
- Confirmation of the in-person trial limits, online trial/price, current Trainerize checkout URL, and referral-page treatment.
- Namecheap domain and DNS access through the provider’s normal access flow; existing mailbox provider and ownership details. Keep credentials out of project files and chat documents.
- Confirmation that Nicho Moser can own Netlify using the required inbox, plus business-owned repository and analytics access.
- Agreement on follow-up expectations, lead retention, analytics choices, design selection, and acceptance results.

### Launch acceptance checklist

- [ ] Owner-selected design, responsive pages, final Nicho Moser photo, approved content, and obvious CTAs.
- [ ] Existing inquiry and Trainerize paths preserved; old URLs work or redirect specifically.
- [ ] Form works without JavaScript; success, validation, failure, retry, spam, delivery, and reply-to verified.
- [ ] Analytics counts accepted inquiries correctly; checkout clicks are reported separately; no PII in telemetry.
- [ ] Consent refusal/withdrawal works; optional recordings exclude form content and private areas.
- [ ] Mobile and desktop Lighthouse reports target all four 100s under documented conditions; any deviation remains explicit.
- [ ] Manual accessibility and real-device checks completed; preview/utility indexing rules intentional.
- [ ] Custom domain, HTTPS, business email, redirects, Search Console, usage alerts, rollback, and account handoff verified.

The companion concept was served successfully over local HTTP and checked in a browser: all three theme selections, keyboard-arrow selection, query-selected themes, and visual layouts at 320px and 390px widths. These are concept checks; production Lighthouse, form delivery, analytics, and checkout verification belong to implementation.

The next implementation step is to choose a visual direction and confirm the offers and account ownership, then build the approved pages and conversion flows. No DNS, subscriptions, accounts, forms, or production website were changed while preparing this proposal.
