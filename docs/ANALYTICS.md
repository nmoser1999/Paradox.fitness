# Analytics setup and measurement

## Default behavior

GA4 and Clarity are disabled until their build-time IDs are supplied. This is deliberate: no fake property, unowned data destination, or duplicate script is included. The footer’s **Analytics settings** control is available on every page. Declining analytics does not affect the form.

## Google Analytics 4

1. Create a business-owned GA4 property and web stream for the final domain. Copy its `G-…` measurement ID.
2. In the stream settings, **turn off Enhanced Measurement automatic events**, including forms, outbound clicks, history/page changes, and site search. This site sends its own bounded page and flow events; automatic events can collect unsanitized URLs or duplicate counts.
3. Leave advertising signals and advertising personalization disabled. The client code also disables them when configuring the tag.
4. Choose an appropriate event data retention period, such as two months initially, and restrict account access to the owner/maintainers.
5. Set `PUBLIC_GA_MEASUREMENT_ID` in Netlify and redeploy. Do not paste an extra Google tag into a component.
6. Accept analytics on a test browser and verify page/event receipt in GA4 Realtime/DebugView. Decline in another session and confirm no Google tag requests. Test withdrawal and subsequent page loads.
7. Mark **`generate_lead`** as the lead key event. Register event-scoped custom dimensions for `placement`, `service`, `form_id`, `channel`, and `error_code` where useful. Do not assign invented revenue values.

Setup references: [GA4 events](https://developers.google.com/analytics/devguides/collection/ga4/events), [lead event reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), [PII restrictions](https://support.google.com/analytics/answer/6366371).

## Events

| Event                   | Meaning                                                         | Allowed properties                                       |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| `page_view`             | Consented view of a known public page                           | Sanitized URL, static title, referrer origin             |
| `cta_click`             | Training/inquiry CTA activated                                  | Fixed placement; service                                 |
| `form_start`            | First focus inside the inquiry form, once per page visit        | Fixed form ID; service                                   |
| `form_error`            | Browser validation or failed submission                         | Fixed form ID; bounded error code                        |
| `generate_lead`         | JavaScript-enhanced form received a successful Netlify response | Form ID; service; last consented CTA placement or `form` |
| `online_checkout_click` | Trainerize checkout link activated                              | Fixed placement; online service                          |
| `contact_click`         | Email/telephone link activated                                  | Fixed placement; email/phone channel                     |

`generate_lead` is not emitted on confirmation-page loads, form button clicks, failed requests, or the local preview. Native no-JavaScript submissions still appear in Netlify, although they cannot produce browser analytics. The operational lead count is the Netlify submissions dashboard, not GA4.

The exact allowlists live in `src/lib/metrics-policy.ts`. Add new placements deliberately when adding components; arbitrary DOM strings are not forwarded. No form values, phone numbers, names, messages, or email addresses are allowed as event parameters.

## Campaign links

The code forwards only these approved labels:

- Sources: `instagram`, `google`, `facebook`, `newsletter`, `referral`.
- Media: `social`, `organic`, `cpc`, `email`, `referral`.
- Campaigns: `training-week`, `online-trial`.

Example: `https://www.pdoxfitness.com/?utm_source=instagram&utm_medium=social&utm_campaign=training-week`.

Unknown labels are dropped. Add approved labels to `safeCampaign` if needed; never put a person’s name, email, health details, or other identifying data in campaign URLs. Referrer data is reduced to its origin. These choices intentionally favor bounded data over capturing every possible marketing label.

## Microsoft Clarity, optional

Create a business-owned project, choose strict text masking, and configure its consent requirements. Set `PUBLIC_CLARITY_PROJECT_ID` and redeploy only after reviewing performance and privacy behavior. The page body is masked, and the code excludes form/confirmation/privacy/private-app paths and initial URLs with queries/fragments. You can inspect interaction patterns without recording form entries. [Clarity masking](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking), [consent API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2).

Test provider requests and the browser console with Netlify security headers active. If a provider needs an additional endpoint, verify it against official documentation before adjusting the CSP in `scripts/postbuild.mjs`. Do not broadly allow every script source to silence an error.

## Owner dashboard

Use GA4 **Explore → Funnel exploration** for:

1. `page_view` on a landing or service page.
2. `cta_click`, filtered by service/placement as relevant.
3. `form_start`.
4. `generate_lead`.

Compare mobile/desktop, source/medium, landing page, and CTA placement. Keep the time range and consent coverage consistent. Show counts beside rates when traffic is low. [GA4 funnel guide](https://support.google.com/analytics/answer/9327974).

Define lead rate as measured sessions containing an accepted inquiry divided by eligible measured sessions. Define form completion as measured form-start sessions that contain a lead event divided by measured form-start sessions. These are a subset of activity because consent, blockers, no-JavaScript visits, and immediate navigation can reduce telemetry.

Track the online path separately: online page visit → `online_checkout_click`. A completed trial or subscription requires supported Trainerize reporting/integration. This implementation cannot infer purchases from an outbound click. Keep Nicho Moser’s consultation/client outcomes in the existing business system until a deliberate CRM integration is added.
