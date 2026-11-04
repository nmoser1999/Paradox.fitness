export const palettes = {
  fieldwork: {
    label: '01 Fieldwork · forest',
    name: 'Fieldwork',
    layout: 'classic',
  },
  precision: {
    label: '02 Precision · navy',
    name: 'Precision',
    layout: 'architectural',
  },
  foundation: {
    label: '03 Foundation · clay',
    name: 'Foundation',
    layout: 'arch',
  },
  studio: { label: '04 Studio · cobalt', name: 'Studio', layout: 'reverse' },
  mineral: {
    label: '05 Mineral · graphite',
    name: 'Mineral',
    layout: 'immersive',
  },
  tide: { label: '06 Tide · coastal blue', name: 'Tide', layout: 'panorama' },
  cadence: {
    label: '07 Cadence · burgundy',
    name: 'Cadence',
    layout: 'editorial',
  },
  grove: { label: '08 Grove · olive', name: 'Grove', layout: 'portrait' },
} as const;
export const layouts = {
  classic: '01 Classic split',
  architectural: '02 Architectural',
  arch: '03 Soft arch',
  reverse: '04 Portrait first',
  immersive: '05 Immersive photo',
  panorama: '06 Centered panorama',
  editorial: '07 Editorial offset',
  portrait: '08 Circular portrait',
} as const;
export type Palette = keyof typeof palettes;
export type Layout = keyof typeof layouts;
export const defaultDesign: { theme: Palette; layout: Layout } = {
  theme: 'grove',
  layout: 'panorama',
};
export const DESIGN_KEY = 'paradox-design-v1';
export function isPalette(value: unknown): value is Palette {
  return typeof value === 'string' && Object.hasOwn(palettes, value);
}
export function isLayout(value: unknown): value is Layout {
  return typeof value === 'string' && Object.hasOwn(layouts, value);
}

export function resolveDesign(params: URLSearchParams, saved: unknown) {
  const previous =
    typeof saved === 'object' && saved !== null
      ? (saved as Record<string, unknown>)
      : {};
  const queryTheme = params.get('theme');
  const queryLayout = params.get('layout');
  return {
    theme: isPalette(queryTheme)
      ? queryTheme
      : isPalette(previous.theme)
        ? previous.theme
        : defaultDesign.theme,
    layout: isLayout(queryLayout)
      ? queryLayout
      : isLayout(previous.layout)
        ? previous.layout
        : defaultDesign.layout,
  };
}
