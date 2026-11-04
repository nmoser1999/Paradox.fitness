# Verification and launch gates

## Automated checks in this repository

`npm run verify` performs:

1. Astro/strict TypeScript diagnostics.
2. Unit tests covering optional contact fields, callback requirements, malformed inputs, honeypot handling, analytics allowlists, removal of identifying URL components, and approved campaign attribution.
3. Static production build and image optimization.
4. Generated HTML checks: one H1, unique titles, description/canonical metadata, local links/assets, a detectable Netlify form, noindex confirmation, and bundle size budgets.

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

## Required checks on Netlify

These cannot be completed by a local static build and remain launch gates:

- Form detection, native/enhanced submission acceptance, dashboard storage, spam behavior, inbox delivery, and reply-to.
- Actual GA4/Clarity account setup, consent behavior with real IDs, no duplicate automatic events, and CSP compatibility with provider endpoints.
- Security/cache headers and legacy redirects as served by Netlify.
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
