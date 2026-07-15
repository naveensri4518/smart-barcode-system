import { useState, useEffect } from 'react'
import { Users, Search, Loader } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import api from '../../api/axios'

export default function Customers() {
  const { settings } = useSettings()
  const currency = settings?.currency_symbol || '₹'
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/customers')
      setCustomers(res.data)
    } catch (err) {
      console.error('Failed to fetch customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  )

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Users className="text-accent" size={32} />
            Customer Database
          </h1>
          <p className="page-subtitle">
            View loyalty points and customer details.<br/>
            <span className="text-sm opacity-80">💡 Customers earn 1 point for every {currency}100 spent. 1 Point = {currency}1 value.</span>
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader className="animate-spin text-accent" size={32} />
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Loyalty Points</th>
                  <th>Value ({currency})</th>
                  <th>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-secondary py-8">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td className="font-semibold">{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <span className="badge badge-success">
                          {customer.loyaltyPoints} pts
                        </span>
                      </td>
                      <td className="font-medium text-accent">{currency}{customer.loyaltyPoints}</td>
                      <td className="text-secondary">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
