import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../../components/common/EmptyState'
import { Modal } from '../../components/common/Modal'
import { Toast } from '../../components/common/Toast'
import type { Inquiry, InquiryStatus } from '../../models/inquiry'
import {
  changeInquiryStatus,
  fetchAdminInquiries,
} from '../../services/inquiry-api'

const statusLabels: Record<InquiryStatus, string> = {
  pending: '待联系',
  contacted: '已联系',
  won: '已成交',
  closed: '已关闭',
}

export function AdminInquiriesPage() {
  const [records, setRecords] = useState<Inquiry[]>([])
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAdminInquiries()
      .then(setRecords)
      .catch(() => setMessage('询价数据加载失败。'))
  }, [])
  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const statusMatch =
          selectedStatus === 'all' || record.status === selectedStatus
        const queryMatch = `${record.id}${record.customer.name}${record.customer.phone}${record.customer.company ?? ''}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
        return statusMatch && queryMatch
      }),
    [query, records, selectedStatus],
  )

  async function changeStatus(inquiryId: string, status: InquiryStatus) {
    try {
      await changeInquiryStatus(inquiryId, status)
      setRecords((current) =>
        current.map((record) =>
          record.id === inquiryId ? { ...record, status } : record,
        ),
      )
      setActiveInquiry(
        (current) => current?.id === inquiryId ? { ...current, status } : current,
      )
      setMessage(`询价状态已更新为“${statusLabels[status]}”。`)
    } catch {
      setMessage('询价状态更新失败。')
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">INQUIRY CONTROL / 02</p>
          <h1>询价管理</h1>
          <span>客户资料、询价设备与联系状态</span>
        </div>
        <dl className="admin-header-metrics">
          <div><dt>全部询价</dt><dd>{records.length}</dd></div>
          <div><dt>待联系</dt><dd>{records.filter((record) => record.status === 'pending').length}</dd></div>
        </dl>
      </header>

      <div className="admin-toolbar admin-toolbar--filters">
        <label className="admin-search">
          <span>搜索客户</span>
          <input
            placeholder="编号 / 姓名 / 手机 / 公司"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="admin-select">
          <span>状态筛选</span>
          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value as InquiryStatus | 'all')
            }
          >
            <option value="all">全部状态</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>客户</th>
                <th>联系方式</th>
                <th>公司 / 地址</th>
                <th>询价产品</th>
                <th>提交时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td><strong>{record.customer.name}</strong><br /><span>{record.id}</span></td>
                  <td>{record.customer.phone}<br />{record.customer.email ?? '—'}</td>
                  <td>{record.customer.company ?? '—'}<br />{record.customer.address ?? '—'}</td>
                  <td>{record.items.map((item) => `${item.productName} × ${item.quantity}`).join('、')}</td>
                  <td>{new Date(record.submittedAt).toLocaleString('zh-CN')}</td>
                  <td>
                    <select
                      aria-label={`修改 ${record.customer.name} 的询价状态`}
                      className={`status-select status-select--${record.status}`}
                      value={record.status}
                      onChange={(event) =>
                        changeStatus(record.id, event.target.value as InquiryStatus)
                      }
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td><button className="table-link" onClick={() => setActiveInquiry(record)} type="button">查看详情</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="暂无匹配询价"
          description="询价记录会在客户完成前台提交后出现在这里。"
        />
      )}

      <Modal
        onClose={() => setActiveInquiry(null)}
        open={activeInquiry !== null}
        title={activeInquiry ? `询价详情 ${activeInquiry.id}` : '询价详情'}
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
              <h3>询价产品</h3>
              <ul>
                {activeInquiry.items.map((item) => (
                  <li key={item.productId}>
                    <img src={item.image} alt="" />
                    <div><strong>{item.productName}</strong><span>{item.sku} · 数量 {item.quantity}</span><p>{item.note || '无采购备注'}</p></div>
                  </li>
                ))}
              </ul>
            </section>
            <label className="admin-field">
              <span>当前状态</span>
              <select
                value={activeInquiry.status}
                onChange={(event) =>
                  changeStatus(activeInquiry.id, event.target.value as InquiryStatus)
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        )}
      </Modal>
      {message && <div className="admin-toast"><Toast message={message} onDismiss={() => setMessage('')} /></div>}
    </section>
  )
}
