'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { useCart } from '../Cartcontext'
import { createClient } from '../lib/supabase/client'
import SearchModal from '../Searchmodal'

export default function Navbar() {
  const { totalItems } = useCart()
  const router   = useRouter()
  const pathname = usePathname()
  const [supabase] = useState(() => createClient())

  const [user,       setUser]       = useState<User | null>(null)
  const [isAdmin,    setIsAdmin]    = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted,    setMounted]    = useState(false)
  const [showNav,    setShowNav]    = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  /* ── homepage এ navbar দেখাবে না ── */
  const isHomePage = pathname === '/'

  useEffect(() => { setMounted(true) }, [])

  /* ── scroll detection: hero শেষ হলে navbar দেখাবে ── */
  useEffect(() => {
    if (isHomePage) {
      const onScroll = () => {
        const hero = document.getElementById('hero-section')
        if (!hero) { setShowNav(true); return }
        setShowNav(hero.getBoundingClientRect().bottom <= 80)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    } else {
      /* অন্য সব page এ সবসময় দেখাবে */
      setShowNav(true)
    }
  }, [isHomePage])

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      const u = data.user ?? null
      setUser(u); setIsAdmin(u?.app_metadata?.role === 'admin')
    }
    loadUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      const u = s?.user ?? null
      setUser(u); setIsAdmin(u?.app_metadata?.role === 'admin')
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [pathname])

  /* ── Esc closes search ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false); setMobileOpen(false)
    router.push('/'); router.refresh()
  }

  const avatarLetter = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()

  const navLinks = [
    { href: '/category/top_pick', label: 'Top Pick'  },
    { href: '/category/club',     label: 'Club'       },
    { href: '/category/retro',    label: 'Retro'      },
    { href: '/category/national', label: 'National'   },
  ]

  /* homepage এ navbar render ই করব না */
  if (isHomePage && !showNav) return null

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showNav ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'
        }`}
        style={{
          background: '#5FAF7B', /* ← navbar BG — hero এর color এর সাথে match করো */
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(253,255,227,0.10)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">

          {/* LOGO */}
          <Link href="/" className="shrink-0 select-none text-lg font-semibold tracking-[0.25em] text-[#FDFFE3] hover:scale-[1.03] transition-transform"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            VALOREX
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href}
                  className="group relative text-[11px] font-medium uppercase tracking-[0.28em] text-[#FDFFE3]/75 hover:text-[#FDFFE3] transition-colors duration-200">
                  {link.label}
                  <span className={`absolute -bottom-1.5 left-0 h-px bg-[#FDFFE3] transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              )
            })}
          </div>

          {/* RIGHT ICONS */}
          <div className={`flex items-center gap-2 sm:gap-2.5 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

            {/* Search */}
            <button onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FDFFE3]/18 text-[#FDFFE3] hover:bg-[#FDFFE3]/10 hover:border-[#FDFFE3]/50 transition-all"
              aria-label="Search">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Orders */}
            <Link href="/orders"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FDFFE3]/18 text-[#FDFFE3] hover:bg-[#FDFFE3]/10 hover:border-[#FDFFE3]/50 transition-all"
              aria-label="Orders">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 11h6M9 15h4"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
              </svg>
            </Link>

            {/* Cart */}
            <Link href="/cart"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FDFFE3]/18 text-[#FDFFE3] hover:bg-[#FDFFE3]/10 hover:border-[#FDFFE3]/50 transition-all relative"
              aria-label="Cart">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {mounted && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FDFFE3] px-1 text-[10px] font-bold text-[#00612E]">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Avatar / Login */}
            {mounted && (user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setMenuOpen(v => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDFFE3] text-sm font-bold text-[#00612E] shadow transition hover:scale-105 shrink-0">
                  {avatarLetter}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-[#FDFFE3]/12 shadow-2xl"
                       style={{ background: 'rgba(0,80,38,0.97)', backdropFilter: 'blur(16px)', animation: 'navDrop .2s ease both' }}>
                    <div className="px-4 py-3 border-b border-[#FDFFE3]/10">
                      <p className="text-sm font-semibold text-[#FDFFE3] truncate">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs text-[#FDFFE3]/50 truncate mt-0.5">{user.email}</p>
                    </div>
                    {isAdmin && <Link href="/adminPanel" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3] hover:bg-[#FDFFE3]/8 transition">⚙️ Admin Panel</Link>}
                    <Link href="/orders"  onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3]/82 hover:bg-[#FDFFE3]/8 transition">📦 My Orders</Link>
                   
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#ffb3b3] hover:bg-[#FDFFE3]/8 transition">🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#FDFFE3]/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FDFFE3]/88 hover:border-[#FDFFE3]/60 hover:bg-[#FDFFE3]/8 transition">
                Login
              </Link>
            ))}

            {/* Hamburger */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FDFFE3]/18 text-[#FDFFE3] hover:bg-[#FDFFE3]/10 transition md:hidden"
              aria-label="Menu">
              <div className="flex w-5 flex-col gap-[5px]">
                <span className={`block h-0.5 rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`}/>
                <span className={`block h-0.5 rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}/>
                <span className={`block h-0.5 rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`}/>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden border-t border-[#FDFFE3]/10 transition-all duration-300 ${mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'}`}
             style={{ background: 'rgba(0,80,38,0.97)', backdropFilter: 'blur(20px)' }}>
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${pathname === link.href ? 'bg-[#FDFFE3]/10 text-[#FDFFE3]' : 'text-[#FDFFE3]/75 hover:bg-[#FDFFE3]/6 hover:text-[#FDFFE3]'}`}>
                {link.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="rounded-2xl border border-[#FDFFE3]/10 px-4 py-3 text-center text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/6 transition">
                🔍 Search
              </button>
              <Link href="/cart"
                className="rounded-2xl border border-[#FDFFE3]/10 px-4 py-3 text-center text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/6 transition">
                🛒 Cart {mounted && totalItems > 0 ? `(${totalItems})` : ''}
              </Link>
              {!user ? (
                <Link href="/login"
                  className="col-span-2 rounded-2xl bg-[#FDFFE3] px-4 py-3 text-center text-sm font-semibold text-[#00612E] hover:opacity-90 transition">
                  Login
                </Link>
              ) : (
                <>
                  {isAdmin && (
                    <Link href="/adminPanel"
                      className="col-span-2 rounded-2xl border border-[#FDFFE3]/10 px-4 py-3 text-center text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/6 transition">
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="col-span-2 rounded-2xl border border-[#FDFFE3]/10 px-4 py-3 text-sm text-[#ffb3b3] hover:bg-[#FDFFE3]/6 transition">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content এর উপরে না আসার জন্য — homepage ছাড়া সব page এ spacer */}
      {!isHomePage && <div className="h-16" />}

      <style>{`
        @keyframes navDrop {
          from { opacity:0; transform:translateY(-8px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}