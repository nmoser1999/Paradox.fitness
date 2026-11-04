const eventNames = [
  'cta_click',
  'form_start',
  'form_error',
  'generate_lead',
  'online_checkout_click',
  'contact_click',
] as const;
export type MetricName = (typeof eventNames)[number];
const allowed: Record<string, readonly string[]> = {
  placement: [
    'header',
    'hero',
    'coach',
    'service-card',
    'final',
    'mobile-sticky',
    'in-person-hero',
    'online-hero',
    'online-details',
    'contact-page',
    'footer',
    'referral-page',
    'form',
  ],
  service: ['in-person', 'online', 'unsure'],
  channel: ['email', 'phone'],
  form_id: ['training-inquiry'],
  error_code: [
    'missing_name',
    'invalid_email',
    'missing_phone',
    'invalid_service',
    'too_long',
    'field_validation',
    'network_failed',
    'server_rejected',
  ],
};

/** Only fixed enum values cross into analytics. Drop unknown keys and user text. */
export function sanitizeMetric(name: string, input: Record<string, unknown>) {
  if (!eventNames.some((event) => event === name)) return null;
  const parameters: Record<string, string> = {};
  for (const [key, values] of Object.entries(allowed)) {
    if (typeof input[key] === 'string' && values.includes(input[key]))
      parameters[key] = input[key];
  }
  return { name: name as MetricName, parameters };
}

export function safePageLocation(location: string) {
  const url = new URL(location);
  const paths = [
    '/',
    '/in-person/',
    '/online-group-membership/',
    '/contact-us-1/',
    '/thanks/',
    '/privacy/',
    '/referrals/',
  ];
  return url.origin + (paths.includes(url.pathname) ? url.pathname : '/404/');
}

export function safeCampaign(search: string) {
  const params = new URLSearchParams(search);
  const fields = {
    utm_source: {
      key: 'campaign_source',
      values: ['instagram', 'google', 'facebook', 'newsletter', 'referral'],
    },
    utm_medium: {
      key: 'campaign_medium',
      values: ['social', 'organic', 'cpc', 'email', 'referral'],
    },
    utm_campaign: {
      key: 'campaign_name',
      values: ['training-week', 'online-trial'],
    },
  };
  const result: Record<string, string> = {};
  for (const [query, rule] of Object.entries(fields)) {
    const value = params.get(query);
    if (value && rule.values.includes(value)) result[rule.key] = value;
  }
  return result;
}
