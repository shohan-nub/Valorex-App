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
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
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
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-14px); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes grain {
          0%,100% { transform: translate(0,0); }
          10%     { transform: translate(-2%,-3%); }
          20%     { transform: translate(3%,1%); }
          30%     { transform: translate(-1%,3%); }
          40%     { transform: translate(2%,-1%); }
          50%     { transform: translate(-3%,2%); }
          60%     { transform: translate(1%,-2%); }
          70%     { transform: translate(-2%,3%); }
          80%     { transform: translate(3%,-1%); }
          90%     { transform: translate(-1%,2%); }
        }
        @keyframes mobileSlide {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .animate-fadeUp       { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) both; }
        .animate-fadeIn       { animation: fadeIn 1s ease both; }
        .animate-slideInRight { animation: slideInRight 1.1s cubic-bezier(.22,1,.36,1) both; }
        .animate-float        { animation: float 6s ease-in-out infinite; }
        .animate-marquee      { animation: marquee 18s linear infinite; }

        .hero-nav-link { position:relative; }
        .hero-nav-link::after {
          content:'';
          position:absolute;
          bottom:-3px;
          left:0;
          width:0;
          height:1px;
          background:#FDFFE3;
          transition: width 0.3s ease;
        }
        .hero-nav-link:hover::after { width:100%; }

        .icon-circle {
          width:40px;
          height:40px;
          border-radius:9999px;
          display:flex;
          align-items:center;
          justify-content:center;
          border:1px solid rgba(253,255,227,0.22);
          background:rgba(255,255,255,0.08);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
          transition: transform .2s, border-color .2s, background .2s;
          will-change: transform;
        }
        .icon-circle:hover {
          border-color: rgba(253,255,227,0.6);
          background: rgba(253,255,227,0.12);
          transform: scale(1.04);
        }

        .btn-shop {
          position:relative;
          overflow:hidden;
          transition: transform .25s, box-shadow .25s;
          will-change: transform;
        }
        .btn-shop::before {
          content:'';
          position:absolute;
          inset:0;
          background:rgba(0,0,0,0.12);
          transform:translateX(-100%);
          transition:transform .35s ease;
        }
        .btn-shop:hover::before { transform:translateX(0); }
        .btn-shop:hover { transform: translateY(-1px) scale(1.02); box-shadow: 0 12px 32px rgba(0,97,49,0.30); }

        .grain-overlay {
          position:absolute;
          inset:-50%;
          width:200%;
          height:200%;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity:0.04;
          pointer-events:none;
          animation: grain 0.5s steps(1) infinite;
          transform: translate3d(0,0,0);
        }

        .premium-text {
          text-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.28);
        }
        .premium-text-soft {
          text-shadow: 0 1px 4px rgba(0,0,0,0.25), 0 4px 14px rgba(0,0,0,0.18);
        }
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <section
        id="hero-section"
        ref={heroRef}
        className="relative w-full min-h-svh bg-[#00612E] overflow-hidden flex flex-col text-[#FDFFE3]"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.13]"
            priority
            aria-hidden
          />
        </div>

        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 48% 55%, rgba(245,247,0,0.16) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 70% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 100%)' }}
        />
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          <div className="grain-overlay" />
        </div>

        <div
          className="pointer-events-none absolute z-[2] hidden lg:block rounded-full"
          style={{
            width: '520px',
            height: '520px',
            background: 'radial-gradient(circle, rgba(245,247,0,0.08) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${mousePos.x * 30}px), calc(-50% + ${mousePos.y * 30}px))`,
            transition: 'transform 0.15s linear',
            willChange: 'transform',
          }}
        />

        {/* NAV */}
        <nav className="absolute top-0 left-0 right-0 z-30">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            <div className={`animate-fadeIn ${mounted ? '' : 'opacity-0'}`}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={160}
                height={60}
                className="h-10 sm:h-12 w-auto object-contain brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] scale-125 origin-left"
                priority
              />
            </div>

            <ul
              className={`hidden md:flex items-center gap-8 font-barlow text-[11px] tracking-[3px] uppercase text-[#FDFFE3]/70 premium-text-soft ${
                mounted ? 'animate-fadeIn' : 'opacity-0'
              }`}
            >
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
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#FDFFE3] text-[#00612E] premium-text transition hover:scale-105"
                  >
                    {avatarLetter}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-12 rounded-2xl shadow-2xl py-1.5 w-52 z-50 border bg-[#00612E] border-[#FDFFE3]/15 backdrop-blur-xl">
                      <div className="px-4 py-2.5 border-b border-[#FDFFE3]/10">
                        <p className="text-xs font-semibold truncate text-[#FDFFE3]">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs truncate mt-0.5 text-[#FDFFE3]/60">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link href="/adminPanel" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-70 text-[#FDFFE3] transition">
                          ⚙️ Admin Panel
                        </Link>
                      )}
                      <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-70 text-[#FDFFE3]/85 transition">
                        📦 My Orders
                      </Link>
                      <Link href="/reviews" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-70 text-[#FDFFE3]/85 transition">
                        ⭐ Reviews
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-70 text-[#ffb3b3] transition">
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="icon-circle"
                  aria-label="Login"
                  title="Login"
                >
                  <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                  </svg>
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(v => !v)}
                className="flex md:hidden w-10 h-10 rounded-full items-center justify-center border border-[#FDFFE3]/22 hover:border-[#FDFFE3]/60 hover:bg-[#FDFFE3]/8 transition"
                aria-label="Menu"
              >
                <div className="flex flex-col gap-[5px] w-5">
                  <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                  <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div
            className="absolute top-[72px] left-4 right-4 z-40 rounded-3xl border border-[#FDFFE3]/12 p-4 md:hidden"
            style={{ background: 'rgba(0,97,46,0.97)', backdropFilter: 'blur(20px)', animation: 'mobileSlide 0.25s ease both' }}
          >
            <ul className="space-y-1 mb-3">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-4 py-3 font-barlow text-sm tracking-[2px] uppercase text-[#FDFFE3]/75 hover:bg-[#FDFFE3]/8 hover:text-[#FDFFE3] transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileOpen(false)
                  setSearchOpen(true)
                }}
                className="rounded-2xl border border-[#FDFFE3]/12 px-4 py-3 text-center font-barlow text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/8 transition"
              >
                🔍 Search
              </button>

              <Link href="/cart" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-[#FDFFE3]/12 px-4 py-3 text-center font-barlow text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/8 transition">
                Cart {mounted && totalItems > 0 ? `(${totalItems})` : ''}
              </Link>

              {!user ? (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="col-span-2 rounded-2xl bg-[#FDFFE3] px-4 py-3 text-center font-barlow text-sm font-semibold text-[#00612E] transition hover:opacity-90"
                >
                  Login
                </Link>
              ) : (
                <button onClick={handleLogout} className="col-span-2 rounded-2xl border border-[#FDFFE3]/10 px-4 py-3 font-barlow text-sm text-[#ffb3b3] hover:bg-[#FDFFE3]/6 transition">
                  Logout
                </button>
              )}
            </div>
          </div>
        )}

        {/* HERO */}
        <section className="relative z-10 flex-1 flex items-center">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full px-6 sm:px-10 lg:px-16 pt-28 pb-16 gap-12 lg:gap-0">
            {/* LEFT */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 xl:w-[55%]">
              <p
                className={`font-barlow text-[#FDFFE3]/60 tracking-[5px] uppercase text-sm sm:text-base mb-3 premium-text-soft ${
                  mounted ? 'animate-fadeUp' : 'opacity-0'
                }`}
              >
                Limited Edition Drops
              </p>

              <h1 className="font-anton text-[#FDFFE3] leading-[0.9] select-none premium-text">
                <span className={`block text-[clamp(72px,13vw,160px)] ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                  EXCLUSIVE
                </span>
                <span
                  className={`block text-[clamp(72px,11vw,160px)] ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}
                  style={{ WebkitTextStroke: '2px #FDFFE3', color: 'transparent' }}
                >
                  JERSEYS
                </span>
                <span className={`block text-[clamp(72px,11vw,160px)] ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                  FOR YOU
                </span>
              </h1>

              <p
                className={`font-bentham text-[#FDFFE3]/75 text-base sm:text-lg lg:text-xl leading-relaxed max-w-md mt-6 premium-text-soft ${
                  mounted ? 'animate-fadeUp' : 'opacity-0'
                }`}
              >
                Premium quality jerseys inspired by your favourite teams. Style, comfort, and performance in one.
              </p>

              <div className={`flex items-center gap-5 mt-8 ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                <Link href="/category/top_pick" className="btn-shop flex items-center gap-3 bg-[#FDFFE3] text-[#00612E] font-bentham text-lg sm:text-xl px-7 py-4 rounded-[55px]">
                  <span>Shop Now</span>
                  <span className="flex items-center justify-center bg-black rounded-full w-9 h-9 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="#FDFFE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>

                <Link href="/reviews" className="hidden sm:block font-barlow text-[#FDFFE3]/50 tracking-[3px] uppercase text-sm hover:text-[#FDFFE3] transition-colors duration-300 premium-text-soft">
                  See Reviews →
                </Link>
              </div>

              <div className={`flex items-center gap-8 mt-10 ${mounted ? 'animate-fadeUp' : 'opacity-0'}`}>
                {[{ val: '200+', label: 'Styles' }, { val: '50+', label: 'Teams' }, { val: '4.9★', label: 'Rating' }].map(s => (
                  <div key={s.label} className="flex flex-col">
                    <span className="font-anton text-[#FDFFE3] text-2xl sm:text-3xl premium-text">{s.val}</span>
                    <span className="font-barlow text-[#FDFFE3]/50 text-xs tracking-[3px] uppercase mt-0.5 premium-text-soft">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className={`w-full lg:w-[42%] flex justify-center lg:justify-end items-center ${mounted ? 'animate-slideInRight' : 'opacity-0'}`}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none hidden lg:block"
                   style={{ width: '340px', height: '340px', background: 'radial-gradient(circle, rgba(245,247,0,0.12) 0%, transparent 70%)' }} />
              <div className="relative animate-float" style={{ width: 'clamp(260px, 36vw, 560px)' }}>
                <Image
                  src="/pic1.jpg"
                  alt="Jersey Model"
                  width={760}
                  height={1000}
                  priority
                  style={{
                    width: 'clamp(420px, 40vw, 1300px)',
                    height: 'auto',
                    maxHeight: '80svh',
                    display: 'block',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.55)) drop-shadow(0 5px 20px rgba(0,0,0,0.35))',
                  }}
                />

                <div className={`absolute top-[12%] -left-4 sm:-left-8 bg-[#FDFFE3] text-[#00612E] rounded-2xl px-4 py-2 shadow-xl ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
                  <p className="font-barlow font-semibold text-xs tracking-[2px] uppercase text-[#00612E]/60">New Drop</p>
                  <p className="font-anton text-[#00612E] text-lg leading-tight">World Cup26</p>
                </div>

                <div className={`absolute bottom-[18%] -right-2 sm:-right-6 bg-black/80 backdrop-blur-sm border border-[#FDFFE3]/10 text-[#FDFFE3] rounded-2xl px-4 py-3 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
                  <p className="font-barlow text-xs tracking-[2px] uppercase text-[#FDFFE3]/50">Starting from</p>
                  <p className="font-anton text-[#FDFFE3] text-2xl premium-text">$99.99</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker */}
        <div className="relative z-10 w-full border-t border-[#FDFFE3]/10 py-3 overflow-hidden mt-auto">
          <div className="ticker-track animate-marquee">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center">
                {['EXCLUSIVE DROP','LIMITED EDITION','PREMIUM JERSEYS','FREE SHIPPING','NEW SEASON','WORLD CUP 26','RETRO CLASSICS'].map((word, j) => (
                  <span key={`${i}-${j}`} className="flex items-center">
                    <span className="font-barlow text-[#FDFFE3]/40 text-xs tracking-[4px] uppercase whitespace-nowrap px-6 premium-text-soft">
                      {word}
                    </span>
                    <span className="text-[#FDFFE3]/20 text-xs">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}