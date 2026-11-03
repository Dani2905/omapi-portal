import { useCallback, useEffect, useState } from 'react';
import type { Event, EventRegistration, Formation, FormationRegistration } from '../types';
import { apiRequest, getApiToken } from '../utils/apiAuth';
import {
  normalizeFormationDraft,
  normalizeFormationRegistration,
  validateFormationDraft,
  validateFormationRegistration,
} from '../utils/formationLogic';
import {
  normalizeEventDraft,
  normalizeEventRecord,
  normalizeEventRegistrationDraft,
  validateEventDraft,
  validateEventRegistrationDraft,
} from '../utils/eventLogic';

type ProgrammeCollection = 'events' | 'formations';
type ProgrammeScope = ProgrammeCollection | 'all';
type NotifyFunction = (message: string, type: 'success' | 'error' | 'info') => void;
type RegistrationResult = { ok: true } | { ok: false; error: string };

interface ApiResponse<T> {
  items?: T[];
  item?: T;
  error?: string;
}

function clearLegacyCopies(collection: ProgrammeCollection): void {
  const keys = collection === 'events'
    ? ['omapi_events', 'omapi_event_registrations']
    : ['omapi_formations', 'omapi_formation_registrations'];
  try {
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Do not block successful API reads when browser storage is unavailable.
  }
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return response.json().catch(() => ({} as ApiResponse<T>));
}

function apiError(status: number, message?: string): string {
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
  if (status === 403) return 'Cette action est réservée aux membres autorisés de l’administration.';
  if (status === 404) return 'Cet élément n’existe plus. Actualisez la page puis réessayez.';
  if (status === 409) return message || 'Cette opération n’est plus possible dans l’état actuel des inscriptions.';
  if (status === 400) return message || 'Les informations saisies ne sont pas valides.';
  if (status === 429) return message || 'Trop de demandes. Réessayez un peu plus tard.';
  return message || 'Le service OMAPI est momentanément indisponible.';
}

function asFormation(value: unknown): Formation | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isSafeInteger(id) || id < 1 || typeof row.title !== 'string') return null;
  return {
    id,
    title: row.title,
    category: row.category === 'Avancee' ? 'Avancee' : 'Base',
    date: typeof row.date === 'string' ? row.date : '',
    time: typeof row.time === 'string' ? row.time : '',
    location: typeof row.location === 'string' ? row.location : '',
    description: typeof row.description === 'string' ? row.description : '',
    conditions: typeof row.conditions === 'string' ? row.conditions : '',
    ...(typeof row.colorTheme === 'string' ? { colorTheme: row.colorTheme as Formation['colorTheme'] } : {}),
    fileUrl: typeof row.fileUrl === 'string' ? row.fileUrl : '',
    fileName: typeof row.fileName === 'string' ? row.fileName : '',
  };
}

function asFormationRegistration(value: unknown): FormationRegistration | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = Number(row.id);
  const formationId = Number(row.formationId);
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(formationId) || formationId < 1) return null;
  return {
    id,
    formationId,
    name: typeof row.name === 'string' ? row.name : '',
    email: typeof row.email === 'string' ? row.email : '',
    phone: typeof row.phone === 'string' ? row.phone : '',
    ...(typeof row.organization === 'string' ? { organization: row.organization } : {}),
    ...(typeof row.message === 'string' ? { message: row.message } : {}),
    registrationDate: typeof row.registrationDate === 'string' ? row.registrationDate : '',
  };
}

export function useApiProgrammes(
  notify?: NotifyFunction,
  scope: ProgrammeScope = 'all',
  includeRegistrations = false,
) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [formationRegistrations, setFormationRegistrations] = useState<FormationRegistration[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError('');
    const collections: ProgrammeCollection[] = scope === 'all' ? ['formations', 'events'] : [scope];
    let ok = true;
    await Promise.all(collections.map(async (collection) => {
      try {
        const response = await apiRequest(`/api/content/${collection}`, {}, null);
        const payload = await readJson<unknown>(response);
        if (!response.ok || !Array.isArray(payload.items)) throw new Error(apiError(response.status, payload.error));
        clearLegacyCopies(collection);
        if (collection === 'formations') setFormations(payload.items.map(asFormation).filter((item): item is Formation => item !== null));
        if (collection === 'events') setEvents(payload.items.map(normalizeEventRecord).filter((item): item is Event => item !== null));
      } catch (cause) {
        ok = false;
        const message = cause instanceof Error ? cause.message : 'Impossible de joindre l’API OMAPI.';
        setError(message);
        notify?.(message, 'error');
      }
    }));

    const token = includeRegistrations ? getApiToken() : null;
    if (includeRegistrations && token) {
      await Promise.all((['events', 'formations'] as const).map(async (collection) => {
        try {
          const response = await apiRequest(`/api/admin/registrations/${collection}`, {}, token);
          const payload = await readJson<unknown>(response);
          if (!response.ok || !Array.isArray(payload.items)) throw new Error(apiError(response.status, payload.error));
          if (collection === 'events') {
            const registrations = payload.items.map((item) => {
              const row = item as Record<string, unknown>;
              const id = Number(row.id);
              const eventId = Number(row.eventId);
              if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(eventId) || eventId < 1) return null;
              return {
                id,
                eventId,
                name: typeof row.name === 'string' ? row.name : '',
                email: typeof row.email === 'string' ? row.email : '',
                phone: typeof row.phone === 'string' ? row.phone : '',
                ...(typeof row.organization === 'string' ? { organization: row.organization } : {}),
                registrationDate: typeof row.registrationDate === 'string' ? row.registrationDate : '',
              } satisfies EventRegistration;
            }).filter((item): item is EventRegistration => item !== null);
            setEventRegistrations(registrations);
            clearLegacyCopies('events');
          } else {
            setFormationRegistrations(payload.items.map(asFormationRegistration).filter((item): item is FormationRegistration => item !== null));
            clearLegacyCopies('formations');
          }
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : 'Impossible de lire les inscriptions OMAPI.';
          setError(message);
          notify?.(message, 'error');
          ok = false;
        }
      }));
    }
    setLoading(false);
    return ok;
  }, [includeRegistrations, notify, scope]);

  useEffect(() => { void refresh(); }, [refresh]);

  const saveCatalogueItem = useCallback(async <T extends Event | Formation>(
    collection: ProgrammeCollection,
    draft: Partial<T>,
  ): Promise<T | null> => {
    const normalized = collection === 'events'
      ? normalizeEventDraft(draft as Partial<Event>)
      : normalizeFormationDraft(draft as Partial<Formation>);
    const validationError = collection === 'events'
      ? validateEventDraft(normalized as Partial<Event>)
      : Object.values(validateFormationDraft(normalized as Partial<Formation>))[0];
    if (validationError) {
      notify?.(collection === 'events' ? `Événement non enregistré : ${validationError}` : `Formation non enregistrée : ${validationError}`, 'error');
      return null;
    }
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return null;
    }
    const id = (normalized as Partial<T>).id;
    const isEdit = id !== undefined && id !== null && String(id) !== '';
    const path = `/api/admin/programs/${collection}${isEdit ? `/${encodeURIComponent(String(id))}` : ''}`;
    try {
      const response = await apiRequest(path, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      }, token);
      const payload = await readJson<unknown>(response);
      const item = collection === 'events'
        ? normalizeEventRecord(payload.item)
        : asFormation(payload.item);
      if (!response.ok || !item) {
        notify?.(apiError(response.status, payload.error), 'error');
        return null;
      }
      if (collection === 'events') setEvents((current) => upsert(current, item as Event));
      else setFormations((current) => upsert(current, item as Formation));
      notify?.(`${collection === 'events' ? 'Événement' : 'Formation'} ${isEdit ? 'mis à jour' : 'ajouté'} dans la base OMAPI.`, 'success');
      return item as T;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. Aucune modification n’a été enregistrée.', 'error');
      return null;
    }
  }, [notify]);

  const removeCatalogueItem = useCallback(async (collection: ProgrammeCollection, id: number | string): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/programs/${collection}/${encodeURIComponent(String(id))}`, { method: 'DELETE' }, token);
      const payload = await readJson<unknown>(response);
      if (!response.ok) {
        notify?.(apiError(response.status, payload.error), 'error');
        return false;
      }
      if (collection === 'events') setEvents((current) => current.filter((item) => String(item.id) !== String(id)));
      else setFormations((current) => current.filter((item) => String(item.id) !== String(id)));
      notify?.(`${collection === 'events' ? 'Événement' : 'Formation'} supprimé${collection === 'events' ? '' : 'e'} de la base OMAPI.`, 'success');
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. L’élément n’a pas été supprimé.', 'error');
      return false;
    }
  }, [notify]);

  const deleteRegistration = useCallback(async (collection: ProgrammeCollection, id: number | string): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/registrations/${collection}/${encodeURIComponent(String(id))}`, { method: 'DELETE' }, token);
      const payload = await readJson<unknown>(response);
      if (!response.ok) {
        notify?.(apiError(response.status, payload.error), 'error');
        return false;
      }
      if (collection === 'events') setEventRegistrations((current) => current.filter((item) => String(item.id) !== String(id)));
      else setFormationRegistrations((current) => current.filter((item) => String(item.id) !== String(id)));
      notify?.('Inscription supprimée de la base OMAPI.', 'success');
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. L’inscription n’a pas été supprimée.', 'error');
      return false;
    }
  }, [notify]);

  const submitEventRegistration = useCallback(async (draft: Partial<EventRegistration>): Promise<RegistrationResult> => {
    const event = events.find((item) => String(item.id) === String(draft.eventId));
    if (!event) return { ok: false, error: 'Cet événement n’existe plus.' };
    const normalized = normalizeEventRegistrationDraft(draft);
    const validationError = validateEventRegistrationDraft(normalized, event, []);
    if (validationError) return { ok: false, error: validationError };
    try {
      const response = await apiRequest('/api/public/registrations/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      }, null);
      const payload = await readJson<unknown>(response);
      if (!response.ok) return { ok: false, error: apiError(response.status, payload.error) };
      setEvents((current) => current.map((item) => String(item.id) === String(event.id)
        ? { ...item, registrationCount: (item.registrationCount || 0) + 1 }
        : item));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Impossible de joindre l’API OMAPI. Votre inscription n’a pas été envoyée.' };
    }
  }, [events]);

  const submitFormationRegistration = useCallback(async (draft: Partial<FormationRegistration>): Promise<RegistrationResult> => {
    const formation = formations.find((item) => String(item.id) === String(draft.formationId));
    if (!formation) return { ok: false, error: 'Cette formation n’existe plus.' };
    const normalized = normalizeFormationRegistration({
      name: draft.name || '',
      email: draft.email || '',
      phone: draft.phone || '',
      organization: draft.organization || '',
      message: draft.message || '',
    });
    const validationError = validateFormationRegistration(normalized, formation, []);
    if (validationError) return { ok: false, error: validationError };
    try {
      const response = await apiRequest('/api/public/registrations/formations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...normalized, formationId: formation.id }),
      }, null);
      const payload = await readJson<unknown>(response);
      if (!response.ok) return { ok: false, error: apiError(response.status, payload.error) };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Impossible de joindre l’API OMAPI. Votre inscription n’a pas été envoyée.' };
    }
  }, [formations]);

  const saveFormation = useCallback((draft: Partial<Formation>) => saveCatalogueItem<Formation>('formations', draft), [saveCatalogueItem]);
  const saveEvent = useCallback((draft: Partial<Event>) => saveCatalogueItem<Event>('events', draft), [saveCatalogueItem]);
  const deleteFormation = useCallback((id: number | string) => removeCatalogueItem('formations', id), [removeCatalogueItem]);
  const deleteEvent = useCallback((id: number | string) => removeCatalogueItem('events', id), [removeCatalogueItem]);
  const deleteFormationRegistration = useCallback((id: number | string) => deleteRegistration('formations', id), [deleteRegistration]);
  const deleteEventRegistration = useCallback((id: number | string) => deleteRegistration('events', id), [deleteRegistration]);

  const saveFormationRegistration = useCallback(async (draft: Partial<FormationRegistration>): Promise<boolean> => (await submitFormationRegistration(draft)).ok, [submitFormationRegistration]);
  const saveEventRegistration = useCallback(async (draft: Partial<EventRegistration>): Promise<boolean> => (await submitEventRegistration(draft)).ok, [submitEventRegistration]);

  return {
    formations, events, formationRegistrations, eventRegistrations,
    loading, error, refresh,
    saveFormation, deleteFormation, saveEvent, deleteEvent,
    saveFormationRegistration, saveEventRegistration,
    submitFormationRegistration, submitEventRegistration,
    deleteFormationRegistration, deleteEventRegistration,
  };
}

function upsert<T extends { id: number | string }>(items: T[], item: T): T[] {
  const index = items.findIndex((existing) => String(existing.id) === String(item.id));
  if (index < 0) return [item, ...items];
  return items.map((existing, currentIndex) => currentIndex === index ? item : existing);
}
