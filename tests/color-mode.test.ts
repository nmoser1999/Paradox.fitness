import { describe, expect, it } from 'vitest';
import { colorPreference, resolveColorMode } from '../src/lib/color-mode';

describe('Site color mode preference', () => {
  it('follows either browser preference for a first visit', () => {
    expect(resolveColorMode(null, false)).toBe('light');
    expect(resolveColorMode(null, true)).toBe('dark');
  });
  it('keeps a manual choice when the browser preference changes', () => {
    expect(resolveColorMode('light', true)).toBe('light');
    expect(resolveColorMode('dark', false)).toBe('dark');
  });
  it('restores automatic behavior when the choice is cleared', () => {
    expect(colorPreference(null)).toBe('system');
    expect(resolveColorMode('system', false)).toBe('light');
    expect(resolveColorMode('system', true)).toBe('dark');
  });
  it('ignores corrupt and unsupported saved values', () => {
    for (const value of ['', 'auto', {}, false, '__proto__']) {
      expect(colorPreference(value)).toBe('system');
      expect(resolveColorMode(value, true)).toBe('dark');
    }
  });
});
