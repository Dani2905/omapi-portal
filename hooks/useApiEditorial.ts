import { useCallback, useEffect, useState } from 'react';
import type { Announcement, NewsItem, Slide } from '../types';
import { apiRequest, getApiToken } from '../utils/apiAuth';

type EditorialCollection = 'news' | 'slides' | 'announcements';
type EditorialScope = EditorialCollection | 'hero' | 'all';
type EditorialItem = NewsItem | Slide | Announcement;
const ALL_COLLECTIONS: EditorialCollection[] = ['news', 'slides', 'announcements'];
const HERO_COLLECTIONS: EditorialCollection[] = ['news', 'slides'];
type NotifyFunction = (message: string, type: 'success' | 'error' | 'info') => void;

const LOCAL_KEYS: Record<EditorialCollection, string> = {
  news: 'omapi_news',
  slides: 'omapi_slides',
  announcements: 'omapi_announcements',
};

interface EditorialResponse<T> {
  items?: T[];
  item?: T;
  error?: string;
  ok?: boolean;
}

function errorMessage(status: number, error?: string): string {
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
  if (status === 403) return "Cette action est réservée à un administrateur.";
  if (status === 404) return "Cet élément n'existe plus. Actualisez la page puis réessayez.";
  if (status === 400) return error || 'Les informations saisies ne sont pas valides.';
  return error || "Le service de contenu est momentanément indisponible.";
}

async function readResponse<T>(response: Response): Promise<EditorialResponse<T>> {
  return response.json().catch(() => ({} as EditorialResponse<T>));
}

/** Shared API-backed source for the three editorial collections. Successful API reads
 * make the API authoritative and clear only the explicitly retired local editorial keys. */
export function useApiEditorial(notify?: NotifyFunction, scope: EditorialScope = 'all') {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const collections = scope === 'all' ? ALL_COLLECTIONS : scope === 'hero' ? HERO_COLLECTIONS : [scope];
      const results = await Promise.all(collections.map(async (collection) => {
        const response = await apiRequest(`/api/content/${collection}`, {}, null);
        const payload = await readResponse<EditorialItem>(response);
        if (!response.ok || !Array.isArray(payload.items)) {
          throw new Error(errorMessage(response.status, payload.error));
        }
        return [collection, payload.items] as const;
      }));

      for (const [collection, items] of results) {
        // The user chose to discard, not migrate, browser-local editorial data.
        // Only clear after a successful API response; never touch other local keys.
        try { localStorage.removeItem(LOCAL_KEYS[collection]); } catch { /* API remains authoritative. */ }
        if (collection === 'news') setNewsItems(items as NewsItem[]);
        if (collection === 'slides') setSlides(items as Slide[]);
        if (collection === 'announcements') setAnnouncements(items as Announcement[]);
      }
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Impossible de joindre l'API OMAPI.";
      setError(message);
      notify?.(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [notify, scope]);

  useEffect(() => { void refresh(); }, [refresh]);

  const save = useCallback(async <T extends EditorialItem>(collection: EditorialCollection, draft: Partial<T>): Promise<T | null> => {
    const token = getApiToken();
    if (!token) {
      const message = 'Session absente ou expirée. Reconnectez-vous puis réessayez.';
      notify?.(message, 'error');
      return null;
    }
    const isEdit = draft.id !== undefined && draft.id !== null && String(draft.id) !== '';
    const path = isEdit
      ? `/api/admin/editorial/${collection}/${encodeURIComponent(String(draft.id))}`
      : `/api/admin/editorial/${collection}`;
    try {
      const response = await apiRequest(path, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }, token);
      const payload = await readResponse<T>(response);
      if (!response.ok || !payload.item) {
        notify?.(errorMessage(response.status, payload.error), 'error');
        return null;
      }
      const item = payload.item;
      if (collection === 'news') setNewsItems((current) => upsert(current, item as NewsItem));
      if (collection === 'slides') setSlides((current) => upsert(current, item as Slide));
      if (collection === 'announcements') setAnnouncements((current) => upsert(current, item as Announcement));
      if (collection !== 'news') notify?.('Contenu enregistré dans la base de données OMAPI.', 'success');
      return item;
    } catch {
      notify?.("Impossible de joindre l'API OMAPI. Votre modification n'a pas été enregistrée.", 'error');
      return null;
    }
  }, [notify]);

  const remove = useCallback(async (collection: EditorialCollection, id: number | string): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/editorial/${collection}/${encodeURIComponent(String(id))}`, { method: 'DELETE' }, token);
      const payload = await readResponse<EditorialItem>(response);
      if (!response.ok) {
        notify?.(errorMessage(response.status, payload.error), 'error');
        return false;
      }
      if (collection === 'news') setNewsItems((current) => current.filter((item) => String(item.id) !== String(id)));
      if (collection === 'slides') setSlides((current) => current.filter((item) => String(item.id) !== String(id)));
      if (collection === 'announcements') setAnnouncements((current) => current.filter((item) => String(item.id) !== String(id)));
      notify?.('Contenu supprimé de la base de données OMAPI.', 'success');
      return true;
    } catch {
      notify?.("Impossible de joindre l'API OMAPI. L'élément n'a pas été supprimé.", 'error');
      return false;
    }
  }, [notify]);

  const saveNews = useCallback((draft: Partial<NewsItem>) => save<NewsItem>('news', draft), [save]);
  const saveSlide = useCallback((draft: Partial<Slide>) => save<Slide>('slides', draft), [save]);
  const saveAnnouncement = useCallback((draft: Partial<Announcement>) => save<Announcement>('announcements', draft), [save]);
  const deleteNews = useCallback((id: number | string) => remove('news', id), [remove]);
  const deleteSlide = useCallback((id: number | string) => remove('slides', id), [remove]);
  const deleteAnnouncement = useCallback((id: number | string) => remove('announcements', id), [remove]);

  return {
    newsItems, slides, announcements, loading, error, refresh,
    saveNews, saveSlide, saveAnnouncement,
    deleteNews, deleteSlide, deleteAnnouncement,
  };
}

function upsert<T extends { id: number | string }>(items: T[], item: T): T[] {
  const index = items.findIndex((existing) => String(existing.id) === String(item.id));
  if (index < 0) return [item, ...items];
  return items.map((existing, currentIndex) => currentIndex === index ? item : existing);
}
