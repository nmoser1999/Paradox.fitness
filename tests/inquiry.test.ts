import { describe, expect, it } from 'vitest';
import { parseInquiry } from '../src/lib/inquiry';

const valid = {
  name: 'Test Prospect',
  email: 'prospect@example.com',
  service: 'in-person',
  'contact-method': 'email',
  phone: '',
  message: 'Interested in getting started.',
  company: '',
};
describe('Inquiry submission boundary', () => {
  it('allows a short inquiry without a phone number or message', () => {
    const result = parseInquiry({ ...valid, message: '' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body.get('form-name')).toBe('training-inquiry');
      expect(result.body.get('email')).toBe(valid.email);
    }
  });
  it('requires a usable callback number only when requested', () => {
    expect(parseInquiry({ ...valid, 'contact-method': 'phone' })).toMatchObject(
      { ok: false, code: 'missing_phone' },
    );
    expect(
      parseInquiry({
        ...valid,
        'contact-method': 'phone',
        phone: '+1 (510) 555-0100',
      }).ok,
    ).toBe(true);
  });
  it('rejects malformed emails, empty names, unknown services, and oversized messages', () => {
    expect(parseInquiry({ ...valid, email: 'not-an-email' })).toMatchObject({
      ok: false,
      code: 'invalid_email',
    });
    expect(parseInquiry({ ...valid, name: ' ' })).toMatchObject({
      ok: false,
      code: 'missing_name',
    });
    expect(parseInquiry({ ...valid, service: 'injected' })).toMatchObject({
      ok: false,
      code: 'invalid_service',
    });
    expect(parseInquiry({ ...valid, message: 'x'.repeat(1501) })).toMatchObject(
      { ok: false, code: 'too_long' },
    );
  });
  it('preserves the honeypot but drops unrecognized fields and caller-supplied subjects', () => {
    const result = parseInquiry({
      ...valid,
      company: 'bot',
      subject: 'injected',
      arbitrary: 'discard',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.isSpam).toBe(true);
      expect(result.body.has('arbitrary')).toBe(false);
      expect(result.body.get('subject')).toBe(
        'New Paradox Fitness training inquiry',
      );
    }
  });
});
