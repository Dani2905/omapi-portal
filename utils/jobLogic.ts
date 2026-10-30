import type { JobApplication, JobOffer } from '../types';
import { getLibraryPlainText } from './documentLibraryLogic';
import { sanitizeNewsHtml } from './editorialLogic';

export const JOB_TYPES = ['CDI', 'CDD', 'Stage', 'Consultant'] as const;
export const JOB_STATUSES = ['Ouvert', 'Fermé'] as const;
export const JOB_APPLICATION_FILE_MAX_BYTES = 700 * 1024;

const APPLICATION_FILE_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function normalizeJobOfferDraft(draft: Partial<JobOffer>): Partial<JobOffer> {
  return {
    ...draft,
    title: normalizeText(draft.title),
    department: normalizeText(draft.department),
    location: normalizeText(draft.location),
    experience: normalizeText(draft.experience),
    publishDate: typeof draft.publishDate === 'string' ? draft.publishDate.trim() : '',
    deadline: typeof draft.deadline === 'string' ? draft.deadline.trim() : '',
    description: typeof draft.description === 'string' ? sanitizeNewsHtml(draft.description) : '',
    fileUrl: typeof draft.fileUrl === 'string' ? draft.fileUrl.trim() : '',
  };
}

export function validateJobOfferDraft(draft: Partial<JobOffer>): string | null {
  const normalized = normalizeJobOfferDraft(draft);
  if (!normalized.title || normalized.title.length < 3) return 'Le titre doit contenir au moins 3 caractères.';
  if (normalized.title.length > 180) return 'Le titre ne peut pas dépasser 180 caractères.';
  if (!normalized.department) return 'Le département est obligatoire.';
  if (!normalized.location) return 'Le lieu est obligatoire.';
  if (!JOB_TYPES.includes(normalized.type as typeof JOB_TYPES[number])) return 'Sélectionnez un type de contrat reconnu.';
  if (!JOB_STATUSES.includes(normalized.status as typeof JOB_STATUSES[number])) return 'Sélectionnez un statut reconnu.';
  if (!isValidIsoDate(normalized.publishDate)) return 'La date de publication est invalide.';
  if (normalized.deadline && !isValidIsoDate(normalized.deadline)) return 'La date limite est invalide.';
  if (normalized.deadline && normalized.publishDate && normalized.deadline < normalized.publishDate) {
    return 'La date limite ne peut pas précéder la date de publication.';
  }
  if (!getLibraryPlainText(normalized.description)) return 'La description détaillée est obligatoire.';
  return null;
}

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function getLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isJobOpenOnDate(job: Pick<JobOffer, 'status' | 'publishDate' | 'deadline'>, today = getLocalDateInputValue()): boolean {
  if (job.status !== 'Ouvert' || !isValidIsoDate(job.publishDate)) return false;
  if (job.publishDate > today) return false;
  if (job.deadline && !isValidIsoDate(job.deadline)) return false;
  if (job.deadline && job.deadline < today) return false;
  return true;
}

export function getJobAvailabilityLabel(job: Pick<JobOffer, 'status' | 'publishDate' | 'deadline'>, today = getLocalDateInputValue()): string {
  if (job.status !== 'Ouvert') return 'Fermé';
  if (!job.publishDate || !isValidIsoDate(job.publishDate) || (job.deadline && !isValidIsoDate(job.deadline))) return 'Date à vérifier';
  if (job.publishDate > today) return 'À venir';
  if (job.deadline && job.deadline < today) return 'Expirée';
  return 'Ouvert';
}

export function normalizeApplicantFileName(value: unknown, fallback: string): string {
  const name = typeof value === 'string' ? value : '';
  const normalized = name
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 120);
  return normalized || fallback;
}

export function getApplicationFileMime(fileName: string): string | null {
  const extension = /\.([^.]+)$/.exec(fileName)?.[1]?.toLowerCase();
  return extension ? APPLICATION_FILE_MIME[extension] || null : null;
}

export function validateApplicationFileMetadata(file: Pick<File, 'name' | 'size' | 'type'>): string | null {
  const extension = /\.([^.]+)$/.exec(file.name)?.[1]?.toLowerCase();
  if (!extension || !(extension in APPLICATION_FILE_MIME)) return 'Seuls les fichiers PDF, DOC et DOCX sont acceptés.';
  if (file.size <= 0) return 'Le fichier est vide.';
  if (file.size > JOB_APPLICATION_FILE_MAX_BYTES) return 'Chaque fichier ne doit pas dépasser 700 Ko.';
  const expectedMime = APPLICATION_FILE_MIME[extension];
  if (file.type && file.type !== expectedMime && file.type !== 'application/octet-stream') {
    return 'Le format du fichier ne correspond pas à son extension.';
  }
  return null;
}

export function isValidApplicationFileSignature(fileName: string, header: Uint8Array): boolean {
  const extension = /\.([^.]+)$/.exec(fileName)?.[1]?.toLowerCase();
  if (extension === 'pdf') return header.length >= 5 && String.fromCharCode(...header.slice(0, 5)) === '%PDF-';
  if (extension === 'doc') return header.length >= 8 && [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((byte, index) => header[index] === byte);
  if (extension === 'docx') return header.length >= 4 && header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;
  return false;
}

export function isSafeApplicationFileUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^data:(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,[a-z0-9+/=]+$/i.test(value);
}

export function normalizeJobApplicationRecord(value: unknown): JobApplication | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'number' ? record.id : Number(record.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const validStatuses: JobApplication['status'][] = ['Nouvelle', 'En cours', 'Rejetée', 'Acceptée'];
  const applicationDate = typeof record.applicationDate === 'string' && Number.isFinite(new Date(record.applicationDate).getTime())
    ? record.applicationDate
    : '';
  const jobId = typeof record.jobId === 'number' && Number.isSafeInteger(record.jobId)
    ? record.jobId
    : typeof record.jobId === 'string' && /^\d+$/.test(record.jobId) && Number.isSafeInteger(Number(record.jobId))
      ? Number(record.jobId)
      : undefined;

  return {
    id,
    ...(jobId !== undefined ? { jobId } : {}),
    ...(typeof record.jobTitle === 'string' ? { jobTitle: record.jobTitle } : {}),
    firstName: typeof record.firstName === 'string' ? record.firstName : '',
    lastName: typeof record.lastName === 'string' ? record.lastName : '',
    email: typeof record.email === 'string' ? record.email : '',
    phone: typeof record.phone === 'string' ? record.phone : '',
    ...(typeof record.message === 'string' ? { message: record.message } : {}),
    cvUrl: typeof record.cvUrl === 'string' ? record.cvUrl : '',
    ...(typeof record.cvFileName === 'string' ? { cvFileName: record.cvFileName } : {}),
    ...(typeof record.coverLetterUrl === 'string' ? { coverLetterUrl: record.coverLetterUrl } : {}),
    ...(typeof record.coverLetterFileName === 'string' ? { coverLetterFileName: record.coverLetterFileName } : {}),
    applicationDate,
    status: validStatuses.includes(record.status as JobApplication['status']) ? record.status as JobApplication['status'] : 'Nouvelle',
  };
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}
