export type CrudNotificationAction = 'created' | 'updated' | 'deleted';

interface NotificationEntityCopy {
  noun: string;
  subject: string;
  createdVerb: string;
  updatedVerb: string;
  deletedVerb: string;
}

const ENTITY_COPY: Record<string, NotificationEntityCopy> = {
  omapi_slides: {
    noun: 'Diapositive', subject: 'La diapositive du carrousel',
    createdVerb: 'a été ajoutée', updatedVerb: 'a été mise à jour', deletedVerb: 'a été supprimée',
  },
  omapi_news: {
    noun: 'Actualité', subject: 'L’actualité',
    createdVerb: 'a été ajoutée', updatedVerb: 'a été mise à jour', deletedVerb: 'a été supprimée',
  },
  omapi_announcements: {
    noun: 'Bandeau d’information', subject: 'Le bandeau d’information',
    createdVerb: 'a été ajouté', updatedVerb: 'a été mis à jour', deletedVerb: 'a été supprimé',
  },
  omapi_forms: {
    noun: 'Formulaire', subject: 'Le formulaire',
    createdVerb: 'a été ajouté', updatedVerb: 'a été mis à jour', deletedVerb: 'a été supprimé',
  },
  omapi_guides: {
    noun: 'Guide', subject: 'Le guide',
    createdVerb: 'a été ajouté', updatedVerb: 'a été mis à jour', deletedVerb: 'a été supprimé',
  },
  omapi_formations: {
    noun: 'Formation', subject: 'La formation',
    createdVerb: 'a été ajoutée', updatedVerb: 'a été mise à jour', deletedVerb: 'a été supprimée',
  },
  omapi_formation_registrations: {
    noun: 'Inscription à une formation', subject: 'L’inscription à la formation',
    createdVerb: 'a été enregistrée', updatedVerb: 'a été mise à jour', deletedVerb: 'a été supprimée',
  },
  omapi_gopi: {
    noun: 'Document du GOPI', subject: 'Le document du GOPI',
    createdVerb: 'a été ajouté', updatedVerb: 'a été mis à jour', deletedVerb: 'a été supprimé',
  },
  omapi_gopi_orders: {
    noun: 'Commande GOPI', subject: 'La commande GOPI',
    createdVerb: 'a été enregistrée', updatedVerb: 'a été mise à jour', deletedVerb: 'a été supprimée',
  },
  omapi_users: {
    noun: 'Compte utilisateur', subject: 'Le compte utilisateur',
    createdVerb: 'a été créé', updatedVerb: 'a été mis à jour', deletedVerb: 'a été supprimé',
  },
  omapi_jobs: {
    noun: 'Offre d’emploi', subject: 'L’offre d’emploi',
    createdVerb: 'a été créée', updatedVerb: 'a été mise à jour', deletedVerb: 'a été supprimée',
  },
  omapi_job_applications: {
    noun: 'Candidature', subject: 'La candidature',
    createdVerb: 'a été reçue', updatedVerb: 'a été mise à jour', deletedVerb: 'a été supprimée',
  },
  omapi_events: {
    noun: 'Événement', subject: 'L’événement',
    createdVerb: 'a été ajouté', updatedVerb: 'a été mis à jour', deletedVerb: 'a été supprimé',
  },
  omapi_event_registrations: {
    noun: 'Inscription à un événement', subject: 'L’inscription à l’événement',
    createdVerb: 'a été enregistrée', updatedVerb: 'a été mise à jour', deletedVerb: 'a été supprimée',
  },
  omapi_legislation: {
    noun: 'Texte juridique', subject: 'Le texte juridique',
    createdVerb: 'a été ajouté', updatedVerb: 'a été mis à jour', deletedVerb: 'a été supprimé',
  },
};

const ITEM_LABEL_FIELDS: Record<string, string[]> = {
  omapi_slides: ['title'],
  omapi_news: ['title'],
  omapi_announcements: ['text'],
  omapi_forms: ['title'],
  omapi_guides: ['title'],
  omapi_formations: ['title'],
  omapi_formation_registrations: ['name', 'email'],
  omapi_gopi: ['title'],
  omapi_gopi_orders: ['customerName', 'gopiTitle'],
  omapi_users: ['name', 'email'],
  omapi_jobs: ['title'],
  omapi_job_applications: ['firstName', 'lastName', 'jobTitle'],
  omapi_events: ['title'],
  omapi_event_registrations: ['name', 'email'],
  omapi_legislation: ['title'],
};

const ACTION_TITLES: Record<CrudNotificationAction, (noun: string) => string> = {
  created: (noun) => `Ajout effectué — ${noun}`,
  updated: (noun) => `Modification enregistrée — ${noun}`,
  deleted: (noun) => `Suppression effectuée — ${noun}`,
};

const cleanLabel = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value).replace(/\s+/g, ' ').trim()
    : '';

export function getNotificationItemLabel(key: string, item: unknown): string {
  if (!item || typeof item !== 'object') return 'élément';
  const record = item as Record<string, unknown>;
  const fields = ITEM_LABEL_FIELDS[key] ?? ['title', 'name', 'text'];
  const parts = fields.map((field) => cleanLabel(record[field])).filter(Boolean);
  return parts.length ? parts.join(' — ') : (record.id !== undefined ? `ID ${record.id}` : 'élément');
}

export function describeCrudAction(
  key: string,
  action: CrudNotificationAction,
  item: unknown,
): { title: string; message: string } {
  const copy = ENTITY_COPY[key] ?? {
    noun: 'Élément', subject: 'L’élément',
    createdVerb: 'a été ajouté', updatedVerb: 'a été mis à jour', deletedVerb: 'a été supprimé',
  };
  const label = getNotificationItemLabel(key, item);
  const verb = action === 'created'
    ? copy.createdVerb
    : action === 'updated' ? copy.updatedVerb : copy.deletedVerb;

  return {
    title: ACTION_TITLES[action](copy.noun),
    message: `${copy.subject} « ${label} » ${verb}.`,
  };
}

export function describeConfigurationSave(key: string): { success: string; error: string } {
  const messages: Record<string, { success: string; error: string }> = {
    omapi_site_config: {
      success: 'Les paramètres de présentation du site ont été enregistrés.',
      error: 'Échec : les paramètres de présentation du site n’ont pas été enregistrés.',
    },
    omapi_home_resources: {
      success: 'Les ressources vedettes de la page d’accueil ont été enregistrées.',
      error: 'Échec : les ressources vedettes de la page d’accueil n’ont pas été enregistrées.',
    },
  };
  return messages[key] ?? {
    success: 'La configuration du site a été enregistrée.',
    error: 'Échec : la configuration du site n’a pas été enregistrée.',
  };
}

function parseNotificationDate(value: string): Date | null {
  const nativeDate = new Date(value);
  if (!Number.isNaN(nativeDate.getTime())) return nativeDate;

  // Compatibilité avec les anciennes activités enregistrées en fr-FR :
  // « 29/10/2026 14:05:00 ».
  const frenchDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!frenchDate) return null;
  const [, day, month, year, hour = '0', minute = '0', second = '0'] = frenchDate;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatNotificationTime(value: string, now = Date.now()): string {
  const parsed = parseNotificationDate(value);
  if (!parsed) return value || 'Date inconnue';

  const differenceMs = now - parsed.getTime();
  const absoluteMs = Math.abs(differenceMs);
  if (absoluteMs < 45_000) return differenceMs >= 0 ? 'À l’instant' : 'Dans quelques secondes';

  const formatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['minute', 60_000], ['hour', 3_600_000], ['day', 86_400_000],
  ];
  for (const [unit, size] of units) {
    if (absoluteMs < size * (unit === 'minute' ? 60 : unit === 'hour' ? 24 : 7)) {
      const amount = Math.max(1, Math.round(absoluteMs / size));
      return formatter.format(differenceMs >= 0 ? -amount : amount, unit);
    }
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(parsed);
}
