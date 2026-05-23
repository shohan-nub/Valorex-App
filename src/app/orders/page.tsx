'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'

type SleeveType = 'regular' | 'full'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  size: string | null
  sleeve?: SleeveType | null
  quantity: number
  price: number
}

interface Order {
  id: string
  user_id: string | null
  customer_name: string
  phone: string
  total_amount: number
  subtotal?: number | null
  delivery_charge?: number | null
  bkash_fee?: number | null
  status: string
  payment_method?: string | null
  payment_status?: string | null
  bkash_trx_id?: string | null
  shipping_address?: string | null
  shipping_city?: string | null
  created_at: string
  order_items: OrderItem[]
}

const statusText: Record<string, string> = {
  pending: 'Waiting for confirmation',
  confirmed: 'Confirmed • Delivery in 1–2 days',
  shipped: 'On the way 🚚',
  delivered: 'Delivered 🎉',
  cancelled: 'Cancelled',
}

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

const STORAGE_KEY = 'browser_order_ids'

function loadOrderIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return [...new Set(parsed.map((v) => String(v)).filter(Boolean))]
  } catch {
    return []
  }
}

function saveOrderIds(orderId: string) {
  if (typeof window === 'undefined') return

  try {
    const current = loadOrderIds()
    const merged = [orderId, ...current].filter(Boolean)
    const unique = [...new Set(merged)].slice(0, 30)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique))
  } catch {
    // ignore
  }
}

function formatSleeve(sleeve?: SleeveType | null) {
  if (sleeve === 'full') return 'Full Sleeve'
  if (sleeve === 'regular') return 'Half Sleeve'
  return null
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="space-y-3">
        {order.order_items?.map((item) => {
          const sleeveLabel = formatSleeve(item.sleeve)

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#00612E]/10 bg-[#f8fbf8] p-3 sm:p-4"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      📦
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {item.product_name}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                    {item.size && (
                      <span>
                        Size: <b className="text-slate-700">{item.size}</b>
                      </span>
                    )}

                    {sleeveLabel && (
                      <span className="rounded-full bg-[#00612E]/8 px-2.5 py-1 text-sm font-semibold text-[#00612E]">
                        {sleeveLabel}
                      </span>
                    )}

                    <span>
                      Qty: <b className="text-slate-700">{item.quantity}</b>
                    </span>

                    <span>৳{(item.price * item.quantity).toLocaleString('en-BD')}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Order</p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>

          <span
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
              statusStyle[order.status] || 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {statusText[order.status] || order.status}
          </span>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-black text-[#00612E]">
            ৳{order.total_amount.toLocaleString('en-BD')}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {new Date(order.created_at).toLocaleDateString('en-BD')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void init()
  }, [])

  async function init() {
    setLoading(true)
    setMessage('')

    const orderIds = loadOrderIds()

    if (orderIds.length === 0) {
      setOrders([])
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .in('id', orderIds.slice(0, 30))

    if (error) {
      setOrders([])
      setMessage(error.message)
      setLoading(false)
      return
    }

    const orderIndex = new Map(orderIds.map((id, index) => [id, index]))

    const sorted = (data || [])
      .slice()
      .sort((a: Order, b: Order) => {
        const ai = orderIndex.get(a.id) ?? 9999
        const bi = orderIndex.get(b.id) ?? 9999
        return ai - bi
      }) as Order[]

    setOrders(sorted)
    setLoading(false)
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00612E]/20 border-t-[#00612E]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            My Orders
          </h1>
          
        </div>

        <button
          onClick={() => void init()}
          className="rounded-full border border-[#00612E]/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#00612E]/5"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </div>
      )}

      {!loading && orders.length === 0 ? (
        <div className="mx-auto max-w-3xl rounded-[24px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <p className="mb-4 text-4xl">📦</p>
          <p className="mb-4 text-slate-500">
         No order Find
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#00612E] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Shop Now →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}