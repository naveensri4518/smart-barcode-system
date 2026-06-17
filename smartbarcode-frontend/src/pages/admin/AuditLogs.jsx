import { useState, useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const actionIcons = {
  LOGIN: '🔐',
  INVOICE_GENERATED: '🧾',
  PRODUCT_CREATED: '➕',
  PRODUCT_UPDATED: '✏️',
  PRODUCT_DELETED: '🗑️',
  STAFF_CREATED: '👤',
  DEFAULT: '📋',
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)

  const fetch = async (page = 0) => {
    setLoading(true)
    try {
      const res = await api.get(`/audit-logs?page=${page}&size=25`)
      setLogs(res.data.content || [])
      setPagination({ page: res.data.number || 0, totalPages: res.data.totalPages || 1 })
    } catch { toast.error('Failed to load audit logs') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const fmtDate = (d) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Audit Logs</div>
          <div className="page-subtitle">Complete system activity trail</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Description</th>
                <th>Entity</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i}>{Array(5).fill(0).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>
                  ))}</tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48 }}>
                  <ClipboardList size={32} style={{ color: 'var(--color-text-tertiary)', marginBottom: 8 }} />
                  <p>No audit logs yet</p>
                </td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>
                          {actionIcons[log.action] || actionIcons.DEFAULT}
                        </span>
                        <span className="badge badge-neutral">{log.action}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{log.username || '—'}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 300 }}>{log.description}</td>
                    <td>
                      {log.entityType && (
                        <span className="badge badge-info">{log.entityType} #{log.entityId}</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {fmtDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border-light)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span>Page {pagination.page + 1} of {pagination.totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={pagination.page === 0} onClick={() => fetch(pagination.page - 1)}>Previous</button>
              <button className="btn btn-secondary btn-sm" disabled={pagination.page >= pagination.totalPages - 1} onClick={() => fetch(pagination.page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
