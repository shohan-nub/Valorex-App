'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { useCart } from '../Cartcontext'
import { createClient } from '../lib/supabase/client'
import SearchModal from '../Searchmodal'

export default function HeroSection() {
  const router = useRouter()
  const supabase = createClient()
  const { totalItems } = useCart()

  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const targetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
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
    } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      setUser(u)
      setIsAdmin(u?.app_metadata?.role === 'admin')
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!heroRef.current) return

      const rect = heroRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      targetRef.current = {
        x: Math.max(-0.5, Math.min(0.5, x)),
        y: Math.max(-0.5, Math.min(0.5, y)),
      }

      if (rafRef.current) return

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        setMousePos(targetRef.current)
      })
    }

    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handleMove)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const avatarLetter = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()

  const NAV_LINKS = [
    { label: 'Reviews', href: '/reviews' },
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Barlow+Condensed:wght@300;400;600&family=Bentham&display=swap');

        .font-anton { font-family: 'Anton SC', sans-serif; }
        .font-barlow { font-family: 'Barlow Condensed', sans-serif; }
        .font-bentham { font-family: 'Bentham', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-10px); }
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        @keyframes mobileSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeUp { animation: fadeUp .8s cubic-bezier(.22,1,.36,1) both; }
        .animate-fadeIn { animation: fadeIn .7s ease both; }
        .animate-float { animation: float 6.5s ease-in-out infinite; }
        .animate-marquee { animation: marquee 20s linear infinite; }

        .hero-nav-link {
          position: relative;
          transition: color .2s ease;
        }
        .hero-nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0;
          height: 1px;
          background: #FDFFE3;
          transition: width .25s ease;
        }
        .hero-nav-link:hover::after { width: 100%; }

        .icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(253,255,227,0.18);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: transform .2s ease, background .2s ease, border-color .2s ease;
          will-change: transform;
        }
        .icon-circle:hover {
          border-color: rgba(253,255,227,0.55);
          background: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }

        .btn-shop {
          position: relative;
          overflow: hidden;
          transition: transform .2s ease, box-shadow .2s ease;
          will-change: transform;
        }
        .btn-shop:hover {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 12px 30px rgba(0,0,0,.18);
        }

        .grain-overlay {
          position:absolute;
          inset:-50%;
          width:200%;
          height:200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity:0.03;
          pointer-events:none;
          transform: translate3d(0,0,0);
        }

        .premium-text {
          text-shadow: 0 2px 8px rgba(0,0,0,.28), 0 8px 24px rgba(0,0,0,.18);
        }

        .premium-soft {
          text-shadow: 0 1px 4px rgba(0,0,0,.2);
        }
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <section
        id="hero-section"
        ref={heroRef}
        className="relative w-full min-h-[100svh] overflow-hidden bg-[#00612E] text-[#FDFFE3]"
      >
        {/* background */}
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt=""
            fill
            sizes="100vw"
            priority
            aria-hidden
            className="object-cover opacity-[0.11]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(245,247,0,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
        </div>

        {/* mouse follow glow - lightweight */}
        <div
          className="pointer-events-none absolute z-[2] hidden lg:block"
          style={{
            width: '500px',
            height: '500px',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, rgba(245,247,0,0.10) 0%, transparent 68%)',
            transform: `translate3d(calc(-50% + ${mousePos.x * 28}px), calc(-50% + ${mousePos.y * 28}px), 0)`,
            left: '50%',
            top: '52%',
            willChange: 'transform',
          }}
        />

        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          <div className="grain-overlay" />
        </div>

        {/* nav */}
        <nav className="absolute top-0 left-0 right-0 z-30">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            <div className={`animate-fadeIn ${mounted ? '' : 'opacity-0'}`}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={160}
                height={60}
                className="h-10 w-auto object-contain sm:h-12 brightness-0 invert sepia saturate-[3] hue-rotate-[55deg]"
                priority
              />
            </div>

            <ul className={`hidden md:flex items-center gap-8 text-[11px] font-medium tracking-[3px] uppercase text-[#FDFFE3]/72 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="hero-nav-link hover:text-[#FDFFE3] transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={`flex items-center gap-2 sm:gap-3 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
              <button
                onClick={() => setSearchOpen(true)}
                className="icon-circle"
                aria-label="Search"
              >
                <svg width="17" height="17" fill="none" stroke="#FDFFE3" strokeWidth="1.7" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </button>

              <Link href="/cart" className="icon-circle relative" aria-label="Cart">
                <svg width="17" height="17" fill="none" stroke="#FDFFE3" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#FDFFE3] text-[#00612E] text-[10px] flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDFFE3] text-sm font-bold text-[#00612E] transition hover:scale-105"
                  >
                    {avatarLetter}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#005A2A] shadow-2xl backdrop-blur-xl">
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-xs font-semibold text-[#FDFFE3]">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#FDFFE3]/60">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/adminPanel"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#FDFFE3]/90 transition hover:bg-white/5"
                        >
                          ⚙️ Admin Panel
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#FDFFE3]/90 transition hover:bg-white/5"
                      >
                        📦 My Orders
                      </Link>

                      <Link
                        href="/reviews"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#FDFFE3]/90 transition hover:bg-white/5"
                      >
                        ⭐ Reviews
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2.5 text-left text-sm text-[#ffb3b3] transition hover:bg-white/5"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden h-10 items-center rounded-full border border-white/15 bg-white/10 px-4 text-[11px] font-semibold uppercase tracking-[3px] text-[#FDFFE3]/90 transition hover:bg-white/15 sm:inline-flex"
                >
                  Login
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(v => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/15 md:hidden"
                aria-label="Menu"
              >
                <div className="flex w-5 flex-col gap-[5px]">
                  <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                  <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* mobile menu */}
        {mobileOpen && (
          <div
            className="absolute left-4 right-4 top-[72px] z-40 rounded-3xl border border-white/10 bg-[#00612E]/98 p-4 shadow-2xl md:hidden"
            style={{ animation: 'mobileSlide .22s ease both' }}
          >
            <ul className="space-y-1">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm tracking-[2px] uppercase text-[#FDFFE3]/80 transition hover:bg-white/5 hover:text-[#FDFFE3]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileOpen(false)
                  setSearchOpen(true)
                }}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-[#FDFFE3]/85 transition hover:bg-white/5"
              >
                🔍 Search
              </button>

              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm text-[#FDFFE3]/85 transition hover:bg-white/5"
              >
                Cart {mounted && totalItems > 0 ? `(${totalItems})` : ''}
              </Link>

              {!user ? (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="col-span-2 rounded-2xl bg-[#FDFFE3] px-4 py-3 text-center text-sm font-semibold text-[#00612E] transition hover:opacity-90"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="col-span-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-[#ffb3b3] transition hover:bg-white/5"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}

        {/* hero content */}
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-4 pb-5 pt-24 sm:px-6 lg:px-8">
          <div className="grid flex-1 items-center gap-10 lg:grid-cols-2 lg:gap-6">
            {/* left */}
            <div className="max-w-2xl">
              <p className={`mb-3 text-xs sm:text-sm uppercase tracking-[5px] text-[#FDFFE3]/65 ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                Limited Edition Drops
              </p>

              <h1 className="leading-[0.88]">
                <span className={`block text-[clamp(3rem,11vw,7.5rem)] font-black tracking-tight premium-text ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                  EXCLUSIVE
                </span>
                <span
                  className={`block text-[clamp(3rem,10vw,7rem)] font-black tracking-tight ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}
                  style={{ WebkitTextStroke: '2px #FDFFE3', color: 'transparent' }}
                >
                  JERSEYS
                </span>
                <span className={`block text-[clamp(3rem,10vw,7rem)] font-black tracking-tight premium-text ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                  FOR YOU
                </span>
              </h1>

              <p className={`mt-5 max-w-xl text-sm leading-7 text-[#FDFFE3]/78 sm:text-base lg:text-lg premium-soft ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                Premium quality jerseys inspired by your favourite teams. Clean design, smooth motion, and a responsive feel on every screen.
              </p>

              <div className={`mt-7 flex flex-col gap-4 sm:flex-row sm:items-center ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                <Link
                  href="/category/top_pick"
                  className="btn-shop inline-flex items-center justify-center gap-3 rounded-full bg-[#FDFFE3] px-6 py-4 text-base font-semibold text-[#00612E] sm:px-7"
                >
                  <span>Shop Now</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="#FDFFE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>

                <Link
                  href="/reviews"
                  className="text-sm uppercase tracking-[3px] text-[#FDFFE3]/55 transition hover:text-[#FDFFE3]"
                >
                  See Reviews →
                </Link>
              </div>

              <div className={`mt-9 grid grid-cols-3 gap-4 sm:gap-8 ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                {[
                  { val: '200+', label: 'Styles' },
                  { val: '50+', label: 'Teams' },
                  { val: '4.9★', label: 'Rating' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-black sm:text-3xl premium-text">{s.val}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[3px] text-[#FDFFE3]/55">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* right */}
            <div className={`relative flex justify-center lg:justify-end ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
              <div className="relative w-full max-w-[400px] sm:max-w-[520px] lg:max-w-[620px]">
                <div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(245,247,0,0.10),transparent_65%)] blur-2xl"
                />
                <div className="animate-float">
                  <Image
                    src="/pic1.jpg"
                    alt="Jersey Model"
                    width={900}
                    height={1200}
                    priority
                    className="h-auto w-full select-none object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.48)]"
                    sizes="(max-width: 1024px) 90vw, 40vw"
                  />
                </div>

                <div className="absolute left-2 top-8 rounded-2xl bg-[#FDFFE3] px-4 py-2 text-[#00612E] shadow-xl sm:left-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#00612E]/60">New Drop</p>
                  <p className="text-lg font-black leading-tight">World Cup26</p>
                </div>

                <div className="absolute bottom-10 right-0 rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-[#FDFFE3] shadow-xl backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[2px] text-[#FDFFE3]/55">Starting from</p>
                  <p className="text-2xl font-black">$99.99</p>
                </div>
              </div>
            </div>
          </div>

          {/* ticker */}
          <div className="mt-8 overflow-hidden border-t border-white/10 py-3">
            <div className="flex w-max animate-marquee">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  {[
                    'EXCLUSIVE DROP',
                    'LIMITED EDITION',
                    'PREMIUM JERSEYS',
                    'FREE SHIPPING',
                    'NEW SEASON',
                    'WORLD CUP 26',
                    'RETRO CLASSICS',
                  ].map((word, j) => (
                    <span key={`${i}-${j}`} className="flex items-center">
                      <span className="whitespace-nowrap px-5 text-[10px] uppercase tracking-[4px] text-[#FDFFE3]/45">
                        {word}
                      </span>
                      <span className="text-[#FDFFE3]/20">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}