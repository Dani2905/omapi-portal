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
  const config = editorialTable(request.params.collection) || libraryTable(request.params.collection);
  if (!config) return response.status(404).json({ error: 'Content collection not found' });
  try {
    const { rows } = await pool.query(`SELECT ${config.select} FROM ${config.table} ORDER BY id ASC`);
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
