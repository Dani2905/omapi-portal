import type { Event, EventRegistration } from '../types';
import { isAllowedLibraryUrl, libraryFileMime, validateLibraryFileMetadata, isValidLibraryFileSignature } from './documentLibraryLogic';
import { getNewsPlainText, isAllowedNewsImageUrl, sanitizeNewsHtml } from './editorialLogic';

export const EVENT_STATUSES = ['À venir', 'En cours', 'Terminé', 'Annulé'] as const;
export const EVENT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const FRENCH_MONTHS: Record<string, string> = {
  janvier: '01', janv: '01', février: '02', fevrier: '02', févr: '02', fevr: '02',
  mars: '03', avril: '04', avr: '04', mai: '05', juin: '06', juillet: '07', juil: '07',
  août: '08', aout: '08', septembre: '09', sept: '09', octobre: '10', oct: '10',
  novembre: '11', nov: '11', décembre: '12', decembre: '12', déc: '12', dec: '12',
};

export function parseEventDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim().replace(/,/g, '').replace(/\s+/g, ' ');
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return isValidDateParts(text) ? text : null;

  const numeric = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(text);
  if (numeric) return makeIsoDate(Number(numeric[3]), Number(numeric[2]), Number(numeric[1]));

  const namedMonth = /^(\d{1,2})\s+([\p{L}.]+)\s+(\d{4})$/u.exec(text.toLocaleLowerCase('fr-FR'));
  if (namedMonth) {
    const month = FRENCH_MONTHS[namedMonth[2].replace(/\.$/, '')];
    if (!month) return null;
    return makeIsoDate(Number(namedMonth[3]), Number(month), Number(namedMonth[1]));
  }
  return null;
}

export function formatEventDate(value: unknown, locale = 'fr-FR'): string {
  const iso = parseEventDate(value);
  if (!iso) return typeof value === 'string' && value.trim() ? value.trim() : 'Date à confirmer';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getLocalEventDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function normalizeEventTime(value: unknown): string {
  if (typeof value !== 'string') return '';
  const text = value.trim().replace(/\s+/g, ' ').replace(/[hH]/g, ':').replace(/[–—]/g, '-');
  const parts = text.split(/\s*(?:-|à)\s*/i);
  if (parts.length < 1 || parts.length > 2) return text;
  const normalized = parts.map((part) => {
    const match = /^(\d{1,2}):(\d{1,2})$/.exec(part);
    if (!match) return '';
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    return hour <= 23 && minute <= 59 ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` : '';
  });
  if (normalized.some((part) => !part)) return text;
  if (normalized.length === 2 && normalized[1] < normalized[0]) return text;
  return normalized.join(' - ');
}

export function normalizeEventRecord(value: unknown): Event | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const id = toPositiveSafeInteger(record.id);
  if (!id) return null;
  const statuses: Event['status'][] = ['À venir', 'En cours', 'Terminé', 'Annulé'];
  const normalized = normalizeEventDraft({
    id,
    title: typeof record.title === 'string' ? record.title : '',
    date: typeof record.date === 'string' ? record.date : '',
    time: typeof record.time === 'string' ? record.time : '',
    location: typeof record.location === 'string' ? record.location : '',
    description: typeof record.description === 'string' ? record.description : '',
    image: typeof record.image === 'string' ? record.image : '',
    status: statuses.includes(record.status as Event['status']) ? record.status as Event['status'] : 'Annulé',
    places: typeof record.places === 'string' ? record.places : '',
    fileUrl: typeof record.fileUrl === 'string' ? record.fileUrl : '',
    fileName: typeof record.fileName === 'string' ? record.fileName : '',
  });
  return {
    id,
    title: normalized.title || '',
    date: normalized.date || '',
    time: normalized.time || '',
    location: normalized.location || '',
    description: normalized.description || '',
    image: normalized.image || '',
    status: normalized.status as Event['status'],
    places: normalized.places || '',
    fileUrl: normalized.fileUrl || '',
    fileName: normalized.fileName || '',
  };
}

export function normalizeEventDraft(draft: Partial<Event>): Partial<Event> {
  const parsedDate = parseEventDate(draft.date);
  const image = typeof draft.image === 'string' ? draft.image.trim() : '';
  const fileUrl = typeof draft.fileUrl === 'string' ? draft.fileUrl.trim() : '';
  return {
    ...draft,
    title: normalizeText(draft.title),
    date: parsedDate || (typeof draft.date === 'string' ? draft.date.trim() : ''),
    time: normalizeEventTime(draft.time),
    location: normalizeText(draft.location),
    description: typeof draft.description === 'string' ? sanitizeNewsHtml(draft.description) : '',
    image,
    status: draft.status,
    places: normalizeText(draft.places),
    fileUrl,
    fileName: normalizeFileName(draft.fileName),
  };
}

export function validateEventDraft(draft: Partial<Event>): string | null {
  const normalized = normalizeEventDraft(draft);
  if (!normalized.title || normalized.title.length < 3) return 'Le titre doit contenir au moins 3 caractères.';
  if (normalized.title.length > 180) return 'Le titre ne peut pas dépasser 180 caractères.';
  if (!parseEventDate(normalized.date)) return 'Choisissez une date valide pour l’événement.';
  if (!isValidEventTime(normalized.time)) return 'Indiquez une heure valide, par exemple 09:00 ou 09:00 - 17:00.';
  if (!normalized.location) return 'Le lieu de l’événement est obligatoire.';
  if (!EVENT_STATUSES.includes(normalized.status as typeof EVENT_STATUSES[number])) return 'Sélectionnez un statut reconnu.';
  if (!getNewsPlainText(normalized.description)) return 'La description de l’événement est obligatoire.';
  if (normalized.places && normalized.places.length > 180) return 'Le champ Places / Accès ne peut pas dépasser 180 caractères.';
  if (normalized.image && !isAllowedNewsImageUrl(normalized.image)) return 'L’image doit être une URL HTTPS, un chemin local ou une image importée valide.';
  if (normalized.fileUrl && !isAllowedLibraryUrl(normalized.fileUrl)) return 'Le document doit être un lien HTTPS, un chemin local ou un fichier PDF, DOC ou DOCX valide.';
  if (normalized.fileUrl?.startsWith('data:') && !isValidEventDocumentDataUrl(normalized.fileUrl, normalized.fileName || '')) return 'Le document importé ne correspond pas à un fichier PDF, DOC ou DOCX valide.';
  if (!normalized.fileUrl && normalized.fileName) return 'Le nom du document est renseigné sans document associé.';
  return null;
}

export function isValidEventTime(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const normalized = normalizeEventTime(value);
  const match = /^(?:([01]\d|2[0-3]):([0-5]\d))(?: - ((?:[01]\d|2[0-3]):([0-5]\d)))?$/.exec(normalized);
  if (!match) return false;
  if (!match[3]) return true;
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3].slice(0, 2)) * 60 + Number(match[3].slice(3, 5));
  return end >= start;
}

export function getEffectiveEventStatus(event: Pick<Event, 'date' | 'status'>, today = getLocalEventDate()): Event['status'] {
  if (event.status === 'Annulé' || event.status === 'Terminé') return event.status;
  const date = parseEventDate(event.date);
  if (!date) return event.status;
  if (date < today) return 'Terminé';
  if (date === today && event.status === 'À venir') return 'En cours';
  return event.status;
}

export function isEventRegistrationOpen(event: Pick<Event, 'date' | 'status'>, today = getLocalEventDate()): boolean {
  const status = getEffectiveEventStatus(event, today);
  const date = parseEventDate(event.date);
  return Boolean(date && date >= today && (status === 'À venir' || status === 'En cours'));
}

export function getEventCapacity(places: unknown): number | null {
  if (typeof places !== 'string') return null;
  const text = places.trim();
  const explicitCapacity = /(?:capacit[ée]|maximum|max|limit[ée]e?s?)\D{0,16}(\d{1,6})/i.exec(text);
  const quantityWithUnit = /(\d{1,6})\s*(?:places?|participants?|inscriptions?)/i.exec(text);
  const parsed = explicitCapacity?.[1] || quantityWithUnit?.[1];
  if (!parsed) return null;
  const capacity = Number(parsed);
  return Number.isSafeInteger(capacity) && capacity >= 0 ? capacity : null;
}

export function normalizeEventRegistration(value: unknown): EventRegistration | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const id = toPositiveSafeInteger(record.id);
  const eventId = toPositiveSafeInteger(record.eventId);
  if (!id || !eventId) return null;
  return {
    id,
    eventId,
    name: typeof record.name === 'string' ? record.name.trim() : '',
    email: typeof record.email === 'string' ? record.email.trim().toLowerCase() : '',
    phone: typeof record.phone === 'string' ? record.phone.trim() : '',
    ...(typeof record.organization === 'string' && record.organization.trim() ? { organization: record.organization.trim() } : {}),
    registrationDate: typeof record.registrationDate === 'string' ? record.registrationDate : '',
  };
}

export function normalizeEventRegistrationDraft(draft: Partial<EventRegistration>): Partial<EventRegistration> {
  return {
    ...draft,
    name: normalizeText(draft.name),
    email: typeof draft.email === 'string' ? draft.email.trim().toLowerCase() : '',
    phone: typeof draft.phone === 'string' ? draft.phone.replace(/\s+/g, ' ').trim() : '',
    organization: normalizeText(draft.organization),
    registrationDate: typeof draft.registrationDate === 'string' ? draft.registrationDate.trim() : '',
  };
}

export function validateEventRegistrationDraft(
  draft: Partial<EventRegistration>,
  event: Pick<Event, 'id' | 'date' | 'status' | 'places'>,
  registrations: readonly EventRegistration[] = [],
  today = getLocalEventDate(),
): string | null {
  const normalized = normalizeEventRegistrationDraft(draft);
  if (!isEventRegistrationOpen(event, today)) return 'Les inscriptions à cet événement sont closes.';
  if (!normalized.name || normalized.name.length < 2) return 'Saisissez votre nom complet.';
  if (normalized.name.length > 120) return 'Le nom complet ne peut pas dépasser 120 caractères.';
  if (!normalized.email || normalized.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) return 'Saisissez une adresse e-mail valide.';
  if (!normalized.phone || normalized.phone.replace(/\D/g, '').length < 7 || normalized.phone.length > 50) return 'Saisissez un numéro de téléphone valide.';
  if (normalized.organization && normalized.organization.length > 160) return 'Le nom de l’organisme ne peut pas dépasser 160 caractères.';
  const capacity = getEventCapacity(event.places);
  if (capacity !== null && registrations.filter((registration) => String(registration.eventId) === String(event.id)).length >= capacity) {
    return `Cet événement a atteint sa capacité maximale de ${capacity} participant(s).`;
  }
  const duplicate = registrations.some((registration) =>
    String(registration.eventId) === String(event.id)
      && registration.email.trim().toLocaleLowerCase() === normalized.email,
  );
  if (duplicate) return 'Une inscription existe déjà pour cette adresse e-mail et cet événement.';
  return null;
}

export function validateEventDocumentFile(file: Pick<File, 'name' | 'size'>): string | null {
  return validateLibraryFileMetadata(file);
}

export function isValidEventDocumentSignature(fileName: string, header: Uint8Array): boolean {
  return isValidLibraryFileSignature(fileName, header);
}

export function isValidEventDocumentDataUrl(dataUrl: string, fileName: string): boolean {
  const match = /^data:(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,([a-z0-9+/=]+)$/i.exec(dataUrl);
  if (!match || match[1].toLowerCase() !== getEventDocumentMime(fileName).toLowerCase()) return false;
  try {
    const binary = atob(match[2].slice(0, 16));
    const header = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return isValidEventDocumentSignature(fileName, header);
  } catch {
    return false;
  }
}

export function getEventDocumentMime(fileName: string): string {
  return libraryFileMime(fileName);
}

export function isSafeEventImage(value: unknown): value is string {
  return isAllowedNewsImageUrl(value);
}

export function isSafeEventDocument(value: unknown, fileName = ''): value is string {
  if (!isAllowedLibraryUrl(value)) return false;
  if (typeof value === 'string' && value.startsWith('data:')) return isValidEventDocumentDataUrl(value, fileName);
  return true;
}

function isValidDateParts(iso: string): boolean {
  const [year, month, day] = iso.split('-').map(Number);
  return makeIsoDate(year, month, day) === iso;
}

function makeIsoDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toPositiveSafeInteger(value: unknown): number | null {
  const number = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function normalizeEventDownloadName(value: unknown, fallback = 'document_evenement.pdf'): string {
  return normalizeFileName(value) || fallback;
}

function normalizeFileName(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/\s+/g, '_').slice(0, 120).trim();
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}
