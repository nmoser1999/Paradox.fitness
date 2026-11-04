import { sanitizeMetric, type MetricName } from './metrics-policy';

export const CONSENT_KEY = 'paradox-analytics-v1';
export function analyticsAllowed() {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}
export function track(
  name: MetricName,
  parameters: Record<string, unknown> = {},
) {
  if (!analyticsAllowed()) return;
  const event = sanitizeMetric(name, parameters);
  if (event?.name === 'cta_click' && event.parameters.placement) {
    try {
      sessionStorage.setItem(
        'paradox-entry-placement',
        event.parameters.placement,
      );
    } catch {
      /* Attribution is optional. */
    }
  }
  if (event)
    window.gtag?.('event', event.name, {
      ...event.parameters,
      transport_type: 'beacon',
    });
}

export function leadPlacement() {
  try {
    const placement = sessionStorage.getItem('paradox-entry-placement');
    return (
      sanitizeMetric('generate_lead', { placement })?.parameters.placement ||
      'form'
    );
  } catch {
    return 'form';
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}
