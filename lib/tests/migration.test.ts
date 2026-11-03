import { describe, expect, it, vi } from 'vitest';

import migrationService from '../server/src/services/migration';
import { formatToStrapiField } from '../admin/src/helpers/format';

/**
 * A Strapi with one content type holding an MCTR field, and the rows of every table in memory.
 * Only what the migration uses: schemas, db.query().findMany/findOne/update, log.
 */
const fakeStrapi = (tables: Record<string, Record<string, any>[]>) => {
  const query = (uid: string) => ({
    findMany: vi.fn(async ({ where }: any) => {
      const [field] = Object.keys(where);
      return (tables[uid] ?? []).filter((row) => row[field] != null);
    }),
    findOne: vi.fn(async ({ where }: any) => (tables[uid] ?? []).find((row) => row.id === where.id) ?? null),
    update: vi.fn(async ({ where, data }: any) => {
      Object.assign(tables[uid].find((row) => row.id === where.id)!, data);
    }),
  });

  return {
    contentTypes: {
      'api::page.page': {
        uid: 'api::page.page',
        attributes: {
          title: { type: 'string' },
          links: { type: 'customField', customField: 'plugin::multi-content-type-relation.multi-content-type-relation' },
          count: { type: 'integer' },
        },
      },
    },
    components: {},
    db: { query },
    log: { info: vi.fn(), warn: vi.fn() },
  } as any;
};

const migrate = async (tables: Record<string, Record<string, any>[]>) => {
  const result = await migrationService({ strapi: fakeStrapi(tables) }).migrateV4ToV5();
  return { result, links: JSON.parse(tables['api::page.page'][0].links) };
};

describe('migrateV4ToV5', () => {
  it('writes what the admin input writes for the same links', async () => {
    const tables = {
      'api::page.page': [{ id: 1, links: '[{"uid":"api::article.article","id":12,"MRCT":true}]' }],
      'api::article.article': [{ id: 12, documentId: 'doc12', locale: 'fr' }],
    };

    const { result } = await migrate(tables);

    expect(tables['api::page.page'][0].links).toBe(
      formatToStrapiField([{ uid: 'api::article.article', item: { documentId: 'doc12' } } as any], 'fr')
    );
    expect(result).toEqual({ success: true, rows: 1, relations: 1 });
  });

  it('has no locale for a non-localized target', async () => {
    const { links } = await migrate({
      'api::page.page': [{ id: 1, links: '[{"uid":"api::author.author","id":3,"MRCT":true}]' }],
      'api::author.author': [{ id: 3, documentId: 'doc3', locale: null }],
    });

    expect(links).toEqual([{ uid: 'api::author.author', documentId: 'doc3', MRCT: true }]);
  });

  it('keeps v5 links and links to deleted entries as they are', async () => {
    const v5Link = { uid: 'api::article.article', documentId: 'done', MRCT: true, locale: 'en' };
    const deleted = { uid: 'api::article.article', id: 99, MRCT: true };
    const { links, result } = await migrate({
      'api::page.page': [{ id: 1, links: JSON.stringify([v5Link, deleted]) }],
      'api::article.article': [],
    });

    expect(links).toEqual([v5Link, deleted]);
    expect(result.rows).toBe(0);
  });

  it('skips values that are not MCTR fields', async () => {
    const tables = {
      'api::page.page': [{ id: 1, title: 'MRCT', links: '[{"uid":"api::article.article","id":12}]' }],
      'api::article.article': [{ id: 12, documentId: 'doc12', locale: 'fr' }],
    };

    const { result } = await migrate(tables);

    expect(tables['api::page.page'][0]).toEqual({ id: 1, title: 'MRCT', links: '[{"uid":"api::article.article","id":12}]' });
    expect(result.rows).toBe(0);
  });
});
