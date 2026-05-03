'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard',     href: '/adminPanel',                icon: '📊' },
  { label: 'Products',      href: '/adminPanel/products',       icon: '📦' },
  { label: 'Orders',        href: '/adminPanel/orders',         icon: '🛒' },
  { label: 'Hero Slides',   href: '/adminPanel/heroSlides',     icon: '🖼️' },
  { label: 'Review Images', href: '/adminPanel/reviewImages',   icon: '⭐' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#FDFFE3]/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#FDFFE3]/55 uppercase mb-0.5"
               style={{ fontSize: 9, letterSpacing: '0.38em', fontFamily: 'Barlow Condensed,sans-serif', fontWeight: 600 }}>
              Admin Panel
            </p>
            <h1 className="text-[#FDFFE3] font-bold text-lg tracking-wide"
                style={{ fontFamily: "'Anton SC',sans-serif", letterSpacing: '0.05em' }}>
              VALOREX
            </h1>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-[#FDFFE3]/60 hover:bg-[#FDFFE3]/10 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
              style={isActive
                ? { background: 'rgba(253,255,227,0.18)', color: '#FDFFE3', backdropFilter: 'blur(8px)' }
                : { color: 'rgba(253,255,227,0.65)' }
              }
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(253,255,227,0.08)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FDFFE3]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[#FDFFE3]/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition hover:bg-[#FDFFE3]/10"
          style={{ color: 'rgba(253,255,227,0.55)' }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          View Website
        </Link>
        <p className="text-[10px] text-[#FDFFE3]/25 mt-2 px-4">Admin Panel v1.0</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#f4f6f3' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 sticky top-0 h-screen"
        style={{ background: 'linear-gradient(160deg,#00612E 0%,#004d24 100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* drawer */}
          <aside
            className="relative w-64 h-full flex flex-col"
            style={{ background: 'linear-gradient(160deg,#00612E 0%,#004d24 100%)', animation: 'slideInLeft .25s ease' }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 border-b border-[#FDFFE3]/10"
          style={{ background: 'linear-gradient(135deg,#00612E,#00843d)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#FDFFE3]"
            style={{ background: 'rgba(253,255,227,0.12)' }}
            aria-label="Open menu"
          >
            <div className="flex flex-col gap-[5px] w-5">
              <span className="block h-[1.5px] rounded bg-[#FDFFE3]" />
              <span className="block h-[1.5px] rounded bg-[#FDFFE3] w-3" />
              <span className="block h-[1.5px] rounded bg-[#FDFFE3]" />
            </div>
          </button>

          <h1 className="text-[#FDFFE3] font-bold tracking-widest text-base"
              style={{ fontFamily: "'Anton SC',sans-serif" }}>
            VALOREX
          </h1>

          <Link href="/" target="_blank"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#FDFFE3]"
            style={{ background: 'rgba(253,255,227,0.12)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}