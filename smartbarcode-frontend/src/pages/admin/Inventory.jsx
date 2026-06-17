import { useState, useEffect } from 'react'
import { AlertTriangle, XCircle, Clock, TrendingDown, Package } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Inventory() {
  const [lowStock, setLowStock] = useState([])
  const [outOfStock, setOutOfStock] = useState([])
  const [expiring, setExpiring] = useState([])
  const [loading, setLoading] = useState(true)

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

  const fmtPrice = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

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

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-bg)' }}>
            <AlertTriangle size={20} color="var(--color-warning)" />
          </div>
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-label">Low Stock Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-danger-bg)' }}>
            <XCircle size={20} color="var(--color-danger)" />
          </div>
          <div className="stat-value">{outOfStock.length}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff8eb' }}>
            <Clock size={20} color="var(--color-warning)" />
          </div>
          <div className="stat-value">{expiring.length}</div>
          <div className="stat-label">Expiring in 30 Days</div>
        </div>
      </div>

      <InventoryTable
        title="Low Stock Products"
        icon={TrendingDown}
        items={lowStock}
        color="var(--color-warning)"
        bg="var(--color-warning-bg)"
        emptyMsg="All products are well stocked 🎉"
      />
      <InventoryTable
        title="Out of Stock Products"
        icon={XCircle}
        items={outOfStock}
        color="var(--color-danger)"
        bg="var(--color-danger-bg)"
        emptyMsg="No products are out of stock 🎉"
      />
      <InventoryTable
        title="Expiring Products (Next 30 Days)"
        icon={Clock}
        items={expiring}
        color="var(--color-warning)"
        bg="var(--color-warning-bg)"
        emptyMsg="No products expiring soon 🎉"
      />
    </div>
  )
}
