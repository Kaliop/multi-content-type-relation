import { toLink } from '../../../shared/links';
import { SelectedEntry } from '../interface';

/**
 * Each link keeps the locale of the linked entry, as stored (validate-relations) or found (search, in the edited
 * locale): a change to the list no longer rewrites every link with the edited locale. The edited locale is the
 * fallback, for an entry without one.
 */
export const formatToStrapiField = (entries: SelectedEntry[], locale: string) => {
  if (entries.length === 0) return '';

  return JSON.stringify(entries.map((entry) => toLink(entry.uid, entry.item.documentId, entry.item.locale ?? locale)));
};
