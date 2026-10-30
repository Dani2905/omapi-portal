import { HomeResourcesConfig } from '../types';

export const DEFAULT_HOME_RESOURCES_CONFIG: HomeResourcesConfig = {
  omapiHourTitle: "L'Heure OMAPI & Ateliers pratiques",
  omapiHourDesc: 'Découvrez les rencontres, échanges et ateliers consacrés à la propriété industrielle à Madagascar.',
  omapiHourThumbnail: '/resources/omapi-hour.jpg',
  omapiHourUrl: '/events',
  videoTitle: 'Guides pratiques de propriété industrielle',
  videoDesc: 'Consultez les ressources disponibles pour mieux comprendre les démarches et le suivi de vos titres.',
  videoThumbnail: '/resources/omapi-video.jpg',
  videoDuration: '',
  videoUrl: '',
};

/** Normalise les anciennes configurations locales qui ne contiennent pas encore tous les champs. */
export function normalizeHomeResourcesConfig(value?: Partial<HomeResourcesConfig> | null): HomeResourcesConfig {
  const config = value || {};
  return {
    ...DEFAULT_HOME_RESOURCES_CONFIG,
    ...config,
    omapiHourTitle: cleanRequiredText(config.omapiHourTitle, DEFAULT_HOME_RESOURCES_CONFIG.omapiHourTitle, 100),
    omapiHourDesc: cleanRequiredText(config.omapiHourDesc, DEFAULT_HOME_RESOURCES_CONFIG.omapiHourDesc, 500),
    omapiHourThumbnail: cleanImage(config.omapiHourThumbnail, DEFAULT_HOME_RESOURCES_CONFIG.omapiHourThumbnail || ''),
    omapiHourUrl: normalizeResourceUrl(config.omapiHourUrl, DEFAULT_HOME_RESOURCES_CONFIG.omapiHourUrl || '/events'),
    videoTitle: cleanRequiredText(config.videoTitle, DEFAULT_HOME_RESOURCES_CONFIG.videoTitle, 100),
    videoDesc: cleanRequiredText(config.videoDesc, DEFAULT_HOME_RESOURCES_CONFIG.videoDesc, 500),
    videoThumbnail: cleanImage(config.videoThumbnail, DEFAULT_HOME_RESOURCES_CONFIG.videoThumbnail || ''),
    videoDuration: cleanText(config.videoDuration, DEFAULT_HOME_RESOURCES_CONFIG.videoDuration || '', 12),
    videoUrl: normalizeResourceUrl(config.videoUrl, ''),
  };
}

export function normalizeResourceUrl(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  const candidate = value.trim();
  if (!candidate || candidate.length > 2048 || candidate.startsWith('//') || candidate.includes('\\')) return fallback;
  if (candidate.startsWith('/') && !candidate.startsWith('/\\') && !candidate.split('/').includes('..')) return candidate;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? candidate : fallback;
  } catch {
    return fallback;
  }
}

export function isValidVideoDuration(value: string): boolean {
  const duration = value.trim();
  return duration === '' || /^(?:\d{1,2}:)?\d{1,2}:[0-5]\d$/.test(duration);
}

function cleanRequiredText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value.trim().slice(0, maxLength);
}

function cleanText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLength);
}

function cleanImage(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || value.length > 1_500_000) return fallback;
  return value.trim();
}
