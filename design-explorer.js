const palettes = {
  fieldwork: { name: 'Fieldwork', description: 'Grounded forest and ivory.', layout: 'classic' },
  precision: { name: 'Precision', description: 'Crisp navy and ice blue.', layout: 'architectural' },
  foundation: { name: 'Foundation', description: 'Warm stone and clay.', layout: 'arch' },
  studio: { name: 'Studio', description: 'Fresh paper and confident cobalt.', layout: 'reverse' },
  mineral: { name: 'Mineral', description: 'Graphite and mineral green.', layout: 'immersive' },
  tide: { name: 'Tide', description: 'Airy coastal blue and deep teal.', layout: 'panorama' },
  cadence: { name: 'Cadence', description: 'Rich burgundy and warm apricot.', layout: 'editorial' },
  grove: { name: 'Grove', description: 'Soft chalk and grounded olive.', layout: 'portrait' }
};
const layouts = {
  classic: { name: 'Classic split', description: 'Text left, coach right.' },
  architectural: { name: 'Architectural', description: 'Precise framing and square edges.' },
  arch: { name: 'Soft arch', description: 'Editorial type and an arched portrait.' },
  reverse: { name: 'Portrait first', description: 'Coach left, bold copy right.' },
  immersive: { name: 'Immersive photo', description: 'Wide photo hero with an overlaid introduction.' },
  panorama: { name: 'Centered panorama', description: 'Centered introduction and a panoramic coach panel.' },
  editorial: { name: 'Editorial offset', description: 'Large serif type and an offset portrait.' },
  portrait: { name: 'Circular portrait', description: 'Open headline and a circular coach profile.' }
};
const paletteSelect = document.getElementById('palette-select');
const layoutSelect = document.getElementById('layout-select');

function applySelection(palette, layout, updateUrl = false) {
  if (!Object.hasOwn(palettes, palette) || !Object.hasOwn(layouts, layout)) return;
  document.documentElement.dataset.theme = palette;
  document.documentElement.dataset.layout = layout;
  paletteSelect.value = palette;
  layoutSelect.value = layout;
  document.getElementById('comparison-status').textContent = `${palettes[palette].name} + ${layouts[layout].name} · ${palettes[palette].description} ${layouts[layout].description}`;
  document.getElementById('direction').textContent = `${palettes[palette].name} / ${layouts[layout].name}`;
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('theme', palette);
    url.searchParams.set('layout', layout);
    try { history.replaceState(null, '', url); } catch { /* Controls also work in standalone file previews. */ }
  }
}

function readSelection() {
  const params = new URLSearchParams(location.search);
  const requestedPalette = params.get('theme');
  const palette = Object.hasOwn(palettes, requestedPalette) ? requestedPalette : 'fieldwork';
  const requestedLayout = params.get('layout');
  // Keep original theme-only links working with their original compositions.
  const layout = Object.hasOwn(layouts, requestedLayout) ? requestedLayout : palettes[palette].layout;
  applySelection(palette, layout);
}

paletteSelect.addEventListener('change', () => applySelection(paletteSelect.value, layoutSelect.value, true));
layoutSelect.addEventListener('change', () => applySelection(paletteSelect.value, layoutSelect.value, true));
document.getElementById('suggested-pair').addEventListener('click', () => applySelection(paletteSelect.value, palettes[paletteSelect.value].layout, true));
window.addEventListener('popstate', readSelection);
readSelection();
