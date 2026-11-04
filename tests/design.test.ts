import { describe, expect, it } from 'vitest';
import { defaultDesign, resolveDesign } from '../src/lib/design';

describe('Independent design preferences', () => {
  it('starts with the selected Grove/panorama design', () => {
    expect(resolveDesign(new URLSearchParams(), null)).toEqual(defaultDesign);
  });
  it('changes color without resetting a saved layout', () => {
    expect(
      resolveDesign(new URLSearchParams('theme=tide'), {
        theme: 'grove',
        layout: 'reverse',
      }),
    ).toEqual({ theme: 'tide', layout: 'reverse' });
  });
  it('changes layout without resetting a saved color', () => {
    expect(
      resolveDesign(new URLSearchParams('layout=arch'), {
        theme: 'precision',
        layout: 'classic',
      }),
    ).toEqual({ theme: 'precision', layout: 'arch' });
  });
  it('lets a shared URL override both stored choices', () => {
    expect(
      resolveDesign(
        new URLSearchParams('theme=studio&layout=portrait'),
        defaultDesign,
      ),
    ).toEqual({ theme: 'studio', layout: 'portrait' });
  });
  it('ignores malformed stored values and unrecognized query strings', () => {
    expect(
      resolveDesign(
        new URLSearchParams('theme=__proto__&layout=arbitrary'),
        'corrupt',
      ),
    ).toEqual(defaultDesign);
  });
});
