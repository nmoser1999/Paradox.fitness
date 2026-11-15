# Deployment walkthrough

This guide takes the completed source from this folder to **Netlify + your Namecheap domain**. Keep the current Squarespace website active until the final checks pass. Skip setup steps you have already completed.

## 1. Gather the owner-controlled accounts and confirm the content

- A GitHub account/repository controlled by the business or its agreed maintainer.
- A Netlify account **owned by Nicho Moser using `Nichomoser@pdoxfitness.com`**. Verify that mailbox first. Native form notification recipients must be active Netlify team members; a single business owner avoids assuming a second free seat. [Netlify notification requirements](https://docs.netlify.com/manage/forms/notifications/).
- Access to the domain’s actual DNS provider. A domain can be registered at Namecheap while its DNS is hosted elsewhere.
- The existing mailbox provider and billing details. Netlify website hosting does not replace business email.
- Owner approval for the supplied photo, public name/bio, address/hours, trial eligibility, $85 starting session price, two-session weekly minimum, $60 online subscription, and Trainerize checkout offer. The site carries forward these published offers; it does not verify their commercial terms.
- Approval of the privacy copy and an operating retention/deletion routine for inquiries. No fabricated testimonials or certifications are included.

## 2. Check the source locally

Install Node 24 LTS from [Node.js](https://nodejs.org/en/download), or use your existing version manager. The older Node 20 installation on this computer cannot run this Astro version.

```sh
npm ci
npm run verify
npm run dev
```

Open the URL printed by the last command. Check the homepage, service pages, contact form, FAQ, navigation, and mobile layout. Local form submission deliberately shows a recoverable error; only Netlify processes the form. `npm run preview` serves `dist/` after a build. To test the production SEO policy locally, use `npm run preview:audit` (stop an existing server on port 4321 first), or run `npm run build:audit` while the existing preview is running and refresh it. Normal staging builds intentionally block indexing.

## 3. Put the project in GitHub

Create an **empty repository** in the intended owner’s account. Choose visibility according to the owner’s preference and your Netlify plan’s repository support. Do not add a second generated project or put `dist/` in Git.

For an initial repository setup, review the files and commit them on `main`. If the repository is already connected and pushed, continue to the Netlify steps.

```sh
git status
git add .
git commit -m "Build Paradox Fitness marketing website"
```

Copy the exact remote command from your newly created GitHub repository, then run its `git remote add origin …` command and:

```sh
git push -u origin main
```

The `.gitignore` excludes dependencies, build output, local environment files, reports, and temporary QA files. Check the proposed commit before pushing; do not add credentials. GitHub Actions runs formatting and verification for production/review build modes. Enable branch protection with successful checks required if that fits your repository plan.

## 4. Create the Netlify project

In the owner’s Netlify account, choose the flow to import an existing project from Git. Connect the intended GitHub repository and choose `main` as the production branch. The root of this folder is the project base directory.

| Setting                    | Value                                     |
| -------------------------- | ----------------------------------------- |
| Framework                  | Astro / static                            |
| Build command              | `npm run verify`                          |
| Publish directory          | `dist`                                    |
| Node version               | `24`                                      |
| Server adapter / functions | None required for the current static site |

These build settings are already in `netlify.toml`. Astro’s official deployment guide also uses a static build published from `dist`. [Astro on Netlify](https://docs.astro.build/en/guides/deploy/netlify/).

Set build-time environment variables in Netlify:

| Variable                    | Initial value                                                 | Purpose                                        |
| --------------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `PUBLIC_SITE_URL`           | `https://www.pdoxfitness.com` if retaining the current domain | Canonical URLs, social images, sitemap         |
| `SITE_INDEXABLE`            | `true` for production; `false` for previews and branch deploys | Allows production indexing; keeps staging out of search |
| `PUBLIC_GA_MEASUREMENT_ID`  | Empty until configured                                        | Optional GA4 ID, such as `G-…`                 |
| `PUBLIC_CLARITY_PROJECT_ID` | Empty until configured                                        | Optional Clarity project ID                    |
| `ENABLE_DESIGN_REVIEW`      | `false` for production                                        | Excludes the old concept archive at `/design/` |

Netlify branch/deploy-preview contexts keep indexing off and include the archived concept explorer. Production builds allow indexing. If the Netlify dashboard has an explicit `SITE_INDEXABLE=false` override for production, change it to `true` or remove it. The main site stays locked to Studio cobalt with the Centered panorama layout; the archive flag does not restore its design chooser.

Start the first deploy. Open the generated `…netlify.app` URL, confirm the build succeeded, and check navigation and images. Do not use a successful build as proof of email delivery.

Turn off **Project configuration → General → Powered by Netlify badge** and save. Netlify injects this badge after the build; its inline iframe code conflicts with this site's strict Content Security Policy and produces `about:srcdoc` console errors. The setting takes effect on the next request without a redeploy. Keep the existing CSP. See [security header troubleshooting](docs/SECURITY_HEADERS.md) for the diagnosis and verification steps. [Netlify badge settings and CSP behavior](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/).

## 5. Connect and prove the inquiry flow

1. In the Netlify project’s **Forms** area, enable form detection if it is off, then redeploy.
2. Confirm that `training-inquiry` appears. The generated HTML contains the real form, the `form-name` hidden field, and a honeypot.
3. Under **Forms → Submission notifications**, add an email notification for this form to the owner’s verified `Nichomoser@pdoxfitness.com` address.
4. Send a controlled test inquiry from the deployed contact page using a real email address you control. Verify all of the following: a stored submission, the confirmation page, receipt in Nicho Moser’s inbox, and a reply addressed to the test prospect. The input is named `email` for reply-to handling.
5. Repeat with JavaScript disabled to verify native POST fallback. Confirm callback selection and phone details, invalid-input handling, and an offline retry that keeps the entries.
6. Inspect spam handling and agree who checks the dashboard. Remove test leads after verification using the provider’s normal controls.

The form is an inquiry, not a calendar booking. Server acceptance and email arrival are separate checks. No automatic prospect acknowledgement is configured. If the recipient cannot be the Netlify owner/team member, stop here and choose a separately tested email integration before launch. [Netlify form setup](https://docs.netlify.com/manage/forms/setup/), [stored submissions](https://docs.netlify.com/manage/forms/submissions/).

## 6. Add optional analytics

Follow [docs/ANALYTICS.md](docs/ANALYTICS.md), then add the provider IDs and redeploy. Decline/accept/withdrawal must be tested with actual IDs, including any Content Security Policy errors. Forms must still work with analytics blocked.

Leave the IDs empty if you want to launch without analytics first. Do not enter fake IDs: invalid configured ID formats fail the build. Do not add another tag snippet in the HTML; that would bypass the consent and event controls.

## 7. Connect Namecheap DNS without breaking email

Keep the same domain if possible. If you supply a different domain, first change `PUBLIC_SITE_URL`, rebuild, and plan old-domain redirects and Search Console migration. Do not assume the old domain can be retired immediately.

1. Export or screenshot the current DNS zone and record the Squarespace website targets for rollback. Identify MX, mail-related hosts, verification TXT, SPF, DKIM, and DMARC records. Preserve these.
2. Add your domain in Netlify’s domain management. For external DNS, prefer `www.pdoxfitness.com` as primary, with the apex redirected to it.
3. In Namecheap, open **Domain List → Manage → Advanced DNS → Host Records** if Namecheap is the authoritative DNS provider. If those controls are absent, edit records at the actual DNS provider instead. [Namecheap DNS location](https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/).
4. Use **the exact current values shown by Netlify** for this project. Typical record structure is below; it is not a replacement for the project’s verification instructions.

| Host  | Record                                                    | Target                                        |
| ----- | --------------------------------------------------------- | --------------------------------------------- |
| `www` | CNAME                                                     | The project’s `…netlify.app` hostname         |
| `@`   | ALIAS where supported                                     | Netlify’s current apex load-balancer hostname |
| `@`   | A, only if using the documented fallback instead of ALIAS | Netlify’s current displayed IPv4 target       |

Use one suitable apex arrangement, not conflicting ALIAS/A/AAAA/URL-redirect records. Replace only the old **website** records that conflict at `@`/`www`; retain email and ownership records. You do not need to transfer the registrar or switch all nameservers just to change website hosting. [Netlify external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/), [Namecheap ALIAS setup](https://www.namecheap.com/support/knowledgebase/article.aspx/10128/2237/how-to-create-an-alias-record/), [Namecheap CNAME setup](https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/).

Wait for DNS propagation and Netlify certificate provisioning. Verify the apex and `www`, HTTP-to-HTTPS redirection, the primary host, and TLS. Then send and receive ordinary email using the business mailbox; test form notifications separately.

## 8. Open indexing and complete launch checks

Before making the site indexable:

- Approve the final copy, photo, offers, referral page, privacy wording, and current checkout terms.
- Test an inquiry from the **custom domain**, stored submission, inbox delivery, and reply-to.
- Test the Trainerize destination and trial details without making an unintended purchase. A checkout click does not verify a completed signup.
- Check mobile layouts, keyboard navigation, form labels/errors, consent choices, external links, redirects, and a missing page.
- Check performance, accessibility, and best practices on staging with the intended integrations. Staging intentionally fails indexing-related SEO checks; certify all four categories after the production indexing change below.

Set production-context `SITE_INDEXABLE=true`, keep `ENABLE_DESIGN_REVIEW=false`, and deploy again. Confirm that public pages now have `index,follow`, the global `X-Robots-Tag` is removed, `robots.txt` allows the site, and `/thanks/` remains noindex. Now run the full Lighthouse protocol in [docs/VERIFICATION.md](docs/VERIFICATION.md), including SEO, and retain the results. Add the domain to Google Search Console and submit `/sitemap-index.xml`.

**Only after these checks and an agreed rollback window should you cancel the Squarespace website plan.** Keep any separate domain/email subscriptions that are still needed.

## 9. Costs, monitoring, and rollback

Netlify’s current credit-based Free plan includes a finite monthly allowance. It can pause both the site and form intake when exhausted. Use the owner’s usage alerts and review traffic/deployment activity; do not treat free hosting as unlimited. Domain and mailbox renewal fees remain separate. [Netlify pricing](https://www.netlify.com/pricing/), [pause behavior](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/).

For a bad code release, use Netlify’s previously successful deploy/rollback controls, then revert or fix the source commit so the next release does not reintroduce the issue. For a DNS cutover failure, restore the recorded website DNS targets while the previous site remains active. Allow propagation time. Document the chosen deploy/commit and notify the owner through your normal process.

Hand over repository/Netlify/domain/analytics access, billing ownership, lead-handling responsibility, and the maintenance guide. Do not leave production dependent on a temporary developer account.
