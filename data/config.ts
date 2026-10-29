
// =============================================================================
// CONSTANTES DE CONFIGURATION (GLOBALES)
// =============================================================================

export const SERVICE_IDS = {
  MARQUE: 'marque',
  BREVET: 'brevet',
  DESSIN: 'dessin',
  NOM_COMMERCIAL: 'nom-commercial',
} as const;

export const CATEGORIES = {
  // Services & Documents
  MARQUES: 'Marques',
  BREVETS: 'Brevets',
  DESSINS: 'Dessins',
  AUTRES: 'Autres',
  // Actualités & Événements
  EVENT: 'Événement',
  ANNOUNCEMENT: 'Annonce',
  INTERNATIONAL: 'International',
  // GOPI
  GAZETTE: 'Gazette Officielle',
  INSCRIPTION: 'Inscription au Registre',
  RENOUVELLEMENT: 'Renouvellement',
  GOPI_GMD: 'GOPI spéciale GMD',
  GOPI_GDM: 'GOPI spéciale GDM'
} as const;

export const THEMES = {
  BLUE: 'blue',
  AMBER: 'amber',
  PURPLE: 'purple',
  EMERALD: 'emerald',
  ORANGE: 'orange',
  GRAY: 'gray',
  ROSE: 'rose',
  INDIGO: 'indigo',
  CYAN: 'cyan'
} as const;

export const STATUS = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  PENDING: 'En attente',
  SENT: 'Envoyé',
  CANCELLED: 'Annulé',
  UPCOMING: 'À venir',
  ONGOING: 'En cours',
  COMPLETED: 'Terminé'
} as const;
