// @vitest-environment node
import { randomUUID } from 'node:crypto'
import session from 'express-session'
import { DataType, newDb } from 'pg-mem'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import type { PoolClient, QueryResult, QueryResultRow } from 'pg'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { hashPassword } from './security/password.js'
import type { Database } from './types.js'

const memory = newDb()
memory.public.registerFunction({
  name: 'gen_random_uuid',
  returns: DataType.uuid,
  implementation: randomUUID,
})
memory.public.none(`
  CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE credential_reset_tokens (
    token_digest text PRIMARY KEY,
    used_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE user_sessions (
    sid varchar PRIMARY KEY,
    sess json NOT NULL,
    expire timestamp NOT NULL
  );
  CREATE TABLE security_audit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    actor_user_id uuid,
    actor_username text NOT NULL,
    actor_role text NOT NULL,
    target_user_id uuid,
    target_username text,
    target_role text,
    subject_id text,
    occurred_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE inquiries (
    id text PRIMARY KEY,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_wechat text,
    customer_company text,
    customer_address text,
    customer_email text,
    customer_note text,
    status text NOT NULL DEFAULT 'pending',
    internal_note text,
    submitted_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE inquiry_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id text NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    product_id text,
    slug text NOT NULL,
    sku text NOT NULL,
    product_name text NOT NULL,
    image_url text NOT NULL,
    specification text,
    quantity integer NOT NULL,
    unit_price bigint NOT NULL,
    note text
  );
  CREATE TABLE site_settings (
    id integer PRIMARY KEY,
    brand_name text NOT NULL,
    legal_name text NOT NULL,
    logo_url text NOT NULL,
    phone text NOT NULL,
    wechat text NOT NULL,
    email text NOT NULL,
    qr_code_url text NOT NULL,
    quote_title text NOT NULL,
    quote_validity_days integer NOT NULL,
    default_sales_note text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  INSERT INTO site_settings VALUES (
    1, 'TATAN FORCE', '泰坦引擎体育', '/logo.png', '400-800-2026',
    'TATAN-SALES', 'sales@tatanforce.cn', '/qr.png',
    '产品报价单', 30, '默认备注', now()
  );
`)

const adapter = memory.adapters.createPg()
const pool = new adapter.Pool()
const db: Database = {
  query<T extends QueryResultRow>(text: string, values?: readonly unknown[]) {
    return pool.query(text, values ? [...values] : undefined) as Promise<QueryResult<T>>
  },
  async transaction<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await pool.connect()
    await client.query('BEGIN')
    try {
      const result = await work(client as unknown as PoolClient)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },
}

const config = loadConfig({
  NODE_ENV: 'test',
  APP_ORIGIN: 'http://localhost',
  SESSION_SECRET: 'integration-test-session-secret-32-characters',
})
const app = createApp({
  config,
  db,
  sessionStore: new session.MemoryStore(),
  storage: {
    async put() {
      return { key: 'test.png', url: '/uploads/test.png', checksum: 'checksum' }
    },
  },
})

async function loginAdmin() {
  const admin = request.agent(app)
  await admin
    .post('/api/auth/login')
    .set('Origin', 'http://localhost')
    .send({
      username: 'tatan_admin',
      password: 'ValidationAdmin!2026',
      role: 'ADMIN',
    })
    .expect(200)
  return admin
}

beforeAll(async () => {
  await db.query(
    "INSERT INTO users (id,username,password_hash,role) VALUES ($1,$2,$3,'ADMIN')",
    [randomUUID(), 'tatan_admin', await hashPassword('ValidationAdmin!2026')],
  )
  await db.query(
    "INSERT INTO users (id,username,password_hash,role) VALUES ($1,$2,$3,'OWNER')",
    [randomUUID(), 'tatan_master', await hashPassword('ValidationOwner!2026')],
  )
})

describe('production API security boundary', () => {
  it('reports database health and blocks unauthenticated administration', async () => {
    await request(app).get('/api/health').expect(200, {
      status: 'ok',
      database: 'connected',
    })
    await request(app).get('/api/inquiries/admin').expect(401)
  })

  it('issues an HttpOnly session and enforces ADMIN versus OWNER permissions', async () => {
    const admin = request.agent(app)
    const login = await admin
      .post('/api/auth/login')
      .set('Origin', 'http://localhost')
      .send({
        username: 'tatan_admin',
        password: 'ValidationAdmin!2026',
        role: 'ADMIN',
      })
      .expect(200)

    expect(login.headers['set-cookie']?.[0]).toContain('HttpOnly')
    await admin.get('/api/owner/users').expect(403)
    await admin
      .put('/api/settings')
      .set('Origin', 'http://localhost')
      .send({
        brandName: 'TATAN FORCE',
        legalName: '泰坦引擎体育',
        logoUrl: '/logo.png',
        phone: '400-800-2026',
        wechat: 'TATAN-SALES',
        email: 'sales@tatanforce.cn',
        qrCodeUrl: '/qr.png',
        quoteTitle: '产品报价单',
        quoteValidityDays: 30,
        defaultSalesNote: '正式报价备注',
      })
      .expect(200)

    const owner = request.agent(app)
    await owner
      .post('/api/auth/login')
      .set('Origin', 'http://localhost')
      .send({
        username: 'tatan_master',
        password: 'ValidationOwner!2026',
        role: 'OWNER',
      })
      .expect(200)
    const users = await owner.get('/api/owner/users').expect(200)
    expect(users.body.users).toHaveLength(1)
    expect(users.body.users[0]).not.toHaveProperty('passwordHash')
  })

  it('rejects cross-origin mutations', async () => {
    await request(app)
      .post('/api/auth/login')
      .set('Origin', 'https://attacker.example')
      .send({
        username: 'tatan_admin',
        password: 'ValidationAdmin!2026',
        role: 'ADMIN',
      })
      .expect(403)
  })

  it('lets only the owner reset admin credentials and review password-change events', async () => {
    const owner = request.agent(app)
    await owner
      .post('/api/auth/login')
      .set('Origin', 'http://localhost')
      .send({
        username: 'tatan_master',
        password: 'ValidationOwner!2026',
        role: 'OWNER',
      })
      .expect(200)
    const users = await owner.get('/api/owner/users').expect(200)
    const adminId = users.body.users[0].id as string

    await owner
      .put(`/api/owner/users/${adminId}/password`)
      .set('Origin', 'http://localhost')
      .send({ password: 'ResetAdmin!2026' })
      .expect(204)

    await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost')
      .send({
        username: 'tatan_admin',
        password: 'ResetAdmin!2026',
        role: 'ADMIN',
      })
      .expect(200)

    await owner
      .put(`/api/owner/users/${adminId}/password`)
      .set('Origin', 'http://localhost')
      .send({ password: 'ValidationAdmin!2026' })
      .then((response) => {
        if (response.status !== 204) throw new Error(JSON.stringify(response.body))
      })

    const events = await owner.get('/api/owner/password-events').expect(200)
    expect(events.body.events).toEqual(expect.arrayContaining([
      expect.objectContaining({
        actorUsername: 'tatan_master',
        source: 'OWNER_RESET',
        targetUsername: 'tatan_admin',
      }),
    ]))
    expect(events.body.events[0]).not.toHaveProperty('password')

    const admin = await loginAdmin()
    await admin.get('/api/owner/password-events').expect(403)
  })

  it('denies administrators and permits the owner to permanently delete an order', async () => {
    const owner = request.agent(app)
    await owner
      .post('/api/auth/login')
      .set('Origin', 'http://localhost')
      .send({
        username: 'tatan_master',
        password: 'ValidationOwner!2026',
        role: 'OWNER',
      })
      .expect(200)

    const original = await db.query(
      `INSERT INTO inquiries (id, customer_name, customer_phone, status)
       VALUES ('TFI-DELETE-001', 'Delete Test', '13000000000', 'pending')
       RETURNING id`,
    )
    expect(original.rowCount).toBe(1)

    const admin = await loginAdmin()
    await admin
      .delete('/api/inquiries/admin/TFI-DELETE-001')
      .set('Origin', 'http://localhost')
      .expect(403)

    await owner
      .delete('/api/inquiries/admin/TFI-DELETE-001')
      .set('Origin', 'http://localhost')
      .then((response) => {
        if (response.status !== 204) throw new Error(JSON.stringify(response.body))
      })

    await owner
      .delete('/api/inquiries/admin/TFI-DELETE-001')
      .set('Origin', 'http://localhost')
      .expect(404)

    const events = await db.query<{ subject_id: string; event_type: string }>(
      "SELECT subject_id, event_type FROM security_audit_events WHERE subject_id = 'TFI-DELETE-001'",
    )
    expect(events.rows).toEqual([
      { event_type: 'INQUIRY_DELETED', subject_id: 'TFI-DELETE-001' },
    ])
  })

  it('accepts signed image content from an authenticated administrator', async () => {
    const admin = await loginAdmin()
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const upload = await admin
      .post('/api/uploads')
      .set('Origin', 'http://localhost')
      .attach('file', Buffer.concat([pngHeader, Buffer.from('test-image')]), {
        filename: 'equipment.png',
        contentType: 'image/png',
      })
      .expect(201)

    expect(upload.body.file.url).toBe('/uploads/test.png')
  })

  it('rejects an image upload whose binary signature is not an image', async () => {
    const admin = await loginAdmin()
    await admin
      .post('/api/uploads')
      .set('Origin', 'http://localhost')
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'bad.png',
        contentType: 'image/png',
      })
      .expect(400, { error: 'INVALID_IMAGE_FILE' })
  })
})
