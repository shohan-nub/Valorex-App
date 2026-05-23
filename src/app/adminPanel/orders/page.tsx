'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '../../../app/lib/supabase/client'

type SleeveType = 'regular' | 'full'

interface OrderItem {
  id: string
  product_name: string
  product_image: string
  size: string | null
  sleeve?: SleeveType | null
  quantity: number
  price: number
}

interface Order {
  id: string
  customer_name: string
  total_amount: number
  subtotal: number
  delivery_charge: number
  bkash_fee: number
  status: string
  payment_method: string
  payment_status: string
  bkash_trx_id: string | null
  shipping_address: string
  shipping_city: string
  phone: string
  created_at: string
  order_items: OrderItem[]
}

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const statusConfig: Record<string, { color: string; dot: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  shipped: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  delivered: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
}

const paymentStatusConfig: Record<string, { color: string; label: string }> = {
  unpaid: { color: 'bg-gray-100 text-gray-600', label: 'Unpaid' },
  pending_verification: { color: 'bg-orange-100 text-orange-700', label: '⏳ Verifying' },
  paid: { color: 'bg-emerald-100 text-emerald-700', label: '✓ Paid' },
}

function formatSleeve(sleeve?: SleeveType | null) {
  if (sleeve === 'full') return 'Full Sleeve'
  if (sleeve === 'regular') return 'Half Sleeve'
  return null
}

function itemKey(item: OrderItem, index: number) {
  return `${item.id}-${item.size ?? 'nosize'}-${item.sleeve ?? 'nosleeve'}-${index}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      setOrders([])
      setLoading(false)
      return
    }

    setOrders((data || []) as Order[])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)))
  }

  async function updatePaymentStatus(id: string, payment_status: string) {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ payment_status }).eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, payment_status } : o)))
  }

  async function deleteOrder(id: string) {
    const ok = window.confirm('Are you sure you want to delete this order? This cannot be undone.')
    if (!ok) return

    const supabase = createClient()
    const { error } = await supabase.from('orders').delete().eq('id', id)

    if (error) {
      alert('Delete failed')
      return
    }

    setOrders(prev => prev.filter(o => o.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const filtered =
    filterStatus === 'all'
      ? orders
      : orders.filter(o => o.status === filterStatus)

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
          <p className="mt-0.5 text-sm text-gray-400">{orders.length} total orders</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            filterStatus === 'all'
              ? 'border-gray-800 bg-gray-800 text-white'
              : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition ${
              filterStatus === s
                ? 'border-gray-800 bg-gray-800 text-white'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {s} ({orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-16 text-center text-gray-400 shadow-sm">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const isExpanded = expandedId === order.id
            const sc = statusConfig[order.status] || statusConfig.pending
            const pc = paymentStatusConfig[order.payment_status] || paymentStatusConfig.unpaid
            const isBkash = order.payment_method === 'bkash'

            return (
              <div
                key={order.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                  isBkash && order.bkash_trx_id ? 'border-pink-100' : 'border-gray-100'
                }`}
              >
                {isBkash && order.bkash_trx_id && (
                  <div className="flex flex-col gap-3 bg-gradient-to-r from-pink-600 to-pink-500 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-widest text-pink-200">
                        bKash TRX ID
                      </span>
                      <span className="font-mono text-lg font-bold tracking-widest text-white sm:text-xl">
                        {order.bkash_trx_id}
                      </span>
                    </div>
                    <div>
                      <select
                        value={order.payment_status}
                        onChange={e => updatePaymentStatus(order.id, e.target.value)}
                        className={`w-full cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold focus:outline-none sm:w-auto ${pc.color}`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="pending_verification">⏳ Verifying</option>
                        <option value="paid">✓ Paid</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex flex-shrink-0 -space-x-3">
                      {order.order_items?.slice(0, 3).map((item, index) => (
                        <div
                          key={itemKey(item, index)}
                          className="h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-gray-100 shadow-sm"
                        >
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              📦
                            </div>
                          )}
                        </div>
                      ))}
                      {(order.order_items?.length || 0) > 3 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-gray-100 text-xs font-semibold text-gray-500 shadow-sm">
                          +{order.order_items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-gray-800">
                          {order.customer_name || 'Unknown'}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-400">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            isBkash ? 'bg-pink-100 text-pink-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isBkash ? '📱 bKash' : '💵 COD'}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>📞 {order.phone || '—'}</span>
                        <span>
                          📍 {order.shipping_address}, {order.shipping_city}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {order.order_items?.map((item, index) => {
                          const sleeveLabel = formatSleeve(item.sleeve)

                          return (
                            <span
                              key={itemKey(item, index)}
                              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                            >
                              {item.product_name}
                              {item.size ? ` (${item.size})` : ''}
                              {sleeveLabel ? (
                                <span className="ml-2 text-sm font-semibold text-[#00612E]">
                                  • {sleeveLabel}
                                </span>
                              ) : null}
                              {' '}×{item.quantity}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-start gap-2 sm:items-end">
                      <span className="text-lg font-bold text-gray-800">
                        ৳{order.total_amount.toLocaleString('en-BD')}
                      </span>

                      <div
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${sc.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="cursor-pointer border-0 bg-transparent font-medium outline-none"
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s} className="bg-white text-gray-800 capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>

                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="flex w-full items-center justify-center gap-1 border-t border-gray-100 py-2 text-xs text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
                >
                  {isExpanded ? '▲ Hide details' : '▼ View item details'}
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-gray-100 bg-gray-50 px-4 py-5 sm:px-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Order Items
                    </p>

                    <div className="space-y-3">
                      {order.order_items?.map((item, index) => {
                        const sleeveLabel = formatSleeve(item.sleeve)

                        return (
                          <div
                            key={itemKey(item, index)}
                            className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center"
                          >
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                              {item.product_image ? (
                                <Image
                                  src={item.product_image}
                                  alt={item.product_name}
                                  width={56}
                                  height={56}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xl text-gray-300">
                                  📦
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-800">
                                {item.product_name}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                                <span>
                                  Size:{' '}
                                  <span className="font-medium text-gray-700">
                                    {item.size || '—'}
                                  </span>
                                </span>

                                {sleeveLabel ? (
                                  <span className="rounded-full bg-[#00612E]/8 px-2.5 py-1 text-sm font-semibold text-[#00612E]">
                                    Sleeve: {sleeveLabel}
                                  </span>
                                ) : null}

                                <span>
                                  Qty:{' '}
                                  <span className="font-medium text-gray-700">
                                    {item.quantity}
                                  </span>
                                </span>

                                <span>
                                  Unit:{' '}
                                  <span className="font-medium text-gray-700">
                                    ৳{item.price.toLocaleString('en-BD')}
                                  </span>
                                </span>
                              </div>
                            </div>

                            <p className="self-end text-sm font-bold text-gray-800 sm:self-auto">
                              ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="space-y-1.5 rounded-xl border border-gray-100 bg-white px-4 py-3">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Subtotal</span>
                        <span>৳{(order.subtotal || 0).toLocaleString('en-BD')}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Delivery</span>
                        <span>৳{order.delivery_charge || 0}</span>
                      </div>
                      {isBkash && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>bKash charge (1.8%)</span>
                          <span>৳{order.bkash_fee || 0}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-bold text-gray-800">
                        <span>Total</span>
                        <span>৳{order.total_amount.toLocaleString('en-BD')}</span>
                      </div>
                    </div>

                    {!isBkash && (
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-500">Payment Status:</p>
                        <select
                          value={order.payment_status}
                          onChange={e => updatePaymentStatus(order.id, e.target.value)}
                          className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold focus:outline-none ${pc.color}`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">✓ Paid</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}