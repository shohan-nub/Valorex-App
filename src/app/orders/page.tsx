'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  shipping_city: string
}

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabel: Record<string, string> = {
  pending:   '⏳ Pending',
  confirmed: '✅ Confirmed',
  shipped:   '🚚 Shipped',
  delivered: '📦 Delivered',
  cancelled: '❌ Cancelled',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      const supabase = createClient()

   
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

     
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)         
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      setOrders(data || [])
      setLoading(false)
    }

    fetchOrders()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-7 h-7 rounded-full border-2 border-[#00612E]/20 border-t-[#00612E] animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400 text-sm mb-4">NO ORDER</p>
          <Link href="/" className="text-[#00612E] text-sm hover:underline font-medium">
            Shop Now →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-1">#{order.id.slice(0, 10)}</p>
                  <p className="text-base font-bold text-gray-900">
                    TK{order.total_amount.toLocaleString('en-BD')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.shipping_city} · {new Date(order.created_at).toLocaleDateString('en-BD')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                  <span className="text-xs text-gray-400">Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}