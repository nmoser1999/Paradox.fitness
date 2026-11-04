import { analyticsAllowed, CONSENT_KEY, track } from './analytics';
import { safeCampaign, safePageLocation } from './metrics-policy';

const rawGa = import.meta.env.PUBLIC_GA_MEASUREMENT_ID || '';
const rawClarity = import.meta.env.PUBLIC_CLARITY_PROJECT_ID || '';
const gaId = /^G-[A-Z0-9]+$/.test(rawGa) ? rawGa : '';
const clarityId = /^[a-z0-9]{5,20}$/.test(rawClarity) ? rawClarity : '';
const configured = Boolean(gaId || clarityId);
const panel = document.getElementById('consent-panel');
let returnFocus: HTMLElement | null = null;
let initialized = false;

function initializeAnalytics() {
  if (initialized || !analyticsAllowed()) return;
  initialized = true;
  if (gaId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.gtag('js', new Date());
    let referrer = '';
    try {
      referrer = document.referrer ? new URL(document.referrer).origin : '';
    } catch {
      /* Invalid referrers are discarded. */
    }
    window.gtag('config', gaId, {
      send_page_view: false,
      page_location: safePageLocation(location.href),
      page_referrer: referrer,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...safeCampaign(location.search),
    });
    window.gtag('event', 'page_view', {
      page_location: safePageLocation(location.href),
      page_title: document.title,
      page_referrer: referrer,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.append(script);
  }
  const recordingExcluded =
    /\/(contact-us-1|thanks|privacy|app)(\/|$)/.test(location.pathname) ||
    Boolean(location.search || location.hash);
  if (clarityId && !recordingExcluded) {
    const clarity = ((...args: unknown[]) => {
      (clarity.q ||= []).push(args);
    }) as NonNullable<Window['clarity']>;
    window.clarity = clarity;
    clarity('consentv2', {
      analytics_Storage: 'granted',
      ad_Storage: 'denied',
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    document.head.append(script);
  }
}

function clearAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter(
      (name): name is string =>
        Boolean(name) && /^(_ga($|_)|_clck$|_clsk$)/.test(name || ''),
    );
  const parts = location.hostname.split('.');
  const domains = [
    '',
    ...parts
      .map((_, index) => parts.slice(index).join('.'))
      .filter((domain) => domain.includes('.')),
  ];
  for (const name of names)
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
}

document
  .querySelectorAll<HTMLButtonElement>('[data-consent-open]')
  .forEach((button) => {
    button.addEventListener('click', () => {
      returnFocus = button;
      if (panel) panel.hidden = false;
      panel?.querySelector<HTMLButtonElement>('button')?.focus();
    });
  });
document
  .querySelectorAll<HTMLButtonElement>('[data-consent]')
  .forEach((button) => {
    button.addEventListener('click', () => {
      const wasAllowed = analyticsAllowed();
      const preference =
        button.dataset.consent === 'granted' ? 'granted' : 'denied';
      try {
        localStorage.setItem(CONSENT_KEY, preference);
      } catch {
        /* Storage blocked: stay opted out. */
      }
      if (panel) panel.hidden = true;
      returnFocus?.focus();
      if (preference === 'granted') initializeAnalytics();
      else {
        clearAnalyticsCookies();
        // Unload already-running vendor scripts after withdrawal. The saved choice prevents reloading them.
        if (wasAllowed) location.reload();
      }
    });
  });
if (!configured) {
  const description = document.getElementById('consent-description');
  if (description)
    description.textContent =
      'Optional analytics are currently disabled on this site. Your inquiry works without analytics. You can still save your preference for future visits.';
} else {
  let saved = false;
  try {
    saved = ['granted', 'denied'].includes(
      localStorage.getItem(CONSENT_KEY) || '',
    );
  } catch {
    /* Ask again without loading tags. */
  }
  if (!saved && panel) panel.hidden = false;
  initializeAnalytics();
}

document.addEventListener('click', (event) => {
  const link =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>('[data-track]')
      : null;
  const name = link?.dataset.track;
  if (
    name === 'cta_click' ||
    name === 'online_checkout_click' ||
    name === 'contact_click'
  )
    track(name, {
      placement: link?.dataset.placement,
      service: link?.dataset.service,
      channel: link?.dataset.channel,
    });
});
