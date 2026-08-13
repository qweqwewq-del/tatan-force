import { randomUUID } from 'node:crypto'
import type { PoolClient, QueryResultRow } from 'pg'
import type { Database, Role, SessionUser } from '../types.js'

type Queryable = Pick<Database, 'query'> | PoolClient

export type PasswordChangeSource =
  | 'SELF_SERVICE'
  | 'OWNER_RESET'
  | 'DEPLOYMENT_RESET'

export interface PasswordChangeTarget {
  id: string
  username: string
  role: Role
}

async function insertEvent(
  db: Queryable,
  event: {
    eventType: 'PASSWORD_CHANGED' | 'INQUIRY_DELETED'
    actor?: Pick<SessionUser, 'id' | 'username' | 'role'>
    actorUsername: string
    actorRole: string
    target?: PasswordChangeTarget
    subjectId?: string
  },
) {
  const query = db.query.bind(db) as Database['query']
  await query<QueryResultRow>(
    `INSERT INTO security_audit_events (
      id, event_type, actor_user_id, actor_username, actor_role,
      target_user_id, target_username, target_role, subject_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      randomUUID(),
      event.eventType,
      event.actor?.id ?? null,
      event.actorUsername,
      event.actorRole,
      event.target?.id ?? null,
      event.target?.username ?? null,
      event.target?.role ?? null,
      event.subjectId ?? null,
    ],
  )
}

export function recordPasswordChange(
  db: Queryable,
  input: {
    actor?: Pick<SessionUser, 'id' | 'username' | 'role'>
    target: PasswordChangeTarget
    source: PasswordChangeSource
  },
) {
  const deploymentReset = input.source === 'DEPLOYMENT_RESET'
  return insertEvent(db, {
    eventType: 'PASSWORD_CHANGED',
    actor: input.actor,
    actorUsername: deploymentReset ? 'deployment-reset' : input.actor!.username,
    actorRole: deploymentReset ? 'SYSTEM' : input.actor!.role,
    target: input.target,
    subjectId: input.source,
  })
}

export function recordInquiryDeletion(
  db: Queryable,
  input: { actor: Pick<SessionUser, 'id' | 'username' | 'role'>; inquiryId: string },
) {
  return insertEvent(db, {
    eventType: 'INQUIRY_DELETED',
    actor: input.actor,
    actorUsername: input.actor.username,
    actorRole: input.actor.role,
    subjectId: input.inquiryId,
  })
}
