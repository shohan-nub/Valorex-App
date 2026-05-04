'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '../lib/supabase/client'
interface OrderItem {
  id: string
  product_name: string
  product_image: string
  size: string
  quantity: number
}

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  order_items: OrderItem[]
}

const statusText: Record<string, string> = {
  pending: 'Waiting for confirmation',
  confirmed: 'Confirmed • Delivery in 1–2 days',
  shipped: 'On the way 🚚',
  delivered: 'Delivered 🎉',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const supabase = createClient()

    const { data } = await supabase
      .from('orders')
      .select('id,total_amount,status,created_at,order_items(*)')
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

      <div className="space-y-6">
        {orders.map(order => (
          <div
            key={order.id}
            className="rounded-[26px] border border-[#00612E]/15 bg-white p-5 shadow-sm"
          >
            {/* PRODUCT LIST (MAIN FOCUS) */}
            <div className="space-y-4">
              {order.order_items?.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-[#f8fbf8] border border-[#00612E]/10 rounded-2xl p-3"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border">
                    {item.product_image && (
                      <Image
                        src={item.product_image}
                        alt=""
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      {item.product_name}
                    </p>

                    <div className="mt-1 text-xs text-slate-500 flex gap-3">
                      <span>Size: <b>{item.size || '-'}</b></span>
                      <span>Qty: <b>{item.quantity}</b></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* STATUS + TOTAL */}
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Order</p>
                <p className="text-sm font-semibold text-slate-700">
                  #{order.id.slice(0, 8)}
                </p>

                <p className="text-xs text-[#00612E] mt-1 font-medium">
                  {statusText[order.status]}
                </p>
              </div>

              <p className="text-xl font-black text-[#00612E]">
                ৳{order.total_amount}
              </p>
            </div>

            {/* DATE */}
            <p className="mt-2 text-xs text-slate-400">
              {new Date(order.created_at).toLocaleDateString('en-BD')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}