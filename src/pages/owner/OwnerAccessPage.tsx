import { useEffect, useState, type FormEvent } from 'react'
import { AccessLoginPanel } from '../../components/admin/AccessLoginPanel'
import { IndustrialButton } from '../../components/common/IndustrialButton'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { Toast } from '../../components/common/Toast'
import { useAuth } from '../../features/admin/useAuth'
import type { Inquiry } from '../../models/inquiry'
import type { Product } from '../../models/product'
import type { SystemConfig } from '../../models/admin'
import { deleteOwnerInquiry, fetchAdminInquiries } from '../../services/inquiry-api'
import {
  fetchAdminUsers,
  fetchPasswordChangeEvents,
  resetAdminPassword,
  type PasswordChangeEvent,
  type ManagedAdminUser,
} from '../../services/owner-api'
import { fetchProducts } from '../../services/product-api'
import {
  fetchSystemConfig,
  updateSystemConfig,
} from '../../services/settings-api'

const initialConfig: SystemConfig = {
  maintenanceMode: false,
  environmentLabel: 'PRODUCTION',
  apiBaseUrl: '/api',
  updatedAt: new Date(0).toISOString(),
}

const passwordChangeSourceLabels: Record<PasswordChangeEvent['source'], string> = {
  SELF_SERVICE: '账号自行修改',
  OWNER_RESET: '所有者重置',
  DEPLOYMENT_RESET: '部署恢复重置',
}

export function OwnerAccessPage() {
  const { loading: authLoading, login, logout, session } = useAuth()
  const [loginError, setLoginError] = useState('')
  const [config, setConfig] = useState<SystemConfig>(initialConfig)
  const [adminUsers, setAdminUsers] = useState<ManagedAdminUser[]>([])
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [passwordEvents, setPasswordEvents] = useState<PasswordChangeEvent[]>([])
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.role !== 'OWNER') return
    Promise.all([
      fetchProducts(true),
      fetchAdminInquiries(),
      fetchAdminUsers(),
      fetchSystemConfig(),
      fetchPasswordChangeEvents(),
    ])
      .then(([nextProducts, nextInquiries, nextAdmins, nextConfig, nextPasswordEvents]) => {
        setProducts(nextProducts)
        setInquiries(nextInquiries)
        setAdminUsers(nextAdmins)
        setConfig(nextConfig)
        setPasswordEvents(nextPasswordEvents)
      })
      .catch(() => setMessage('维护数据加载失败，请检查 API 与数据库状态。'))
      .finally(() => setLoading(false))
  }, [session])

  useEffect(() => {
    if (session?.role !== 'OWNER') return undefined
    const refresh = () => {
      void fetchPasswordChangeEvents()
        .then(setPasswordEvents)
        .catch(() => undefined)
    }
    const interval = window.setInterval(refresh, 15_000)
    return () => window.clearInterval(interval)
  }, [session])

  if (authLoading) {
    return <LoadingState label="正在验证维护会话" />
  }

  if (session?.role !== 'OWNER') {
    return (
      <main className="owner-access-page">
        <AccessLoginPanel
          description="独立维护通道。身份凭据由服务端验证，隐藏路径不构成安全边界。"
          error={loginError}
          eyebrow="SYSTEM MAINTENANCE CHANNEL"
          role="OWNER"
          title="维护身份验证"
          onSubmit={async (username, password) => {
            if (!(await login(username, password, 'OWNER'))) {
              setLoginError('身份校验失败。')
            }
          }}
        />
      </main>
    )
  }

  async function saveConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setConfig(await updateSystemConfig({
        maintenanceMode: config.maintenanceMode,
        environmentLabel: config.environmentLabel,
        apiBaseUrl: config.apiBaseUrl,
      }))
      setMessage('系统配置已保存。')
    } catch {
      setMessage('系统配置保存失败。')
    }
  }

  async function deleteInquiry(inquiry: Inquiry) {
    if (!window.confirm(`确认永久删除订单 ${inquiry.id} 吗？此操作无法撤销。`)) {
      return
    }
    try {
      await deleteOwnerInquiry(inquiry.id)
      setInquiries((current) => current.filter((record) => record.id !== inquiry.id))
      setActiveInquiry(null)
      setMessage(`订单 ${inquiry.id} 已删除。`)
    } catch {
      setMessage('订单删除失败，请稍后重试。')
    }
  }

  return (
    <main className="owner-console">
      <header className="owner-console__header">
        <div>
          <p>OWNER / PLATFORM MAINTENANCE</p>
          <h1>系统维护控制台</h1>
          <span>该入口不属于商家后台导航</span>
        </div>
        <button onClick={() => void logout()} type="button">结束维护会话</button>
      </header>

      {loading ? <LoadingState label="正在加载系统状态" /> : (
        <section className="owner-status-grid" aria-label="系统状态">
          <article><span>01 / RUNTIME</span><strong>ONLINE</strong><p>{config.environmentLabel}</p></article>
          <article><span>02 / PRODUCTS</span><strong>{products.length}</strong><p>数据库商品记录</p></article>
          <article><span>03 / INQUIRIES</span><strong>{inquiries.length}</strong><p>全部询价记录</p></article>
          <article><span>04 / STORAGE</span><strong>REMOTE</strong><p>PostgreSQL + 对象存储</p></article>
        </section>
      )}

      <div className="owner-console__grid">
        <section className="owner-panel">
          <header><p>ADMIN ACCOUNT</p><h2>商家管理员账号</h2></header>
          {adminUsers.map((admin) => (
            <form
              className="owner-admin-row"
              key={admin.id}
              onSubmit={async (event) => {
                event.preventDefault()
                try {
                  await resetAdminPassword(admin.id, newPassword)
                  setNewPassword('')
                  setMessage(`已重置 ${admin.username} 的密码。`)
                } catch {
                  setMessage('密码重置失败，新密码至少需要 12 位。')
                }
              }}
            >
              <div><strong>{admin.username}</strong><span>ADMIN · {new Date(admin.createdAt).toLocaleDateString('zh-CN')}</span></div>
              <label className="admin-field">
                <span>重置密码</span>
                <input
                  minLength={12}
                  placeholder="输入新密码"
                  required
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>
              <IndustrialButton type="submit">执行重置</IndustrialButton>
            </form>
          ))}
        </section>

        <form className="owner-panel admin-form" onSubmit={saveConfig}>
          <header><p>SYSTEM CONFIG</p><h2>系统配置</h2></header>
          <label className="admin-field">
            <span>环境标识</span>
            <input
              value={config.environmentLabel}
              onChange={(event) => setConfig((current) => ({
                ...current,
                environmentLabel: event.target.value,
              }))}
            />
          </label>
          <label className="admin-field">
            <span>API 地址</span>
            <input
              value={config.apiBaseUrl}
              onChange={(event) => setConfig((current) => ({
                ...current,
                apiBaseUrl: event.target.value,
              }))}
            />
          </label>
          <label className="owner-toggle">
            <input
              checked={config.maintenanceMode}
              type="checkbox"
              onChange={(event) => setConfig((current) => ({
                ...current,
                maintenanceMode: event.target.checked,
              }))}
            />
            <span>维护模式标记</span>
          </label>
          <IndustrialButton type="submit">保存系统配置</IndustrialButton>
        </form>
      </div>

      <section className="owner-panel owner-password-events" aria-live="polite">
        <header>
          <p>PASSWORD CHANGE AUDIT / LIVE</p>
          <h2>管理员密码变更记录</h2>
        </header>
        <p className="owner-panel__note">
          每 15 秒更新一次。出于安全原因，系统只显示变更记录，不显示或保存真实密码。
        </p>
        {passwordEvents.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>管理员</th><th>变更方式</th><th>操作者</th><th>发生时间</th></tr></thead>
              <tbody>
                {passwordEvents.map((event) => (
                  <tr key={event.id}>
                    <td><strong>{event.targetUsername}</strong></td>
                    <td>{passwordChangeSourceLabels[event.source]}</td>
                    <td>{event.actorUsername} / {event.actorRole}</td>
                    <td>{new Date(event.occurredAt).toLocaleString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="owner-panel__note">暂未记录到密码变更。</p>}
      </section>

      <section className="owner-panel owner-inquiries">
        <header><p>ALL INQUIRIES</p><h2>全部询价数据</h2></header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>编号</th><th>客户</th><th>手机</th><th>产品条目</th><th>状态</th><th>提交时间</th><th>操作</th></tr></thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>{inquiry.id}</td>
                  <td>{inquiry.customer.name}</td>
                  <td>{inquiry.customer.phone}</td>
                  <td>{inquiry.items.length}</td>
                  <td>{inquiry.status}</td>
                  <td>{new Date(inquiry.submittedAt).toLocaleString('zh-CN')}</td>
                  <td className="owner-order-actions">
                    <button className="table-link" onClick={() => setActiveInquiry(inquiry)} type="button">查看订单</button>
                    <button className="table-link table-link--danger" onClick={() => void deleteInquiry(inquiry)} type="button">删除订单</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Modal
        onClose={() => setActiveInquiry(null)}
        open={activeInquiry !== null}
        title={activeInquiry ? `订单详情 ${activeInquiry.id}` : '订单详情'}
        footer={activeInquiry ? (
          <IndustrialButton onClick={() => void deleteInquiry(activeInquiry)} variant="outline">
            删除订单
          </IndustrialButton>
        ) : undefined}
      >
        {activeInquiry && (
          <div className="inquiry-detail">
            <section>
              <h3>客户资料</h3>
              <dl>
                <div><dt>姓名</dt><dd>{activeInquiry.customer.name}</dd></div>
                <div><dt>手机</dt><dd>{activeInquiry.customer.phone}</dd></div>
                <div><dt>微信</dt><dd>{activeInquiry.customer.wechat ?? '—'}</dd></div>
                <div><dt>公司</dt><dd>{activeInquiry.customer.company ?? '—'}</dd></div>
                <div><dt>地址</dt><dd>{activeInquiry.customer.address ?? '—'}</dd></div>
                <div><dt>邮箱</dt><dd>{activeInquiry.customer.email ?? '—'}</dd></div>
              </dl>
            </section>
            <section>
              <h3>订单产品</h3>
              <ul>
                {activeInquiry.items.map((item) => (
                  <li key={`${item.productId}-${item.sku}`}>
                    <img src={item.image} alt="" />
                    <div><strong>{item.productName}</strong><span>{item.sku} · 数量 {item.quantity}</span><p>{item.specification ?? item.note ?? '无附加说明'}</p></div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </Modal>
      <footer className="owner-console__footer">
        OWNER 路径只负责入口隔离；真实安全由服务端会话、角色校验与数据库权限保证。
      </footer>
      {message && (
        <div className="admin-toast">
          <Toast
            message={message}
            tone={message.includes('失败') ? 'error' : 'success'}
            onDismiss={() => setMessage('')}
          />
        </div>
      )}
    </main>
  )
}
