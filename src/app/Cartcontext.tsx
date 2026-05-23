'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SleeveType = 'regular' | 'full'

export interface CartItem {
  id: string
  name: string
  price: number
  image_url: string
  size: string
  sleeve?: SleeveType | null
  quantity: number
  stock?: number
}

interface CartContextType {
  items: CartItem[]
  hydrated: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string, size: string, sleeve?: SleeveType | null) => void
  updateQty: (
    id: string,
    size: string,
    qty: number,
    sleeve?: SleeveType | null
  ) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[]
        setItems(
          parsed.map(item => ({
            ...item,
            sleeve: item.sleeve ?? null,
          }))
        )
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch {
      // ignore storage errors
    }
  }, [items, hydrated])

  function addItem(item: CartItem) {
    setItems(prev => {
      const incomingSleeve = item.sleeve ?? null

      const existingIndex = prev.findIndex(
        i =>
          i.id === item.id &&
          i.size === item.size &&
          (i.sleeve ?? null) === incomingSleeve
      )

      const maxStock = typeof item.stock === 'number' ? item.stock : Infinity

      if (existingIndex !== -1) {
        const updated = [...prev]
        const existing = updated[existingIndex]

        updated[existingIndex] = {
          ...existing,
          sleeve: existing.sleeve ?? null,
          quantity: Math.min(existing.quantity + item.quantity, maxStock),
        }

        return updated
      }

      return [
        ...prev,
        {
          ...item,
          sleeve: incomingSleeve,
          quantity: Math.min(item.quantity || 1, maxStock),
        },
      ]
    })
  }

  function removeItem(id: string, size: string, sleeve?: SleeveType | null) {
    const targetSleeve = sleeve ?? null

    setItems(prev =>
      prev.filter(
        i =>
          !(
            i.id === id &&
            i.size === size &&
            (i.sleeve ?? null) === targetSleeve
          )
      )
    )
  }

  function updateQty(
    id: string,
    size: string,
    qty: number,
    sleeve?: SleeveType | null
  ) {
    if (qty < 1) return

    const targetSleeve = sleeve ?? null

    setItems(prev =>
      prev.map(i => {
        if (
          i.id === id &&
          i.size === size &&
          (i.sleeve ?? null) === targetSleeve
        ) {
          const maxStock = typeof i.stock === 'number' ? i.stock : Infinity
          const safeQty = Math.min(qty, maxStock)

          return {
            ...i,
            sleeve: i.sleeve ?? null,
            quantity: safeQty,
          }
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
    <CartContext.Provider
      value={{
        items,
        hydrated,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}