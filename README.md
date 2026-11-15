# Paradox Fitness

Static Astro + TypeScript + Tailwind website, prepared for Netlify. The approved design is locked to **Studio · cobalt + Centered panorama** across every page. The design chooser has been removed; old palette/layout query parameters and saved design preferences cannot override it. The original standalone concept explorer is retained as an archive. The normal site header and navigation remain visible. A sun/moon button to the left of the desktop header CTA switches the cobalt palette between light and dark mode. The toggle is hidden at widths of 800px and below. It follows the browser preference by default, remembers a manual choice, and can return to automatic mode through “Use browser theme” in the footer.

## Start here

1. Install **Node.js 24 LTS** and npm. This project requires at least Node 22.23.4; Node 24 is used in development, CI, and Netlify. If you use nvm, run `nvm install` and `nvm use` in this folder.
2. Run `npm ci`.
3. Run `npm run dev` and open the printed local URL, usually `http://127.0.0.1:4321/`.
4. Run `npm run verify` before releasing changes.
5. Follow [DEPLOYMENT.md](DEPLOYMENT.md) to launch on Netlify with Namecheap DNS.

Local preview never sends or pretends to store inquiries. Test actual delivery on Netlify before launch. Analytics are disabled until configured. Production builds allow indexing; deploy previews and branch deploys remain blocked from indexing.

## Commands

| Command                 | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `npm ci`                | Install the exact lockfile dependencies                                 |
| `npm run dev`           | Local development with live updates                                     |
| `npm run check`         | Strict TypeScript and Astro checks                                      |
| `npm test`              | Inquiry validation and analytics privacy tests                          |
| `npm run build`         | Optimized static website in `dist/`, security headers included          |
| `npm run check:site`    | Generated pages, links, metadata, form detection, and bundle budgets    |
| `npm run verify`        | Type checks, tests, build, and generated-site checks                    |
| `npm run preview`       | Serve the actual built output locally                                   |
| `npm run build:audit`   | Build and check the public indexing policy for a local Lighthouse audit |
| `npm run preview:audit` | Build that audit version and serve it at `http://127.0.0.1:4321/`       |
| `npm run format`        | Format source and documentation                                         |
| `npm run format:check`  | Check formatting without changing files                                 |

Use `.env.example` as a reference for local `.env` values; never commit secrets. Public analytics IDs are identifiers, not private API keys. After changing build-time environment values, rebuild the site.

## Local Lighthouse audits

For local Lighthouse SEO checks, use `npm run preview:audit` instead of a staging build. Stop any server already using port 4321 first. If the preview is already running, `npm run build:audit` updates its built files; refresh the page before rerunning Lighthouse. This enables the real public indexing policy in the local build without changing Netlify’s preview settings. Ordinary `npm run verify` rebuilds the default staging policy, so rerun the audit command afterward when testing SEO. Confirmation/error pages intentionally remain noindex.

## Documentation

- [Deployment walkthrough](DEPLOYMENT.md): account setup, Git, Netlify, forms, DNS, email, launch, rollback.
- [Architecture](docs/ARCHITECTURE.md): components, trust boundaries, privacy, future auth/LLM features.
- [Analytics](docs/ANALYTICS.md): consent, provider setup, event definitions, funnels, campaign labels.
- [Maintenance](docs/MAINTENANCE.md): content edits, releases, dependencies, lead operations.
- [Verification](docs/VERIFICATION.md): checks performed, remaining launch gates, Lighthouse protocol.
- [Security header troubleshooting](docs/SECURITY_HEADERS.md): Netlify badge conflicts, CSP checks, and console diagnostics.
- [Original proposal](REBUILD_PROPOSAL.md): research and design rationale; implementation docs describe the current code.

## Editing

Business details, hours, prices, checkout URL, and FAQs live in `src/data/site.ts`. Page copy lives in `src/pages/`. Shared styles are in `src/styles/global.css`; shared page structure is in `src/layouts/Base.astro`. Replace `assets/unnamed.jpg` with an approved final photo when ready; Astro generates optimized image formats at build time.

The fixed design is declared in `src/lib/design.ts` and rendered by `src/layouts/Base.astro`. Studio color tokens live in `src/styles/global.css`, shared panorama framing in `src/styles/appearance.css`, and dark-mode tokens in `src/styles/color-mode.css`. Light/dark preferences are functional and do not require analytics consent.

The original archived concept is `design-directions.html`, with `design-explorer.css` and `design-explorer.js`. It is excluded from normal production builds. Build with `ENABLE_DESIGN_REVIEW=true` to include that archive at `/design/`; Netlify deploy previews do this automatically. This flag does not change the fixed design on the main site. Archive service links intentionally point at the existing website. Review links are noindex, which does not make them private.

The Git remote is configured for `nmoser1999/Paradox.fitness`. Deployment uses the existing GitHub/Netlify workflow described in `DEPLOYMENT.md`.
