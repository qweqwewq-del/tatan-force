BEGIN;

CREATE TABLE IF NOT EXISTS credential_reset_tokens (
  token_digest text PRIMARY KEY,
  used_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('PASSWORD_CHANGED', 'INQUIRY_DELETED')),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_username text NOT NULL,
  actor_role text NOT NULL,
  target_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  target_username text,
  target_role text,
  subject_id text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS security_audit_events_password_idx
  ON security_audit_events (event_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS security_audit_events_subject_idx
  ON security_audit_events (subject_id, occurred_at DESC);

COMMIT;
