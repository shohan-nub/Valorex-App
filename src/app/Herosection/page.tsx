"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { useCart } from "../Cartcontext";
import { createClient } from "../lib/supabase/client";
import SearchModal from "../Searchmodal";

export default function HeroSection() {
  const router = useRouter();
  const supabase = createClient();
  const { totalItems } = useCart();

  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      // Smooth movement tracking
      setMousePos({
        x: (e.clientX - left) / width - 0.5,
        y: (e.clientY - top) / height - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      const u = data.user ?? null;
      setUser(u);
      setIsAdmin(u?.app_metadata?.role === "admin");
    }
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsAdmin(u?.app_metadata?.role === "admin");
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const NAV_LINKS = [
    { label: "Reviews", href: "/reviews" },
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Barlow+Condensed:wght@300;400;600&family=Bentham&display=swap');
        
        :root { --accent: #FDFFE3; --bg-dark: #00612E; }
        .font-anton { font-family: 'Anton SC', sans-serif; }
        .font-barlow { font-family: 'Barlow Condensed', sans-serif; }
        .font-bentham { font-family: 'Bentham', serif; }

        @keyframes smoothFadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          20% { transform: translate(-2%, 1%); }
          60% { transform: translate(1%, -2%); }
        }

        .animate-smoothFade { animation: smoothFadeUp 1.2s cubic-bezier(0.19, 1, 0.22, 1) both; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        
        .grain-overlay {
          position: absolute; inset: -50%; width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; animation: grain 1s steps(2) infinite;
        }

        .premium-text { text-shadow: 0 10px 40px rgba(0,0,0,0.4); }
        .icon-btn {
          @apply w-11 h-11 rounded-full flex items-center justify-center border border-[#FDFFE3]/20 
          bg-[#FDFFE3]/5 backdrop-blur-md transition-all duration-500 hover:border-[#FDFFE3]/60 hover:bg-[#FDFFE3]/15;
        }
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ══ NAV ══ */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-6">
        <Link href="/" className={`transition-all duration-1000 ${mounted ? "opacity-100" : "opacity-0 scale-95"}`}>
          <Image src="/logo.png" alt="Logo" width={150} height={50} className="h-10 sm:h-12 w-auto brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] drop-shadow-2xl" priority />
        </Link>

        <ul className={`hidden md:flex items-center gap-10 font-barlow text-[11px] tracking-[4px] uppercase text-[#FDFFE3]/60 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {NAV_LINKS.map((link, idx) => (
            <li key={link.label} className="animate-smoothFade" style={{ animationDelay: `${idx * 0.1}s` }}>
              <Link href={link.href} className="hover:text-[#FDFFE3] transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#FDFFE3] transition-all duration-500 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(true)} className="icon-btn" aria-label="Search">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
          </button>

          <Link href="/cart" className="icon-btn relative">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FDFFE3] text-[#00612E] text-[10px] flex items-center justify-center font-bold shadow-lg animate-bounce">{totalItems}</span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="w-11 h-11 rounded-full flex items-center justify-center bg-[#FDFFE3] text-[#00612E] font-bold shadow-xl hover:scale-105 transition-transform duration-300">
                {(user.email?.[0] || "U").toUpperCase()}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#00612E]/95 backdrop-blur-xl border border-[#FDFFE3]/20 rounded-2xl py-3 shadow-2xl animate-smoothFade">
                   <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-[#FDFFE3]/40">Account</p>
                   <Link href="/orders" className="block px-4 py-2 text-[#FDFFE3] hover:bg-[#FDFFE3]/10">My Orders</Link>
                   <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-300 hover:bg-red-500/10">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="icon-btn" aria-label="Login">
              <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden icon-btn">
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`h-0.5 bg-[#FDFFE3] transition-all duration-500 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-0.5 bg-[#FDFFE3] transition-all duration-500 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 bg-[#FDFFE3] transition-all duration-500 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* ══ HERO SECTION ══ */}
      <section ref={heroRef} className="relative w-full min-h-screen bg-[#00612E] overflow-hidden flex flex-col justify-center">
        {/* Optimized Layers */}
        <div className="absolute inset-0 z-0">
          <Image src="/hero.png" alt="" fill className="object-cover opacity-[0.1]" priority />
        </div>
        <div className="absolute inset-0 z-[1] grain-overlay" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/20 via-transparent to-black/40" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-16 pt-24 pb-8 h-full max-w-[1800px] mx-auto w-full gap-12 lg:gap-4">
          
          {/* Text Side */}
          <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left animate-smoothFade">
            <span className="font-barlow text-[#FDFFE3]/40 tracking-[8px] uppercase text-[10px] sm:text-xs mb-6 block">Exclusive Collection 2026</span>
            <h1 className="font-anton text-[#FDFFE3] leading-[0.85] select-none premium-text mb-8">
              <span className="block text-[clamp(55px,11vw,140px)]">EXCLUSIVE</span>
              <span className="block text-[clamp(55px,11vw,140px)] text-transparent" style={{ WebkitTextStroke: "1.5px #FDFFE3" }}>JERSEYS</span>
              <span className="block text-[clamp(55px,11vw,140px)]">FOR YOU</span>
            </h1>
            <p className="font-bentham text-[#FDFFE3]/60 text-lg sm:text-xl max-w-md leading-relaxed mb-10">
              High-performance fabrics meets iconic street style. Designed for the fans who demand excellence.
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
              <Link href="/category/top_pick" className="group relative bg-[#FDFFE3] text-[#00612E] px-10 py-5 rounded-full font-bold text-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(253,255,227,0.3)]">
                <span className="relative z-10">Shop Collection</span>
                <div className="absolute inset-0 bg-white translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
              </Link>
              <Link href="/reviews" className="text-[#FDFFE3]/40 uppercase tracking-[3px] text-[10px] border-b border-[#FDFFE3]/10 pb-1 hover:text-[#FDFFE3] transition-colors">See Reviews</Link>
            </div>
          </div>

          {/* Image Side (Model Picture Made Bigger) */}
          <div className="w-full lg:w-[55%] relative flex justify-center lg:justify-end items-end h-full">
            {/* Interactive Glow */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-yellow-400/5 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
              style={{ transform: `translate(calc(-50% + ${mousePos.x * 50}px), calc(-50% + ${mousePos.y * 50}px))` }}
            />
            
            <div className="relative z-10 transition-transform duration-700 ease-out" style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}>
              {/* Image scaling improved */}
              <Image 
                src="/pic1.jpg" 
                alt="Model" 
                width={1000} 
                height={1200} 
                className="w-[320px] sm:w-[500px] lg:w-[650px] xl:w-[750px] h-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)] animate-smoothFade"
                priority 
              />
              
              {/* UI Badges - Smooth placement */}
              <div className="absolute top-[15%] -left-8 bg-[#FDFFE3] p-4 sm:p-5 rounded-2xl shadow-2xl rotate-[-4deg] animate-smoothFade delay-500">
                <p className="text-[9px] font-bold text-[#00612E]/40 uppercase tracking-widest mb-1">Authentic</p>
                <p className="font-anton text-[#00612E] text-lg sm:text-2xl leading-none">WORLD CUP '26</p>
              </div>

              <div className="absolute bottom-[10%] -right-4 bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl animate-smoothFade delay-700">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Starting Price</p>
                <p className="font-anton text-[#FDFFE3] text-3xl">$99.99</p>
              </div>
            </div>
          </div>
        </div>

        {/* Smooth Marquee Ticker */}
        <div className="relative z-20 w-full border-t border-white/5 py-5 bg-[#00612E]/50 backdrop-blur-sm">
          <div className="animate-marquee flex whitespace-nowrap gap-16">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-16 items-center">
                {["PREMIUM QUALITY", "FREE GLOBAL SHIPPING", "LIMITED DROPS", "AUTHENTIC GEAR", "24/7 SUPPORT"].map(text => (
                  <div key={text} className="flex items-center gap-16">
                    <span className="font-barlow text-[10px] tracking-[6px] text-[#FDFFE3]/20 uppercase font-semibold">{text}</span>
                    <span className="text-[#FDFFE3]/10 text-lg">✦</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}