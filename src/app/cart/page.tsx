'use client'

import { useMemo, useEffect, useState } from 'react'
import { useCart } from '../Cartcontext'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

// realtime stock fetch করে cart item এর stock update করা
function useRealtimeStock() {
  const { items, updateQty } = useCart()
  const [stockMap, setStockMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (items.length === 0) return
    async function fetchStock() {
      const supabase = createClient()
      const ids = [...new Set(items.map(i => i.id))]
      const { data } = await supabase
        .from('products')
        .select('id, stock')
        .in('id', ids)
      if (!data) return

      const map: Record<string, number> = {}
      data.forEach(p => { map[p.id] = p.stock })
      setStockMap(map)

      // cart quantity যদি stock এর বেশি হয় → clamp করে দাও
      items.forEach(item => {
        const realStock = map[item.id]
        if (realStock !== undefined && item.quantity > realStock) {
          updateQty(item.id, item.size, Math.max(1, realStock))
        }
      })
    }
    fetchStock()
  }, []) // mount এ একবার

  return stockMap
}

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const stockMap = useRealtimeStock()

  const deliveryCount = useMemo(() => items.length, [items])

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-4 text-4xl">🛒</p>
        <p className="mb-4 text-lg text-gray-500">Your cart is empty</p>
        <Link href="/" className="text-sm text-[#00612E] hover:underline">
          ← Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[4px] text-[#00612E]/60">
            Shopping Cart
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-800 sm:text-3xl">
            Your Cart
          </h1>
        </div>
        <span className="rounded-full bg-[#00612E]/8 px-3 py-1 text-xs font-semibold text-[#00612E]">
          {deliveryCount} item{deliveryCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {items.map((item) => {
            // realtime stock — fallback to item.stock
            const realStock = stockMap[item.id] ?? (typeof item.stock === 'number' ? item.stock : Infinity)
            const isOutOfStock = realStock === 0
            const isMaxed = item.quantity >= realStock

            return (
              <div
                key={`${item.id}-${item.size}`}
                className={`flex gap-4 rounded-[22px] border bg-white p-4 shadow-[0_12px_35px_rgba(0,0,0,0.05)] ${
                  isOutOfStock ? 'border-red-200 opacity-70' : 'border-white/80'
                }`}
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50">
                  <Image
                    src={item.image_url || '/placeholder.png'}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {item.size && (
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                        Size: {item.size}
                      </span>
                    )}
                    {/* stock warning */}
                    {isOutOfStock ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-600 font-medium">Out of stock</span>
                    ) : realStock <= 3 && realStock < Infinity ? (
                      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-orange-600 font-medium">Only {realStock} left!</span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-bold text-[#00612E]">
                    ৳{item.price.toLocaleString('en-BD')}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-lg leading-none text-gray-300 transition hover:text-red-400"
                    aria-label="Remove item"
                  >
                    ×
                  </button>

                  <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <button
                      onClick={() => updateQty(item.id, item.size, Math.max(1, item.quantity - 1))}
                      className="px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    {!isMaxed ? (
                      <button
                        onClick={() => updateQty(item.id, item.size, item.quantity + 1)}
                        className="px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100"
                      >
                        +
                      </button>
                    ) : (
                      <span className="px-3 py-2 text-xs font-semibold text-red-500">Max</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-[26px] border border-[#00612E]/10 bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#00612E]/55">Order Summary</p>
            <h2 className="mt-2 text-xl font-bold text-gray-900">Checkout Details</h2>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>৳{totalPrice.toLocaleString('en-BD')}</span>
            </div>
            <div className="flex justify-between">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
          </div>

          <div className="my-4 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>৳{totalPrice.toLocaleString('en-BD')}</span>
            </div>
          </div>

          {/* out of stock থাকলে checkout block */}
          {items.some(item => (stockMap[item.id] ?? Infinity) === 0) ? (
            <div className="w-full rounded-2xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-600 text-center font-medium">
              কিছু item out of stock — cart থেকে সরাও
            </div>
          ) : (
            <button
              onClick={() => router.push('/checkout')}
              className="w-full rounded-2xl bg-[#00612E] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,97,46,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,97,46,0.28)]"
            >
              Proceed to Checkout
            </button>
          )}

          <button
            onClick={clearCart}
            className="mt-3 w-full rounded-2xl border border-[#00612E]/10 bg-white px-5 py-3 text-xs font-medium text-gray-500 transition hover:bg-[#00612E]/5 hover:text-red-500"
          >
            Clear Cart
          </button>

          <Link href="/" className="mt-3 block text-center text-xs text-gray-400 transition hover:text-[#00612E]">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}