import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import type { AppConfig } from './config.js'
import type { Database } from './types.js'

export function createDatabase(config: AppConfig): Database & { close(): Promise<void> } {
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 15,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  return {
    query<T extends QueryResultRow>(text: string, values?: readonly unknown[]) {
      return pool.query<T>(text, values ? [...values] : undefined)
    },
    async transaction<T>(work: (client: PoolClient) => Promise<T>) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await work(client)
        await client.query('COMMIT')
        return result
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
    close() {
      return pool.end()
    },
  }
}
