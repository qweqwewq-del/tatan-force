import path from 'node:path'
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from 'express'
import helmet from 'helmet'
import session, { type Store } from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import { ZodError } from 'zod'
import type { AppConfig } from './config.js'
import type { Database } from './types.js'
import type { FileStorage } from './storage/index.js'
import { requireSameOrigin } from './middleware/auth.js'
import { createAuthRouter } from './routes/auth.js'
import { createProductsRouter } from './routes/products.js'
import { createInquiriesRouter } from './routes/inquiries.js'
import { createSettingsRouter } from './routes/settings.js'
import { createOwnerRouter } from './routes/owner.js'
import { createUploadsRouter } from './routes/uploads.js'

interface AppDependencies {
  config: AppConfig
  db: Database
  storage: FileStorage
  sessionStore?: Store
}

function createSessionStore(config: AppConfig) {
  const PostgresStore = connectPgSimple(session)
  return new PostgresStore({
    conString: config.DATABASE_URL,
    tableName: 'user_sessions',
    createTableIfMissing: false,
    pruneSessionInterval: 15 * 60,
  })
}

export function createApp({
  config,
  db,
  storage,
  sessionStore,
}: AppDependencies) {
  const app = express()

  if (config.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  app.disable('x-powered-by')
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(session({
    name: 'tf_session',
    secret: config.SESSION_SECRET,
    store: sessionStore ?? createSessionStore(config),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: config.COOKIE_SECURE || config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1_000,
      path: '/',
    },
  }))
  app.use(requireSameOrigin(config.APP_ORIGIN))

  if (config.STORAGE_DRIVER === 'local') {
    app.use(
      '/uploads',
      express.static(path.resolve(config.UPLOAD_DIR), {
        immutable: true,
        maxAge: '1y',
        fallthrough: false,
      }),
    )
  }

  app.get('/api/health', async (_request, response, next) => {
    try {
      await db.query('SELECT 1')
      response.json({ status: 'ok', database: 'connected' })
    } catch (error) {
      next(error)
    }
  })

  app.use('/api/auth', createAuthRouter(db))
  app.use('/api/products', createProductsRouter(db))
  app.use('/api/inquiries', createInquiriesRouter(db))
  app.use('/api/settings', createSettingsRouter(db))
  app.use('/api/owner', createOwnerRouter(db))
  app.use('/api/uploads', createUploadsRouter(storage))

  if (config.NODE_ENV === 'production') {
    const frontendDirectory = path.resolve('dist')
    app.use(express.static(frontendDirectory, {
      immutable: true,
      maxAge: '1y',
      index: false,
    }))
    app.use((request, response, next) => {
      if (request.method === 'GET' && request.accepts('html')) {
        response.sendFile(path.join(frontendDirectory, 'index.html'))
        return
      }
      next()
    })
  }

  app.use(((request, response) => {
    response.status(404).json({
      error: 'NOT_FOUND',
      path: request.path,
    })
  }) satisfies RequestHandler)

  app.use(((error, _request, response, _next) => {
    void _next
    if (error instanceof ZodError) {
      response.status(400).json({
        error: 'VALIDATION_ERROR',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    const structured = error as {
      code?: string
      statusCode?: number
      message?: string
    }
    if (structured.code === '23505') {
      response.status(409).json({ error: 'DUPLICATE_RECORD' })
      return
    }

    response.status(structured.statusCode ?? 500).json({
      error: structured.code ?? 'INTERNAL_ERROR',
      ...(config.NODE_ENV === 'development' && structured.message
        ? { message: structured.message }
        : {}),
    })
  }) satisfies ErrorRequestHandler)

  return app
}
