import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pg from 'pg';
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from './authCrypto.js';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Les clients serveur-à-serveur n'envoient pas l'en-tête Origin.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));
app.use(express.json({ limit: '8mb' }));

const databaseConfig = {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  application_name: 'omapi-api',
};
const pool = new Pool(databaseConfig);

const SESSION_HOURS = 12;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 8;
const loginFailures = new Map();

const publicUserFields = `id, name, email, role, status, created_at, updated_at`;


const editorialCategories = ['Annonce', 'Actualité', 'Blog', 'Déclaration', 'Événement', 'International', 'Juridique', 'Formation', 'Innovation'];
const editorialConfig = {
  news: {
    table: 'news',
    select: 'id, title, display_date, category, image_url, description, content, featured',
    dbColumns: ['title', 'display_date', 'category', 'image_url', 'description', 'content', 'featured'],
    normalize(body) {
      const item = {
        title: typeof body?.title === 'string' ? body.title.trim() : '',
        date: typeof (body?.date ?? body?.display_date) === 'string' ? String(body.date ?? body.display_date).trim() : '',
        category: typeof body?.category === 'string' ? body.category.trim() : '',
        image: typeof (body?.image ?? body?.image_url) === 'string' ? String(body.image ?? body.image_url).trim() : '',
        description: typeof body?.description === 'string' ? body.description.trim() : '',
        content: typeof body?.content === 'string' ? body.content : '',
        featured: body?.featured === true,
      };
      if (item.title.length < 3 || item.title.length > 180 || !item.date || item.date.length > 100 || !editorialCategories.includes(item.category) || !item.description || item.description.length > 500 || item.content.length > 1000000 || !isSafeImageValue(item.image)) {
        return { error: 'News item is invalid' };
      }
      return { item };
    },
    values: (item) => [item.title, item.date, item.category, item.image, item.description, item.content, item.featured],
    mapRow: (row) => ({ id: Number(row.id), title: row.title, date: row.display_date, category: row.category, image: row.image_url, description: row.description, content: row.content || '', featured: row.featured }),
  },
  slides: {
    table: 'home_slides',
    select: 'id, image_url, title, subtitle, cta_text, cta_link, news_id',
    dbColumns: ['image_url', 'title', 'subtitle', 'cta_text', 'cta_link', 'news_id'],
    normalize(body) {
      const item = {
        image: typeof (body?.image ?? body?.image_url) === 'string' ? String(body.image ?? body.image_url).trim() : '',
        title: typeof body?.title === 'string' ? body.title.trim() : '',
        subtitle: typeof body?.subtitle === 'string' ? body.subtitle.trim() : '',
        ctaText: typeof (body?.ctaText ?? body?.cta_text) === 'string' ? String(body.ctaText ?? body.cta_text).trim() : '',
        ctaLink: typeof (body?.ctaLink ?? body?.cta_link) === 'string' ? String(body.ctaLink ?? body.cta_link).trim() : '',
        newsId: body?.newsId == null && body?.news_id == null ? null : Number(body.newsId ?? body.news_id),
      };
      if (item.title.length > 200 || item.subtitle.length > 1000 || item.ctaText.length > 100 || item.ctaLink.length > 2048 || !isSafeImageValue(item.image) || !isSafeLinkValue(item.ctaLink) || (item.newsId !== null && (!Number.isSafeInteger(item.newsId) || item.newsId < 1))) {
        return { error: 'Slide is invalid' };
      }
      return { item };
    },
    values: (item) => [item.image, item.title, item.subtitle, item.ctaText, item.ctaLink, item.newsId],
    mapRow: (row) => ({ id: Number(row.id), image: row.image_url, title: row.title, subtitle: row.subtitle, ctaText: row.cta_text, ctaLink: row.cta_link, ...(row.news_id == null ? {} : { newsId: Number(row.news_id) }) }),
  },
  announcements: {
    table: 'announcements',
    select: 'id, text, is_active',
    dbColumns: ['text', 'is_active'],
    normalize(body) {
      const item = { text: typeof body?.text === 'string' ? body.text.replace(/\s+/g, ' ').trim() : '', isActive: body?.isActive === true || body?.is_active === true };
      if (!item.text || item.text.length > 240 || typeof body?.isActive !== 'boolean' && typeof body?.is_active !== 'boolean') return { error: 'Announcement is invalid' };
      return { item };
    },
    values: (item) => [item.text, item.isActive],
    mapRow: (row) => ({ id: Number(row.id), text: row.text, isActive: row.is_active }),
  },
};


const FORM_CATEGORIES = ['Marques', 'Brevets', 'Dessins', 'Autres'];
const GUIDE_ICONS = ['tag', 'bulb', 'swatch', 'book', 'globe', 'banknotes'];
const GUIDE_THEMES = ['blue', 'amber', 'purple', 'emerald', 'orange', 'gray'];
const LEGISLATION_CATEGORIES = ['Fondamental', 'Application', 'Autre'];
const LEGISLATION_TYPES = ['Loi', 'Ordonnance', 'Décret', 'Arrêté', 'Autre'];
const libraryConfig = {
  forms: {
    table: 'content_forms',
    select: 'id, title, description, category, file_url, file_name',
    dbColumns: ['title', 'description', 'category', 'file_url', 'file_name'],
    normalize(body) {
      const item = {
        title: cleanText(body?.title, 150),
        description: cleanText(body?.description, 5000),
        category: cleanText(body?.category, 30),
        fileUrl: typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : '',
        fileName: cleanText(body?.fileName, 120),
      };
      if (item.title.length < 3 || !FORM_CATEGORIES.includes(item.category) || !isSafeLibraryFileValue(item.fileUrl)) {
        return { error: 'Form item is invalid' };
      }
      return { item };
    },
    values: (item) => [item.title, item.description, item.category, item.fileUrl, item.fileName],
    mapRow: (row) => ({ id: Number(row.id), title: row.title, description: row.description, category: row.category, fileUrl: row.file_url, fileName: row.file_name || '' }),
  },
  guides: {
    table: 'content_guides',
    select: 'id, title, description, icon_name, points, color_theme, file_url, file_name',
    dbColumns: ['title', 'description', 'icon_name', 'points', 'color_theme', 'file_url', 'file_name'],
    normalize(body) {
      const points = Array.isArray(body?.points) ? body.points.filter((point) => typeof point === 'string').map((point) => point.trim()).filter(Boolean) : [];
      const item = {
        title: cleanText(body?.title, 150),
        description: cleanText(body?.description, 5000),
        iconName: cleanText(body?.iconName, 30),
        points,
        colorTheme: cleanText(body?.colorTheme, 30),
        fileUrl: typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : '',
        fileName: cleanText(body?.fileName, 120),
      };
      if (item.title.length < 3 || !GUIDE_ICONS.includes(item.iconName) || !GUIDE_THEMES.includes(item.colorTheme) || points.length > 20 || points.some((point) => point.length > 180) || !isSafeLibraryFileValue(item.fileUrl)) {
        return { error: 'Guide item is invalid' };
      }
      return { item };
    },
    values: (item) => [item.title, item.description, item.iconName, JSON.stringify(item.points), item.colorTheme, item.fileUrl, item.fileName],
    mapRow: (row) => ({ id: Number(row.id), title: row.title, description: row.description, iconName: row.icon_name, points: Array.isArray(row.points) ? row.points : [], colorTheme: row.color_theme, fileUrl: row.file_url, fileName: row.file_name || '' }),
  },
  legislation: {
    table: 'content_legislation',
    select: 'id, title, category, type, display_date, description, file_url, file_name',
    dbColumns: ['title', 'category', 'type', 'display_date', 'description', 'file_url', 'file_name'],
    normalize(body) {
      const item = {
        title: cleanText(body?.title, 240),
        category: cleanText(body?.category, 30),
        type: cleanText(body?.type, 30),
        date: cleanText(body?.date, 100),
        description: cleanText(body?.description, 5000),
        fileUrl: typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : '',
        fileName: cleanText(body?.fileName, 120),
      };
      if (item.title.length < 3 || !LEGISLATION_CATEGORIES.includes(item.category) || !LEGISLATION_TYPES.includes(item.type) || !item.date || !isSafeLegislationFileValue(item.fileUrl)) {
        return { error: 'Legislation item is invalid' };
      }
      return { item };
    },
    values: (item) => [item.title, item.category, item.type, item.date, item.description, item.fileUrl, item.fileName],
    mapRow: (row) => ({ id: Number(row.id), title: row.title, category: row.category, type: row.type, date: row.display_date, description: row.description, fileUrl: row.file_url, fileName: row.file_name || '' }),
  },
};


const FORMATION_CATEGORIES = ['Base', 'Avancee'];
const FORMATION_THEMES = ['blue', 'emerald', 'amber', 'rose', 'indigo', 'purple', 'cyan'];
const PROGRAM_EVENT_STATUSES = ['À venir', 'En cours', 'Terminé', 'Annulé'];
const GOPI_API_CATEGORIES = ['Gazette Officielle', 'Inscription au Registre', 'Renouvellement', 'GOPI spéciale GMD', 'GOPI spéciale GDM'];
const programmeConfig = {
  formations: {
    table: 'formations',
    select: 'id, title, category, event_date, event_time, location, description, conditions, color_theme, file_url, file_name',
    publicSelect: 'id, title, category, event_date, event_time, location, description, conditions, color_theme, file_url, file_name',
    dbColumns: ['title', 'category', 'event_date', 'event_time', 'location', 'description', 'conditions', 'color_theme', 'file_url', 'file_name'],
    normalize(body) {
      const item = {
        title: cleanText(body?.title, 120),
        category: cleanText(body?.category, 20),
        date: normalizeProgramDate(body?.date ?? body?.event_date),
        time: cleanText(body?.time ?? body?.event_time, 80),
        location: cleanText(body?.location, 200),
        description: typeof body?.description === 'string' ? body.description.trim() : '',
        conditions: typeof body?.conditions === 'string' ? body.conditions.trim() : '',
        colorTheme: typeof (body?.colorTheme ?? body?.color_theme) === 'string' ? String(body.colorTheme ?? body.color_theme).trim() : '',
        fileUrl: typeof (body?.fileUrl ?? body?.file_url) === 'string' ? String(body.fileUrl ?? body.file_url).trim() : '',
        fileName: cleanText(body?.fileName ?? body?.file_name, 120),
      };
      if (item.title.length < 3 || !FORMATION_CATEGORIES.includes(item.category) || item.date && !isIsoDate(item.date) || item.time.length > 80 || item.location.length > 200 || item.description.length > 5000 || item.conditions.length > 2000 || item.colorTheme && !FORMATION_THEMES.includes(item.colorTheme) || item.fileUrl && !isSafeLibraryFileValue(item.fileUrl)) {
        return { error: 'Formation item is invalid' };
      }
      return { item };
    },
    values: (item) => [item.title, item.category, item.date || null, item.time, item.location, item.description, item.conditions, item.colorTheme || null, item.fileUrl || null, item.fileName || null],
    mapRow: (row) => ({ id: Number(row.id), title: row.title, category: row.category, date: row.event_date ? formatDbDate(row.event_date) : '', time: row.event_time || '', location: row.location || '', description: row.description || '', conditions: row.conditions || '', colorTheme: row.color_theme || undefined, fileUrl: row.file_url || '', fileName: row.file_name || '', ...(row.registration_count === undefined ? {} : { registrationCount: Number(row.registration_count) || 0 }) }),
  },
  events: {
    table: 'events',
    select: 'id, title, event_date, event_time, location, description, image_url, status, places, file_url, file_name',
    publicSelect: 'id, title, event_date, event_time, location, description, image_url, status, places, file_url, file_name, (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = events.id) AS registration_count',
    dbColumns: ['title', 'event_date', 'event_time', 'location', 'description', 'image_url', 'status', 'places', 'file_url', 'file_name'],
    normalize(body) {
      const item = {
        title: cleanText(body?.title, 180),
        date: typeof (body?.date ?? body?.event_date) === 'string' ? String(body.date ?? body.event_date).trim() : '',
        time: cleanText(body?.time ?? body?.event_time, 80),
        location: cleanText(body?.location, 180),
        description: typeof body?.description === 'string' ? body.description.trim() : '',
        image: typeof (body?.image ?? body?.image_url) === 'string' ? String(body.image ?? body.image_url).trim() : '',
        status: cleanText(body?.status, 30),
        places: cleanText(body?.places, 180),
        fileUrl: typeof (body?.fileUrl ?? body?.file_url) === 'string' ? String(body.fileUrl ?? body.file_url).trim() : '',
        fileName: cleanText(body?.fileName ?? body?.file_name, 120),
      };
      if (item.title.length < 3 || !isIsoDate(item.date) || !isValidProgramEventTime(item.time) || !item.location || !PROGRAM_EVENT_STATUSES.includes(item.status) || item.description.length > 20000 || item.places.length > 180 || !isSafeImageValue(item.image) || item.fileUrl && !isSafeLibraryFileValue(item.fileUrl)) {
        return { error: 'Event item is invalid' };
      }
      return { item };
    },
    values: (item) => [item.title, item.date, item.time, item.location, item.description, item.image, item.status, item.places || null, item.fileUrl || null, item.fileName || null],
    mapRow: (row) => ({ id: Number(row.id), title: row.title, date: formatDbDate(row.event_date), time: row.event_time || '', location: row.location || '', description: row.description || '', image: row.image_url || '', status: row.status, places: row.places || '', fileUrl: row.file_url || '', fileName: row.file_name || '', ...(row.registration_count === undefined ? {} : { registrationCount: Number(row.registration_count) || 0 }) }),
  },
  jobs: {
    table: 'jobs',
    select: 'id, title, department, location, employment_type, experience, description, status, publish_date, deadline, file_url',
    publicSelect: 'id, title, department, location, employment_type, experience, description, status, publish_date, deadline, file_url',
    dbColumns: ['title', 'department', 'location', 'employment_type', 'experience', 'description', 'status', 'publish_date', 'deadline', 'file_url'],
    normalize(body) {
      const item = {
        title: cleanText(body?.title, 180),
        department: cleanText(body?.department, 160),
        location: cleanText(body?.location, 180),
        type: cleanText(body?.type ?? body?.employment_type, 30),
        experience: cleanText(body?.experience, 180),
        description: typeof body?.description === 'string' ? body.description.trim() : '',
        status: cleanText(body?.status, 20),
        publishDate: cleanText(body?.publishDate ?? body?.publish_date, 10),
        deadline: cleanText(body?.deadline, 10),
        fileUrl: typeof (body?.fileUrl ?? body?.file_url) === 'string' ? String(body.fileUrl ?? body.file_url).trim() : '',
      };
      if (item.title.length < 3 || !item.department || !item.location || !['CDI', 'CDD', 'Stage', 'Consultant'].includes(item.type) || !['Ouvert', 'Fermé'].includes(item.status) || !isIsoDate(item.publishDate) || item.deadline && !isIsoDate(item.deadline) || item.deadline && item.deadline < item.publishDate || !stripHtml(item.description).trim() || item.description.length > 50000 || item.fileUrl && !isSafeLibraryFileValue(item.fileUrl)) {
        return { error: 'Job item is invalid' };
      }
      return { item };
    },
    values: (item) => [item.title, item.department, item.location, item.type, item.experience, item.description, item.status, item.publishDate, item.deadline || null, item.fileUrl || null],
    mapRow: (row) => ({ id: Number(row.id), title: row.title, department: row.department || '', location: row.location || '', type: row.employment_type, experience: row.experience || '', description: row.description || '', status: row.status, publishDate: formatDbDate(row.publish_date), deadline: row.deadline ? formatDbDate(row.deadline) : '', fileUrl: row.file_url || '' }),
  },
  gopi: {
    table: 'gopi_items',
    select: 'id, title, publication_period, category, description, file_url, file_name, cover_image',
    publicSelect: 'id, title, publication_period, category, description, file_url, file_name, cover_image',
    dbColumns: ['title', 'publication_period', 'category', 'description', 'file_url', 'file_name', 'cover_image'],
    normalize(body) {
      const item = {
        title: cleanText(body?.title, 180),
        date: cleanText(body?.date ?? body?.publication_period, 100),
        category: cleanText(body?.category, 80),
        description: typeof body?.description === 'string' ? body.description.trim() : '',
        fileUrl: typeof (body?.fileUrl ?? body?.file_url) === 'string' ? String(body.fileUrl ?? body.file_url).trim() : '',
        fileName: cleanText(body?.fileName ?? body?.file_name, 140),
        coverImage: typeof (body?.coverImage ?? body?.cover_image) === 'string' ? String(body.coverImage ?? body.cover_image).trim() : '',
      };
      const validPdf = !item.fileUrl || /^data:application\/pdf;base64,[a-z0-9+/=]+$/i.test(item.fileUrl) || /^https:\/\/.+\.pdf(?:[?#].*)?$/i.test(item.fileUrl);
      if (item.title.length < 3 || !item.date || !GOPI_API_CATEGORIES.includes(item.category) || item.description.length > 5000 || !validPdf || item.fileUrl && !isSafeLibraryFileValue(item.fileUrl) || !isSafeImageValue(item.coverImage)) {
        return { error: 'GOPI item is invalid' };
      }
      return { item };
    },
    values: (item) => [item.title, item.date, item.category, item.description, item.fileUrl || null, item.fileName || null, item.coverImage || null],
    mapRow: (row) => ({ id: Number(row.id), title: row.title, date: row.publication_period, category: row.category, description: row.description || '', fileUrl: row.file_url || '', fileName: row.file_name || '', coverImage: row.cover_image || '' }),
  },
};

function stripHtml(value) {
  return typeof value === 'string' ? value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&') : '';
}

function programmeTable(collection) {
  return programmeConfig[collection] || null;
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeProgramDate(value) {
  const input = typeof value === 'string' ? value.trim() : '';
  if (!input || isIsoDate(input)) return input;
  const match = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/.exec(input);
  if (!match) return input;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return input;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return input;
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function formatDbDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === 'string' ? value.slice(0, 10) : '';
}

function isValidProgramEventTime(value) {
  if (typeof value !== 'string') return false;
  return /^(?:[01]\d|2[0-3]):[0-5]\d(?: - (?:[01]\d|2[0-3]):[0-5]\d)?$/.test(value);
}

function normalizeRegistration(body, kind) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const item = {
    parentId: Number(kind === 'events' ? body?.eventId : body?.formationId),
    name: cleanText(body?.name, 160).replace(/\s+/g, ' '),
    email,
    phone: cleanText(body?.phone, 50),
    organization: cleanText(body?.organization, 200).replace(/\s+/g, ' '),
    ...(kind === 'formations' ? { message: typeof body?.message === 'string' ? body.message.trim().slice(0, 2000) : '' } : {}),
  };
  if (!Number.isSafeInteger(item.parentId) || item.parentId < 1 || item.name.length < 2 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || item.phone.length > 50 || kind === 'events' && item.phone.length < 3 || item.organization.length > 200 || item.message?.length > 2000) {
    return { error: 'Registration data is invalid' };
  }
  return { item };
}


const JOB_APPLICATION_STATUSES = ['Nouvelle', 'En cours', 'Rejetée', 'Acceptée'];
const GOPI_ORDER_STATUSES = ['En attente', 'Paiement confirmé', 'Envoyé', 'Annulé'];
const GOPI_PAYMENT_METHODS_API = ['MVola', 'Orange Money', 'Airtel Money', 'Virement Bancaire', 'Espèces', 'Chèque'];
const GOPI_PRICE_MGA_API = 10000;
const APPLICATION_FILE_MIME_API = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function normalizeApplicantFile(value, fileName) {
  const safeName = cleanText(fileName, 120).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/\s+/g, '_').replace(/^\.+|\.+$/g, '');
  const extension = /\.([^.]+)$/.exec(safeName)?.[1]?.toLowerCase();
  const match = typeof value === 'string'
    ? /^data:(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,([a-z0-9+/=]+)$/i.exec(value)
    : null;
  if (!match || !extension || !APPLICATION_FILE_MIME_API[extension] || match[1].toLowerCase() !== APPLICATION_FILE_MIME_API[extension]) return null;
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > 700 * 1024) return null;
  const signatureValid = extension === 'pdf'
    ? bytes.subarray(0, 5).toString('ascii') === '%PDF-'
    : extension === 'doc'
      ? Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]).equals(bytes.subarray(0, 8))
      : bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  if (!signatureValid) return null;
  return { value, fileName: safeName };
}

function normalizeJobApplicationSubmission(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const cv = normalizeApplicantFile(body?.cvUrl, body?.cvFileName);
  const coverLetter = body?.coverLetterUrl ? normalizeApplicantFile(body.coverLetterUrl, body?.coverLetterFileName) : null;
  const jobIdRaw = body?.jobId;
  const jobId = jobIdRaw === undefined || jobIdRaw === null || jobIdRaw === '' ? null : Number(jobIdRaw);
  const item = {
    jobId,
    firstName: cleanText(body?.firstName, 100).replace(/\s+/g, ' '),
    lastName: cleanText(body?.lastName, 100).replace(/\s+/g, ' '),
    email,
    phone: cleanText(body?.phone, 50).replace(/\s+/g, ' '),
    message: typeof body?.message === 'string' ? body.message.trim().slice(0, 3000) : '',
    cv,
    coverLetter,
  };
  if (jobId !== null && (!Number.isSafeInteger(jobId) || jobId < 1) || item.firstName.length < 1 || item.lastName.length < 1 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || item.phone.replace(/\D/g, '').length < 7 || item.message.length > 3000 || !cv || body?.coverLetterUrl && !coverLetter) {
    return { error: 'Application data is invalid' };
  }
  return { item };
}

function isGopiPdfValue(value) {
  return typeof value === 'string' && (
    /^data:application\/pdf;base64,[a-z0-9+/=]+$/i.test(value)
    || /^https:\/\/.+\.pdf(?:[?#].*)?$/i.test(value)
  );
}

function normalizeGopiOrderSubmission(body) {
  const item = {
    gopiId: Number(body?.gopiId),
    customerName: cleanText(body?.customerName, 160).replace(/\s+/g, ' '),
    customerEmail: typeof body?.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '',
    customerPhone: cleanText(body?.customerPhone, 50).replace(/\s+/g, ' '),
    paymentMethod: cleanText(body?.paymentMethod, 40),
    transactionRef: cleanText(body?.transactionRef, 200).replace(/\s+/g, ' '),
  };
  if (!Number.isSafeInteger(item.gopiId) || item.gopiId < 1 || item.customerName.length < 2 || item.customerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.customerEmail) || item.customerPhone.replace(/\D/g, '').length < 7 || !GOPI_PAYMENT_METHODS_API.includes(item.paymentMethod) || !['Espèces', 'Chèque'].includes(item.paymentMethod) && item.transactionRef.length < 3) {
    return { error: 'GOPI order data is invalid' };
  }
  return { item };
}

function mapGopiOrder(row) {
  const amount = row.amount_mga === null || row.amount_mga === undefined ? undefined : Number(row.amount_mga);
  return {
    id: Number(row.id),
    ...(row.gopi_id === null || row.gopi_id === undefined ? {} : { gopiId: Number(row.gopi_id) }),
    gopiTitle: row.gopi_title || '',
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    date: row.order_date instanceof Date ? row.order_date.toISOString() : String(row.order_date),
    ...(Number.isFinite(amount) ? { amountMGA: amount } : {}),
    status: row.status,
    ...(row.transaction_ref ? { transactionRef: row.transaction_ref } : {}),
    ...(row.payment_method ? { paymentMethod: row.payment_method } : {}),
    ...(row.payment_confirmed_at ? { paymentConfirmedAt: row.payment_confirmed_at instanceof Date ? row.payment_confirmed_at.toISOString() : String(row.payment_confirmed_at) } : {}),
    ...(row.sent_at ? { sentAt: row.sent_at instanceof Date ? row.sent_at.toISOString() : String(row.sent_at) } : {}),
  };
}

function eventCapacityFromPlaces(value) {
  if (typeof value !== 'string') return null;
  const match = /(?:capacit[ée]|maximum|max|limit[ée]e?s?)\D{0,16}(\d{1,6})|(\d{1,6})\s*(?:places?|participants?|inscriptions?)/i.exec(value.trim());
  const count = Number(match?.[1] || match?.[2]);
  return Number.isSafeInteger(count) && count >= 0 ? count : null;
}

function cleanText(value, maximum) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
}

function isSafeLibraryFileValue(value) {
  if (!value || typeof value !== 'string' || value.length > 2_800_000 || /[\u0000-\u0020]/.test(value)) return false;
  if (/^data:(?:application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,[a-z0-9+/=]+$/i.test(value)) return true;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.split('/').includes('..')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function isSafeLegislationFileValue(value) {
  if (!isSafeLibraryFileValue(value)) return false;
  return !value.startsWith('data:') || /^data:application\/pdf;base64,[a-z0-9+/=]+$/i.test(value);
}

function libraryTable(collection) {
  return libraryConfig[collection] || null;
}

const SITE_SETTING_KEYS = ['site_config', 'home_resources'];

function normalizeSiteSetting(key, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { error: 'Setting value is invalid' };
  if (key === 'site_config') {
    const image = typeof value.newsSectionBgImage === 'string' ? value.newsSectionBgImage.trim() : '';
    if (image && !isSafeImageValue(image)) return { error: 'Site configuration image is invalid' };
    return { value: image ? { newsSectionBgImage: image } : {} };
  }
  if (key === 'home_resources') {
    const item = {
      omapiHourTitle: cleanText(value.omapiHourTitle, 100),
      omapiHourDesc: cleanText(value.omapiHourDesc, 500),
      omapiHourThumbnail: typeof value.omapiHourThumbnail === 'string' ? value.omapiHourThumbnail.trim() : '',
      omapiHourUrl: typeof value.omapiHourUrl === 'string' ? value.omapiHourUrl.trim() : '',
      videoTitle: cleanText(value.videoTitle, 100),
      videoDesc: cleanText(value.videoDesc, 500),
      videoThumbnail: typeof value.videoThumbnail === 'string' ? value.videoThumbnail.trim() : '',
      videoDuration: cleanText(value.videoDuration, 12),
      videoUrl: typeof value.videoUrl === 'string' ? value.videoUrl.trim() : '',
    };
    const safeResourceLink = (link) => !link || isSafeLinkValue(link) || /^http:\/\//i.test(link);
    const safeResourceImage = (image) => !image || isSafeImageValue(image) && image.length <= 1_500_000;
    if (!item.omapiHourTitle || !item.omapiHourDesc || !item.videoTitle || !item.videoDesc || !safeResourceImage(item.omapiHourThumbnail) || !safeResourceImage(item.videoThumbnail) || !safeResourceLink(item.omapiHourUrl) || !safeResourceLink(item.videoUrl) || item.videoDuration && !/^(?:\d{1,2}:)?\d{1,2}:[0-5]\d$/.test(item.videoDuration)) {
      return { error: 'Home resources configuration is invalid' };
    }
    return { value: item };
  }
  return { error: 'Setting key not found' };
}

function isSafeImageValue(value) {
  if (!value) return true;
  if (value.length > 2_100_000 || /[\u0000-\u0020]/.test(value)) return false;
  if (/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value)) return true;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.split('/').includes('..')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function isSafeLinkValue(value) {
  if (!value) return true;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.split('/').includes('..')) return true;
  if (value.startsWith('#')) return true;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'https:' || parsed.protocol === 'mailto:') && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function editorialTable(collection) {
  return editorialConfig[collection] || null;
}

function validateEditorialId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function loginRateKey(request, email) {
  return `${request.ip || request.socket.remoteAddress || 'unknown'}:${email}`;
}

function getLoginBucket(key, now = Date.now()) {
  const previous = loginFailures.get(key);
  if (!previous || now - previous.startedAt >= LOGIN_WINDOW_MS) {
    const fresh = { startedAt: now, failures: 0 };
    loginFailures.set(key, fresh);
    return fresh;
  }
  return previous;
}

function pruneLoginBuckets(now = Date.now()) {
  if (loginFailures.size < 500) return;
  for (const [key, bucket] of loginFailures) {
    if (now - bucket.startedAt >= LOGIN_WINDOW_MS) loginFailures.delete(key);
  }
}

function requireAuth(request, response, next) {
  const authorization = request.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+([A-Za-z0-9_-]{40,})$/);
  if (!match) {
    return response.status(401).json({ error: 'Authentication required' });
  }

  const tokenHash = hashSessionToken(match[1]);
  pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.status, s.expires_at
       FROM admin_sessions s
       JOIN app_users u ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > NOW()
        AND u.status = 'Actif'
      LIMIT 1`,
    [tokenHash],
  ).then(({ rows }) => {
    if (!rows.length) {
      return response.status(401).json({ error: 'Session expired or invalid' });
    }
    const { expires_at: expiresAt, ...user } = rows[0];
    request.auth = { tokenHash, expiresAt, user };
    return next();
  }).catch(() => {
    console.error('OMAPI authentication lookup failed');
    return response.status(503).json({ error: 'Authentication service unavailable' });
  });
}

function requireAdmin(request, response, next) {
  if (request.auth?.user?.role !== 'Admin') {
    return response.status(403).json({ error: 'Administrator role required' });
  }
  return next();
}

function requireContentManager(request, response, next) {
  if (!['Admin', 'Éditeur'].includes(request.auth?.user?.role)) {
    return response.status(403).json({ error: 'Content manager role required' });
  }
  return next();
}

function activityEntityForAdminPath(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'api' && parts[1] === 'auth' && parts[2] === 'profile') {
    return { key: 'omapi_users', label: 'profile' };
  }
  if (parts[0] !== 'api' || parts[1] !== 'admin') return null;
  if (parts[2] === 'activity-logs' || parts[2] === 'notification-reads') return null;
  if (parts[2] === 'programs' && ['events', 'formations', 'jobs', 'gopi'].includes(parts[3])) {
    return { key: `omapi_${parts[3]}`, label: parts[3] };
  }
  if (parts[2] === 'library' && ['forms', 'guides', 'legislation'].includes(parts[3])) {
    return { key: `omapi_${parts[3]}`, label: parts[3] };
  }
  if (parts[2] === 'editorial' && ['news', 'slides', 'announcements'].includes(parts[3])) {
    return { key: `omapi_${parts[3]}`, label: parts[3] };
  }
  if (parts[2] === 'registrations' && ['events', 'formations'].includes(parts[3])) {
    return { key: parts[3] === 'events' ? 'omapi_event_registrations' : 'omapi_formation_registrations', label: `${parts[3]} registrations` };
  }
  if (parts[2] === 'job-applications') return { key: 'omapi_job_applications', label: 'job applications' };
  if (parts[2] === 'gopi' && parts[3] === 'orders') return { key: 'omapi_gopi_orders', label: 'GOPI orders' };
  if (parts[2] === 'users') return { key: 'omapi_users', label: 'users' };
  if (parts[2] === 'settings' && ['site_config', 'home_resources'].includes(parts[3])) {
    return { key: parts[3] === 'site_config' ? 'omapi_site_config' : 'omapi_home_resources', label: 'site settings' };
  }
  return null;
}

app.use((request, response, next) => {
  const method = request.method.toUpperCase();
  const entity = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) ? activityEntityForAdminPath(request.path) : null;
  if (!entity) return next();
  const originalJson = response.json.bind(response);
  response.json = (body) => {
    response.locals.activityResponseBody = body;
    return originalJson(body);
  };
  response.on('finish', () => {
    if (response.statusCode < 200 || response.statusCode >= 300 || !request.auth?.user?.id) return;
    const body = response.locals.activityResponseBody;
    const pathId = request.path.split('/').filter(Boolean).at(-1);
    const responseId = body?.item?.id ?? body?.user?.id ?? body?.id ?? body?.item?.key ?? body?.key;
    const entityId = responseId ?? (/^\d+$/.test(pathId || '') ? pathId : undefined);
    const verb = method === 'POST' ? 'ajouté' : method === 'DELETE' ? 'supprimé' : 'mis à jour';
    const action = method === 'POST' ? 'Ajout effectué' : method === 'DELETE' ? 'Suppression effectuée' : 'Mise à jour effectuée';
    const details = entityId === undefined
      ? `Élément ${verb} dans ${entity.label}.`
      : `Élément ${verb} (ID: ${String(entityId).slice(0, 120)}) dans ${entity.label}.`;
    pool.query(
      `INSERT INTO activity_logs (user_id, user_name, entity_key, entity_id, action, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [request.auth.user.id, String(request.auth.user.name || 'Administration').slice(0, 200), entity.key, entityId === undefined ? null : String(entityId), action, details],
    ).catch(() => console.error('OMAPI activity log write failed'));
  });
  return next();
});

app.get('/', (_request, response) => {
  response.json({ service: 'OMAPI API', status: 'running' });
});

app.get('/health', (_request, response) => {
  response.json({ service: 'OMAPI API', status: 'running' });
});

app.get('/api/health/database', async (_request, response) => {
  const required = ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return response.status(503).json({ status: 'unavailable', reason: 'database configuration incomplete' });
  }

  try {
    await pool.query('SELECT 1');
    return response.json({ status: 'connected' });
  } catch {
    console.error('OMAPI PostgreSQL health check failed');
    return response.status(503).json({ status: 'unavailable', reason: 'database connection failed' });
  }
});

app.post('/api/auth/login', async (request, response) => {
  response.set('Cache-Control', 'no-store');
  pruneLoginBuckets();

  const email = normalizeEmail(request.body?.email);
  const password = request.body?.password;
  const key = loginRateKey(request, email);
  const bucket = getLoginBucket(key);
  if (bucket.failures >= LOGIN_MAX_FAILURES) {
    const retryAfter = Math.max(1, Math.ceil((LOGIN_WINDOW_MS - (Date.now() - bucket.startedAt)) / 1000));
    response.set('Retry-After', String(retryAfter));
    return response.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }

  if (!email || email.length > 320 || typeof password !== 'string' || password.length > 1024) {
    bucket.failures += 1;
    return response.status(401).json({ error: 'Invalid email or password' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, status, password_hash
         FROM app_users
        WHERE LOWER(email) = $1
        LIMIT 1`,
      [email],
    );
    const account = rows[0];
    const passwordMatches = account ? await verifyPassword(password, account.password_hash) : false;
    if (!account || account.status !== 'Actif' || !passwordMatches) {
      bucket.failures += 1;
      return response.status(401).json({ error: 'Invalid email or password' });
    }

    loginFailures.delete(key);
    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const { rows: sessions } = await pool.query(
      `INSERT INTO admin_sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 hour'))
       RETURNING expires_at`,
      [account.id, tokenHash, SESSION_HOURS],
    );
    const { password_hash: _passwordHash, ...user } = account;
    return response.status(200).json({
      token,
      tokenType: 'Bearer',
      expiresAt: sessions[0].expires_at,
      user,
    });
  } catch {
    console.error('OMAPI login failed');
    return response.status(503).json({ error: 'Authentication service unavailable' });
  }
});

app.get('/api/auth/me', requireAuth, (_request, response) => {
  response.set('Cache-Control', 'no-store');
  return response.json({ user: _request.auth.user, expiresAt: _request.auth.expiresAt });
});

app.patch('/api/auth/profile', requireAuth, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const name = typeof request.body?.name === 'string' ? request.body.name.trim().replace(/\s+/g, ' ') : '';
  const email = normalizeEmail(request.body?.email);
  const currentPassword = request.body?.currentPassword;
  const newPassword = request.body?.password;
  const changingPassword = Boolean(currentPassword || newPassword);

  if (name.length < 2 || name.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return response.status(400).json({ error: 'Name or email is invalid' });
  }
  if (changingPassword && (typeof currentPassword !== 'string' || typeof newPassword !== 'string')) {
    return response.status(400).json({ error: 'Current and new passwords are both required' });
  }
  if (changingPassword && (newPassword.length < 12 || newPassword.length > 1024)) {
    return response.status(400).json({ error: 'New password must contain at least 12 characters' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: currentRows } = await client.query(
      'SELECT password_hash FROM app_users WHERE id = $1 AND status = \'Actif\' FOR UPDATE',
      [request.auth.user.id],
    );
    if (!currentRows.length) {
      await client.query('ROLLBACK');
      return response.status(401).json({ error: 'Account is unavailable' });
    }

    let passwordHash = currentRows[0].password_hash;
    if (changingPassword) {
      const matches = await verifyPassword(currentPassword, passwordHash);
      if (!matches) {
        await client.query('ROLLBACK');
        return response.status(400).json({ error: 'Current password is incorrect' });
      }
      passwordHash = await hashPassword(newPassword);
    }

    const { rows: updatedRows } = await client.query(
      `UPDATE app_users
          SET name = $1,
              email = $2,
              password_hash = $3,
              password_changed_at = CASE WHEN $4::boolean THEN NOW() ELSE password_changed_at END,
              updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, email, role, status`,
      [name, email, passwordHash, changingPassword, request.auth.user.id],
    );

    if (changingPassword) {
      await client.query(
        `UPDATE admin_sessions
            SET revoked_at = NOW()
          WHERE user_id = $1 AND token_hash <> $2 AND revoked_at IS NULL`,
        [request.auth.user.id, request.auth.tokenHash],
      );
    }
    await client.query('COMMIT');
    return response.json({ user: updatedRows[0] });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error?.code === '23505') {
      return response.status(409).json({ error: 'That email is already assigned to another account' });
    }
    console.error('OMAPI profile update failed');
    return response.status(503).json({ error: 'Profile service unavailable' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/logout', requireAuth, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  try {
    await pool.query(
      'UPDATE admin_sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
      [request.auth.tokenHash],
    );
    return response.json({ ok: true });
  } catch {
    console.error('OMAPI logout failed');
    return response.status(503).json({ error: 'Authentication service unavailable' });
  }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (_request, response) => {
  response.set('Cache-Control', 'no-store');
  try {
    const { rows } = await pool.query(
      `SELECT ${publicUserFields} FROM app_users ORDER BY created_at ASC, id ASC`,
    );
    return response.json({ users: rows });
  } catch {
    console.error('OMAPI admin user list failed');
    return response.status(503).json({ error: 'User service unavailable' });
  }
});

app.post('/api/admin/users', requireAuth, requireAdmin, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const name = typeof request.body?.name === 'string' ? request.body.name.trim().replace(/\s+/g, ' ') : '';
  const email = normalizeEmail(request.body?.email);
  const role = request.body?.role;
  const status = request.body?.status;
  const password = request.body?.password;

  if (name.length < 2 || name.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return response.status(400).json({ error: 'Name or email is invalid' });
  }
  if (!['Admin', 'Éditeur'].includes(role) || !['Actif', 'Inactif'].includes(status)) {
    return response.status(400).json({ error: 'Role or status is invalid' });
  }
  if (typeof password !== 'string' || password.trim() !== password || password.length < 12 || password.length > 1024) {
    return response.status(400).json({ error: 'Password must contain at least 12 characters' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO app_users (name, email, role, status, password_hash, password_changed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, name, email, role, status, created_at, updated_at`,
      [name, email, role, status, passwordHash],
    );
    return response.status(201).json({ user: rows[0] });
  } catch (error) {
    if (error?.code === '23505') {
      return response.status(409).json({ error: 'That email is already assigned to another account' });
    }
    console.error('OMAPI admin user create failed');
    return response.status(503).json({ error: 'User service unavailable' });
  }
});

app.patch('/api/admin/users/:id', requireAuth, requireAdmin, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const userId = request.params.id;
  if (!/^\d+$/.test(userId)) return response.status(400).json({ error: 'User id is invalid' });

  const name = typeof request.body?.name === 'string' ? request.body.name.trim().replace(/\s+/g, ' ') : '';
  const email = normalizeEmail(request.body?.email);
  const role = request.body?.role;
  const status = request.body?.status;
  const password = request.body?.password;
  const changingPassword = typeof password === 'string' && password.length > 0;

  if (name.length < 2 || name.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return response.status(400).json({ error: 'Name or email is invalid' });
  }
  if (!['Admin', 'Éditeur'].includes(role) || !['Actif', 'Inactif'].includes(status)) {
    return response.status(400).json({ error: 'Role or status is invalid' });
  }
  if (changingPassword && (password.trim() !== password || password.length < 12 || password.length > 1024)) {
    return response.status(400).json({ error: 'Password must contain at least 12 characters' });
  }
  if (password !== undefined && password !== '' && typeof password !== 'string') {
    return response.status(400).json({ error: 'Password is invalid' });
  }

  let passwordHash;
  try {
    if (changingPassword) passwordHash = await hashPassword(password);
  } catch {
    return response.status(400).json({ error: 'Password could not be processed' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE app_users IN SHARE ROW EXCLUSIVE MODE');
    const { rows: currentRows } = await client.query(
      `SELECT id, name, email, role, status FROM app_users WHERE id = $1 FOR UPDATE`,
      [userId],
    );
    if (!currentRows.length) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'User not found' });
    }
    const current = currentRows[0];
    const isPrimary = String(current.id) === '1';
    const isSelf = String(current.id) === String(request.auth.user.id);

    if (isPrimary && (email !== normalizeEmail(current.email) || role !== 'Admin' || status !== 'Actif')) {
      await client.query('ROLLBACK');
      return response.status(400).json({ error: 'The primary administrator email, role, and active status are protected' });
    }
    if (isSelf && (role !== current.role || status !== current.status)) {
      await client.query('ROLLBACK');
      return response.status(400).json({ error: 'You cannot change your own role or status' });
    }
    if (isSelf && changingPassword) {
      await client.query('ROLLBACK');
      return response.status(400).json({ error: 'Use the profile page to change your own password' });
    }

    const { rows: remainingAdminRows } = await client.query(
      `SELECT COUNT(*)::int AS count
         FROM app_users
        WHERE id <> $1 AND role = 'Admin' AND status = 'Actif'`,
      [userId],
    );
    const targetRemainsAdmin = role === 'Admin' && status === 'Actif';
    if (!targetRemainsAdmin && remainingAdminRows[0].count === 0) {
      await client.query('ROLLBACK');
      return response.status(409).json({ error: 'At least one active administrator must remain' });
    }

    const { rows: updatedRows } = await client.query(
      `UPDATE app_users
          SET name = $1,
              email = $2,
              role = $3,
              status = $4,
              password_hash = COALESCE($5, password_hash),
              password_changed_at = CASE WHEN $5::text IS NULL THEN password_changed_at ELSE NOW() END,
              updated_at = NOW()
        WHERE id = $6
        RETURNING id, name, email, role, status, created_at, updated_at`,
      [name, email, role, status, passwordHash || null, userId],
    );
    if (status === 'Inactif' || changingPassword || role !== current.role) {
      await client.query(
        `UPDATE admin_sessions SET revoked_at = NOW()
          WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId],
      );
    }
    await client.query('COMMIT');
    return response.json({ user: updatedRows[0] });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error?.code === '23505') {
      return response.status(409).json({ error: 'That email is already assigned to another account' });
    }
    console.error('OMAPI admin user update failed');
    return response.status(503).json({ error: 'User service unavailable' });
  } finally {
    client.release();
  }
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const userId = request.params.id;
  if (!/^\d+$/.test(userId)) return response.status(400).json({ error: 'User id is invalid' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE app_users IN SHARE ROW EXCLUSIVE MODE');
    const { rows } = await client.query(
      `SELECT id FROM app_users WHERE id = $1 FOR UPDATE`,
      [userId],
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'User not found' });
    }
    if (String(rows[0].id) === '1') {
      await client.query('ROLLBACK');
      return response.status(403).json({ error: 'The primary administrator cannot be deleted' });
    }
    if (String(rows[0].id) === String(request.auth.user.id)) {
      await client.query('ROLLBACK');
      return response.status(403).json({ error: 'You cannot delete your own account' });
    }
    const { rows: admins } = await client.query(
      `SELECT COUNT(*)::int AS count
         FROM app_users
        WHERE id <> $1 AND role = 'Admin' AND status = 'Actif'`,
      [userId],
    );
    if (admins[0].count === 0) {
      await client.query('ROLLBACK');
      return response.status(409).json({ error: 'The last active administrator cannot be deleted' });
    }
    await client.query('DELETE FROM app_users WHERE id = $1', [userId]);
    await client.query('COMMIT');
    return response.json({ ok: true, id: userId });
  } catch {
    await client.query('ROLLBACK').catch(() => {});
    console.error('OMAPI admin user delete failed');
    return response.status(503).json({ error: 'User service unavailable' });
  } finally {
    client.release();
  }
});


app.get('/api/content/settings', async (_request, response) => {
  response.set('Cache-Control', 'no-store');
  try {
    const { rows } = await pool.query('SELECT setting_key, value FROM site_settings WHERE setting_key = ANY($1::text[])', [SITE_SETTING_KEYS]);
    const settings = Object.fromEntries(SITE_SETTING_KEYS.map((key) => [key, null]));
    for (const row of rows) settings[row.setting_key] = row.value;
    return response.json({ settings });
  } catch {
    console.error('OMAPI public settings read failed');
    return response.status(503).json({ error: 'Settings service unavailable' });
  }
});

app.get('/api/content/:collection', async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = editorialTable(request.params.collection) || libraryTable(request.params.collection) || programmeTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Content collection not found' });
  try {
    const { rows } = await pool.query(`SELECT ${config.publicSelect || config.select} FROM ${config.table} ORDER BY id ASC`);
    return response.json({ items: rows.map(config.mapRow) });
  } catch {
    console.error('OMAPI public content read failed');
    return response.status(503).json({ error: 'Content service unavailable' });
  }
});

app.get('/api/admin/editorial/:collection', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = editorialTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Content collection not found' });
  try {
    const { rows } = await pool.query(`SELECT ${config.select} FROM ${config.table} ORDER BY id ASC`);
    return response.json({ items: rows.map(config.mapRow) });
  } catch {
    console.error('OMAPI admin editorial read failed');
    return response.status(503).json({ error: 'Content service unavailable' });
  }
});

app.post('/api/admin/editorial/:collection', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = editorialTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Content collection not found' });
  const normalized = config.normalize(request.body);
  if (normalized.error) return response.status(400).json({ error: normalized.error });
  const placeholders = config.dbColumns.map((_, index) => `$${index + 1}`).join(', ');
  try {
    const { rows } = await pool.query(
      `INSERT INTO ${config.table} (${config.dbColumns.join(', ')}) VALUES (${placeholders}) RETURNING ${config.select}`,
      config.values(normalized.item),
    );
    return response.status(201).json({ item: config.mapRow(rows[0]) });
  } catch (error) {
    if (error?.code === '23503') return response.status(400).json({ error: 'Linked content item does not exist' });
    console.error('OMAPI editorial create failed');
    return response.status(503).json({ error: 'Content service unavailable' });
  }
});

app.patch('/api/admin/editorial/:collection/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = editorialTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Content collection not found' });
  const id = validateEditorialId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Content id is invalid' });
  const normalized = config.normalize(request.body);
  if (normalized.error) return response.status(400).json({ error: normalized.error });
  const assignments = config.dbColumns.map((column, index) => `${column} = $${index + 1}`).join(', ');
  try {
    const { rows } = await pool.query(
      `UPDATE ${config.table} SET ${assignments}, updated_at = NOW() WHERE id = $${config.dbColumns.length + 1} RETURNING ${config.select}`,
      [...config.values(normalized.item), id],
    );
    if (!rows.length) return response.status(404).json({ error: 'Content item not found' });
    return response.json({ item: config.mapRow(rows[0]) });
  } catch (error) {
    if (error?.code === '23503') return response.status(400).json({ error: 'Linked content item does not exist' });
    console.error('OMAPI editorial update failed');
    return response.status(503).json({ error: 'Content service unavailable' });
  }
});

app.delete('/api/admin/editorial/:collection/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = editorialTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Content collection not found' });
  const id = validateEditorialId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Content id is invalid' });
  try {
    const result = await pool.query(`DELETE FROM ${config.table} WHERE id = $1`, [id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Content item not found' });
    return response.json({ ok: true, id });
  } catch {
    console.error('OMAPI editorial delete failed');
    return response.status(503).json({ error: 'Content service unavailable' });
  }
});




app.get('/api/admin/library/:collection', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = libraryTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Library collection not found' });
  try {
    const { rows } = await pool.query(`SELECT ${config.select} FROM ${config.table} ORDER BY id ASC`);
    return response.json({ items: rows.map(config.mapRow) });
  } catch {
    console.error('OMAPI library read failed');
    return response.status(503).json({ error: 'Library service unavailable' });
  }
});

app.post('/api/admin/library/:collection', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = libraryTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Library collection not found' });
  const normalized = config.normalize(request.body);
  if (normalized.error) return response.status(400).json({ error: normalized.error });
  const placeholders = config.dbColumns.map((_, index) => `$${index + 1}`).join(', ');
  try {
    const { rows } = await pool.query(
      `INSERT INTO ${config.table} (${config.dbColumns.join(', ')}) VALUES (${placeholders}) RETURNING ${config.select}`,
      config.values(normalized.item),
    );
    return response.status(201).json({ item: config.mapRow(rows[0]) });
  } catch {
    console.error('OMAPI library create failed');
    return response.status(503).json({ error: 'Library service unavailable' });
  }
});

app.patch('/api/admin/library/:collection/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = libraryTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Library collection not found' });
  const id = validateEditorialId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Document id is invalid' });
  const normalized = config.normalize(request.body);
  if (normalized.error) return response.status(400).json({ error: normalized.error });
  const assignments = config.dbColumns.map((column, index) => `${column} = $${index + 1}`).join(', ');
  try {
    const { rows } = await pool.query(
      `UPDATE ${config.table} SET ${assignments}, updated_at = NOW() WHERE id = $${config.dbColumns.length + 1} RETURNING ${config.select}`,
      [...config.values(normalized.item), id],
    );
    if (!rows.length) return response.status(404).json({ error: 'Document not found' });
    return response.json({ item: config.mapRow(rows[0]) });
  } catch {
    console.error('OMAPI library update failed');
    return response.status(503).json({ error: 'Library service unavailable' });
  }
});

app.delete('/api/admin/library/:collection/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = libraryTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Library collection not found' });
  const id = validateEditorialId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Document id is invalid' });
  try {
    const result = await pool.query(`DELETE FROM ${config.table} WHERE id = $1`, [id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Document not found' });
    return response.json({ ok: true, id });
  } catch {
    console.error('OMAPI library delete failed');
    return response.status(503).json({ error: 'Library service unavailable' });
  }
});



const publicRegistrationAttempts = new Map();
function limitPublicRegistration(request, response, next) {
  const now = Date.now();
  const key = request.ip || request.socket?.remoteAddress || 'unknown';
  const windowMs = 15 * 60 * 1000;
  if (publicRegistrationAttempts.size > 1000) {
    for (const [attemptKey, attempt] of publicRegistrationAttempts) {
      if (now - attempt.startedAt >= windowMs) publicRegistrationAttempts.delete(attemptKey);
    }
  }
  const current = publicRegistrationAttempts.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    publicRegistrationAttempts.set(key, { startedAt: now, count: 1 });
    return next();
  }
  if (current.count >= 8) {
    response.set('Retry-After', String(Math.ceil((windowMs - (now - current.startedAt)) / 1000)));
    return response.status(429).json({ error: 'Trop de demandes depuis cette adresse. Réessayez un peu plus tard.' });
  }
  current.count += 1;
  return next();
}

app.post('/api/public/registrations/events', limitPublicRegistration, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const normalized = normalizeRegistration(request.body, 'events');
  if (normalized.error) return response.status(400).json({ error: 'Veuillez vérifier les informations saisies.' });
  const item = normalized.item;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const eventResult = await client.query(
      "SELECT id, event_date, status, places, event_date < CURRENT_DATE AS is_past FROM events WHERE id = $1 FOR UPDATE",
      [item.parentId],
    );
    if (!eventResult.rows.length) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'Cet événement n’est plus disponible.' });
    }
    const event = eventResult.rows[0];
    if (!['À venir', 'En cours'].includes(event.status) || event.is_past) {
      await client.query('ROLLBACK');
      return response.status(409).json({ error: 'Les inscriptions pour cet événement sont fermées.' });
    }
    const capacity = eventCapacityFromPlaces(event.places);
    if (capacity !== null) {
      const countResult = await client.query('SELECT COUNT(*)::int AS count FROM event_registrations WHERE event_id = $1', [item.parentId]);
      if (Number(countResult.rows[0]?.count || 0) >= capacity) {
        await client.query('ROLLBACK');
        return response.status(409).json({ error: 'Cet événement a atteint sa capacité maximale.' });
      }
    }
    const inserted = await client.query(
      `INSERT INTO event_registrations (event_id, name, email, phone, organization)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, registration_date`,
      [item.parentId, item.name, item.email, item.phone, item.organization || null],
    );
    await client.query('COMMIT');
    return response.status(201).json({ ok: true, id: Number(inserted.rows[0].id), registrationDate: new Date(inserted.rows[0].registration_date).toISOString() });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error?.code === '23505') return response.status(409).json({ error: 'Cette adresse e-mail est déjà inscrite à cet événement.' });
    if (error?.code === '23503') return response.status(404).json({ error: 'Cet événement n’est plus disponible.' });
    console.error('OMAPI event registration failed');
    return response.status(503).json({ error: 'Le service d’inscription est momentanément indisponible.' });
  } finally {
    client.release();
  }
});

app.post('/api/public/registrations/formations', limitPublicRegistration, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const normalized = normalizeRegistration(request.body, 'formations');
  if (normalized.error) return response.status(400).json({ error: 'Veuillez vérifier les informations saisies.' });
  const item = normalized.item;
  try {
    const formationResult = await pool.query('SELECT id FROM formations WHERE id = $1', [item.parentId]);
    if (!formationResult.rows.length) return response.status(404).json({ error: 'Cette formation n’est plus disponible.' });
    const inserted = await pool.query(
      `INSERT INTO formation_registrations (formation_id, name, email, phone, organization, message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, registration_date`,
      [item.parentId, item.name, item.email, item.phone, item.organization || null, item.message || null],
    );
    return response.status(201).json({ ok: true, id: Number(inserted.rows[0].id), registrationDate: new Date(inserted.rows[0].registration_date).toISOString() });
  } catch (error) {
    if (error?.code === '23505') return response.status(409).json({ error: 'Cette adresse e-mail est déjà inscrite à cette formation.' });
    if (error?.code === '23503') return response.status(404).json({ error: 'Cette formation n’est plus disponible.' });
    console.error('OMAPI formation registration failed');
    return response.status(503).json({ error: 'Le service d’inscription est momentanément indisponible.' });
  }
});

app.get('/api/admin/registrations/:collection', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const kind = request.params.collection;
  const config = kind === 'events'
    ? { table: 'event_registrations', parentColumn: 'event_id', map: (row) => ({ id: Number(row.id), eventId: Number(row.event_id), name: row.name, email: row.email, phone: row.phone, ...(row.organization ? { organization: row.organization } : {}), registrationDate: new Date(row.registration_date).toISOString() }) }
    : kind === 'formations'
      ? { table: 'formation_registrations', parentColumn: 'formation_id', map: (row) => ({ id: Number(row.id), formationId: Number(row.formation_id), name: row.name, email: row.email, phone: row.phone, ...(row.organization ? { organization: row.organization } : {}), ...(row.message ? { message: row.message } : {}), registrationDate: new Date(row.registration_date).toISOString() }) }
      : null;
  if (!config) return response.status(404).json({ error: 'Registration collection not found' });
  try {
    const { rows } = await pool.query(`SELECT id, ${config.parentColumn}, name, email, phone, organization${kind === 'formations' ? ', message' : ''}, registration_date FROM ${config.table} ORDER BY registration_date DESC, id DESC`);
    return response.json({ items: rows.map(config.map) });
  } catch {
    console.error('OMAPI admin registrations read failed');
    return response.status(503).json({ error: 'Registration service unavailable' });
  }
});

app.delete('/api/admin/registrations/:collection/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const kind = request.params.collection;
  const table = kind === 'events' ? 'event_registrations' : kind === 'formations' ? 'formation_registrations' : null;
  const id = validateEditorialId(request.params.id);
  if (!table) return response.status(404).json({ error: 'Registration collection not found' });
  if (!id) return response.status(400).json({ error: 'Registration id is invalid' });
  try {
    const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Registration not found' });
    return response.json({ ok: true, id });
  } catch {
    console.error('OMAPI admin registration delete failed');
    return response.status(503).json({ error: 'Registration service unavailable' });
  }
});



app.post('/api/public/job-applications', limitPublicRegistration, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const normalized = normalizeJobApplicationSubmission(request.body);
  if (normalized.error) return response.status(400).json({ error: 'Vérifiez vos coordonnées et les fichiers PDF, DOC ou DOCX (700 Ko maximum par fichier).' });
  const item = normalized.item;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let jobTitle = null;
    if (item.jobId !== null) {
      const jobResult = await client.query(
        `SELECT id, title, status, publish_date, deadline,
                (publish_date <= CURRENT_DATE AND (deadline IS NULL OR deadline >= CURRENT_DATE)) AS in_date_range
         FROM jobs WHERE id = $1 FOR UPDATE`,
        [item.jobId],
      );
      if (!jobResult.rows.length || jobResult.rows[0].status !== 'Ouvert' || !jobResult.rows[0].in_date_range) {
        await client.query('ROLLBACK');
        return response.status(409).json({ error: 'Cette offre n’est plus ouverte. Vous pouvez envoyer une candidature spontanée.' });
      }
      jobTitle = jobResult.rows[0].title;
    }
    const inserted = await client.query(
      `INSERT INTO job_applications
       (job_id, job_title, first_name, last_name, email, phone, message, cv_url, cv_file_name, cover_letter_url, cover_letter_file_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Nouvelle')
       RETURNING id, application_date`,
      [item.jobId, jobTitle, item.firstName, item.lastName, item.email, item.phone, item.message || null, item.cv.value, item.cv.fileName, item.coverLetter?.value || null, item.coverLetter?.fileName || null],
    );
    await client.query('COMMIT');
    return response.status(201).json({ ok: true, id: Number(inserted.rows[0].id) });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error?.code === '23503') return response.status(409).json({ error: 'L’offre concernée n’est plus disponible.' });
    console.error('OMAPI public job application failed');
    return response.status(503).json({ error: 'Le service de candidature est momentanément indisponible.' });
  } finally {
    client.release();
  }
});

app.get('/api/admin/job-applications', requireAuth, requireContentManager, async (_request, response) => {
  response.set('Cache-Control', 'no-store');
  try {
    const { rows } = await pool.query(
      `SELECT id, job_id, job_title, first_name, last_name, email, phone, message,
              cv_url, cv_file_name, cover_letter_url, cover_letter_file_name,
              application_date, status
       FROM job_applications ORDER BY application_date DESC, id DESC`,
    );
    return response.json({ items: rows.map((row) => ({
      id: Number(row.id),
      ...(row.job_id === null ? {} : { jobId: Number(row.job_id) }),
      ...(row.job_title ? { jobTitle: row.job_title } : {}),
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      ...(row.message ? { message: row.message } : {}),
      cvUrl: row.cv_url,
      ...(row.cv_file_name ? { cvFileName: row.cv_file_name } : {}),
      ...(row.cover_letter_url ? { coverLetterUrl: row.cover_letter_url } : {}),
      ...(row.cover_letter_file_name ? { coverLetterFileName: row.cover_letter_file_name } : {}),
      applicationDate: row.application_date instanceof Date ? row.application_date.toISOString() : String(row.application_date),
      status: row.status,
    })) });
  } catch {
    console.error('OMAPI admin job applications read failed');
    return response.status(503).json({ error: 'Le service des candidatures est momentanément indisponible.' });
  }
});

app.patch('/api/admin/job-applications/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const id = validateEditorialId(request.params.id);
  const status = cleanText(request.body?.status, 20);
  if (!id) return response.status(400).json({ error: 'Application id is invalid' });
  if (!JOB_APPLICATION_STATUSES.includes(status)) return response.status(400).json({ error: 'Sélectionnez un statut de candidature valide.' });
  try {
    const { rows } = await pool.query('UPDATE job_applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status', [status, id]);
    if (!rows.length) return response.status(404).json({ error: 'Cette candidature n’existe plus.' });
    return response.json({ id: Number(rows[0].id), status: rows[0].status });
  } catch {
    console.error('OMAPI job application status update failed');
    return response.status(503).json({ error: 'Le statut de la candidature n’a pas pu être enregistré.' });
  }
});

app.delete('/api/admin/job-applications/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const id = validateEditorialId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Application id is invalid' });
  try {
    const result = await pool.query('DELETE FROM job_applications WHERE id = $1', [id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Cette candidature n’existe plus.' });
    return response.json({ ok: true, id });
  } catch {
    console.error('OMAPI job application delete failed');
    return response.status(503).json({ error: 'La candidature n’a pas pu être supprimée.' });
  }
});

app.post('/api/public/gopi-orders', limitPublicRegistration, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const normalized = normalizeGopiOrderSubmission(request.body);
  if (normalized.error) return response.status(400).json({ error: 'Vérifiez vos coordonnées et les informations de paiement.' });
  const item = normalized.item;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const publicationResult = await client.query('SELECT id, title, file_url FROM gopi_items WHERE id = $1 FOR UPDATE', [item.gopiId]);
    if (!publicationResult.rows.length || !isGopiPdfValue(publicationResult.rows[0].file_url)) {
      await client.query('ROLLBACK');
      return response.status(409).json({ error: 'Cette publication GOPI n’est plus disponible à la commande.' });
    }
    const publication = publicationResult.rows[0];
    const inserted = await client.query(
      `INSERT INTO gopi_orders (gopi_id, gopi_title, customer_name, customer_email, customer_phone, amount_mga, status, transaction_ref, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, 'En attente', $7, $8)
       RETURNING id`,
      [item.gopiId, publication.title, item.customerName, item.customerEmail, item.customerPhone, GOPI_PRICE_MGA_API, item.transactionRef || null, item.paymentMethod],
    );
    await client.query('COMMIT');
    return response.status(201).json({ ok: true, id: Number(inserted.rows[0].id) });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error?.code === '23503') return response.status(409).json({ error: 'Cette publication GOPI n’est plus disponible.' });
    console.error('OMAPI public GOPI order failed');
    return response.status(503).json({ error: 'Le service de commande GOPI est momentanément indisponible.' });
  } finally {
    client.release();
  }
});

app.get('/api/admin/gopi/orders', requireAuth, requireContentManager, async (_request, response) => {
  response.set('Cache-Control', 'no-store');
  try {
    const { rows } = await pool.query('SELECT id, gopi_id, gopi_title, customer_name, customer_email, customer_phone, order_date, amount_mga, status, transaction_ref, payment_method, payment_confirmed_at, sent_at FROM gopi_orders ORDER BY order_date DESC, id DESC');
    return response.json({ items: rows.map(mapGopiOrder) });
  } catch {
    console.error('OMAPI admin GOPI orders read failed');
    return response.status(503).json({ error: 'Le service des commandes GOPI est momentanément indisponible.' });
  }
});

app.patch('/api/admin/gopi/orders/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const id = validateEditorialId(request.params.id);
  const nextStatus = cleanText(request.body?.status, 30);
  if (!id) return response.status(400).json({ error: 'Order id is invalid' });
  if (!GOPI_ORDER_STATUSES.includes(nextStatus)) return response.status(400).json({ error: 'Sélectionnez un statut de commande reconnu.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const currentResult = await client.query('SELECT id, status, transaction_ref, payment_method FROM gopi_orders WHERE id = $1 FOR UPDATE', [id]);
    if (!currentResult.rows.length) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'Cette commande n’existe plus.' });
    }
    const current = currentResult.rows[0];
    const allowed = current.status === 'En attente'
      ? ['Paiement confirmé', 'Annulé'].includes(nextStatus)
      : current.status === 'Paiement confirmé' && nextStatus === 'Envoyé';
    if (!allowed) {
      await client.query('ROLLBACK');
      return response.status(409).json({ error: `Transition refusée : une commande « ${current.status} » ne peut pas devenir « ${nextStatus} ».` });
    }
    let result;
    if (nextStatus === 'Paiement confirmé') {
      const paymentMethod = cleanText(request.body?.paymentMethod, 40);
      const transactionRef = cleanText(request.body?.transactionRef, 200).replace(/\s+/g, ' ');
      if (!GOPI_PAYMENT_METHODS_API.includes(paymentMethod) || !['Espèces', 'Chèque'].includes(paymentMethod) && transactionRef.length < 3) {
        await client.query('ROLLBACK');
        return response.status(400).json({ error: 'Moyen de paiement ou référence invalide.' });
      }
      result = await client.query('UPDATE gopi_orders SET status = $1, payment_method = $2, transaction_ref = $3, payment_confirmed_at = NOW(), updated_at = NOW() WHERE id = $4 RETURNING id, gopi_id, gopi_title, customer_name, customer_email, customer_phone, order_date, amount_mga, status, transaction_ref, payment_method, payment_confirmed_at, sent_at', [nextStatus, paymentMethod, transactionRef || null, id]);
    } else if (nextStatus === 'Envoyé') {
      result = await client.query('UPDATE gopi_orders SET status = $1, sent_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING id, gopi_id, gopi_title, customer_name, customer_email, customer_phone, order_date, amount_mga, status, transaction_ref, payment_method, payment_confirmed_at, sent_at', [nextStatus, id]);
    } else {
      result = await client.query('UPDATE gopi_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, gopi_id, gopi_title, customer_name, customer_email, customer_phone, order_date, amount_mga, status, transaction_ref, payment_method, payment_confirmed_at, sent_at', [nextStatus, id]);
    }
    await client.query('COMMIT');
    return response.json({ item: mapGopiOrder(result.rows[0]) });
  } catch {
    await client.query('ROLLBACK').catch(() => {});
    console.error('OMAPI GOPI order update failed');
    return response.status(503).json({ error: 'La commande GOPI n’a pas été mise à jour.' });
  } finally {
    client.release();
  }
});

app.delete('/api/admin/gopi/orders/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const id = validateEditorialId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Order id is invalid' });
  try {
    const result = await pool.query('DELETE FROM gopi_orders WHERE id = $1', [id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Cette commande n’existe plus.' });
    return response.json({ ok: true, id });
  } catch {
    console.error('OMAPI GOPI order delete failed');
    return response.status(503).json({ error: 'La commande GOPI n’a pas pu être supprimée.' });
  }
});



app.get('/api/admin/activity-logs', requireAuth, requireContentManager, async (_request, response) => {
  response.set('Cache-Control', 'no-store');
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, user_name, entity_key, entity_id, action, details, occurred_at
       FROM activity_logs ORDER BY occurred_at DESC, id DESC LIMIT 300`,
    );
    return response.json({ items: rows.map((row) => ({
      id: Number(row.id),
      ...(row.user_id === null ? {} : { userId: String(row.user_id) }),
      userName: row.user_name || 'Visiteur',
      ...(row.entity_key ? { entityKey: row.entity_key } : {}),
      ...(row.entity_id === null ? {} : { entityId: row.entity_id }),
      action: row.action,
      details: row.details,
      timestamp: row.occurred_at instanceof Date ? row.occurred_at.toISOString() : String(row.occurred_at),
    })) });
  } catch {
    console.error('OMAPI activity log read failed');
    return response.status(503).json({ error: 'Le journal d’activité est momentanément indisponible.' });
  }
});

app.get('/api/admin/notification-reads', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  try {
    const { rows } = await pool.query('SELECT notification_id FROM notification_reads WHERE user_id = $1', [request.auth.user.id]);
    return response.json({ ids: rows.map((row) => row.notification_id) });
  } catch {
    console.error('OMAPI notification reads read failed');
    return response.status(503).json({ error: 'L’état des notifications est momentanément indisponible.' });
  }
});

app.put('/api/admin/notification-reads', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const rawIds = request.body?.ids;
  if (!Array.isArray(rawIds) || rawIds.length > 100 || rawIds.some((id) => typeof id !== 'string' || id.length > 180 || !/^[a-z][a-z0-9-]{0,20}-[a-zA-Z0-9._:-]{1,150}$/.test(id))) {
    return response.status(400).json({ error: 'La liste des notifications lues est invalide.' });
  }
  const ids = [...new Set(rawIds)];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM notification_reads WHERE user_id = $1', [request.auth.user.id]);
    if (ids.length) {
      await client.query(
        `INSERT INTO notification_reads (user_id, notification_id)
         SELECT $1, input.notification_id FROM unnest($2::text[]) AS input(notification_id)`,
        [request.auth.user.id, ids],
      );
    }
    await client.query('COMMIT');
    return response.json({ ids });
  } catch {
    await client.query('ROLLBACK').catch(() => {});
    console.error('OMAPI notification reads save failed');
    return response.status(503).json({ error: 'L’état des notifications n’a pas pu être enregistré.' });
  } finally {
    client.release();
  }
});

app.get('/api/admin/programs/:collection', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = programmeTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Program collection not found' });
  try {
    const { rows } = await pool.query(`SELECT ${config.select} FROM ${config.table} ORDER BY id ASC`);
    return response.json({ items: rows.map(config.mapRow) });
  } catch {
    console.error('OMAPI admin programs read failed');
    return response.status(503).json({ error: 'Program service unavailable' });
  }
});

app.post('/api/admin/programs/:collection', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = programmeTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Program collection not found' });
  const normalized = config.normalize(request.body);
  if (normalized.error) return response.status(400).json({ error: normalized.error });
  const placeholders = config.dbColumns.map((_, index) => `$${index + 1}`).join(', ');
  try {
    const { rows } = await pool.query(`INSERT INTO ${config.table} (${config.dbColumns.join(', ')}) VALUES (${placeholders}) RETURNING ${config.select}`, config.values(normalized.item));
    return response.status(201).json({ item: config.mapRow(rows[0]) });
  } catch {
    console.error('OMAPI program create failed');
    return response.status(503).json({ error: 'Program service unavailable' });
  }
});

app.patch('/api/admin/programs/:collection/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const config = programmeTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Program collection not found' });
  const id = validateEditorialId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Program id is invalid' });
  const normalized = config.normalize(request.body);
  if (normalized.error) return response.status(400).json({ error: normalized.error });
  const assignments = config.dbColumns.map((column, index) => `${column} = $${index + 1}`).join(', ');
  try {
    const { rows } = await pool.query(`UPDATE ${config.table} SET ${assignments}, updated_at = NOW() WHERE id = $${config.dbColumns.length + 1} RETURNING ${config.select}`, [...config.values(normalized.item), id]);
    if (!rows.length) return response.status(404).json({ error: 'Program item not found' });
    return response.json({ item: config.mapRow(rows[0]) });
  } catch {
    console.error('OMAPI program update failed');
    return response.status(503).json({ error: 'Program service unavailable' });
  }
});

app.delete('/api/admin/programs/:collection/:id', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const kind = request.params.collection;
  const config = programmeTable(kind);
  const id = validateEditorialId(request.params.id);
  if (!config) return response.status(404).json({ error: 'Program collection not found' });
  if (!id) return response.status(400).json({ error: 'Program id is invalid' });
  const related = {
    events: { table: 'event_registrations', foreignKey: 'event_id' },
    formations: { table: 'formation_registrations', foreignKey: 'formation_id' },
    jobs: { table: 'job_applications', foreignKey: 'job_id' },
    gopi: { table: 'gopi_orders', foreignKey: 'gopi_id' },
  }[kind];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const parent = await client.query(`SELECT id FROM ${config.table} WHERE id = $1 FOR UPDATE`, [id]);
    if (!parent.rows.length) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'Program item not found' });
    }
    if (related) {
      const pendingFilter = kind === 'gopi' ? " AND status IN ('En attente', 'Paiement confirmé')" : '';
      const count = await client.query(`SELECT COUNT(*)::int AS count FROM ${related.table} WHERE ${related.foreignKey} = $1${pendingFilter}`, [id]);
      if (Number(count.rows[0]?.count || 0) > 0) {
        await client.query('ROLLBACK');
        const message = kind === 'jobs'
          ? 'Cette offre est liée à des candidatures; fermez-la plutôt afin de préserver les dossiers.'
          : kind === 'gopi'
            ? 'Cette publication possède des commandes encore à traiter.'
            : 'Cet élément possède encore des inscriptions; supprimez-les avant de supprimer le catalogue.';
        return response.status(409).json({ error: message });
      }
    }
    await client.query(`DELETE FROM ${config.table} WHERE id = $1`, [id]);
    await client.query('COMMIT');
    return response.json({ ok: true, id });
  } catch {
    await client.query('ROLLBACK').catch(() => {});
    console.error('OMAPI program delete failed');
    return response.status(503).json({ error: 'Program service unavailable' });
  } finally {
    client.release();
  }
});

app.put('/api/admin/settings/:key', requireAuth, requireContentManager, async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const key = request.params.key;
  if (!SITE_SETTING_KEYS.includes(key)) return response.status(404).json({ error: 'Setting not found' });
  const normalized = normalizeSiteSetting(key, request.body?.value);
  if (normalized.error) return response.status(400).json({ error: normalized.error });
  try {
    const { rows } = await pool.query(
      `INSERT INTO site_settings (setting_key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (setting_key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING setting_key, value`,
      [key, JSON.stringify(normalized.value)],
    );
    return response.json({ key: rows[0].setting_key, value: rows[0].value });
  } catch {
    console.error('OMAPI site settings save failed');
    return response.status(503).json({ error: 'Settings service unavailable' });
  }
});

app.use((error, _request, response, _next) => {
  if (error?.message === 'Origin not allowed') {
    return response.status(403).json({ error: 'Origin not allowed' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error('OMAPI API request failed');
  return response.status(500).json({ error: 'Internal server error' });
});

async function bootstrapInitialAdmin() {
  const name = process.env.OMAPI_BOOTSTRAP_ADMIN_NAME?.trim();
  const email = normalizeEmail(process.env.OMAPI_BOOTSTRAP_ADMIN_EMAIL);
  const password = process.env.OMAPI_BOOTSTRAP_ADMIN_PASSWORD;
  if (!name || !email || !password) return;
  if (name.length > 200 || email.length > 320 || password.length < 12 || password.length > 1024) {
    console.error('OMAPI initial administrator configuration is invalid');
    return;
  }

  try {
    const existing = await pool.query('SELECT 1 FROM app_users LIMIT 1');
    if (existing.rowCount) return;
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO app_users (name, email, role, status, password_hash)
       VALUES ($1, $2, 'Admin', 'Actif', $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [name, email, passwordHash],
    );
    if (result.rowCount) {
      console.log('OMAPI initial administrator created; remove bootstrap variables from cPanel.');
    }
  } catch {
    console.error('OMAPI initial administrator bootstrap failed');
  }
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`OMAPI API started on port ${port}`);
  void bootstrapInitialAdmin();
});

function shutdown() {
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
