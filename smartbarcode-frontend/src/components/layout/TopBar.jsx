import { useLocation } from 'react-router-dom'
import { Bell, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { toast } from 'react-hot-toast'

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

  const handleNotificationClick = () => {
    toast('No new notifications', { icon: '🔔' })
  }

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
        <button 
          className="btn-icon btn-secondary" 
          aria-label="Notifications"
          onClick={handleNotificationClick}
        >
          <Bell size={18} />
        </button>
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
