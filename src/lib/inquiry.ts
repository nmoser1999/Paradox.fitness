export const services = ['in-person', 'online', 'unsure'] as const;
export type Service = (typeof services)[number];
export function isService(value: unknown): value is Service {
  return (
    typeof value === 'string' && services.some((service) => service === value)
  );
}

type InquiryResult =
  | { ok: true; body: URLSearchParams; service: Service; isSpam: boolean }
  | {
      ok: false;
      code:
        | 'missing_name'
        | 'invalid_email'
        | 'missing_phone'
        | 'invalid_service'
        | 'too_long';
      message: string;
    };

/** Client-side usability validation, not a replacement for a server trust boundary. */
export function parseInquiry(values: Record<string, unknown>): InquiryResult {
  const text = (name: string) =>
    typeof values[name] === 'string' ? values[name].trim() : '';
  const name = text('name');
  const email = text('email');
  const phone = text('phone');
  const message = text('message');
  const service = text('service');
  const contactMethod = text('contact-method') === 'phone' ? 'phone' : 'email';
  if (!name)
    return {
      ok: false,
      code: 'missing_name',
      message: 'Please add your name so Nico knows who to reply to.',
    };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return {
      ok: false,
      code: 'invalid_email',
      message: 'Please enter a valid email address.',
    };
  if (!isService(service))
    return {
      ok: false,
      code: 'invalid_service',
      message: 'Please choose a training option, or select “Still deciding”.',
    };
  if (contactMethod === 'phone' && phone.replace(/\D/g, '').length < 7)
    return {
      ok: false,
      code: 'missing_phone',
      message:
        'Please include a phone number for your callback, or choose an email reply.',
    };
  if (
    name.length > 100 ||
    email.length > 254 ||
    phone.length > 40 ||
    message.length > 1500
  )
    return {
      ok: false,
      code: 'too_long',
      message:
        'Please shorten the highlighted details. Messages can be up to 1,500 characters.',
    };
  return {
    ok: true,
    service,
    isSpam: Boolean(text('company')),
    body: new URLSearchParams({
      'form-name': 'training-inquiry',
      subject: 'New Paradox Fitness training inquiry',
      name,
      email,
      phone,
      service,
      'contact-method': contactMethod,
      message,
      company: text('company'),
    }),
  };
}
