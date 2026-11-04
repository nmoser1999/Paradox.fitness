import { leadPlacement, track } from './analytics';
import { isService, parseInquiry } from './inquiry';

const form = document.querySelector<HTMLFormElement>('#inquiry-form');
const service = document.querySelector<HTMLSelectElement>('#service');
const contactMethod =
  document.querySelector<HTMLSelectElement>('#contact-method');
const phone = document.querySelector<HTMLInputElement>('#phone');
const phoneOptional = document.getElementById('phone-optional');
const error = document.getElementById('form-error');
const status = document.getElementById('form-status');
const button = document.querySelector<HTMLButtonElement>('#inquiry-submit');
const buttonLabel = button?.querySelector<HTMLElement>('[data-inquiry-label]');

const requested = new URLSearchParams(location.search).get('service');
if (service && isService(requested)) service.value = requested;
function updateForm() {
  const callback = contactMethod?.value === 'phone';
  if (phone) phone.required = callback;
  if (phoneOptional)
    phoneOptional.textContent = callback
      ? '(required for a callback)'
      : '(optional)';
  if (buttonLabel)
    buttonLabel.textContent =
      service?.value === 'in-person'
        ? 'Request my training week'
        : 'Send my inquiry';
}
service?.addEventListener('change', updateForm);
contactMethod?.addEventListener('change', updateForm);
updateForm();

let started = false;
let pending = false;
let completed = false;
form?.addEventListener('focusin', () => {
  if (!started) {
    track('form_start', {
      form_id: 'training-inquiry',
      service: service?.value,
    });
    started = true;
  }
});
form?.addEventListener(
  'invalid',
  () =>
    track('form_error', {
      form_id: 'training-inquiry',
      error_code: 'field_validation',
    }),
  true,
);

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (pending || completed || !button || !error || !status) return;
  const result = parseInquiry(Object.fromEntries(new FormData(form)));
  if (!result.ok) {
    error.textContent = result.message;
    error.hidden = false;
    error.focus();
    track('form_error', {
      form_id: 'training-inquiry',
      error_code: result.code,
    });
    return;
  }
  pending = true;
  button.disabled = true;
  error.hidden = true;
  status.textContent = 'Sending your inquiry…';
  form.setAttribute('aria-busy', 'true');
  let failureCode = 'network_failed';
  try {
    // A local static preview is not a form processor. Never present it as a saved lead.
    if (['localhost', '127.0.0.1', '::1'].includes(location.hostname))
      throw new Error('Local preview');
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: result.body.toString(),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      failureCode = 'server_rejected';
      throw new Error('Submission rejected');
    }
    completed = true;
    if (!result.isSpam)
      track('generate_lead', {
        form_id: 'training-inquiry',
        service: result.service,
        placement: leadPlacement(),
      });
    status.textContent = 'Your inquiry has been sent.';
    location.assign('/thanks/');
  } catch {
    error.textContent =
      'Your inquiry could not be sent. Your entries are still here. Please try again, or contact Nico using the email or phone number on this page.';
    error.hidden = false;
    error.focus();
    status.textContent = '';
    track('form_error', {
      form_id: 'training-inquiry',
      error_code: failureCode,
    });
  } finally {
    pending = false;
    button.disabled = completed;
    form.removeAttribute('aria-busy');
  }
});
