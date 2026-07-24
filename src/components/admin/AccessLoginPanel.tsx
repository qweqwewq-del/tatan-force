import { useState, type FormEvent } from 'react'
import type { AdminRole } from '../../models/admin'
import { IndustrialButton } from '../common/IndustrialButton'

interface AccessLoginPanelProps {
  role: AdminRole
  eyebrow: string
  title: string
  description: string
  error: string
  onSubmit: (username: string, password: string) => void
}

export function AccessLoginPanel({
  role,
  eyebrow,
  title,
  description,
  error,
  onSubmit,
}: AccessLoginPanelProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(username, password)
  }

  return (
    <section className="access-panel" aria-labelledby={`${role}-access-title`}>
      <div className="access-panel__rail" aria-hidden="true">
        <span>{role === 'OWNER' ? 'SYS' : 'ADM'}</span>
      </div>
      <div className="access-panel__content">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id={`${role}-access-title`}>{title}</h1>
        <p>{description}</p>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>用户名</span>
            <input
              autoComplete="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>
          <label className="admin-field">
            <span>密码</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && <p className="admin-form__error" role="alert">{error}</p>}
          <IndustrialButton fullWidth type="submit">
            验证身份
          </IndustrialButton>
        </form>
      </div>
    </section>
  )
}
