'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image_url: string
  size: string
  quantity: number
 stock?: number
}

interface CartContextType {
  items: CartItem[]
  hydrated: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string, size: string) => void
  updateQty: (id: string, size: string, qty: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Client এ mount হলে localStorage থেকে load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setHydrated(true)
  }, [])

  // items change হলে save
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

function addItem(item: CartItem) {
  setItems((prev) => {
    const existing = prev.find(
      (i) => i.id === item.id && i.size === item.size
    )

    if (existing) {
      const maxStock =
        typeof item.stock === 'number' ? item.stock : Infinity

      const newQty = Math.min(
        existing.quantity + item.quantity,
        maxStock
      )

      return prev.map((i) =>
        i.id === item.id && i.size === item.size
          ? { ...i, quantity: newQty }
          : i
      )
    }

    return [...prev, item]
  })
}

  function removeItem(id: string, size: string) {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)))
  }

 function updateQty(id: string, size: string, qty: number) {
  setItems((prev) =>
    prev.map((i) => {
      if (i.id === id && i.size === size) {
        if (qty < 1) return i

        const maxStock =
          typeof i.stock === 'number' ? i.stock : Infinity

        const safeQty = Math.min(qty, maxStock)

        return { ...i, quantity: safeQty }
      }
      return i
    })
  )
}

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, hydrated, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}