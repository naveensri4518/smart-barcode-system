import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const Section = ({ title, children }) => (
  <div className="card" style={{ marginBottom: 24 }}>
    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{title}</h3>
    <div className="form-grid">{children}</div>
  </div>
)

const Field = ({ label, id, ...rest }) => (
  <div className="form-group">
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
  </div>
)

export default function Settings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [smsLogs, setSmsLogs] = useState([])
  const [whatsappLogs, setWhatsappLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)

  useEffect(() => {
    api.get('/settings').then(res => {
      const map = {}
      ;(res.data || []).forEach(s => { map[s.settingKey] = s.settingValue })
      setSettings(map)
    }).catch(() => toast.error('Failed to load settings'))
    .finally(() => setLoading(false))
  }, [])

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/settings/bulk', settings)
      toast.success('Settings saved successfully')
    } catch { toast.error('Failed to save settings') }
    finally { setSaving(false) }
  }

  const loadLogs = async () => {
    try {
      const sms = await api.get('/notifications/sms-logs')
      const wa = await api.get('/notifications/whatsapp-logs')
      setSmsLogs(sms.data)
      setWhatsappLogs(wa.data)
      setShowLogs(true)
    } catch {
      toast.error('Failed to load logs')
    }
  }

  const retryLog = async (type, id) => {
    try {
      await api.post(`/notifications/retry/${type}/${id}`)
      toast.success('Retry triggered')
      loadLogs()
    } catch {
      toast.error('Retry failed')
    }
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><div className="loading-spinner" /></div>

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Store configuration and preferences</div>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <Section title="Store Information">
        <Field label="Store Name" id="store_name" value={settings.store_name || ''}
          onChange={e => set('store_name', e.target.value)} placeholder="My Retail Store" />
        <Field label="Store Phone" id="store_phone" value={settings.store_phone || ''}
          onChange={e => set('store_phone', e.target.value)} placeholder="+91 98765 43210" />
        <Field label="Store Email" id="store_email" value={settings.store_email || ''}
          onChange={e => set('store_email', e.target.value)} placeholder="contact@store.com" />
        <div className="form-group full">
          <label>Store Address</label>
          <textarea value={settings.store_address || ''} rows={2}
            onChange={e => set('store_address', e.target.value)}
            placeholder="Full store address" />
        </div>
      </Section>





      <Section title="System Preferences">
        <div className="form-group">
          <label>Timezone</label>
          <select value={settings.timezone || 'Asia/Kolkata'}
            onChange={e => set('timezone', e.target.value)}>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </div>
        <div className="form-group">
          <label>Low Stock Alert</label>
          <select value={settings.low_stock_alert || 'true'}
            onChange={e => set('low_stock_alert', e.target.value)}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </Section>

      {showLogs && (
        <div className="modal-overlay" onClick={() => setShowLogs(false)}>
          <div className="modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Notification Logs</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowLogs(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 600, overflowY: 'auto' }}>
              <h4>SMS Logs</h4>
              <table className="table" style={{ width: '100%', marginBottom: 20 }}>
                <thead><tr><th>Phone</th><th>Status</th><th>Invoice</th><th>API Response</th><th>Action</th></tr></thead>
                <tbody>
                  {smsLogs.map((l, i) => (
                    <tr key={i}>
                      <td>{l.phone}</td>
                      <td>{l.status}</td>
                      <td>{l.invoiceId}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.apiResponse}>{l.apiResponse || '-'}</td>
                      <td>
                        {l.status === 'FAILED' && <button className="btn btn-primary btn-sm" onClick={() => retryLog('sms', l.id)}>Retry</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h4>WhatsApp Logs</h4>
              <table className="table" style={{ width: '100%' }}>
                <thead><tr><th>Phone</th><th>Status</th><th>Invoice</th><th>API Response</th><th>Action</th></tr></thead>
                <tbody>
                  {whatsappLogs.map((l, i) => (
                    <tr key={i}>
                      <td>{l.phone}</td>
                      <td>{l.status}</td>
                      <td>{l.invoiceId}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.apiResponse}>{l.apiResponse || '-'}</td>
                      <td>
                        {l.status === 'FAILED' && <button className="btn btn-primary btn-sm" onClick={() => retryLog('whatsapp', l.id)}>Retry</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
