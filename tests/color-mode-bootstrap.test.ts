import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { COLOR_MODE_KEY } from '../src/lib/color-mode';
import {
  palettes,
  layouts,
  defaultDesign,
  DESIGN_KEY,
} from '../src/lib/design';

// Execute the actual pre-paint script, independently from the later controller.
const source = readFileSync(
  new URL('../src/layouts/Base.astro', import.meta.url),
  'utf8',
);
const bootstrap = source.match(
  /<script\s+is:inline\s+define:vars=\{\{\s*appearanceSeed\s*\}\}>\s*([\s\S]*?)<\/script>/,
)![1];

function firstPaint(saved: unknown, browserDark: boolean, blocked = false) {
  const dataset: Record<string, string> = {};
  runInNewContext(bootstrap, {
    appearanceSeed: {
      paletteIds: Object.keys(palettes),
      layoutIds: Object.keys(layouts),
      defaults: defaultDesign,
      storageKey: DESIGN_KEY,
      modeStorageKey: COLOR_MODE_KEY,
    },
    localStorage: {
      getItem(key: string) {
        if (blocked) throw new Error('Storage unavailable');
        return key === COLOR_MODE_KEY ? saved : null;
      },
    },
    location: { search: '?theme=mineral&layout=panorama' },
    URLSearchParams,
    document: { documentElement: { dataset } },
    matchMedia: () => ({ matches: browserDark }),
  });
  return dataset;
}

describe('Theme before first paint', () => {
  it.each([
    [null, false, 'light'],
    [null, true, 'dark'],
    ['light', true, 'light'],
    ['dark', false, 'dark'],
    ['corrupt', true, 'dark'],
  ])(
    'resolves saved %s with browser dark=%s to %s',
    (saved, browserDark, mode) => {
      expect(firstPaint(saved, browserDark as boolean)).toEqual({
        theme: 'mineral',
        layout: 'panorama',
        mode,
      });
    },
  );
  it('still follows the browser when preference storage is blocked', () => {
    expect(firstPaint(null, true, true).mode).toBe('dark');
    expect(firstPaint(null, false, true).mode).toBe('light');
  });
});
