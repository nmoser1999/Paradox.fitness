import { initializeColorMode } from './color-mode';
import {
  defaultDesign,
  DESIGN_KEY,
  isLayout,
  isPalette,
  layouts,
  palettes,
  resolveDesign,
  type Layout,
  type Palette,
} from './design';

const paletteSelect =
  document.querySelector<HTMLSelectElement>('#palette-select');
const layoutSelect =
  document.querySelector<HTMLSelectElement>('#layout-select');
const controlsBar = document.getElementById('design-controls');
const hideControls = document.querySelector<HTMLButtonElement>('#design-hide');

if (controlsBar && hideControls) {
  hideControls.disabled = false;
  hideControls.addEventListener('click', () => {
    controlsBar.hidden = true;
    document.getElementById('main')?.focus({ preventScroll: true });
  });
}

function apply(theme: Palette, layout: Layout, updateUrl = false) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.layout = layout;
  if (paletteSelect) paletteSelect.value = theme;
  if (layoutSelect) layoutSelect.value = layout;
  const status = document.getElementById('design-status');
  if (status)
    status.textContent = `${palettes[theme].name} + ${layouts[layout].slice(3)}`;
  try {
    localStorage.setItem(DESIGN_KEY, JSON.stringify({ theme, layout }));
  } catch {
    /* A blocked preference store must not break controls. */
  }
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('theme', theme);
    url.searchParams.set('layout', layout);
    history.replaceState(null, '', url);
  }
}
function read() {
  let saved: unknown;
  try {
    saved = JSON.parse(localStorage.getItem(DESIGN_KEY) || 'null');
  } catch {
    saved = null;
  }
  const selection = resolveDesign(new URLSearchParams(location.search), saved);
  apply(selection.theme, selection.layout);
}
paletteSelect?.addEventListener('change', () => {
  if (isPalette(paletteSelect.value))
    apply(
      paletteSelect.value,
      isLayout(layoutSelect?.value) ? layoutSelect.value : defaultDesign.layout,
      true,
    );
});
layoutSelect?.addEventListener('change', () => {
  if (isLayout(layoutSelect.value))
    apply(
      isPalette(paletteSelect?.value)
        ? paletteSelect.value
        : defaultDesign.theme,
      layoutSelect.value,
      true,
    );
});
document.getElementById('suggested-pair')?.addEventListener('click', () => {
  if (isPalette(paletteSelect?.value))
    apply(paletteSelect.value, palettes[paletteSelect.value].layout, true);
});
window.addEventListener('popstate', read);
read();
initializeColorMode();
