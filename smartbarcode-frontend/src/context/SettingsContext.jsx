import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    currency_symbol: '₹',
    gst_rate: 18,
    timezone: 'Asia/Kolkata',
    invoice_prefix: 'INV',
    low_stock_alert: 'true',
    store_name: 'Velora Retail',
    store_phone: '',
    store_email: '',
    store_address: '',
    invoice_footer: 'Thank you for shopping with us!'
  })
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    if (user) {
      setLoadingSettings(true)
      api.get('/settings').then(res => {
        if (res.data && res.data.length > 0) {
          const map = {}
          res.data.forEach(s => { 
            // Ignore corrupted tax & billing settings from backend
            if (s.settingKey !== 'currency_symbol' && s.settingKey !== 'gst_rate' && s.settingKey !== 'invoice_prefix' && s.settingKey !== 'invoice_footer') {
              map[s.settingKey] = s.settingValue 
            }
          })
          setSettings(prev => ({ ...prev, ...map }))
        }
      }).catch(err => {
        console.error("Failed to load global settings", err)
      }).finally(() => {
        setLoadingSettings(false)
      })
    } else {
      setLoadingSettings(false)
    }
  }, [user])

  return (
    <SettingsContext.Provider value={{ settings, loadingSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}
