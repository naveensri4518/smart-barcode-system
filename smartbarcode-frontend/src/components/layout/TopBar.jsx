import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Moon, Sun, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { toast } from 'react-hot-toast'
import api from '../../api/axios'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your store' },
  '/products': { title: 'Products', subtitle: 'Manage your product catalog' },
  '/inventory': { title: 'Inventory', subtitle: 'Stock levels and alerts' },
  '/staff': { title: 'Staff Management', subtitle: 'Manage your team' },
  '/invoices': { title: 'Invoice History', subtitle: 'All billing records' },
  '/reports': { title: 'Reports', subtitle: 'Analytics and exports' },
  '/settings': { title: 'Settings', subtitle: 'Store configuration' },
  '/audit-logs': { title: 'Audit Logs', subtitle: 'System activity trail' },
  '/billing': { title: 'POS Billing', subtitle: 'Scan and sell' },
}

export default function TopBar() {
  const location = useLocation()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const page = pageTitles[location.pathname] || { title: 'Dashboard', subtitle: '' }
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      api.get('/dashboard/stats').then(res => {
        const stats = res.data
        const notifs = []
        if (stats.outOfStockProducts > 0) {
          notifs.push({
            title: 'Out of Stock',
            message: `${stats.outOfStockProducts} products are currently out of stock.`,
            icon: XCircle,
            color: 'var(--color-danger)'
          })
        }
        if (stats.lowStockProducts > 0) {
          notifs.push({
            title: 'Low Stock Alert',
            message: `${stats.lowStockProducts} products are running low on inventory.`,
            icon: AlertTriangle,
            color: 'var(--color-warning)'
          })
        }
        if (stats.expiringProducts && stats.expiringProducts.length > 0) {
          notifs.push({
            title: 'Expiring Soon',
            message: `${stats.expiringProducts.length} products are expiring in the next 30 days.`,
            icon: Clock,
            color: 'var(--color-danger)'
          })
        }
        setNotifications(notifs)
      }).catch(err => console.error("Error fetching notifications", err))
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="topbar">
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{page.title}</h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 1 }}>{dateStr}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          className="btn-icon btn-secondary" 
          aria-label="Toggle Theme"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className="btn-icon btn-secondary" 
            aria-label="Notifications"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2, width: 8, height: 8,
                background: 'var(--color-danger)', borderRadius: '50%'
              }} />
            )}
          </button>
          
          {showNotifs && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 320, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border-light)',
              zIndex: 50, overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-light)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Notifications
                {notifications.length > 0 && (
                  <span style={{ fontSize: 11, background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 12 }}>
                    {notifications.length} new
                  </span>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                    <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--color-border-light)',
                      fontSize: 13, display: 'flex', gap: 12, alignItems: 'flex-start',
                      background: i === 0 ? 'var(--color-bg)' : 'transparent'
                    }}>
                      <div style={{ padding: 6, background: n.color + '15', color: n.color, borderRadius: 8 }}>
                        <n.icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
                        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--color-text-primary)'
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--color-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white'
          }}>
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          {user?.fullName?.split(' ')[0]}
        </div>
      </div>
    </header>
  )
}
