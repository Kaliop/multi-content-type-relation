import { describe, expect, it } from 'vitest';

import controller from '../server/src/controllers/controller';

const article = 'api::article.article';

/** The rows of the document service: "doc1" has a draft and no published version, another draft comes before it */
const rows = [
  { documentId: 'first', locale: 'fr', title: 'Another entry', publishedAt: null },
  { documentId: 'doc1', locale: 'fr', title: 'Draft only', publishedAt: null },
];

/** POST /multi-content-type-relation/validate-relations: the entries the admin input shows for stored links */
const validateRelations = async (entries: object[]) => {
  const matches = (filter: Record<string, any>) => (row: Record<string, any>) =>
    (filter.status === 'draft' ? row.publishedAt === null : row.publishedAt !== null) &&
    (!filter.documentId || row.documentId === filter.documentId) &&
    (!filter.locale || row.locale === filter.locale);
  const strapi = {
    contentTypes: { [article]: { info: { displayName: 'Article' } } },
    documents: () => ({
      findOne: async (filter: object) => rows.find(matches(filter)) ?? null,
      findFirst: async (filter: object) => rows.find(matches(filter)) ?? null,
    }),
    plugin: () => ({ service: () => ({ getFirstStringFieldInContentType: () => 'title' }) }),
  };

  return controller({ strapi } as any).validateRelations({ request: { body: { entries } } });
};

describe('validateRelations', () => {
  it("shows the linked entry's draft when it has no published version, not another entry", async () => {
    const result = await validateRelations([{ uid: article, documentId: 'doc1', MRCT: true, locale: 'fr' }]);

    expect(result.map(({ item }: any) => item.documentId)).toEqual(['doc1']);
  });

  it('drops a link to an entry that no longer exists', async () => {
    expect(await validateRelations([{ uid: article, documentId: 'deleted', MRCT: true, locale: 'fr' }])).toEqual([]);
  });
});
