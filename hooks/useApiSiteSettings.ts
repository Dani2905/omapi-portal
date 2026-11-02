import { useCallback, useEffect, useState } from 'react';
import type { HomeResourcesConfig, SiteConfig } from '../types';
import { DEFAULT_HOME_RESOURCES_CONFIG, normalizeHomeResourcesConfig, normalizeResourceUrl } from '../data/homeResources';
import { apiRequest, getApiToken } from '../utils/apiAuth';

type NotifyFunction = (message: string, type: 'success' | 'error' | 'info') => void;
type SettingsKey = 'site_config' | 'home_resources';

function clearLegacySettingCopies(): void {
  try {
    localStorage.removeItem('omapi_site_config');
    localStorage.removeItem('omapi_home_resources');
  } catch {
    // Do not block successful API reads if browser storage is unavailable.
  }
}

interface SettingsResponse {
  settings?: Partial<Record<SettingsKey, unknown>>;
  value?: unknown;
  error?: string;
}

async function readJson(response: Response): Promise<SettingsResponse> {
  return response.json().catch(() => ({} as SettingsResponse));
}

function normalizeSiteConfig(value: unknown): SiteConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  return {
    ...(typeof raw.newsSectionBgImage === 'string' && raw.newsSectionBgImage.trim()
      ? { newsSectionBgImage: normalizeResourceUrl(raw.newsSectionBgImage, '') }
      : {}),
  };
}

function apiError(status: number, message?: string): string {
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
  if (status === 403) return 'Cette action est réservée aux membres autorisés de l’administration.';
  if (status === 400) return message || 'Le réglage contient une valeur invalide.';
  return message || 'Le service de configuration OMAPI est momentanément indisponible.';
}

export function useApiSiteSettings(notify?: NotifyFunction) {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({});
  const [homeResourcesConfig, setHomeResourcesConfig] = useState<HomeResourcesConfig>(DEFAULT_HOME_RESOURCES_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/content/settings', {}, null);
      const payload = await readJson(response);
      if (!response.ok || !payload.settings) throw new Error(apiError(response.status, payload.error));
      // Retire only the two superseded local setting keys after the shared API
      // confirms it is reachable. Keep every unrelated browser key untouched.
      clearLegacySettingCopies();
      setSiteConfig(normalizeSiteConfig(payload.settings.site_config));
      setHomeResourcesConfig(normalizeHomeResourcesConfig(payload.settings.home_resources as Partial<HomeResourcesConfig> | undefined));
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Impossible de joindre l’API OMAPI.';
      setError(message);
      notify?.(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void refresh(); }, [refresh]);

  const save = useCallback(async (key: SettingsKey, value: SiteConfig | HomeResourcesConfig): Promise<boolean> => {
    const token = getApiToken();
    if (!token) {
      notify?.('Session absente ou expirée. Reconnectez-vous puis réessayez.', 'error');
      return false;
    }
    try {
      const response = await apiRequest(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      }, token);
      const payload = await readJson(response);
      if (!response.ok || payload.value === undefined) {
        notify?.(apiError(response.status, payload.error), 'error');
        return false;
      }
      if (key === 'site_config') setSiteConfig(normalizeSiteConfig(payload.value));
      if (key === 'home_resources') setHomeResourcesConfig(normalizeHomeResourcesConfig(payload.value as Partial<HomeResourcesConfig>));
      notify?.('Réglages enregistrés dans la base OMAPI.', 'success');
      return true;
    } catch {
      notify?.('Impossible de joindre l’API OMAPI. Les réglages n’ont pas été enregistrés.', 'error');
      return false;
    }
  }, [notify]);

  const saveSiteConfig = useCallback((config: SiteConfig) => save('site_config', normalizeSiteConfig(config)), [save]);
  const saveHomeResourcesConfig = useCallback((config: HomeResourcesConfig) => save('home_resources', normalizeHomeResourcesConfig(config)), [save]);

  return { siteConfig, homeResourcesConfig, loading, error, refresh, saveSiteConfig, saveHomeResourcesConfig };
}
