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
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [reviewImages, setReviewImages] = useState<ReviewImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const [products, orders, users, pendingData, recent, reviews] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('status', 'pending'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('review_images').select('id, image_url, caption, is_active')
          .order('created_at', { ascending: false }).limit(6),
      ])
      const pendingRevenue = (pendingData.data || []).reduce((s, o) => s + (o.total_amount || 0), 0)
      setStats({
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        totalUsers: users.count || 0,
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
    { label: 'Products',     value: stats.totalProducts, icon: '📦', accent: '#00612E', light: 'rgba(0,97,46,0.10)' },
    { label: 'Total Orders', value: stats.totalOrders,   icon: '🛒', accent: '#0f6cbd', light: 'rgba(15,108,189,0.10)' },
    { label: 'Users',        value: stats.totalUsers,    icon: '👤', accent: '#6d28d9', light: 'rgba(109,40,217,0.10)' },
    { label: 'Pending',      value: stats.pendingOrders, icon: '⏳', accent: '#d97706', light: 'rgba(217,119,6,0.10)',
      sub: `৳${stats.pendingRevenue.toLocaleString('en-BD')} pending` },
  ]

  const statusStyle: Record<string, { bg: string; color: string }> = {
    pending:   { bg: '#fef9c3', color: '#854d0e' },
    confirmed: { bg: '#dbeafe', color: '#1e40af' },
    shipped:   { bg: '#e0e7ff', color: '#3730a3' },
    delivered: { bg: '#dcfce7', color: '#166534' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' },
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 rounded-full border-2 border-[#00612E]/20 border-t-[#00612E] animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#00612E 0%,#00843d 60%,#004d24 100%)', minHeight: 140 }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 right-0 w-64 h-40 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(245,247,0,0.5) 0%,transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-[#FDFFE3]/55 uppercase mb-1" style={{ fontSize: 10, letterSpacing: '0.42em', fontFamily: 'Barlow Condensed,sans-serif', fontWeight: 600 }}>
              Admin Panel
            </p>
            <h1 className="text-[#FDFFE3]" style={{ fontFamily: "'Anton SC',sans-serif", fontSize: 'clamp(28px,5vw,46px)', lineHeight: 1 }}>
              DASHBOARD
            </h1>
            <p className="text-[#FDFFE3]/55 text-sm mt-1.5">Welcome back — here's what's happening today.</p>
          </div>
          <Link href="/" target="_blank"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-[#FDFFE3] transition hover:-translate-y-0.5"
            style={{ background: 'rgba(253,255,227,0.14)', border: '1.5px solid rgba(253,255,227,0.22)', backdropFilter: 'blur(8px)' }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            View Website
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: card.light }}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            {card.sub && <p className="text-xs font-semibold mt-1.5" style={{ color: card.accent }}>{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/adminPanel/products/new', label: '+ Add Product', primary: true },
          { href: '/adminPanel/orders',       label: '📋 All Orders',    primary: false },
          { href: '/adminPanel/heroslides',   label: '🖼️ Hero Slides',  primary: false },
          { href: '/adminPanel/reviewImages', label: '⭐ Review Images', primary: false },
        ].map(btn => (
          <Link key={btn.href} href={btn.href}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md"
            style={btn.primary
              ? { background: '#00612E', color: 'white' }
              : { background: 'white', border: '1px solid rgba(0,97,46,0.14)', color: '#374151' }}>
            {btn.label}
          </Link>
        ))}
      </div>

      {/* ── ORDERS + REVIEWS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Recent Orders */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link href="/adminPanel/orders" className="text-xs font-semibold text-[#00612E] hover:opacity-70 transition">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,97,46,0.06)' }}>
                    {['ID', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const s = statusStyle[order.status] || { bg: '#f3f4f6', color: '#374151' }
                    return (
                      <tr key={order.id} className="hover:bg-[#00612E]/[0.02] transition-colors" style={{ borderBottom: '1px solid rgba(0,97,46,0.04)' }}>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800">৳{order.total_amount.toLocaleString('en-BD')}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: s.bg, color: s.color }}>
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

        {/* Review Images */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Review Images</h3>
            <Link href="/adminPanel/reviewImages" className="text-xs font-semibold text-[#00612E] hover:opacity-70 transition">Manage →</Link>
          </div>
          {reviewImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
              <span className="text-3xl">📸</span>
              <p className="text-sm">No review images yet</p>
              <Link href="/adminPanel/reviewImages" className="text-xs bg-[#00612E] text-white px-4 py-1.5 rounded-lg hover:bg-[#00502a] transition">
                + Add Images
              </Link>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {reviewImages.map(img => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <Image src={img.image_url} alt={img.caption || 'review'} fill sizes="100px" className="object-cover" />
                    {!img.is_active && (
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                        <span className="text-white text-[9px] font-semibold tracking-wider uppercase">Hidden</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/adminPanel/reviewImages"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold text-[#00612E] hover:bg-[#00612E]/5 transition"
                style={{ border: '1.5px dashed rgba(0,97,46,0.25)' }}>
                + Upload more
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}