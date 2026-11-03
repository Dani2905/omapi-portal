import type { Formation, FormationRegistration } from '../types';
import { isValidEmail, normalizeEmail } from './userAccounts';

export interface FormationDraftErrors {
  title?: string;
  category?: string;
  form?: string;
}

export interface FormationRegistrationDraft {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message?: string;
}

export const normalizeFormationTitle = (value: string | undefined): string =>
  (value ?? '').trim().replace(/\s+/g, ' ');

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function formatIsoDate(day: number, month: number, year: number): string | null {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 1, janv: 1,
  fevrier: 2, fevr: 2,
  mars: 3,
  avril: 4, avr: 4,
  mai: 5,
  juin: 6,
  juillet: 7, juil: 7,
  aout: 8,
  septembre: 9, sept: 9,
  octobre: 10, oct: 10,
  novembre: 11, nov: 11,
  decembre: 12, dec: 12,
};

export function normalizeFormationDate(value: string | undefined): string {
  const input = (value ?? '').trim();
  if (!input || isValidIsoDate(input)) return input;

  const numericDate = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/.exec(input);
  if (numericDate) {
    return formatIsoDate(Number(numericDate[1]), Number(numericDate[2]), Number(numericDate[3])) || input;
  }

  const namedDate = /^(\d{1,2})\s+([\p{L}]+)\.?\s+(\d{4})$/u.exec(input);
  if (namedDate) {
    const monthName = namedDate[2].toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const month = FRENCH_MONTHS[monthName];
    if (month) return formatIsoDate(Number(namedDate[1]), month, Number(namedDate[3])) || input;
  }

  return input;
}

export function formatFormationDate(value: string | undefined): string {
  const normalized = normalizeFormationDate(value);
  if (!isValidIsoDate(normalized)) return (value ?? '').trim();
  const [year, month, day] = normalized.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatFormationDateForInput(value: string | undefined): string {
  const normalized = normalizeFormationDate(value);
  if (!isValidIsoDate(normalized)) return (value ?? '').trim();
  const [year, month, day] = normalized.split('-');
  return `${day}/${month}/${year}`;
}

export function normalizeFormationDraft(draft: Partial<Formation>): Partial<Formation> {
  return {
    ...draft,
    title: normalizeFormationTitle(draft.title),
    category: draft.category === 'Avancee' ? 'Avancee' : 'Base',
    date: normalizeFormationDate(draft.date),
    time: draft.time?.trim() || '',
    location: draft.location?.trim().replace(/\s+/g, ' ') || '',
    description: draft.description?.trim() || '',
    conditions: draft.conditions?.trim() || '',
    fileName: draft.fileName?.trim() || undefined,
  };
}

export function validateFormationDraft(draft: Partial<Formation>): FormationDraftErrors {
  const errors: FormationDraftErrors = {};
  const title = normalizeFormationTitle(draft.title);

  if (!title) {
    errors.title = 'Le titre de la formation est obligatoire.';
  } else if (title.length < 3) {
    errors.title = 'Le titre doit contenir au moins 3 caractères.';
  } else if (title.length > 120) {
    errors.title = 'Le titre ne peut pas dépasser 120 caractères.';
  }

  if (draft.category !== 'Base' && draft.category !== 'Avancee') {
    errors.category = 'Choisissez la catégorie de cette formation.';
  }

  const normalizedDate = normalizeFormationDate(draft.date);
  if (draft.date?.trim() && !isValidIsoDate(normalizedDate)) {
    errors.form = 'Saisissez une date valide, par exemple 20/11/2026 ou 15 avril 2026.';
  }

  if ((draft.description?.length ?? 0) > 5000) {
    errors.form = 'La description ne peut pas dépasser 5 000 caractères.';
  } else if ((draft.conditions?.length ?? 0) > 2000) {
    errors.form = 'Les conditions ne peuvent pas dépasser 2 000 caractères.';
  }

  return errors;
}

export function normalizeFormationRegistration(
  draft: FormationRegistrationDraft,
): FormationRegistrationDraft {
  return {
    ...draft,
    name: draft.name.trim().replace(/\s+/g, ' '),
    email: normalizeEmail(draft.email),
    phone: draft.phone?.trim() || '',
    organization: draft.organization?.trim().replace(/\s+/g, ' ') || '',
    message: draft.message?.trim() || '',
  };
}

export function validateFormationRegistration(
  draft: FormationRegistrationDraft,
  formation: Formation | null,
  existingRegistrations: FormationRegistration[],
): string | undefined {
  if (!formation) return 'Choisissez une formation avant de confirmer votre inscription.';

  const normalized = normalizeFormationRegistration(draft);
  if (!normalized.name) return 'Saisissez votre nom complet.';
  if (normalized.name.length < 2) return 'Le nom doit contenir au moins 2 caractères.';
  if (!normalized.email) return 'Saisissez votre adresse e-mail.';
  if (!isValidEmail(normalized.email)) return 'Saisissez une adresse e-mail valide.';

  const alreadyRegistered = existingRegistrations.some((registration) =>
    String(registration.formationId) === String(formation.id)
    && normalizeEmail(registration.email) === normalized.email,
  );
  if (alreadyRegistered) {
    return 'Cette adresse e-mail est déjà inscrite à cette formation. Contactez l’OMAPI si vous devez corriger votre demande.';
  }

  return undefined;
}

export const MAX_FORMATION_DOCUMENT_BYTES = 2 * 1024 * 1024;

export const isSupportedFormationDocument = (file: Pick<File, 'name' | 'type'>): boolean => {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  const isPdf = fileName.endsWith('.pdf')
    && ['', 'application/pdf', 'application/octet-stream'].includes(mimeType);
  const isDocx = fileName.endsWith('.docx')
    && ['', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream', 'application/zip'].includes(mimeType);
  return isPdf || isDocx;
};
