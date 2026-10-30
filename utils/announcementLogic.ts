import type { Announcement } from '../types';

export const MAX_ANNOUNCEMENT_LENGTH = 240;

export function normalizeAnnouncementText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

export function validateAnnouncementText(value: unknown): string | null {
  const text = normalizeAnnouncementText(value);
  if (!text) return 'Le message ne peut pas être vide.';
  if (text.length > MAX_ANNOUNCEMENT_LENGTH) {
    return `Le message ne peut pas dépasser ${MAX_ANNOUNCEMENT_LENGTH} caractères.`;
  }
  return null;
}

export function normalizeAnnouncementDraft(
  draft: Partial<Announcement>,
): Partial<Announcement> {
  return { ...draft, text: normalizeAnnouncementText(draft.text) };
}

export function getActiveAnnouncements(items: unknown): Announcement[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item): Announcement[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const text = normalizeAnnouncementText(record.text);
    const rawActive = record.isActive;
    const isActive = rawActive === true
      || (typeof rawActive === 'string' && rawActive.toLowerCase() === 'true');
    const id = typeof record.id === 'number' ? record.id : Number.NaN;
    if (!isActive || !text || !Number.isFinite(id)) return [];
    return [{ ...record, id, text, isActive: true } as Announcement];
  });
}

export function getSafeAnnouncementIndex(index: number, count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  const normalizedIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
  return ((normalizedIndex % count) + count) % count;
}

export function getNextAnnouncementIndex(index: number, count: number, direction: -1 | 1 = 1): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return getSafeAnnouncementIndex(index + direction, count);
}
