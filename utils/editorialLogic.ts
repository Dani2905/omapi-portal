import type { NewsItem, Slide } from '../types';
import { getLibraryPlainText } from './documentLibraryLogic';

export const NEWS_CATEGORIES = [
  'Annonce', 'Actualité', 'Blog', 'Déclaration', 'Événement', 'International', 'Juridique', 'Formation', 'Innovation',
] as const;
export const MAX_NEWS_TITLE_LENGTH = 180;
export const MAX_NEWS_DESCRIPTION_LENGTH = 500;
export const MAX_NEWS_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_NEWS_IMAGE_DATA_URL_LENGTH = 2 * 1024 * 1024;

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0, janv: 0, jan: 0,
  février: 1, fevrier: 1, févr: 1, fevr: 1, fév: 1, fev: 1,
  mars: 2,
  avril: 3, avr: 3,
  mai: 4,
  juin: 5,
  juillet: 6, juil: 6,
  août: 7, aout: 7,
  septembre: 8, sept: 8,
  octobre: 9, oct: 9,
  novembre: 10, nov: 10,
  décembre: 11, decembre: 11, déc: 11, dec: 11,
};

export function normalizeNewsText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

export function normalizeNewsDraft(draft: Partial<NewsItem>): Partial<NewsItem> {
  return {
    ...draft,
    title: normalizeNewsText(draft.title),
    date: normalizeNewsText(draft.date),
    category: normalizeNewsText(draft.category),
    description: normalizeNewsText(draft.description),
    image: typeof draft.image === 'string' ? draft.image.trim() : '',
    content: typeof draft.content === 'string' ? sanitizeNewsHtml(draft.content) : '',
    featured: draft.featured === true,
  };
}

export function validateNewsDraft(draft: Partial<NewsItem>): string | null {
  const normalized = normalizeNewsDraft(draft);
  if (!normalized.title || normalized.title.length < 3) return 'Le titre doit contenir au moins 3 caractères.';
  if (normalized.title.length > MAX_NEWS_TITLE_LENGTH) return `Le titre ne peut pas dépasser ${MAX_NEWS_TITLE_LENGTH} caractères.`;
  if (!NEWS_CATEGORIES.includes(normalized.category as typeof NEWS_CATEGORIES[number])) return 'Sélectionnez une catégorie reconnue.';
  if (!normalized.date) return 'La date de publication est obligatoire.';
  if (!normalized.description) return 'La description courte est obligatoire.';
  if (normalized.description.length > MAX_NEWS_DESCRIPTION_LENGTH) return `La description ne peut pas dépasser ${MAX_NEWS_DESCRIPTION_LENGTH} caractères.`;
  if (normalized.image && !isAllowedNewsImageUrl(normalized.image)) return 'L’image doit utiliser une URL HTTPS, un chemin local ou une image importée valide.';
  return null;
}

export function isAllowedNewsImageUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const image = value.trim();
  if (!image || /[\u0000-\u0020]/.test(image)) return false;
  if (/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(image)) {
    return image.length <= MAX_NEWS_IMAGE_DATA_URL_LENGTH;
  }
  if (image.startsWith('/') && !image.startsWith('//') && !image.includes('\\')) return true;
  try {
    const parsed = new URL(image);
    return parsed.protocol === 'https:' && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

const ALLOWED_RICH_TAGS = new Set([
  'p', 'br', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'pre', 'code', 'a',
]);
const DROP_RICH_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form', 'input', 'button', 'video', 'audio', 'source', 'img',
]);

export function sanitizeNewsHtml(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  if (typeof DOMParser === 'undefined') {
    return value
      .replace(/<\s*(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
      .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
  }

  const document = new DOMParser().parseFromString(value, 'text/html');
  const sanitizeChildren = (parent: ParentNode) => {
    Array.from(parent.childNodes).forEach((node) => {
      if (!(node instanceof Element)) return;
      const tag = node.tagName.toLowerCase();
      if (DROP_RICH_TAGS.has(tag)) {
        node.remove();
        return;
      }
      if (!ALLOWED_RICH_TAGS.has(tag)) {
        sanitizeChildren(node);
        node.replaceWith(...Array.from(node.childNodes));
        return;
      }

      const href = tag === 'a' ? node.getAttribute('href')?.trim() : undefined;
      Array.from(node.attributes).forEach((attribute) => node.removeAttribute(attribute.name));
      if (tag === 'a' && href && isAllowedNewsLink(href)) {
        node.setAttribute('href', href);
        node.setAttribute('rel', 'noopener noreferrer');
        node.setAttribute('target', '_blank');
      }
      sanitizeChildren(node);
    });
  };

  sanitizeChildren(document.body);
  return document.body.innerHTML;
}

function isAllowedNewsLink(value: string): boolean {
  if (!value || /[\u0000-\u0020]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return true;
  if (value.startsWith('#')) return true;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'https:' || parsed.protocol === 'mailto:')
      && !parsed.username
      && !parsed.password;
  } catch {
    return false;
  }
}

export function parseEditorialDate(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const text = value.trim().toLocaleLowerCase('fr').replace(/[,]/g, '').replace(/\./g, '');
  if (!text) return null;

  const numeric = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    const year = Number(numeric[3]);
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date.getTime() : null;
  }

  const french = text.match(/^(\d{1,2})\s+([a-zà-ÿ]+)\s+(\d{4})$/i);
  if (french) {
    const month = FRENCH_MONTHS[french[2]];
    if (month === undefined) return null;
    const day = Number(french[1]);
    const year = Number(french[3]);
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date.getTime() : null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function sortNewsItems(items: NewsItem[]): NewsItem[] {
  return items
    .map((item, index) => ({ item, index, dateValue: parseEditorialDate(item.date), idValue: Number(item.id) }))
    .sort((a, b) => {
      const aValue = a.dateValue ?? (Number.isFinite(a.idValue) && a.idValue > 1_000_000_000_000 ? a.idValue : Number.NEGATIVE_INFINITY);
      const bValue = b.dateValue ?? (Number.isFinite(b.idValue) && b.idValue > 1_000_000_000_000 ? b.idValue : Number.NEGATIVE_INFINITY);
      return bValue - aValue || a.index - b.index;
    })
    .map(({ item }) => item);
}

export function getHomepageNewsSection(category: unknown): 'news' | 'blog' | 'remarks' {
  if (category === 'Blog') return 'blog';
  if (category === 'Déclaration') return 'remarks';
  return 'news';
}

export function buildEditorialSlides(managedSlides: Slide[], newsItems: NewsItem[]): Slide[] {
  const editorialSlides: Slide[] = sortNewsItems(newsItems)
    .filter((item) => item.featured === true)
    .map((item) => ({
      id: -Math.abs(item.id) - 1,
      image: item.image || '',
      title: item.title,
      subtitle: item.description,
      ctaText: 'Lire l’actualité',
      ctaLink: `/news/${item.id}`,
      newsId: item.id,
    }));

  // Les slides liés à une actualité sont générés depuis la fiche éditoriale.
  // Ignorer les anciennes copies synchronisées pour éviter les doublons.
  return [...managedSlides.filter((slide) => slide.newsId === undefined), ...editorialSlides];
}

export function getNewsPlainText(value: unknown): string {
  return getLibraryPlainText(sanitizeNewsHtml(value));
}
