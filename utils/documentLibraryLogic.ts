import { Formulaire, Guide } from '../types';

export const FORM_CATEGORIES = ['Marques', 'Brevets', 'Dessins', 'Autres'] as const;
export type FormCategory = typeof FORM_CATEGORIES[number];

export const GUIDE_ICONS = ['tag', 'bulb', 'swatch', 'book', 'globe', 'banknotes'] as const;
export const GUIDE_THEMES = ['blue', 'amber', 'purple', 'emerald', 'orange', 'gray'] as const;
export const MAX_LIBRARY_FILE_BYTES = 2 * 1024 * 1024;

const LIBRARY_FILE_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function normalizeLibraryUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed && trimmed !== '#' ? trimmed : '';
}

export function isAllowedLibraryUrl(value: unknown): boolean {
  const url = normalizeLibraryUrl(value);
  if (!url || /[\u0000-\u0020]/.test(url)) return false;
  if (/^data:(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,[a-z0-9+/=]+$/i.test(url)) {
    return url.length <= Math.ceil(MAX_LIBRARY_FILE_BYTES * 4 / 3) + 160;
  }
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

export function normalizeFormDraft(draft: Partial<Formulaire>): Partial<Formulaire> {
  return {
    ...draft,
    title: typeof draft.title === 'string' ? draft.title.replace(/\s+/g, ' ').trim() : draft.title,
    description: typeof draft.description === 'string' ? draft.description.trim() : draft.description,
    category: typeof draft.category === 'string' ? draft.category.trim() as Formulaire['category'] : draft.category,
    fileUrl: normalizeLibraryUrl(draft.fileUrl),
    fileName: typeof draft.fileName === 'string' ? draft.fileName.trim() : draft.fileName,
  };
}

export function validateFormDraft(draft: Partial<Formulaire>): string | null {
  if (!draft.title || draft.title.trim().length < 3) return 'Le titre doit contenir au moins 3 caractères.';
  if (!FORM_CATEGORIES.includes(draft.category as FormCategory)) return 'Sélectionnez une catégorie reconnue.';
  if (!isAllowedLibraryUrl(draft.fileUrl)) return 'Ajoutez un lien sécurisé (HTTPS) ou importez un document PDF, DOC ou DOCX valide.';
  return null;
}

export function normalizeGuideDraft(draft: Partial<Guide>): Partial<Guide> {
  return {
    ...draft,
    title: typeof draft.title === 'string' ? draft.title.replace(/\s+/g, ' ').trim() : draft.title,
    description: typeof draft.description === 'string' ? draft.description.trim() : draft.description,
    iconName: typeof draft.iconName === 'string' ? draft.iconName.trim() as Guide['iconName'] : draft.iconName,
    colorTheme: typeof draft.colorTheme === 'string' ? draft.colorTheme.trim() as Guide['colorTheme'] : draft.colorTheme,
    points: Array.isArray(draft.points)
      ? draft.points.filter((point): point is string => typeof point === 'string').map((point) => point.replace(/\s+/g, ' ').trim()).filter(Boolean)
      : [],
    fileUrl: normalizeLibraryUrl(draft.fileUrl),
    fileName: typeof draft.fileName === 'string' ? draft.fileName.trim() : draft.fileName,
  };
}

export function validateGuideDraft(draft: Partial<Guide>): string | null {
  if (!draft.title || draft.title.trim().length < 3) return 'Le titre doit contenir au moins 3 caractères.';
  if (!GUIDE_ICONS.includes(draft.iconName as typeof GUIDE_ICONS[number])) return 'Sélectionnez une icône reconnue.';
  if (!GUIDE_THEMES.includes(draft.colorTheme as typeof GUIDE_THEMES[number])) return 'Sélectionnez un thème de couleur reconnu.';
  if (!Array.isArray(draft.points) || draft.points.length > 20 || draft.points.some((point) => typeof point !== 'string' || point.trim().length > 180)) {
    return 'Les points clés doivent contenir au maximum 20 éléments de 180 caractères chacun.';
  }
  if (!isAllowedLibraryUrl(draft.fileUrl)) return 'Ajoutez un lien sécurisé (HTTPS) ou importez un document PDF, DOC ou DOCX valide.';
  return null;
}

export function validateLibraryFileMetadata(file: Pick<File, 'name' | 'size'>): string | null {
  const extension = /\.([^.]+)$/.exec(file.name)?.[1]?.toLowerCase();
  if (!extension || !(extension in LIBRARY_FILE_MIME)) return 'Format refusé : seuls les fichiers PDF, DOC et DOCX sont acceptés.';
  if (file.size <= 0) return 'Le fichier est vide.';
  if (file.size > MAX_LIBRARY_FILE_BYTES) return 'Le fichier dépasse la limite de 2 Mo.';
  return null;
}

export function isValidLibraryFileSignature(fileName: string, header: Uint8Array): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return header.length >= 5 && String.fromCharCode(...header.slice(0, 5)) === '%PDF-';
  if (extension === 'doc') return header.length >= 8 && [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((byte, index) => header[index] === byte);
  if (extension === 'docx') return header.length >= 4 && header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;
  return false;
}

export function libraryFileMime(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return LIBRARY_FILE_MIME[extension] || 'application/octet-stream';
}

export function getLibraryPlainText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<\s*br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
