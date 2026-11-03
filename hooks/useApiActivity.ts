import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityLog } from '../types';
import { apiRequest, getApiToken } from '../utils/apiAuth';

type NotifyFunction = (message: string, type: 'success' | 'error' | 'info') => void;

interface ActivityResponse {
  items?: unknown[];
  ids?: string[];
  error?: string;
}

async function readJson(response: Response): Promise<ActivityResponse> {
  return response.json().catch(() => ({} as ActivityResponse));
}

function normalizeActivity(value: unknown): ActivityLog | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isSafeInteger(id) || id < 1 || typeof row.action !== 'string' || typeof row.details !== 'string') return null;
  return {
    id,
    ...(typeof row.userId === 'string' ? { userId: row.userId } : {}),
    ...(typeof row.userName === 'string' ? { userName: row.userName } : {}),
    ...(typeof row.entityKey === 'string' ? { entityKey: row.entityKey } : {}),
    ...(typeof row.entityId === 'string' || typeof row.entityId === 'number' ? { entityId: row.entityId } : {}),
    action: row.action,
    details: row.details,
    timestamp: typeof row.timestamp === 'string' ? row.timestamp : '',
  };
}

function apiError(status: number, message?: string): string {
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
  if (status === 403) return 'L’accès au journal et aux notifications est réservé aux membres autorisés de l’administration.';
  return message || 'Le service du journal/notifications OMAPI est momentanément indisponible.';
}

function clearLegacyKey(key: 'omapi_activities' | 'omapi_read_notifications') {
  try {
    localStorage.removeItem(key);
  } catch {
    // API data remains usable when browser storage is unavailable.
  }
}

export function useApiActivity(notify?: NotifyFunction) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      setLoading(false);
      return false;
    }
    setLoading(true);
    setError('');
    let ok = true;
    await Promise.all(([
      { path: '/api/admin/activity-logs', key: 'omapi_activities' as const },
      { path: '/api/admin/notification-reads', key: 'omapi_read_notifications' as const },
    ]).map(async ({ path, key }) => {
      try {
        const response = await apiRequest(path, {}, token);
        const payload = await readJson(response);
        if (!response.ok) throw new Error(apiError(response.status, payload.error));
        if (key === 'omapi_activities') {
          if (!Array.isArray(payload.items)) throw new Error('Réponse du journal d’activité invalide.');
          setActivityLogs(payload.items.map(normalizeActivity).filter((item): item is ActivityLog => item !== null));
        } else {
          if (!Array.isArray(payload.ids) || payload.ids.some((id) => typeof id !== 'string')) throw new Error('Réponse de lecture des notifications invalide.');
          setReadNotificationIds([...new Set(payload.ids)]);
        }
        // Retire uniquement la copie de navigateur correspondant à la ressource
        // dont l’API vient de confirmer la lecture. Aucune donnée locale n’est importée.
        clearLegacyKey(key);
      } catch (cause) {
        ok = false;
        const message = cause instanceof Error ? cause.message : 'Impossible de joindre l’API OMAPI.';
        setError(message);
        notify?.(message, 'error');
      }
    }));
    setLoading(false);
    return ok;
  }, [notify]);

  const refreshTimer = useRef<number | null>(null);
  useEffect(() => {
    void refresh();
    const onActivityWrite = () => {
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(() => {
        refreshTimer.current = null;
        void refresh();
      }, 800);
    };
    window.addEventListener('omapi-api-activity-written', onActivityWrite);
    return () => {
      window.removeEventListener('omapi-api-activity-written', onActivityWrite);
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    };
  }, [refresh]);

  const saveReadNotificationIds = useCallback(async (ids: string[]): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    const safeIds = [...new Set(ids)].filter((id) => /^[a-z][a-z0-9-]{0,20}-[a-zA-Z0-9._:-]{1,150}$/.test(id)).slice(-100);
    try {
      const response = await apiRequest('/api/admin/notification-reads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: safeIds }),
      }, token);
      const payload = await readJson(response);
      if (!response.ok || !Array.isArray(payload.ids)) {
        notify?.(apiError(response.status, payload.error), 'error');
        return false;
      }
      const savedIds = payload.ids.filter((id): id is string => typeof id === 'string');
      setReadNotificationIds(savedIds);
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. La lecture des notifications n’a pas été enregistrée.', 'error');
      return false;
    }
  }, [notify]);

  return { activityLogs, readNotificationIds, loading, error, refresh, saveReadNotificationIds };
}
