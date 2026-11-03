import { toLink } from '../../../shared/links';
import { SelectedEntry } from '../interface';

export const formatToStrapiField = (entries: SelectedEntry[], locale: string) => {
  if (entries.length === 0) return '';

  return JSON.stringify(entries.map((entry) => toLink(entry.uid, entry.item.documentId, locale)));
};
