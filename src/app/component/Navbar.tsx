'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { useCart } from '../Cartcontext'
import { createClient } from '../lib/supabase/client'

export default function Navbar() {
  const { totalItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [supabase] = useState(() => createClient())

  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showNav, setShowNav] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('hero-section')

      if (!hero) {
        setShowNav(true)
        return
      }

      const rect = hero.getBoundingClientRect()
      setShowNav(rect.bottom <= 80)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      const u = data.user ?? null
      setUser(u)
      setIsAdmin(u?.app_metadata?.role === 'admin')
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      setIsAdmin(u?.app_metadata?.role === 'admin')
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    setMobileOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/category/top_pick', label: 'Top Pick' },
    { href: '/category/club', label: 'Club' },
    { href: '/category/retro', label: 'Retro' },
    { href: '/category/national', label: 'National' },
  ]

  const avatarLetter = (
    user?.user_metadata?.full_name?.[0] ||
    user?.email?.[0] ||
    'U'
  ).toUpperCase()

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
          showNav
            ? 'translate-y-0 opacity-100'
            : '-translate-y-10 opacity-0 pointer-events-none'
        }`}
        style={{
          background: showNav
            ? 'linear-gradient(180deg, rgba(0,97,46,0.94) 0%, rgba(0,97,46,0.84) 100%)'
            : 'linear-gradient(180deg, rgba(0,97,46,0.10) 0%, rgba(0,97,46,0.02) 100%)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(253,255,227,0.10)',
          boxShadow: showNav ? '0 18px 50px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(245,247,0,0.12) 0%, transparent 55%)',
            }}
          />

          <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <Link
              href="/"
              className="flex-shrink-0 select-none text-lg font-semibold tracking-[0.25em] text-[#FDFFE3] transition-transform duration-300 hover:scale-[1.03]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              VALOREX
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative text-[11px] font-medium uppercase tracking-[0.28em] text-[#FDFFE3]/72 transition-all duration-300 hover:text-[#FDFFE3]"
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-2 left-0 h-px bg-[#FDFFE3] transition-all duration-300 ${
                        active ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                )
              })}
            </div>

            <div
              className={`flex items-center gap-2 sm:gap-3 transition-all duration-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-6px]'
              }`}
            >
              <Link
                href="/orders"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[#FDFFE3]/15 bg-white/0 text-[#FDFFE3] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FDFFE3]/45 hover:bg-[#FDFFE3]/8"
                aria-label="Orders"
                title="Orders"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 11h6M9 15h4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </Link>

              <Link
                href="/cart"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[#FDFFE3]/15 bg-white/0 text-[#FDFFE3] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FDFFE3]/45 hover:bg-[#FDFFE3]/8"
                aria-label="Cart"
                title="Cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>

                {mounted && totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FDFFE3] px-1 text-[10px] font-bold text-[#00612E] shadow-lg">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#FDFFE3]/15 bg-[#FDFFE3] text-sm font-bold text-[#00612E] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                    aria-label="Account menu"
                    title="Account"
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      {avatarLetter}
                    </span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-[28px] border border-[#FDFFE3]/10 bg-[#00612E]/96 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl animate-[navDrop_220ms_ease-out]">
                      <div className="border-b border-[#FDFFE3]/10 px-5 py-4">
                        <p className="truncate text-sm font-semibold text-[#FDFFE3]">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-[#FDFFE3]/60">
                          {user.email}
                        </p>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/adminPanel"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#FDFFE3]/90 transition-all duration-300 hover:bg-[#FDFFE3]/8 hover:text-[#FDFFE3]"
                        >
                          ⚙️ Admin Panel
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#FDFFE3]/90 transition-all duration-300 hover:bg-[#FDFFE3]/8 hover:text-[#FDFFE3]"
                      >
                        📦 Orders
                      </Link>

                      <Link
                        href="/products"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#FDFFE3]/90 transition-all duration-300 hover:bg-[#FDFFE3]/8 hover:text-[#FDFFE3]"
                      >
                        🛍️ Products
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-[#ffb3b3] transition-all duration-300 hover:bg-[#FDFFE3]/8 hover:text-[#ffd6d6]"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-[#FDFFE3]/20 px-4 py-2 text-[11px] sm:text-sm uppercase tracking-[3px] text-[#FDFFE3]/90 hover:border-[#FDFFE3]/60 transition-colors duration-300"
                >
                  Login
                </Link>
              )}

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FDFFE3]/15 text-[#FDFFE3] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FDFFE3]/45 hover:bg-[#FDFFE3]/8 md:hidden"
                aria-label="Menu"
                aria-expanded={mobileOpen}
              >
                <div className="flex w-5 flex-col gap-1.5">
                  <span
                    className={`block h-0.5 rounded bg-[#FDFFE3] transition-all duration-300 ${
                      mobileOpen ? 'translate-y-2 rotate-45' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 rounded bg-[#FDFFE3] transition-all duration-300 ${
                      mobileOpen ? 'opacity-0' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 rounded bg-[#FDFFE3] transition-all duration-300 ${
                      mobileOpen ? '-translate-y-2 -rotate-45' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden border-t border-[#FDFFE3]/10 bg-[#00612E]/96 backdrop-blur-2xl transition-all duration-300 ${
            mobileOpen ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="grid gap-2">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-[#FDFFE3]/10 text-[#FDFFE3]'
                        : 'text-[#FDFFE3]/76 hover:bg-[#FDFFE3]/5 hover:text-[#FDFFE3]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/orders"
                className="rounded-2xl border border-[#FDFFE3]/10 px-4 py-3 text-center text-sm text-[#FDFFE3]/90 transition-all duration-300 hover:bg-[#FDFFE3]/5"
              >
                Orders
              </Link>

              <Link
                href="/cart"
                className="rounded-2xl border border-[#FDFFE3]/10 px-4 py-3 text-center text-sm text-[#FDFFE3]/90 transition-all duration-300 hover:bg-[#FDFFE3]/5"
              >
                Cart {mounted && totalItems > 0 ? `(${totalItems})` : ''}
              </Link>

              {!user ? (
                <Link
                  href="/login"
                  className="col-span-2 rounded-2xl bg-[#FDFFE3] px-4 py-3 text-center text-sm font-semibold text-[#00612E] transition-all duration-300 hover:scale-[1.01]"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="col-span-2 rounded-2xl border border-[#FDFFE3]/10 px-4 py-3 text-center text-sm text-[#ffb3b3] transition-all duration-300 hover:bg-[#FDFFE3]/5"
                >
                  Logout
                </button>
              )}
            </div>

            {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#FDFFE3] text-[#00612E]"
              >
                {avatarLetter}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 rounded-2xl shadow-2xl py-1.5 w-52 border bg-[#00612E] border-[#FDFFE3]/15">
                  <div className="px-4 py-2.5 border-b border-[#FDFFE3]/10">
                    <p className="text-xs text-[#FDFFE3]">
                      {user.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-[#FDFFE3]/60">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-[#FDFFE3]/80"
                    onClick={() => setMenuOpen(false)}
                  >
                    📦 My Orders
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-[#ffb3b3]"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-[#FDFFE3]/20 px-4 py-2 text-[11px] sm:text-sm uppercase tracking-[3px] text-[#FDFFE3]/90 hover:border-[#FDFFE3]/60"
            >
              Login
            </Link>
          )}
          </div>
        </div>
      </nav>

      <style jsx global>{`
        @keyframes navDrop {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}