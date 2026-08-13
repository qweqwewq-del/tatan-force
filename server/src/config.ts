import { z } from 'zod'

const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true')

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4174),
  DATABASE_URL: z.string().min(1).default('postgres://tatan:tatan@127.0.0.1:5432/tatan_force'),
  SESSION_SECRET: z.string().min(32).default('development-only-change-before-production'),
  APP_ORIGIN: z.string().url().default('http://127.0.0.1:4173'),
  OWNER_USERNAME: z.string().min(3).default('tatan_master'),
  OWNER_PASSWORD: z.string().min(12).default('OwnerLocal!2026'),
  ADMIN_USERNAME: z.string().min(3).default('tatan_admin'),
  ADMIN_INITIAL_PASSWORD: z.string().min(12).default('TatanAdmin!2026'),
  CREDENTIAL_RESET_TOKEN: z.string().min(16).max(1_000).optional(),
  COOKIE_SECURE: booleanString,
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().default('server/uploads'),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional(),
})

export type AppConfig = z.infer<typeof schema>

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const config = schema.parse(environment)

  if (config.NODE_ENV === 'production') {
    if (
      config.SESSION_SECRET === 'development-only-change-before-production' ||
      config.OWNER_PASSWORD === 'OwnerLocal!2026' ||
      config.ADMIN_INITIAL_PASSWORD === 'TatanAdmin!2026'
    ) {
      throw new Error('Production secrets must be replaced before startup.')
    }

    if (
      config.STORAGE_DRIVER === 's3' &&
      [
        config.S3_ENDPOINT,
        config.S3_BUCKET,
        config.S3_ACCESS_KEY_ID,
        config.S3_SECRET_ACCESS_KEY,
        config.S3_PUBLIC_BASE_URL,
      ].some((value) => !value)
    ) {
      throw new Error('S3 storage requires endpoint, bucket, credentials, and public URL.')
    }
  }

  return config
}
