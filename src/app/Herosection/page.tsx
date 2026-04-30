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
        @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Barlow+Condensed:wght@400;600&family=Bentham&display=swap');
        .font-anton { font-family: 'Anton SC', sans-serif; }
        .font-barlow { font-family: 'Barlow Condensed', sans-serif; }
        .font-bentham { font-family: 'Bentham', serif; }

        @keyframes simpleUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        
        .animate-up { animation: simpleUp 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        
        .grain { position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.04; pointer-events: none; }
        .glass-btn { @apply flex items-center justify-center rounded-full border border-[#FDFFE3]/10 bg-[#FDFFE3]/5 backdrop-blur-md transition-all duration-300 hover:bg-[#FDFFE3]/20 hover:border-[#FDFFE3]/40; }
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ══ MINIMAL HEADER (Simplified Links) ══ */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 bg-gradient-to-b from-[#00612E]/80 to-transparent">
        
        {/* Logo Link */}
        <Link href="/" className="shrink-0 transition-transform hover:scale-105">
          <Image src="/logo.png" alt="Logo" width={140} height={45} className="h-9 sm:h-11 w-auto brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] drop-shadow-lg" priority />
        </Link>

        {/* Flat Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 font-barlow text-[10px] tracking-[4px] uppercase text-[#FDFFE3]/50">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-[#FDFFE3] transition-colors">{l.label}</Link>
          ))}
        </div>

        {/* Action Links/Icons */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(true)} className="glass-btn w-10 h-10" aria-label="Search">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" /></svg>
          </button>

          <Link href="/cart" className="glass-btn w-10 h-10 relative">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            {mounted && totalItems > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FDFFE3] text-[#00612E] rounded-full text-[9px] font-bold flex items-center justify-center">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 rounded-full bg-[#FDFFE3] text-[#00612E] font-bold text-sm shadow-xl">
                {(user.email?.[0] || "U").toUpperCase()}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#00612E] border border-[#FDFFE3]/10 rounded-xl py-2 shadow-2xl overflow-hidden">
                  <Link href="/orders" className="block px-4 py-2 text-xs text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/10">Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-300 hover:bg-red-500/10">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="glass-btn w-10 h-10">
              <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
          )}

          {/* Mobile Menu Icon */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden glass-btn w-10 h-10">
            <span className="w-5 h-0.5 bg-[#FDFFE3]" />
          </button>
        </div>
      </header>

      {/* ══ MOBILE MENU (Overlay) ══ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#00612E] flex flex-col p-10 space-y-6 animate-up">
          <button onClick={() => setMobileOpen(false)} className="self-end text-[#FDFFE3] text-2xl">✕</button>
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="font-anton text-5xl text-[#FDFFE3] uppercase tracking-tighter">{l.label}</Link>
          ))}
        </div>
      )}

      {/* ══ HERO SECTION ══ */}
      <section ref={heroRef} className="relative w-full min-h-screen bg-[#00612E] overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0 z-0 opacity-[0.08]"><Image src="/hero.png" alt="" fill className="object-cover" /></div>
        <div className="grain z-[1]" />
        
        {/* Main Content Area */}
        <div className="relative z-10 w-full max-w-[1700px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 pt-20">
          
          {/* Text Side */}
          <div className="w-full lg:w-[45%] text-center lg:text-left">
            <span className="block font-barlow text-[#FDFFE3]/40 tracking-[10px] uppercase text-[10px] mb-4 animate-up">Season Drop 2026</span>
            <h1 className="font-anton text-[#FDFFE3] leading-[0.8] mb-8 select-none">
              <span className="block text-[clamp(65px,12vw,140px)] animate-up">EXCLUSIVE</span>
              <span className="block text-[clamp(65px,12vw,140px)] text-transparent" style={{ WebkitTextStroke: "1px #FDFFE3" }}>JERSEYS</span>
              <span className="block text-[clamp(65px,12vw,140px)] animate-up">FOR YOU</span>
            </h1>
            <p className="font-bentham text-[#FDFFE3]/60 text-lg sm:text-xl max-w-sm mx-auto lg:mx-0 leading-relaxed mb-10">
              Premium fabrics. Iconic designs. Built for the streets and the stands.
            </p>
            <Link href="/category/top_pick" className="inline-block bg-[#FDFFE3] text-[#00612E] px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-500 shadow-2xl">Shop Now</Link>
          </div>

          {/* Image Side (BIGGER MODEL PIC) */}
          <div className="w-full lg:w-[55%] flex justify-center lg:justify-end items-end relative h-full">
            <div className="absolute inset-0 bg-yellow-400/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative transition-transform duration-1000" style={{ transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)` }}>
              {/* BIGGER MODEL IMAGE */}
              <Image 
                src="/pic1.jpg" 
                alt="Model" 
                width={1200} 
                height={1400} 
                className="w-[350px] sm:w-[550px] lg:w-[700px] xl:w-[850px] h-auto object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.6)] animate-up"
                priority 
              />
              
              {/* Floating Badge */}
              <div className="absolute top-[15%] left-0 sm:-left-10 bg-[#FDFFE3] p-5 rounded-2xl shadow-2xl -rotate-6 animate-up">
                <p className="font-anton text-[#00612E] text-2xl leading-none">WORLD CUP '26</p>
                <p className="font-barlow text-[8px] tracking-widest text-[#00612E]/50 uppercase mt-1">Limited Edition</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="absolute bottom-0 w-full border-t border-white/5 py-6 bg-[#00612E]/40 backdrop-blur-md">
          <div className="animate-marquee flex whitespace-nowrap gap-20">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-20 items-center">
                {["PREMIUM QUALITY", "FREE SHIPPING", "AUTHENTIC GEAR", "NEW SEASON"].map(t => (
                  <span key={t} className="font-barlow text-[9px] tracking-[6px] text-[#FDFFE3]/20 uppercase">{t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}