/**
 * The stored format of a multi-content-type-relation field: a JSON array of links, written by the admin input
 * (formatToStrapiField) and by the v4 => v5 migration. Both use toLink, so that a migrated value is the one the input
 * would write: same keys, same order.
 */
export type MCTRLink = {
  uid: string;
  documentId: string;
  MRCT: true;
  locale?: string;
};

export const toLink = (uid: string, documentId: string, locale?: string | null): MCTRLink =>
  locale ? { uid, documentId, MRCT: true, locale } : { uid, documentId, MRCT: true };

const linkedEntries = (value: string | null | undefined): string[] | undefined => {
  if (!value) return [];

  try {
    const links = JSON.parse(value);
    if (!Array.isArray(links)) return undefined;

    return links.map((link) => `${link?.uid}::${link?.documentId ?? link?.id}`);
  } catch {
    return undefined;
  }
};

/**
 * Whether two stored values link the same entries, in the same order. The locale is not compared: for the same link,
 * the input writes the edited locale when the linked entry has none (non-localized type), a migrated value none.
 * Values that aren't link lists are compared as strings.
 */
export const isSameLinkList = (a: string | null | undefined, b: string | null | undefined): boolean => {
  const [entriesA, entriesB] = [linkedEntries(a), linkedEntries(b)];
  if (!entriesA || !entriesB) return a === b;

  return entriesA.length === entriesB.length && entriesA.every((entry, index) => entry === entriesB[index]);
};
