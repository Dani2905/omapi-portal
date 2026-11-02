import { useCallback, useEffect, useState } from 'react';
import type { Formulaire, Guide, LegislationItem } from '../types';
import { apiRequest, getApiToken } from '../utils/apiAuth';
import {
  normalizeFormDraft,
  normalizeGuideDraft,
  validateFormDraft,
  validateGuideDraft,
} from '../utils/documentLibraryLogic';
import { normalizeLegislationDraft, validateLegislationDraft } from '../utils/legislationLogic';

type LibraryCollection = 'forms' | 'guides' | 'legislation';
type LibraryScope = LibraryCollection | 'all';
type LibraryItem = Formulaire | Guide | LegislationItem;
type NotifyFunction = (message: string, type: 'success' | 'error' | 'info') => void;

const LEGACY_STORAGE_KEYS: Record<LibraryCollection, string> = {
  forms: 'omapi_forms',
  guides: 'omapi_guides',
  legislation: 'omapi_legislation',
};

function clearLegacyLocalCopy(collection: LibraryCollection): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEYS[collection]);
  } catch {
    // API remains authoritative; inaccessible browser storage is left untouched.
  }
}

interface ApiResponse<T> {
  items?: T[];
  item?: T;
  error?: string;
}

function requestError(status: number, message?: string): string {
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
  if (status === 403) return 'Cette action est réservée aux membres autorisés de l’administration.';
  if (status === 404) return 'Ce document n’existe plus. Actualisez la page puis réessayez.';
  if (status === 400) return message || 'Les informations saisies ne sont pas valides.';
  return message || 'Le service documentaire OMAPI est momentanément indisponible.';
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return response.json().catch(() => ({} as ApiResponse<T>));
}

export function useApiLibrary(notify?: NotifyFunction, scope: LibraryScope = 'all') {
  const [forms, setForms] = useState<Formulaire[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [legislationItems, setLegislationItems] = useState<LegislationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError('');
    const collections: LibraryCollection[] = scope === 'all' ? ['forms', 'guides', 'legislation'] : [scope];
    try {
      const results = await Promise.all(collections.map(async (collection) => {
        const response = await apiRequest(`/api/content/${collection}`, {}, null);
        const payload = await readJson<LibraryItem>(response);
        if (!response.ok || !Array.isArray(payload.items)) {
          throw new Error(requestError(response.status, payload.error));
        }
        return [collection, payload.items] as const;
      }));
      for (const [collection, items] of results) {
        // Clear only this module's obsolete browser copy, and only after its API
        // collection has answered successfully. Never clear unrelated localStorage keys.
        clearLegacyLocalCopy(collection);
        if (collection === 'forms') setForms(items as Formulaire[]);
        if (collection === 'guides') setGuides(items as Guide[]);
        if (collection === 'legislation') setLegislationItems(items as LegislationItem[]);
      }
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Impossible de joindre l’API OMAPI.';
      setError(message);
      notify?.(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [notify, scope]);

  useEffect(() => { void refresh(); }, [refresh]);

  const save = useCallback(async <T extends LibraryItem>(collection: LibraryCollection, draft: Partial<T>): Promise<T | null> => {
    const normalized = collection === 'forms'
      ? normalizeFormDraft(draft as Partial<Formulaire>)
      : collection === 'guides'
        ? normalizeGuideDraft(draft as Partial<Guide>)
        : normalizeLegislationDraft(draft as Partial<LegislationItem>);
    const validationError = collection === 'forms'
      ? validateFormDraft(normalized as Partial<Formulaire>)
      : collection === 'guides'
        ? validateGuideDraft(normalized as Partial<Guide>)
        : validateLegislationDraft(normalized as Partial<LegislationItem>);
    if (validationError) {
      notify?.(validationError, 'error');
      return null;
    }

    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return null;
    }
    const itemId = (normalized as Partial<LibraryItem>).id;
    const isEdit = itemId !== undefined && itemId !== null && String(itemId) !== '';
    const path = isEdit
      ? `/api/admin/library/${collection}/${encodeURIComponent(String(itemId))}`
      : `/api/admin/library/${collection}`;
    try {
      const response = await apiRequest(path, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      }, token);
      const payload = await readJson<T>(response);
      if (!response.ok || !payload.item) {
        notify?.(requestError(response.status, payload.error), 'error');
        return null;
      }
      const saved = payload.item;
      if (collection === 'forms') setForms((current) => upsert(current, saved as Formulaire));
      if (collection === 'guides') setGuides((current) => upsert(current, saved as Guide));
      if (collection === 'legislation') setLegislationItems((current) => upsert(current, saved as LegislationItem));
      const label = collection === 'forms' ? 'Formulaire' : collection === 'guides' ? 'Guide' : 'Texte législatif';
      notify?.(`${label} ${isEdit ? 'mis à jour' : 'ajouté'} dans la base OMAPI.`, 'success');
      return saved;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. Aucune modification n’a été enregistrée.', 'error');
      return null;
    }
  }, [notify]);

  const remove = useCallback(async (collection: LibraryCollection, id: number | string): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/library/${collection}/${encodeURIComponent(String(id))}`, { method: 'DELETE' }, token);
      const payload = await readJson<LibraryItem>(response);
      if (!response.ok) {
        notify?.(requestError(response.status, payload.error), 'error');
        return false;
      }
      if (collection === 'forms') setForms((current) => current.filter((item) => String(item.id) !== String(id)));
      if (collection === 'guides') setGuides((current) => current.filter((item) => String(item.id) !== String(id)));
      if (collection === 'legislation') setLegislationItems((current) => current.filter((item) => String(item.id) !== String(id)));
      const label = collection === 'forms' ? 'Formulaire' : collection === 'guides' ? 'Guide' : 'Texte législatif';
      notify?.(`${label} supprimé de la base OMAPI.`, 'success');
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. Le document n’a pas été supprimé.', 'error');
      return false;
    }
  }, [notify]);

  const saveForm = useCallback((draft: Partial<Formulaire>) => save<Formulaire>('forms', draft), [save]);
  const saveGuide = useCallback((draft: Partial<Guide>) => save<Guide>('guides', draft), [save]);
  const saveLegislation = useCallback((draft: Partial<LegislationItem>) => save<LegislationItem>('legislation', draft), [save]);
  const deleteForm = useCallback((id: number | string) => remove('forms', id), [remove]);
  const deleteGuide = useCallback((id: number | string) => remove('guides', id), [remove]);
  const deleteLegislation = useCallback((id: number | string) => remove('legislation', id), [remove]);

  return {
    forms, guides, legislationItems, loading, error, refresh,
    saveForm, saveGuide, saveLegislation,
    deleteForm, deleteGuide, deleteLegislation,
  };
}

function upsert<T extends { id: number | string }>(items: T[], item: T): T[] {
  const index = items.findIndex((existing) => String(existing.id) === String(item.id));
  if (index < 0) return [item, ...items];
  return items.map((existing, currentIndex) => currentIndex === index ? item : existing);
}
