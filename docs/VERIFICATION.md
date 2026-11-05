# Verification and launch gates

## Automated checks in this repository

`npm run verify` performs:

1. Astro/strict TypeScript diagnostics.
2. Unit tests covering optional contact fields, callback requirements, malformed inputs, honeypot handling, analytics allowlists, removal of identifying URL components, and approved campaign attribution.
3. Static production build and image optimization.
4. Generated HTML checks: one H1, unique titles, description/canonical metadata, local links/assets, a detectable Netlify form, noindex confirmation, CSP hash coverage, the minimal browser feature policy, and bundle size budgets. CSP checks also cover the archived explorer when included and reject inline style/event attributes.

`npm run format:check` checks source/document formatting. The GitHub workflow runs both ordinary and design-review builds. Dependency installation reported zero known vulnerabilities at implementation time; this is not a promise about future package advisories.

The passing build has **about 4.5 KB gzipped JavaScript and 7.4 KB gzipped CSS across all first-party bundles combined**, with optimized portrait assets. Small code size is useful evidence, not a Lighthouse score. Refer to the final command output for the latest bundle totals.

## Browser review

Review the built site, not only the dev server. Check:

- Homepage, in-person/online services, contact, privacy, referrals, confirmation, and 404.
- Desktop and narrow mobile layouts, images/crops, long email wrapping, FAQ expansion, navigation, and the mobile CTA.
- Form service preselection, callback phone requirement, native validation, duplicate-click prevention, recoverable errors, and preserved entries.
- Consent settings, decline/accept/withdrawal, and absence of vendor scripts when IDs are empty or consent is declined.
- Current Trainerize URL, promotional parameters, and separation of checkout clicks from lead events.

The original explorer’s 64 color/layout combinations passed desktop selector/image/overflow checks before implementation. The production site defaults to Grove/panorama; new production browser results should be recorded separately from those concept checks.

Implementation review on November 4, 2026: all eight built pages had a single H1, no horizontal overflow at 1280px, and no vendor tags with provider IDs unset. Visual checks covered the homepage, inquiry, and online pages at 320px/390px. The hero CTA preselected in-person service; callback selection made the phone field required; a local submission displayed the recoverable error, retained the entered name/email, and re-enabled retry. Analytics settings opened with a disabled-provider explanation. Both indexable public and noindex design-review build modes passed their generated-output checks. Live delivery, provider-account behavior, Netlify headers, and Lighthouse remain the launch gates below.

The real app now includes independent selectors on every page. All 64 live homepage combinations passed selector consistency, image-loading, and 1280px overflow checks. Browser review confirmed that Precision/reversed-layout preferences persisted into the inquiry page and through reload, while in-person service preselection still worked. Mobile visual review included live selectors, Studio/reversed and Mineral/immersive homepages, and a Precision/arched contact page at 320px/390px. Five additional unit tests cover independent selection, share-link overrides, and invalid stored/query values.

Shared-dropdown review on November 4, 2026: all four app dropdowns use `SelectControl.astro`. Browser measurements confirmed centered chevrons, a 16px form inset with 44px end padding, and a 12px desktop design-control inset with 40px end padding. All eight palettes preserved form arrow/text color matching and had no desktop overflow. Visual review at 320px and 390px confirmed clear arrow spacing in both form and design controls. In-person query preselection and the callback phone requirement still worked. The high-contrast fallback is implemented with `forced-colors`; it was not tested on a Windows high-contrast browser.

Maps-link review on November 4, 2026: all ten Google Maps links across the eight built pages used `DirectionsLink.astro`, including both service/contact panels and the footer. Browser measurements confirmed a 10px horizontal gap, a 32px square icon box, and equal vertical centers for the label and icon in every instance. The contact panel was also checked visually with the local Maps asset loaded.

Design-header dismissal review on November 4, 2026: the desktop **Hide header** button removed the entire bar, reduced its rendered height to zero, removed its controls from the accessibility tree, and placed keyboard focus on the main content. Enter-key activation worked. Refreshing restored the header while preserving a non-default Tide/Soft arch selection. Visual and accessibility-tree review at 320px and 390px confirmed the entire design header and dismiss button were absent. Visibility is not persisted; the mobile CSS cutoff is 800px. Documentation reflects this behavior.

Copy and design review on November 4, 2026:

- Rewrote the homepage, service introductions, inquiry page, referral copy, and shared calls to action around specific coaching services. Trial requests now say “Request your free week”; online checkout buttons consistently name the seven-day trial. Prices and offer limits are unchanged. The previously removed homepage hero fine print remains removed.
- Increased supporting text sizes, set form controls to 16px, aligned service-card pricing and actions, introduced a two-column desktop FAQ, and added online membership FAQs. The compact mobile header keeps the menu accessible without squeezing a trial button beside the brand. Escape returns focus to the menu; selecting a link closes it. Active service links have a visible underline and `aria-current`.
- All eight built pages had one H1 and no horizontal overflow at 320px and 1280px. All 64 homepage color/layout combinations had no overflow and a visible photo container at both 1280px and 320px; the design controls remained hidden on mobile. Another 56 checks covered all eight layouts at widths of 700, 760, 800, 801, 1050, 1100, and 1101px, with no overflow. Visual checks included the default desktop homepage, service cards, FAQ, in-person page, and contact page; mobile homepage/contact/online pages at 320px or 390px; and Mineral/immersive on desktop.
- Across the eight palettes, measured body, muted, panel, offer-label, and primary-button text pairs exceeded 4.5:1. Form border contrast against its surface exceeded 3:1 (lowest 3.06:1). This checks the named solid-color pairs, not every image-overlay pixel or every accessibility requirement. The immersive overlay was also checked visually.
- Confirmed in-person query preselection, the callback phone requirement, the local recoverable submission error, retained name/email, and an enabled retry button. Dismissing the design header reduces the computed anchor offset to 24px. Homepage section links preserve the current appearance query and dismissed header; mobile section links also close the menu. Real delivery remains a Netlify launch check.
- `npm run verify` passed: zero Astro diagnostics, all 15 tests, eight-page build, metadata/link/form/CSP checks, and bundle budgets. First-party assets total approximately 5.0 KB JavaScript and 8.1 KB CSS gzip. Local screenshots are retained in the ignored `reports/copy-design-*.png` files; measured variant, breakpoint, and color-pair results are in `reports/copy-design-checks.json`.

## Required checks on Netlify

These cannot be completed by a local static build and remain launch gates:

- Form detection, native/enhanced submission acceptance, dashboard storage, spam behavior, inbox delivery, and reply-to.
- Actual GA4/Clarity account setup, consent behavior with real IDs, no duplicate automatic events, and CSP compatibility with provider endpoints.
- Security/cache headers and legacy redirects as served by Netlify.
- Disable Netlify's injected public badge and confirm no `about:srcdoc` CSP errors after a fresh load. See [security header troubleshooting](SECURITY_HEADERS.md).
- Custom-domain DNS, primary-host redirect, TLS, and independent mailbox send/receive.
- Owner approval of photo/copy/offers, privacy/retention practice, and checkout/referral terms.

## Local Lighthouse audits

The normal staging build blocks indexing on purpose. For a full local SEO audit, run `npm run preview:audit`. It rebuilds with the public indexing policy, checks all eight pages and the generated global response header, then serves on loopback port 4321. If a preview server is already running, use `npm run build:audit` and refresh it instead. This changes only the built output; Netlify preview settings and local environment files remain unchanged. The confirmation and error pages keep their own noindex directives.

A normal `npm run verify` or staging rebuild restores the staging policy, so use the audit command again before subsequent local SEO runs. Lighthouse flags noindex directives and crawler blocks as described in [Chrome’s indexing audit](https://developer.chrome.com/docs/lighthouse/seo/is-crawlable).

November 4, 2026 verification: the running local server returned `index,follow` for all six public content pages, `noindex,nofollow` for confirmation/error pages, and an allowed root robots policy. This verifies removal of the reported blocker; it is not a newly measured Lighthouse score.

## Lighthouse protocol

The target remains **100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO** for the six public indexable content pages. Do not claim this result until measured. The default staging configuration is intentionally noindex, so it cannot be used to certify the public SEO score. `/thanks/`, `/404.html`, and review pages have intentional indexing exclusions.

On the final Netlify custom domain:

1. Record the deploy/commit, browser and Lighthouse versions, viewport/profile, throttling, and enabled provider IDs/configuration.
2. Audit `/`, `/in-person/`, `/online-group-membership/`, `/contact-us-1/`, `/privacy/`, and `/referrals/` on mobile and desktop.
3. Collect five cold-load runs per page/profile, retaining all results and the median. Test consent-denied and consent-granted states with the intended production analytics enabled. A clean baseline with no optional tags is diagnostic, not a substitute for integrated results.
4. Save HTML/JSON reports in an external release record or ignored `reports/` folder. Resolve every actionable failure and document any remaining deviation rather than quietly lowering the target.
5. Manually test keyboard and screen-reader form completion; automated accessibility scores are only part of the review.

Browser tools or CI can run Lighthouse against the deployed URL. No Lighthouse report has been fabricated from bundle sizes or a screenshot. [Chrome scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring), [variability guidance](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md).

For field experience, follow LCP ≤2.5 seconds, INP ≤200 ms, and CLS ≤0.1 at the 75th percentile by device class. Low traffic may not produce a public CrUX report immediately. These are separate from the lab score. [Core Web Vitals](https://web.dev/articles/vitals).

## Release sign-off

The owner/maintainer should record the chosen deploy, tested domain, date, checker, form test outcome, analytics status, Lighthouse reports, and rollback reference. Complete the functional and owner checks before enabling production indexing, then retain the final public Lighthouse results. Retire the old website subscription only after final verification and the agreed rollback period.
