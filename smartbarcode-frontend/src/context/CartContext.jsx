import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState({ type: 'FLAT', value: 0 })
  const [taxRate, setTaxRate] = useState(18)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [customer, setCustomer] = useState({ name: '', phone: '' })

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        barcode: product.barcode,
        unitPrice: product.sellingPrice,
        quantity: 1,
        maxStock: product.currentStock
      }]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev => prev.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart([])
    setDiscount({ type: 'FLAT', value: 0 })
    setCustomer({ name: '', phone: '' })
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

  const discountAmount = discount.type === 'PERCENTAGE'
    ? (subtotal * discount.value) / 100
    : Math.min(discount.value, subtotal)

  const afterDiscount = subtotal - discountAmount
  const taxAmount = (afterDiscount * taxRate) / 100
  const total = afterDiscount + taxAmount

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      discount, setDiscount,
      taxRate, setTaxRate,
      paymentMethod, setPaymentMethod,
      customer, setCustomer,
      subtotal, discountAmount, taxAmount, total
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
