import type { LegislationItem } from '../types';

export const LEGISLATION_CATEGORIES = ['Fondamental', 'Application', 'Autre'] as const;
export const LEGISLATION_TYPES = ['Loi', 'Ordonnance', 'Décret', 'Arrêté', 'Autre'] as const;
export const MAX_LEGISLATION_PDF_BYTES = 2 * 1024 * 1024;

export function normalizeLegislationUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  return url === '#' ? '' : url;
}

export function isAllowedLegislationUrl(value: unknown): boolean {
  const url = normalizeLegislationUrl(value);
  if (!url || /[\u0000-\u0020]/.test(url)) return false;

  if (/^data:application\/pdf;base64,[a-z0-9+/=]+$/i.test(url)) {
    return url.length <= Math.ceil(MAX_LEGISLATION_PDF_BYTES * 4 / 3) + 64;
  }

  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return true;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && Boolean(parsed.hostname)
      && !parsed.username
      && !parsed.password;
  } catch {
    return false;
  }
}

export function normalizeLegislationDraft(
  draft: Partial<LegislationItem>,
): Partial<LegislationItem> {
  return {
    ...draft,
    title: typeof draft.title === 'string' ? draft.title.replace(/\s+/g, ' ').trim() : draft.title,
    date: typeof draft.date === 'string' ? draft.date.trim() : draft.date,
    description: typeof draft.description === 'string' ? draft.description.trim() : draft.description,
    fileUrl: normalizeLegislationUrl(draft.fileUrl),
  };
}

export function validateLegislationDraft(draft: Partial<LegislationItem>): string | null {
  const normalized = normalizeLegislationDraft(draft);
  if (!normalized.title || normalized.title.length < 3) return 'Le titre doit contenir au moins 3 caractères.';
  if (!LEGISLATION_TYPES.includes(normalized.type as typeof LEGISLATION_TYPES[number])) return 'Sélectionnez un type de texte reconnu.';
  if (!LEGISLATION_CATEGORIES.includes(normalized.category as typeof LEGISLATION_CATEGORIES[number])) return 'Sélectionnez une catégorie reconnue.';
  if (!normalized.date) return 'La date du texte est obligatoire.';
  if (!isAllowedLegislationUrl(normalized.fileUrl)) return 'Ajoutez un lien HTTPS sécurisé ou un document PDF valide.';
  return null;
}

export function validateLegislationPdfMetadata(file: Pick<File, 'name' | 'size'>): string | null {
  if (!/\.pdf$/i.test(file.name)) return 'Seuls les fichiers PDF sont acceptés.';
  if (file.size <= 0) return 'Le fichier PDF est vide.';
  if (file.size > MAX_LEGISLATION_PDF_BYTES) return 'Le fichier PDF dépasse la limite de 2 Mo.';
  return null;
}

export function hasPdfSignature(header: Uint8Array): boolean {
  return header.length >= 5 && String.fromCharCode(...header.slice(0, 5)) === '%PDF-';
}
