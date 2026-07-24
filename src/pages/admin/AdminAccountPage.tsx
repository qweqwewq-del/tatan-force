import { useState, type FormEvent } from 'react'
import { IndustrialButton } from '../../components/common/IndustrialButton'
import { Toast } from '../../components/common/Toast'
import { useAuth } from '../../features/admin/useAuth'

export function AdminAccountPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const { changePassword, session } = useAuth()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (nextPassword.length < 12 || nextPassword !== confirmation) {
      setMessage('新密码至少 12 位，且两次输入必须一致。')
      return
    }

    if (!(await changePassword(currentPassword, nextPassword))) {
      setMessage('当前密码不正确，修改未生效。')
      return
    }

    setCurrentPassword('')
    setNextPassword('')
    setConfirmation('')
    setMessage('密码修改成功。')
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">ACCOUNT SECURITY / 04</p>
          <h1>账号安全</h1>
          <span>当前商家管理员仅能修改自己的密码</span>
        </div>
      </header>
      <div className="account-grid">
        <section className="admin-panel account-card">
          <p>当前账号</p>
          <strong>{session?.username}</strong>
          <dl>
            <div><dt>角色</dt><dd>ADMIN</dd></div>
            <div><dt>会话</dt><dd>HTTPONLY COOKIE</dd></div>
          </dl>
        </section>
        <form className="admin-panel admin-form" onSubmit={handleSubmit}>
          <h2>修改密码</h2>
          <label className="admin-field"><span>当前密码</span><input autoComplete="current-password" required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
          <label className="admin-field"><span>新密码</span><input autoComplete="new-password" minLength={12} required type="password" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} /></label>
          <label className="admin-field"><span>确认新密码</span><input autoComplete="new-password" minLength={12} required type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
          <IndustrialButton type="submit">更新密码</IndustrialButton>
        </form>
      </div>
      {message && <div className="admin-toast"><Toast message={message} tone={message.includes('成功') ? 'success' : 'error'} onDismiss={() => setMessage('')} /></div>}
    </section>
  )
}
