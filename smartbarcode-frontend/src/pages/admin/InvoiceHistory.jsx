import { useState, useEffect } from 'react'
import { Search, Eye, Download, FileText, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function InvoiceHistory() {
  const { settings } = useSettings()
  const currency = settings?.currency_symbol || '₹'
  const [invoices, setInvoices] = useState([])
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchInvoices = async (page = 0) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, size: 20 })
      if (search) params.set('search', search)
      const res = await api.get(`/invoices?${params}`)
      setInvoices(res.data.content || [])
      setPagination({ page: res.data.number || 0, totalPages: res.data.totalPages || 1 })
    } catch { toast.error('Failed to load invoices') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchInvoices() }, [search])

  const fmtCurrency = (n) => currency + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })
  const fmtDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Invoice History</div>
          <div className="page-subtitle">All billing records</div>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper" style={{ maxWidth: 360 }}>
          <Search size={16} />
          <input placeholder="Search invoice number or customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Staff</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(11).fill(0).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>
                  ))}</tr>
                ))
              ) : invoices.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 48 }}>
                  <FileText size={32} style={{ color: 'var(--color-text-tertiary)', marginBottom: 8 }} />
                  <p>No invoices found</p>
                </td></tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }}>
                      {inv.invoiceNumber}
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{inv.customerName || 'Walk-in'}</div>
                      {inv.customerPhone && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{inv.customerPhone}</div>}
                    </td>
                    <td>{fmtCurrency(inv.subtotal)}</td>
                    <td>{fmtCurrency(inv.taxAmount)}</td>
                    <td>{fmtCurrency(inv.discountAmount)}</td>
                    <td style={{ fontWeight: 700 }}>{fmtCurrency(inv.total)}</td>
                    <td>
                      <span className="badge badge-neutral">{inv.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={`badge ${inv.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{inv.createdBy?.fullName}</td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(inv.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="View Invoice"
                          onClick={() => navigate(`/invoice/${inv.id}`)}>
                          <Eye size={15} />
                        </button>
                      </div>
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
            <span style={{ color: 'var(--color-text-secondary)' }}>Page {pagination.page + 1} of {pagination.totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={pagination.page === 0} onClick={() => fetchInvoices(pagination.page - 1)}>Previous</button>
              <button className="btn btn-secondary btn-sm" disabled={pagination.page >= pagination.totalPages - 1} onClick={() => fetchInvoices(pagination.page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
