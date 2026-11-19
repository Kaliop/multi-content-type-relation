import { describe, expect, it } from 'vitest';

import { flattenObj, unflatten } from '../server/src/helpers';

describe('flattenObj / unflatten (REST hydration)', () => {
  it('keeps null values, dates, empty lists and empty objects', () => {
    const entry = {
      title: 'Lyon',
      picture: { alt: null, image: { caption: null, url: '/lyon.jpg' } },
      tags: [],
      seo: {},
      blocks: [{ title: 'Block', link: null }],
      publishedAt: new Date('2026-11-01T00:00:00.000Z'),
    };

    expect(unflatten(flattenObj(entry, null))).toEqual(entry);
  });
});
