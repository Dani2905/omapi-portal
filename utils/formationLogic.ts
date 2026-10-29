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

export function normalizeFormationDraft(draft: Partial<Formation>): Partial<Formation> {
  return {
    ...draft,
    title: normalizeFormationTitle(draft.title),
    category: draft.category === 'Avancee' ? 'Avancee' : 'Base',
    date: draft.date?.trim() || '',
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
