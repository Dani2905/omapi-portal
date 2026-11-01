import { useCallback, useEffect, useState } from 'react';
import type { User } from '../types';
import { apiRequest, getApiToken } from '../utils/apiAuth';

export type ApiUserDraft = Partial<User> & { password?: string };

interface ApiUserResponse {
  user?: User;
  users?: User[];
  error?: string;
}

function messageForResponse(status: number, error?: string): string {
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
  if (status === 403) {
    if (/primary administrator/i.test(error || '')) return 'Le compte administrateur principal ne peut pas être supprimé.';
    if (/own account/i.test(error || '')) return 'Vous ne pouvez pas supprimer votre propre compte.';
    return "Cette action est réservée à un administrateur ou n'est pas autorisée pour ce compte.";
  }
  if (status === 404) return "Ce compte n'existe plus. Actualisez la liste puis réessayez.";
  if (status === 409) {
    if (/email/i.test(error || '')) return 'Cette adresse e-mail est déjà utilisée.';
    if (/administrator/i.test(error || '')) return 'Cette opération laisserait le système sans administrateur actif.';
    return "L'opération ne peut pas être effectuée dans l'état actuel des comptes.";
  }
  if (status === 400 && /primary administrator/i.test(error || '')) return 'Le compte administrateur principal doit conserver son e-mail, son rôle Admin et son statut Actif.';
  if (status === 400 && /own role or status/i.test(error || '')) return 'Vous ne pouvez pas modifier votre propre rôle ou statut.';
  if (status === 400 && /profile page/i.test(error || '')) return 'Pour modifier votre mot de passe, utilisez la fenêtre Mon profil.';
  if (status === 400 && /password/i.test(error || '')) return 'Le mot de passe doit contenir au moins 12 caractères et ne pas avoir d’espace au début ou à la fin.';
  if (status === 400 && /email/i.test(error || '')) return "L'adresse e-mail n'est pas valide.";
  if (status === 400 && /name/i.test(error || '')) return 'Le nom doit contenir entre 2 et 200 caractères.';
  if (status === 400 && /role or status/i.test(error || '')) return 'Choisissez un rôle et un statut valides.';
  return error || 'Le service de gestion des comptes est momentanément indisponible.';
}

async function readResponse(response: Response): Promise<ApiUserResponse> {
  return response.json().catch(() => ({} as ApiUserResponse));
}

export function useApiUsers(enabled: boolean) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async (): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      setError('Session absente. Reconnectez-vous pour charger les comptes.');
      return false;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/admin/users', {}, token);
      const payload = await readResponse(response);
      if (!response.ok || !Array.isArray(payload.users)) {
        const message = messageForResponse(response.status, payload.error);
        setError(message);
        return false;
      }
      setUsers(payload.users);
      // La liste locale du prototype n'est plus une source d'authentification.
      try { localStorage.removeItem('omapi_users'); } catch { /* API list remains authoritative. */ }
      return true;
    } catch {
      setError("Impossible de joindre l'API OMAPI pour charger les comptes.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  const saveUser = useCallback(async (draft: ApiUserDraft): Promise<User> => {
    const token = getApiToken();
    if (!token) throw new Error('Votre session a expiré. Reconnectez-vous puis réessayez.');

    const isEdit = draft.id !== undefined && draft.id !== null && String(draft.id) !== '';
    const path = isEdit ? `/api/admin/users/${encodeURIComponent(String(draft.id))}` : '/api/admin/users';
    const response = await apiRequest(path, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: draft.name,
        email: draft.email,
        role: draft.role,
        status: draft.status,
        ...(draft.password ? { password: draft.password } : {}),
      }),
    }, token);
    const payload = await readResponse(response);
    if (!response.ok || !payload.user) {
      throw new Error(messageForResponse(response.status, payload.error));
    }

    const savedUser = payload.user;
    setUsers((current) => {
      const exists = current.some((user) => String(user.id) === String(savedUser.id));
      return exists
        ? current.map((user) => String(user.id) === String(savedUser.id) ? savedUser : user)
        : [...current, savedUser].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
    });
    return savedUser;
  }, []);

  const deleteUser = useCallback(async (id: User['id']): Promise<void> => {
    const token = getApiToken();
    if (!token) throw new Error('Votre session a expiré. Reconnectez-vous puis réessayez.');
    const response = await apiRequest(`/api/admin/users/${encodeURIComponent(String(id))}`, { method: 'DELETE' }, token);
    const payload = await readResponse(response);
    if (!response.ok) throw new Error(messageForResponse(response.status, payload.error));
    setUsers((current) => current.filter((user) => String(user.id) !== String(id)));
  }, []);

  return { users, loading, error, refresh, saveUser, deleteUser };
}
