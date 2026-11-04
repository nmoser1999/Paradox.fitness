import { describe, expect, it } from 'vitest';
import {
  safeCampaign,
  safePageLocation,
  sanitizeMetric,
} from '../src/lib/metrics-policy';

describe('Analytics privacy boundary', () => {
  it('drops personal information and arbitrary event properties', () => {
    expect(
      sanitizeMetric('generate_lead', {
        form_id: 'training-inquiry',
        service: 'online',
        email: 'private@example.com',
        message: 'private details',
        name: 'Private',
        url: 'https://example.com/?email=private',
      }),
    ).toEqual({
      name: 'generate_lead',
      parameters: { form_id: 'training-inquiry', service: 'online' },
    });
  });
  it('rejects unexpected event names and free-form property values', () => {
    expect(sanitizeMetric('arbitrary-event', {})).toBeNull();
    expect(
      sanitizeMetric('form_error', {
        error_code: 'server said private@example.com',
        placement: 'private name',
      }),
    ).toEqual({ name: 'form_error', parameters: {} });
  });
  it('removes query strings and fragments from measured page URLs', () => {
    expect(
      safePageLocation(
        'https://www.pdoxfitness.com/contact-us-1/?email=private@example.com#private',
      ),
    ).toBe('https://www.pdoxfitness.com/contact-us-1/');
  });
  it('keeps checkout clicks separate from accepted inquiries', () => {
    expect(
      sanitizeMetric('online_checkout_click', { placement: 'online-hero' })
        ?.name,
    ).not.toBe('generate_lead');
  });
  it('does not transmit unexpected path segments that could contain personal information', () => {
    expect(
      safePageLocation('https://www.pdoxfitness.com/private@example.com'),
    ).toBe('https://www.pdoxfitness.com/404/');
  });
  it('supports only preapproved campaign labels, never arbitrary query values', () => {
    expect(
      safeCampaign(
        '?utm_source=instagram&utm_medium=social&utm_campaign=training-week&email=private@example.com',
      ),
    ).toEqual({
      campaign_source: 'instagram',
      campaign_medium: 'social',
      campaign_name: 'training-week',
    });
    expect(
      safeCampaign(
        '?utm_source=private@example.com&utm_campaign=personal-name',
      ),
    ).toEqual({});
  });
});
