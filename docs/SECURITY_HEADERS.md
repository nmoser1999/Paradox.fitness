# Security headers and Netlify console errors

## Confirmed badge conflict

On November 4, 2026, the HTML served from `https://paradox-marketing-site-demo.netlify.app/` included Netlify's injected `/.netlify/scripts/hud?variant=public` script. It creates an iframe named `nl-badge-frame` with an `about:srcdoc` document. This code is added by Netlify after the build and is absent from the repository and `dist/` HTML.

The blocked inline script hash reported in Chrome was:

```text
sha256-BkKP2XO6WOEc3kXOiLr2ZoY83hamalKjPY9xBcbXVuw=
```

That hash exactly matched the public badge's inline script, reconstructed from Netlify's public HUD source. Its accompanying inline stylesheet is also blocked by the site's CSP. Netlify documents that this badge and the private pre-launch toolbar conflict with policies that prohibit blanket inline scripts. [Netlify badge documentation](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/).

## Fix the public badge

1. Open the project in the Netlify dashboard.
2. Go to **Project configuration → General → Powered by Netlify badge**.
3. Turn the badge **off** and save.
4. Reload the deployed page. This setting takes effect on the next request; no new deploy is needed.
5. In Chrome DevTools, clear the Console and reload with the Network panel's cache disabled. Confirm the HUD script request and `nl-badge-frame` iframe are absent, then rerun Lighthouse.

Keep the generated CSP. Adding `'unsafe-inline'` or copying the badge's current hashes into the policy is unnecessary: the badge is optional, and its generated stylesheet depends on viewport dimensions. Hiding the badge with CSS still leaves its script running. A browser-local dismissal also does not turn it off for visitors or fresh Lighthouse sessions.

Follow-up verification on November 4, 2026: the same demo URL no longer returned the HUD script. A fresh in-app browser visit contained no badge script or iframe and reported no captured console warnings/errors. The original conflict is removed from the inspected response. A new Chrome/Lighthouse run is still needed to confirm the user's audit results.

For a private project's pre-launch toolbar, consult [Netlify's toolbar documentation](https://docs.netlify.com/manage/projects/pre-launch-toolbar/). Do not make a private project public just to troubleshoot a toolbar. The inspected demo uses the public badge, so the project setting above applies.

## Permissions-Policy warnings

The same deployed homepage returned exactly:

```http
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Neither this response nor the repository's generated header declares `attribution-reporting`, `private-aggregation`, `join-ad-interest-group`, `run-ad-auction`, or `browsing-topics`. HEAD checks of the deployed favicon, CSS, JavaScript, and portrait returned the same three-feature policy; the HUD endpoint returned no Permissions-Policy header. The supplied warnings alone do not identify which other response or browser component declares them. Their origin remains unconfirmed; removing these names from this application's header cannot resolve them because they are already absent.

If they remain after disabling the badge, reproduce in a fresh Chrome profile with extensions disabled. In DevTools Network, inspect response headers for the document and any frames/resources that log warnings. Record the affected request URL and actual `Permissions-Policy` value before changing configuration. Also inspect any enabled Netlify header extensions or edge middleware for a second policy. A warning that appears only in an existing browser profile should be investigated in that profile.

## What local checks establish

`npm run check:site` verifies that all generated inline script/style bodies have SHA-256 hashes in their respective CSP directive, that inline event/style attributes are absent, and that the global browser feature policy stays minimal. Both public and design-review builds run these checks in CI. This catches missing or stale hashes in build output, including the appearance bootstrap and structured data.

Astro's ordinary preview server does **not** apply Netlify's `_headers` file. A clean local console therefore cannot certify the deployed security headers. Repeat browser checks against Netlify, with the intended analytics and consent settings, after platform configuration changes. Keep the demo's intentional `noindex` policy until launch; it is independent of these console errors.
