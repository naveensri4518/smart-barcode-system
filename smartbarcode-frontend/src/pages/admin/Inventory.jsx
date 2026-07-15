import { useState, useEffect } from 'react'
import { AlertTriangle, XCircle, Clock, TrendingDown, Package } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Inventory() {
  const { settings } = useSettings()
  const currency = settings?.currency_symbol || '₹'
  const [lowStock, setLowStock] = useState([])
  const [outOfStock, setOutOfStock] = useState([])
  const [expiring, setExpiring] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('low')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [low, out, exp] = await Promise.all([
          api.get('/products/low-stock'),
          api.get('/products/out-of-stock'),
          api.get('/products/expiring?days=30'),
        ])
        setLowStock(low.data || [])
        setOutOfStock(out.data || [])
        setExpiring(exp.data || [])
      } catch {
        toast.error('Failed to load inventory data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const fmtPrice = (n) => currency + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  const InventoryTable = ({ title, icon: Icon, items, color, bg, emptyMsg }) => (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {items.length} product{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-tertiary)' }}>
          <Package size={28} style={{ marginBottom: 8 }} />
          <p>{emptyMsg}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Selling Price</th>
                {title.includes('Expiring') && <th>Expiry Date</th>}
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    {p.brand && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{p.brand}</div>}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.barcode}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color }}>
                      {p.currentStock} {p.unit}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{p.minStockLevel}</td>
                  <td style={{ fontWeight: 600 }}>{fmtPrice(p.sellingPrice)}</td>
                  {title.includes('Expiring') && (
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warning)' }}>
                        {p.expiryDate}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title">Inventory</div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ marginBottom: 24 }}>
            <div className="skeleton" style={{ width: '30%', height: 24, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: '100%', height: 120 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Inventory Intelligence</div>
          <div className="page-subtitle">Automated stock monitoring and alerts</div>
        </div>
      </div>

      {/* Summary Cards as Tabs */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div 
          className="stat-card"
          onClick={() => setActiveTab('low')}
          style={{ 
            cursor: 'pointer', 
            border: activeTab === 'low' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            boxShadow: activeTab === 'low' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            transform: activeTab === 'low' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="stat-icon" style={{ background: 'var(--color-warning-bg)' }}>
            <AlertTriangle size={20} color="var(--color-warning)" />
          </div>
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-label">Low Stock Products</div>
        </div>
        <div 
          className="stat-card"
          onClick={() => setActiveTab('out')}
          style={{ 
            cursor: 'pointer', 
            border: activeTab === 'out' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            boxShadow: activeTab === 'out' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            transform: activeTab === 'out' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="stat-icon" style={{ background: 'var(--color-danger-bg)' }}>
            <XCircle size={20} color="var(--color-danger)" />
          </div>
          <div className="stat-value">{outOfStock.length}</div>
          <div className="stat-label">Out of Stock Products</div>
        </div>
        <div 
          className="stat-card"
          onClick={() => setActiveTab('expiring')}
          style={{ 
            cursor: 'pointer', 
            border: activeTab === 'expiring' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            boxShadow: activeTab === 'expiring' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            transform: activeTab === 'expiring' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="stat-icon" style={{ background: '#fff8eb' }}>
            <Clock size={20} color="var(--color-warning)" />
          </div>
          <div className="stat-value">{expiring.length}</div>
          <div className="stat-label">Expiring in 30 Days</div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        width: '100%',
        background: 'var(--color-surface)', 
        padding: '6px', 
        borderRadius: '16px', 
        gap: '8px', 
        marginBottom: '28px', 
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {[
          { id: 'low', label: 'Low Stock' },
          { id: 'out', label: 'Out of Stock' },
          { id: 'expiring', label: 'Expiring Soon' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 24px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--color-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              fontSize: '15px',
              borderRadius: '10px',
              boxShadow: activeTab === tab.id ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
              transform: activeTab === tab.id ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {activeTab === 'low' && (
        <InventoryTable
          title="Low Stock Products"
          icon={TrendingDown}
          items={lowStock}
          color="var(--color-warning)"
          bg="var(--color-warning-bg)"
          emptyMsg="All products are well stocked 🎉"
        />
      )}
      
      {activeTab === 'out' && (
        <InventoryTable
          title="Out of Stock Products"
          icon={XCircle}
          items={outOfStock}
          color="var(--color-danger)"
          bg="var(--color-danger-bg)"
          emptyMsg="No products are out of stock 🎉"
        />
      )}
      
      {activeTab === 'expiring' && (
        <InventoryTable
          title="Expiring Products (Next 30 Days)"
          icon={Clock}
          items={expiring}
          color="var(--color-warning)"
          bg="var(--color-warning-bg)"
          emptyMsg="No products expiring soon 🎉"
        />
      )}
    </div>
  )
}
