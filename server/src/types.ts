import type { PoolClient, QueryResult, QueryResultRow } from 'pg'

export type Role = 'OWNER' | 'ADMIN'

export interface SessionUser {
  id: string
  username: string
  role: Role
}

export interface Database {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<T>>
  transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T>
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser
  }
}
