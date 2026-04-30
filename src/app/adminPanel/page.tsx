'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'

interface Stats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  pendingOrders: number
  pendingRevenue: number
}

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  shipping_address: string
}

interface ReviewImage {
  id: string
  image_url: string
  caption: string | null
  is_active: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0, totalOrders: 0, totalUsers: 0,
    pendingOrders: 0, pendingRevenue: 0,
  })
  const [recentOrders,  setRecentOrders]  = useState<Order[]>([])
  const [reviewImages,  setReviewImages]  = useState<ReviewImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const [products, orders, users, pendingData, recent, reviews] = await Promise.all([
        supabase.from('products').select('id', { count:'exact', head:true }),
        supabase.from('orders').select('id', { count:'exact', head:true }),
        supabase.from('profiles').select('id', { count:'exact', head:true }),
        supabase.from('orders').select('total_amount').eq('status', 'pending'),
        supabase.from('orders').select('*').order('created_at', { ascending:false }).limit(5),
        supabase.from('review_images').select('id, image_url, caption, is_active')
          .order('created_at', { ascending:false }).limit(6),
      ])

      const pendingRevenue = (pendingData.data || []).reduce((s, o) => s + (o.total_amount || 0), 0)
      setStats({
        totalProducts: products.count || 0,
        totalOrders:   orders.count   || 0,
        totalUsers:    users.count    || 0,
        pendingOrders: pendingData.data?.length || 0,
        pendingRevenue,
      })
      setRecentOrders(recent.data || [])
      setReviewImages((reviews.data as ReviewImage[]) || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { label:'Total Products', value:stats.totalProducts, icon:'📦', accent:'#00612E', light:'rgba(0,97,46,0.08)' },
    { label:'Total Orders',   value:stats.totalOrders,   icon:'🛒', accent:'#0f6cbd', light:'rgba(15,108,189,0.08)' },
    { label:'Total Users',    value:stats.totalUsers,    icon:'👤', accent:'#6d28d9', light:'rgba(109,40,217,0.08)' },
    { label:'Pending Orders', value:stats.pendingOrders, icon:'⏳', accent:'#d97706', light:'rgba(217,119,6,0.08)',
      sub:`৳${stats.pendingRevenue.toLocaleString('en-BD')} pending` },
  ]

  const statusStyle: Record<string, { bg:string; color:string }> = {
    pending:   { bg:'#fef9c3', color:'#854d0e' },
    confirmed: { bg:'#dbeafe', color:'#1e40af' },
    shipped:   { bg:'#e0e7ff', color:'#3730a3' },
    delivered: { bg:'#dcfce7', color:'#166534' },
    cancelled: { bg:'#fee2e2', color:'#991b1b' },
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 rounded-full border-2 border-[#00612E]/20 border-t-[#00612E] animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's what's happening today.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                   style={{ background: card.light }}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            {card.sub && <p className="text-xs font-medium mt-1.5" style={{ color: card.accent }}>{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-3">
        <Link href="/adminPanel/products/new"
          className="inline-flex items-center gap-2 bg-[#00612E] text-white text-sm px-5 py-2.5 rounded-xl hover:bg-[#00502a] transition font-medium">
          <span className="text-base">+</span> Add Product
        </Link>
        <Link href="/adminPanel/orders"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium">
          📋 All Orders
        </Link>
        <Link href="/adminPanel/heroSlides"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium">
          🖼️ Hero Slides
        </Link>
        <Link href="/adminPanel/reviewImages"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium">
          ⭐ Review Images
        </Link>
      </div>

      {/* ── Two column: recent orders + review preview ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Recent Orders — wider */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link href="/adminPanel/orders" className="text-xs text-[#00612E] hover:opacity-70 transition font-medium tracking-wide">
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(order => {
                    const s = statusStyle[order.status] || { bg:'#f3f4f6', color:'#374151' }
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-400">#{order.id.slice(0,8)}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800">৳{order.total_amount.toLocaleString('en-BD')}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background:s.bg, color:s.color }}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-BD')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Review Images preview — narrower */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Review Images</h3>
            <Link href="/adminPanel/reviewImages" className="text-xs text-[#00612E] hover:opacity-70 transition font-medium tracking-wide">
              Manage →
            </Link>
          </div>

          {reviewImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <span className="text-3xl">📸</span>
              <p className="text-sm">No review images yet</p>
              <Link href="/adminPanel/reviewImages"
                className="text-xs bg-[#00612E] text-white px-4 py-1.5 rounded-lg hover:bg-[#00502a] transition">
                + Add Images
              </Link>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {reviewImages.map(img => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden" style={{ aspectRatio:'1/1' }}>
                    <Image src={img.image_url} alt={img.caption || 'review'} fill sizes="100px" className="object-cover"/>
                    {!img.is_active && (
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                        <span className="text-white text-[9px] font-semibold tracking-wider uppercase">Hidden</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/adminPanel/reviews"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-dashed border-[#00612E]/25 text-xs font-medium text-[#00612E] hover:bg-[#00612E]/5 transition">
                + Upload more
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}