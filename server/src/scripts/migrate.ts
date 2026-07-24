import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { loadConfig } from '../config.js'
import { createDatabase } from '../db.js'

const config = loadConfig()
const db = createDatabase(config)
const migrationsDirectory = path.resolve('server/migrations')

try {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)
  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const existing = await db.query(
      'SELECT 1 FROM schema_migrations WHERE name = $1',
      [file],
    )
    if (existing.rowCount) continue
    const sql = await readFile(path.join(migrationsDirectory, file), 'utf8')
    await db.query(sql)
    await db.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
    console.info(`Applied ${file}`)
  }
} finally {
  await db.close()
}
