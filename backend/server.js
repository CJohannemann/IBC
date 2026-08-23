require('dotenv').config()
const express = require('express')
const fs = require('fs')
const cors = require('cors')
const path = require('path')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const createRequireAdmin = require('./middleware/requireAdmin')
const createPlayerRoutes = require('./routes/players')
const createTeamRoutes = require('./routes/teams')
const createCoachRoutes = require('./routes/coaches')
const createAssistantRoutes = require('./routes/assistants')
const createGameRoutes = require('./routes/games')
const createNewsRoutes = require('./routes/news')
const createSwagRoutes = require('./routes/swag')
const createScheduleRoutes = require('./routes/schedule')
const createStatsRoutes = require('./routes/stats')
const createAdminRoutes = require('./routes/admin')
const createUploadRoutes = require('./routes/upload')
const createUniformRoutes = require('./routes/uniform')
const createAuthRoutes = require('./routes/auth')
const createUserRoutes = require('./routes/users')
const { requireRole } = require('./middleware/requireAdmin')
const { purgeExpired } = require('./lib/sessions')
const { normalizeIdentifiers } = require('./lib/normalize')
const { runMigrations } = require('./lib/migrations')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'baseball.db')
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN

async function start() {
  // ======================================================
  // DATABASE
  // ======================================================

  const db = await sqlite.open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  })

  await db.run('PRAGMA foreign_keys = ON')

  // Idempotent (everything is CREATE ... IF NOT EXISTS), so the auth tables are
  // guaranteed to exist rather than failing at the first login attempt.
  for (const schema of ['users.sql', 'assistants.sql', 'uniform.sql']) {
    await db.exec(fs.readFileSync(path.join(__dirname, '..', 'database', schema), 'utf8'))
  }

  const migrated = await runMigrations(db)
  for (const change of migrated) console.log(`Migrated: ${change}`)

  const purged = await purgeExpired(db)
  if (purged) console.log(`Purged ${purged} expired session(s)`)

  const requireAdmin = createRequireAdmin(db)

  // ======================================================
  // EXPRESS SETUP
  // ======================================================

  const app = express()

  // Behind nginx, req.ip is the proxy without this - which would collapse every
  // visitor onto one rate-limit bucket.
  app.set('trust proxy', process.env.TRUST_PROXY || 'loopback')

  // Credentialed requests cannot use a wildcard origin, so cookie auth needs an
  // explicit allow-list. Unset (dev) reflects the request origin.
  app.use(cors({
    origin: CORS_ORIGIN ? CORS_ORIGIN.split(',').map((o) => o.trim()) : true,
    credentials: true,
  }))
  app.use(express.json())

  // '10u', '10 U' and '10U' must not become three different teams.
  app.use(normalizeIdentifiers)

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

  // ======================================================
  // ROUTES
  // ======================================================

  app.use('/api/players', createPlayerRoutes(db, requireAdmin))
  app.use('/api/teams', createTeamRoutes(db, requireAdmin))
  app.use('/api/coaches', createCoachRoutes(db, requireAdmin))
  app.use('/api/assistants', createAssistantRoutes(db, requireAdmin))
  app.use('/api/games', createGameRoutes(db, requireAdmin))
  app.use('/api/news', createNewsRoutes(db, requireAdmin))
  app.use('/api/swag', createSwagRoutes(db, requireAdmin))
  app.use('/api/schedule', createScheduleRoutes(db, requireAdmin))
  app.use('/api/stats', createStatsRoutes(db, requireAdmin))
  app.use('/api/auth', createAuthRoutes(db, requireAdmin))
  app.use('/api/users', createUserRoutes(db, requireAdmin, requireRole))
  app.use('/api/admin', createAdminRoutes(requireAdmin))
  app.use('/api/upload', createUploadRoutes(requireAdmin))
  app.use('/api/uniform', createUniformRoutes(db, requireAdmin))

  // ======================================================
  // HEALTH / DEBUG
  // ======================================================

  app.get('/health', (req, res) => {
    res.json({ ok: true })
  })

  app.get('/debug/routes', (req, res) => {
    res.json({ ok: true })
  })

  // ======================================================
  // START SERVER
  // ======================================================

  app.listen(PORT, async () => {
    console.log(`Backend API listening on http://localhost:${PORT}`)
    console.log(`Using DB at ${DB_PATH}`)

    if (process.env.NODE_ENV !== 'production') {
      console.warn('WARNING: NODE_ENV is not "production" - session cookies are not marked Secure')
    }
    if (!CORS_ORIGIN && process.env.NODE_ENV === 'production') {
      console.warn('WARNING: CORS_ORIGIN is unset - any origin may send credentialed requests')
    }

    const { total } = await db.get('SELECT COUNT(*) AS total FROM users WHERE active = 1')
    if (total === 0) {
      console.warn('WARNING: no active users. Create one: node backend/scripts/manage-users.js add <username>')
    } else if (process.env.ADMIN_PASS) {
      console.warn(`WARNING: ${total} user account(s) exist but ADMIN_USER/ADMIN_PASS are still set.`)
      console.warn('         That shared break-glass password still works. Unset it in backend/.env.')
    }
  })
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
