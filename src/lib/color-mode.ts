export const COLOR_MODE_KEY = 'paradox-color-mode-v1';
export type ColorMode = 'light' | 'dark';
export type ColorPreference = ColorMode | 'system';

export function colorPreference(value: unknown): ColorPreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function resolveColorMode(
  value: unknown,
  prefersDark: boolean,
): ColorMode {
  const preference = colorPreference(value);
  return preference === 'system'
    ? prefersDark
      ? 'dark'
      : 'light'
    : preference;
}

export function initializeColorMode() {
  const root = document.documentElement;
  const toggle =
    document.querySelector<HTMLButtonElement>('#color-mode-toggle');
  const reset = document.querySelector<HTMLButtonElement>('#color-mode-reset');
  const status = document.getElementById('color-mode-status');
  const browser = matchMedia('(prefers-color-scheme: dark)');
  let preference: ColorPreference = 'system';
  try {
    preference = colorPreference(localStorage.getItem(COLOR_MODE_KEY));
  } catch {
    /* Browser preference still works when storage is unavailable. */
  }

  function updateBrowserChrome() {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (meta)
      meta.content = getComputedStyle(root).getPropertyValue('--paper').trim();
  }

  function apply(announce = false) {
    const mode = resolveColorMode(preference, browser.matches);
    root.dataset.mode = mode;
    root.dataset.modePreference = preference;
    if (toggle) {
      toggle.disabled = false;
      toggle.setAttribute('aria-pressed', String(mode === 'dark'));
      toggle.title = `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`;
    }
    if (reset) {
      reset.disabled = preference === 'system';
      reset.textContent =
        preference === 'system' ? 'Using browser theme' : 'Use browser theme';
    }
    updateBrowserChrome();
    if (announce && status)
      status.textContent = `${mode === 'dark' ? 'Dark' : 'Light'} mode${preference === 'system' ? ', following browser preference' : ''}`;
  }

  function save(next: ColorPreference) {
    preference = next;
    try {
      if (next === 'system') localStorage.removeItem(COLOR_MODE_KEY);
      else localStorage.setItem(COLOR_MODE_KEY, next);
    } catch {
      /* The control remains usable for the current page. */
    }
    apply(true);
  }

  toggle?.addEventListener('click', () =>
    save(root.dataset.mode === 'dark' ? 'light' : 'dark'),
  );
  reset?.addEventListener('click', () => save('system'));
  browser.addEventListener('change', () => {
    if (preference === 'system') apply();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === COLOR_MODE_KEY || event.key === null) {
      preference = colorPreference(event.newValue);
      apply();
    }
  });
  // Palette changes keep the selected mode and update the browser toolbar color.
  new MutationObserver(updateBrowserChrome).observe(root, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  apply();
}
