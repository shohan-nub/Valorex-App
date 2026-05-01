'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '../../../app/lib/supabase/client'

interface OrderItem {
  id: string
  product_name: string
  product_image: string
  size: string
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
  pending:   { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  shipped:   { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  delivered: { color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-400' },
}

const paymentStatusConfig: Record<string, { color: string; label: string }> = {
  unpaid:              { color: 'bg-gray-100 text-gray-600',       label: 'Unpaid' },
  pending_verification:{ color: 'bg-orange-100 text-orange-700',   label: '⏳ Verifying' },
  paid:                { color: 'bg-emerald-100 text-emerald-700', label: '✓ Paid' },
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
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  async function updatePaymentStatus(id: string, payment_status: string) {
    const supabase = createClient()
    await supabase.from('orders').update({ payment_status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status } : o))
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

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
            filterStatus === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition border ${
              filterStatus === s ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s} ({orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center text-gray-400 shadow-sm">No orders found.</div>
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
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                  isBkash && order.bkash_trx_id ? 'border-pink-100' : 'border-gray-100'
                }`}
              >
                {/* bKash TRX ID — always visible at top if bKash order */}
                {isBkash && order.bkash_trx_id && (
                  <div className="bg-gradient-to-r from-pink-600 to-pink-500 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-pink-200 text-xs font-semibold uppercase tracking-widest">bKash TRX ID</span>
                      <span className="text-white text-xl font-bold font-mono tracking-widest">
                        {order.bkash_trx_id}
                      </span>
                    </div>
                    <div>
                      <select
                        value={order.payment_status}
                        onChange={e => updatePaymentStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none ${pc.color}`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="pending_verification">⏳ Verifying</option>
                        <option value="paid">✓ Paid</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Card Header */}
                <div className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    {/* Product thumbnails */}
                    <div className="flex -space-x-3 flex-shrink-0 mt-1">
                      {order.order_items?.slice(0, 3).map(item => (
                        <div key={item.id} className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-gray-100 shadow-sm">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                          )}
                        </div>
                      ))}
                      {(order.order_items?.length || 0) > 3 && (
                        <div className="w-12 h-12 rounded-xl border-2 border-white bg-gray-100 shadow-sm flex items-center justify-center text-xs font-semibold text-gray-500">
                          +{order.order_items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-gray-800">{order.customer_name || 'Unknown'}</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isBkash ? 'bg-pink-100 text-pink-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isBkash ? '📱 bKash' : '💵 COD'}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>📞 {order.phone || '—'}</span>
                        <span>📍 {order.shipping_address}, {order.shipping_city}</span>
                      </div>

                      {/* Items summary badges */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {order.order_items?.map(item => (
                          <span key={item.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {item.product_name}{item.size ? ` (${item.size})` : ''} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: amount + status + date + delete */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-lg font-bold text-gray-800">
                        ৳{order.total_amount.toLocaleString('en-BD')}
                      </span>

                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="bg-transparent border-0 outline-none cursor-pointer capitalize font-medium"
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
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition border-t border-gray-100"
                >
                  {isExpanded ? '▲ Hide details' : '▼ View item details'}
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 space-y-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Order Items</p>

                    <div className="space-y-3">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-white rounded-xl px-4 py-3 border border-gray-100">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            {item.product_image ? (
                              <Image
                                src={item.product_image}
                                alt={item.product_name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📦</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{item.product_name}</p>
                            <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                              <span>Size: <span className="font-medium text-gray-700">{item.size || '—'}</span></span>
                              <span>Qty: <span className="font-medium text-gray-700">{item.quantity}</span></span>
                              <span>Unit: <span className="font-medium text-gray-700">৳{item.price.toLocaleString('en-BD')}</span></span>
                            </div>
                          </div>

                          <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                            ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Bill breakdown */}
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 space-y-1.5">
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
                      <div className="flex justify-between text-sm font-bold text-gray-800 border-t border-gray-100 pt-2">
                        <span>Total</span>
                        <span>৳{order.total_amount.toLocaleString('en-BD')}</span>
                      </div>
                    </div>

                    {/* COD payment status */}
                    {!isBkash && (
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-500">Payment Status:</p>
                        <select
                          value={order.payment_status}
                          onChange={e => updatePaymentStatus(order.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none ${pc.color}`}
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