'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCart } from '../Cartcontext'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

type SleeveType = 'regular' | 'full'

function useRealtimeStock() {
  const { items, updateQty } = useCart()
  const [stockMap, setStockMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (items.length === 0) {
      setStockMap({})
      return
    }

    let cancelled = false

    async function fetchStock() {
      const supabase = createClient()
      const ids = [...new Set(items.map((i) => i.id))]

      const { data, error } = await supabase
        .from('products')
        .select('id, stock')
        .in('id', ids)

      if (cancelled || error || !data) return

      const map: Record<string, number> = {}
      data.forEach((p) => {
        map[p.id] = p.stock
      })
      setStockMap(map)

      items.forEach((item) => {
        const realStock = map[item.id]
        if (realStock !== undefined && item.quantity > realStock) {
          updateQty(item.id, item.size, Math.max(1, realStock), item.sleeve)
        }
      })
    }

    fetchStock()

    return () => {
      cancelled = true
    }
  }, [items, updateQty])

  return stockMap
}

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const stockMap = useRealtimeStock()

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const hasOutOfStockItem = useMemo(
    () => items.some((item) => (stockMap[item.id] ?? item.stock ?? Infinity) === 0),
    [items, stockMap]
  )

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="mb-4 text-4xl">🛒</p>
        <p className="mb-4 text-lg text-gray-500">Your cart is empty</p>
        <Link href="/" className="text-sm text-[#00612E] hover:underline">
          ← Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[3px] text-[#00612E]/60 sm:text-xs sm:tracking-[4px]">
            Shopping Cart
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-800 sm:text-3xl lg:text-[2.15rem]">
            Your Cart
          </h1>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-[#00612E]/8 px-3 py-1 text-xs font-semibold text-[#00612E]">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start">
        <div className="space-y-3 sm:space-y-4">
          {items.map((item) => {
            const variantKey = `${item.id}-${item.size ?? 'nosize'}-${item.sleeve ?? 'none'}`
            const realStock =
              stockMap[item.id] ?? (typeof item.stock === 'number' ? item.stock : Infinity)
            const isOutOfStock = realStock === 0
            const isMaxed = Number.isFinite(realStock) && item.quantity >= realStock

            return (
              <div
                key={variantKey}
                className={`flex flex-col gap-4 rounded-[22px] border bg-white p-4 shadow-[0_12px_35px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${
                  isOutOfStock ? 'border-red-200 opacity-70' : 'border-white/80'
                }`}
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50 sm:h-24 sm:w-24">
                  <Image
                    src={item.image_url || '/placeholder.png'}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 80px, 96px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 text-sm font-semibold text-gray-800 sm:text-base">
                      {item.name}
                    </p>

                    <button
                      onClick={() => removeItem(item.id, item.size, item.sleeve)}
                      className="-mt-1 text-xl leading-none text-gray-300 transition hover:text-red-400 sm:mt-0"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {item.size && (
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                        Size: {item.size}
                      </span>
                    )}

                    {item.sleeve && (
                      <span className="rounded-full border border-[#00612E]/10 bg-[#00612E]/5 px-2.5 py-1 font-medium text-[#00612E]">
                        {item.sleeve === 'full' ? 'Full Sleeve' : 'Half Sleeve'}
                      </span>
                    )}

                    {isOutOfStock ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-600">
                        Out of stock
                      </span>
                    ) : realStock <= 3 && Number.isFinite(realStock) ? (
                      <span className="rounded-full bg-orange-100 px-2.5 py-1 font-medium text-orange-600">
                        Only {realStock} left!
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4 sm:mt-4">
                    <p className="text-sm font-bold text-[#00612E] sm:text-base">
                      ৳{item.price.toLocaleString('en-BD')}
                    </p>

                    <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <button
                        onClick={() =>
                          updateQty(
                            item.id,
                            item.size,
                            Math.max(1, item.quantity - 1),
                            item.sleeve
                          )
                        }
                        className="px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span className="w-10 text-center text-sm font-semibold text-gray-800">
                        {item.quantity}
                      </span>

                      {!isMaxed ? (
                        <button
                          onClick={() =>
                            updateQty(item.id, item.size, item.quantity + 1, item.sleeve)
                          }
                          className="px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-xs font-semibold text-red-500">
                          Max
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-fit rounded-[26px] border border-[#00612E]/10 bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.05)] lg:sticky lg:top-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#00612E]/55">
              Order Summary
            </p>
            <h2 className="mt-2 text-xl font-bold text-gray-900">Checkout Details</h2>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between gap-4">
              <span>Subtotal</span>
              <span className="text-right">৳{totalPrice.toLocaleString('en-BD')}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Items</span>
              <span className="text-right">{totalItems}</span>
            </div>
          </div>

          <div className="my-4 border-t border-gray-100 pt-4">
            <div className="flex justify-between gap-4 text-base font-bold text-gray-900">
              <span>Total</span>
              <span className="text-right">৳{totalPrice.toLocaleString('en-BD')}</span>
            </div>
          </div>

          {hasOutOfStockItem ? (
            <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-center text-sm font-medium text-red-600">
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

          <Link
            href="/"
            className="mt-3 block text-center text-xs text-gray-400 transition hover:text-[#00612E]"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
