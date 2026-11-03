import { useCallback, useEffect, useState } from 'react';
import type { GopiItem, GopiOrder, JobApplication, JobOffer } from '../types';
import { apiRequest, getApiToken } from '../utils/apiAuth';
import {
  normalizeJobApplicationRecord,
  normalizeJobOfferDraft,
  validateJobOfferDraft,
} from '../utils/jobLogic';
import {
  canTransitionGopiOrder,
  normalizeGopiPublication,
  validateGopiPublication,
} from '../utils/gopiLogic';

type ModuleScope = 'jobs' | 'gopi' | 'all';
type NotifyFunction = (message: string, type: 'success' | 'error' | 'info') => void;
type SubmitResult = { ok: true } | { ok: false; error: string };

interface ApiResponse<T> {
  items?: T[];
  item?: T;
  id?: number;
  status?: JobApplication['status'];
  error?: string;
}

function clearLegacyCopies(collection: 'jobs' | 'gopi'): void {
  const keys = collection === 'jobs'
    ? ['omapi_jobs', 'omapi_job_applications']
    : ['omapi_gopi', 'omapi_gopi_orders'];
  try {
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Keep API data usable when browser storage is blocked.
  }
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return response.json().catch(() => ({} as ApiResponse<T>));
}

function apiError(status: number, message?: string): string {
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
  if (status === 403) return 'Cette action est réservée aux membres autorisés de l’administration.';
  if (status === 404) return 'Cet élément n’existe plus. Actualisez la page puis réessayez.';
  if (status === 409 || status === 400 || status === 429) return message || 'Cette opération ne peut pas être effectuée avec les informations fournies.';
  return message || 'Le service OMAPI est momentanément indisponible.';
}

function asJob(value: unknown): JobOffer | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isSafeInteger(id) || id < 1 || typeof row.title !== 'string') return null;
  return {
    id,
    title: row.title,
    department: typeof row.department === 'string' ? row.department : '',
    location: typeof row.location === 'string' ? row.location : '',
    type: row.type === 'CDD' || row.type === 'Stage' || row.type === 'Consultant' ? row.type : 'CDI',
    experience: typeof row.experience === 'string' ? row.experience : '',
    description: typeof row.description === 'string' ? row.description : '',
    status: row.status === 'Fermé' ? 'Fermé' : 'Ouvert',
    publishDate: typeof row.publishDate === 'string' ? row.publishDate : '',
    ...(typeof row.deadline === 'string' && row.deadline ? { deadline: row.deadline } : {}),
    ...(typeof row.fileUrl === 'string' && row.fileUrl ? { fileUrl: row.fileUrl } : {}),
  };
}

function asGopi(value: unknown): GopiItem | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isSafeInteger(id) || id < 1 || typeof row.title !== 'string') return null;
  return {
    id,
    title: row.title,
    date: typeof row.date === 'string' ? row.date : '',
    category: typeof row.category === 'string' ? row.category : '',
    ...(typeof row.description === 'string' ? { description: row.description } : {}),
    ...(typeof row.fileUrl === 'string' ? { fileUrl: row.fileUrl } : {}),
    ...(typeof row.fileName === 'string' ? { fileName: row.fileName } : {}),
    ...(typeof row.coverImage === 'string' ? { coverImage: row.coverImage } : {}),
  };
}

function asGopiOrder(value: unknown): GopiOrder | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = Number(row.id);
  const validStatuses: GopiOrder['status'][] = ['En attente', 'Paiement confirmé', 'Envoyé', 'Annulé'];
  const date = typeof row.date === 'string' ? row.date : '';
  if (!Number.isSafeInteger(id) || id < 1 || !date || !validStatuses.includes(row.status as GopiOrder['status'])) return null;
  const gopiId = row.gopiId === null || row.gopiId === undefined ? undefined : Number(row.gopiId);
  return {
    id,
    ...(Number.isSafeInteger(gopiId) && Number(gopiId) > 0 ? { gopiId: Number(gopiId) } : {}),
    gopiTitle: typeof row.gopiTitle === 'string' ? row.gopiTitle : '',
    customerName: typeof row.customerName === 'string' ? row.customerName : '',
    customerEmail: typeof row.customerEmail === 'string' ? row.customerEmail : '',
    customerPhone: typeof row.customerPhone === 'string' ? row.customerPhone : '',
    date,
    ...(Number.isFinite(Number(row.amountMGA)) ? { amountMGA: Number(row.amountMGA) } : {}),
    status: row.status as GopiOrder['status'],
    ...(typeof row.transactionRef === 'string' ? { transactionRef: row.transactionRef } : {}),
    ...(typeof row.paymentMethod === 'string' ? { paymentMethod: row.paymentMethod } : {}),
    ...(typeof row.paymentConfirmedAt === 'string' ? { paymentConfirmedAt: row.paymentConfirmedAt } : {}),
    ...(typeof row.sentAt === 'string' ? { sentAt: row.sentAt } : {}),
  };
}

function upsert<T extends { id: number | string }>(items: T[], item: T): T[] {
  const index = items.findIndex((current) => String(current.id) === String(item.id));
  if (index < 0) return [item, ...items];
  return items.map((current, currentIndex) => currentIndex === index ? item : current);
}

export function useApiRemainingModules(notify?: NotifyFunction, scope: ModuleScope = 'all', includePrivate = false) {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [gopiItems, setGopiItems] = useState<GopiItem[]>([]);
  const [gopiOrders, setGopiOrders] = useState<GopiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError('');
    const collections: Array<'jobs' | 'gopi'> = scope === 'all' ? ['jobs', 'gopi'] : [scope];
    let ok = true;
    await Promise.all(collections.map(async (collection) => {
      try {
        const response = await apiRequest(`/api/content/${collection}`, {}, null);
        const payload = await readJson<unknown>(response);
        if (!response.ok || !Array.isArray(payload.items)) throw new Error(apiError(response.status, payload.error));
        clearLegacyCopies(collection);
        if (collection === 'jobs') setJobs(payload.items.map(asJob).filter((item): item is JobOffer => item !== null));
        if (collection === 'gopi') setGopiItems(payload.items.map(asGopi).filter((item): item is GopiItem => item !== null));
      } catch (cause) {
        ok = false;
        const message = cause instanceof Error ? cause.message : 'Impossible de joindre l’API OMAPI.';
        setError(message);
        notify?.(message, 'error');
      }
    }));

    const token = includePrivate ? getApiToken() : null;
    if (includePrivate && token) {
      await Promise.all((['jobs', 'gopi'] as const).map(async (collection) => {
        try {
          const path = collection === 'jobs' ? '/api/admin/job-applications' : '/api/admin/gopi/orders';
          const response = await apiRequest(path, {}, token);
          const payload = await readJson<unknown>(response);
          if (!response.ok || !Array.isArray(payload.items)) throw new Error(apiError(response.status, payload.error));
          if (collection === 'jobs') {
            setJobApplications(payload.items.map(normalizeJobApplicationRecord).filter((item): item is JobApplication => item !== null));
            clearLegacyCopies('jobs');
          } else {
            setGopiOrders(payload.items.map(asGopiOrder).filter((item): item is GopiOrder => item !== null));
            clearLegacyCopies('gopi');
          }
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : 'Impossible de lire les dossiers privés OMAPI.';
          setError(message);
          notify?.(message, 'error');
          ok = false;
        }
      }));
    }
    setLoading(false);
    return ok;
  }, [includePrivate, notify, scope]);

  useEffect(() => { void refresh(); }, [refresh]);

  const saveCatalogue = useCallback(async <T extends JobOffer | GopiItem>(collection: 'jobs' | 'gopi', draft: Partial<T>): Promise<T | null> => {
    const normalized = collection === 'jobs'
      ? normalizeJobOfferDraft(draft as Partial<JobOffer>)
      : normalizeGopiPublication(draft as Partial<GopiItem>);
    const validationError = collection === 'jobs'
      ? validateJobOfferDraft(normalized as Partial<JobOffer>)
      : validateGopiPublication(normalized as Partial<GopiItem>);
    if (validationError) {
      notify?.(`${collection === 'jobs' ? 'Offre' : 'Publication GOPI'} non enregistrée : ${validationError}`, 'error');
      return null;
    }
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return null;
    }
    const id = (normalized as Partial<T>).id;
    const editing = id !== undefined && id !== null && String(id) !== '';
    try {
      const response = await apiRequest(`/api/admin/programs/${collection}${editing ? `/${encodeURIComponent(String(id))}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      }, token);
      const payload = await readJson<unknown>(response);
      const item = collection === 'jobs' ? asJob(payload.item) : asGopi(payload.item);
      if (!response.ok || !item) {
        notify?.(apiError(response.status, payload.error), 'error');
        return null;
      }
      if (collection === 'jobs') setJobs((current) => upsert(current, item as JobOffer));
      else setGopiItems((current) => upsert(current, item as GopiItem));
      notify?.(`${collection === 'jobs' ? 'Offre' : 'Publication GOPI'} ${editing ? 'mise à jour' : 'ajoutée'} dans la base OMAPI.`, 'success');
      return item as T;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. Aucune modification n’a été enregistrée.', 'error');
      return null;
    }
  }, [notify]);

  const removeCatalogue = useCallback(async (collection: 'jobs' | 'gopi', id: number | string): Promise<boolean> => {
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
      if (collection === 'jobs') setJobs((current) => current.filter((item) => String(item.id) !== String(id)));
      else setGopiItems((current) => current.filter((item) => String(item.id) !== String(id)));
      notify?.(`${collection === 'jobs' ? 'Offre' : 'Publication GOPI'} supprimée de la base OMAPI.`, 'success');
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. L’élément n’a pas été supprimé.', 'error');
      return false;
    }
  }, [notify]);

  const submitJobApplication = useCallback(async (draft: Partial<JobApplication>): Promise<SubmitResult> => {
    try {
      const response = await apiRequest('/api/public/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }, null);
      const payload = await readJson<unknown>(response);
      if (!response.ok) return { ok: false, error: apiError(response.status, payload.error) };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Impossible de joindre l’API OMAPI. La candidature n’a pas été envoyée.' };
    }
  }, []);

  const updateJobApplicationStatus = useCallback(async (application: Pick<JobApplication, 'id'>, status: JobApplication['status']): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/job-applications/${encodeURIComponent(String(application.id))}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }, token);
      const payload = await readJson(response);
      if (!response.ok || !payload.id || !payload.status) {
        notify?.(apiError(response.status, (payload as ApiResponse<unknown>).error), 'error');
        return false;
      }
      setJobApplications((current) => current.map((item) => String(item.id) === String(payload.id) ? { ...item, status: payload.status! } : item));
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. Le statut n’a pas changé.', 'error');
      return false;
    }
  }, [notify]);

  const deleteJobApplication = useCallback(async (id: number | string): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/job-applications/${encodeURIComponent(String(id))}`, { method: 'DELETE' }, token);
      const payload = await readJson<unknown>(response);
      if (!response.ok) {
        notify?.(apiError(response.status, payload.error), 'error');
        return false;
      }
      setJobApplications((current) => current.filter((item) => String(item.id) !== String(id)));
      notify?.('Candidature supprimée de la base OMAPI.', 'success');
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. La candidature n’a pas été supprimée.', 'error');
      return false;
    }
  }, [notify]);

  const submitGopiOrder = useCallback(async (draft: Partial<GopiOrder>): Promise<SubmitResult> => {
    try {
      const response = await apiRequest('/api/public/gopi-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      }, null);
      const payload = await readJson<unknown>(response);
      if (!response.ok) return { ok: false, error: apiError(response.status, payload.error) };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Impossible de joindre l’API OMAPI. La demande n’a pas été transmise.' };
    }
  }, []);

  const updateGopiOrder = useCallback(async (patch: Partial<GopiOrder>): Promise<boolean> => {
    if (patch.id === undefined || !patch.status) {
      notify?.('Mise à jour refusée : la commande ou son nouveau statut est manquant.', 'error');
      return false;
    }
    const current = gopiOrders.find((item) => String(item.id) === String(patch.id));
    if (!current) {
      notify?.('Cette commande n’existe plus. Actualisez la page puis réessayez.', 'error');
      return false;
    }
    if (!canTransitionGopiOrder(current.status, patch.status)) {
      notify?.(`Transition refusée : une commande « ${current.status} » ne peut pas devenir « ${patch.status} ».`, 'error');
      return false;
    }
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/gopi/orders/${encodeURIComponent(String(patch.id))}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }, token);
      const payload = await readJson<unknown>(response);
      const item = asGopiOrder(payload.item);
      if (!response.ok || !item) {
        notify?.(apiError(response.status, payload.error), 'error');
        return false;
      }
      setGopiOrders((items) => upsert(items, item));
      notify?.('Statut de la commande GOPI mis à jour dans la base OMAPI.', 'success');
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. La commande est inchangée.', 'error');
      return false;
    }
  }, [gopiOrders, notify]);

  const deleteGopiOrder = useCallback(async (id: number | string): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/gopi/orders/${encodeURIComponent(String(id))}`, { method: 'DELETE' }, token);
      const payload = await readJson<unknown>(response);
      if (!response.ok) {
        notify?.(apiError(response.status, payload.error), 'error');
        return false;
      }
      setGopiOrders((current) => current.filter((item) => String(item.id) !== String(id)));
      notify?.('Commande GOPI supprimée de la base OMAPI.', 'success');
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. La commande GOPI n’a pas été supprimée.', 'error');
      return false;
    }
  }, [notify]);

  const saveJob = useCallback((draft: Partial<JobOffer>) => saveCatalogue<JobOffer>('jobs', draft), [saveCatalogue]);
  const saveGopi = useCallback((draft: Partial<GopiItem>) => saveCatalogue<GopiItem>('gopi', draft), [saveCatalogue]);
  const deleteJob = useCallback((id: number | string) => removeCatalogue('jobs', id), [removeCatalogue]);
  const deleteGopi = useCallback((id: number | string) => removeCatalogue('gopi', id), [removeCatalogue]);

  return {
    jobs, jobApplications, gopiItems, gopiOrders, loading, error, refresh,
    saveJob, deleteJob, submitJobApplication, updateJobApplicationStatus, deleteJobApplication,
    saveGopi, deleteGopi, submitGopiOrder, updateGopiOrder, deleteGopiOrder,
  };
}
