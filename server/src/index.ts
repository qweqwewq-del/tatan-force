import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createDatabase } from './db.js'
import { createFileStorage } from './storage/index.js'

const config = loadConfig()
const db = createDatabase(config)
const app = createApp({
  config,
  db,
  storage: createFileStorage(config),
})

const server = app.listen(config.PORT, '0.0.0.0', () => {
  console.info(`TATAN FORCE API listening on port ${config.PORT}`)
})

async function shutdown(signal: string) {
  console.info(`Received ${signal}; shutting down.`)
  server.close(async () => {
    await db.close()
    process.exit(0)
  })
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
