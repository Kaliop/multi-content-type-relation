import { describe, expect, it } from 'vitest';

import { formatToStrapiField } from '../admin/src/helpers/format';
import { isSameLinkList, toLink } from '../shared/links';

const entry = (uid: string, documentId: string) =>
  ({ uid, displayName: '', searchableField: '', item: { id: '1', documentId } }) as any;

describe('toLink', () => {
  it('writes uid, documentId, MRCT, locale, in that order', () => {
    expect(JSON.stringify(toLink('api::article.article', 'abc', 'fr'))).toBe(
      '{"uid":"api::article.article","documentId":"abc","MRCT":true,"locale":"fr"}'
    );
  });

  it('has no locale without one (non-localized type)', () => {
    expect(toLink('api::author.author', 'abc', null)).toEqual({ uid: 'api::author.author', documentId: 'abc', MRCT: true });
    expect(toLink('api::author.author', 'abc')).not.toHaveProperty('locale');
  });
});

describe('formatToStrapiField', () => {
  it('is empty without entries', () => {
    expect(formatToStrapiField([], 'fr')).toBe('');
  });

  it('writes the links with the edited locale', () => {
    expect(formatToStrapiField([entry('api::article.article', 'a'), entry('api::author.author', 'b')], 'fr')).toBe(
      JSON.stringify([toLink('api::article.article', 'a', 'fr'), toLink('api::author.author', 'b', 'fr')])
    );
  });
});

describe('isSameLinkList', () => {
  const migrated = '[{"uid":"api::article.article","documentId":"a","locale":"fr","MRCT":true},{"uid":"api::author.author","documentId":"b","locale":null,"MRCT":true}]';

  it('ignores the key order and the locale', () => {
    const written = formatToStrapiField([entry('api::article.article', 'a'), entry('api::author.author', 'b')], 'fr');

    expect(written).not.toBe(migrated);
    expect(isSameLinkList(written, migrated)).toBe(true);
  });

  it('sees another order, another entry or a removed entry', () => {
    const [a, b] = [toLink('api::article.article', 'a', 'fr'), toLink('api::author.author', 'b', 'fr')];

    expect(isSameLinkList(JSON.stringify([b, a]), migrated)).toBe(false);
    expect(isSameLinkList(JSON.stringify([a, toLink('api::author.author', 'c', 'fr')]), migrated)).toBe(false);
    expect(isSameLinkList(JSON.stringify([a]), migrated)).toBe(false);
  });

  it('sees the same entry in another content type', () => {
    expect(
      isSameLinkList(JSON.stringify([toLink('api::article.article', 'a')]), JSON.stringify([toLink('api::event.event', 'a')]))
    ).toBe(false);
  });

  it('treats empty values alike', () => {
    expect(isSameLinkList('', null)).toBe(true);
    expect(isSameLinkList('', undefined)).toBe(true);
    expect(isSameLinkList('', '[]')).toBe(true);
    expect(isSameLinkList('', migrated)).toBe(false);
  });

  it('compares values that are not link lists as strings', () => {
    expect(isSameLinkList('not json', 'not json')).toBe(true);
    expect(isSameLinkList('not json', '')).toBe(false);
    expect(isSameLinkList('{"uid":"x"}', '')).toBe(false);
  });

  it('tells a v4 link from the v5 link of the same id', () => {
    expect(isSameLinkList('[{"uid":"api::article.article","id":12,"MRCT":true}]', JSON.stringify([toLink('api::article.article', 'a')]))).toBe(false);
  });
});
