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
app.use(express.json({ limit: '1mb' }));

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
