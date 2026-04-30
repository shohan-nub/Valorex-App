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

  const [mounted, setMounted]       = useState(false);
  const [user, setUser]             = useState<User | null>(null);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const avatarLetter = (
    user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"
  ).toUpperCase();

  const NAV_LINKS = [
    { label: "Reviews",  href: "/reviews" },
    { label: "Home",     href: "/"        },
    { label: "About",    href: "/about"   },
    { label: "Contact",  href: "/contact" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Barlow+Condensed:wght@300;400;600&family=Bentham&display=swap');
        .font-anton   { font-family: 'Anton SC', sans-serif; }
        .font-barlow  { font-family: 'Barlow Condensed', sans-serif; }
        .font-bentham { font-family: 'Bentham', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .animate-fadeUp        { animation: fadeUp 0.8s ease-out both; }
        .animate-fadeIn        { animation: fadeIn 0.8s ease-out both; }
        .animate-slideInRight  { animation: slideInRight 0.8s ease-out both; }
        .animate-marquee       { animation: marquee 20s linear infinite; }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }

        .btn-shop {
          position: relative; overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .btn-shop:hover { transform: scale(1.04); box-shadow: 0 8px 32px rgba(0,97,49,0.35); }

        .ticker-track { display:flex; width:max-content; }
        .hero-nav-link { position:relative; }
        .hero-nav-link::after {
          content:''; position:absolute; bottom:-3px; left:0;
          width:0; height:1px; background:#FDFFE3;
          transition: width 0.3s ease;
        }
        .hero-nav-link:hover::after { width:100%; }

        .icon-circle {
          width:40px; height:40px; border-radius:9999px;
          display:flex; align-items:center; justify-content:center;
          border: 1px solid rgba(253,255,227,0.22);
          transition: border-color 0.25s, background 0.25s;
        }
        .icon-circle:hover {
          border-color: rgba(253,255,227,0.6);
          background: rgba(253,255,227,0.08);
        }
      `}</style>

      {/* Search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ══ SIMPLE NAVBAR ══ */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5">
        
        {/* LOGO */}
        <div className={`animate-fadeIn ${mounted ? "" : "opacity-0"}`}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={60}
              className="h-12 sm:h-14 w-auto object-contain brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] scale-125 origin-left"
              priority
            />
          </Link>
        </div>

        {/* DESKTOP LINKS */}
        <div className={`hidden md:flex items-center gap-8 font-barlow text-[13px] tracking-[3px] uppercase text-[#FDFFE3]/80 animate-fadeIn delay-100 ${mounted ? "" : "opacity-0"}`}>
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href} className="hero-nav-link hover:text-[#FDFFE3] transition-colors duration-200">
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT ICONS */}
        <div className={`flex items-center gap-3 animate-fadeIn delay-200 ${mounted ? "" : "opacity-0"}`}>
          
          {/* Search Icon */}
          <button onClick={() => setSearchOpen(true)} className="icon-circle" aria-label="Search">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Cart Icon */}
          <Link href="/cart" className="icon-circle relative" aria-label="Cart">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#FDFFE3] text-[#00612E] text-[10px] flex items-center justify-center font-bold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Login / User Profile */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#FDFFE3] text-[#00612E] transition hover:scale-105"
              >
                {avatarLetter}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 rounded-2xl shadow-xl py-1.5 w-52 z-50 border bg-[#00612E] border-[#FDFFE3]/20">
                  <div className="px-4 py-2.5 border-b border-[#FDFFE3]/10">
                    <p className="text-xs font-semibold truncate text-[#FDFFE3]">{user.user_metadata?.full_name || "User"}</p>
                    <p className="text-xs truncate mt-0.5 text-[#FDFFE3]/60">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link href="/adminPanel" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[#FDFFE3]/10 text-[#FDFFE3] transition">
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <Link href="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[#FDFFE3]/10 text-[#FDFFE3]/85 transition">
                    📦 My Orders
                  </Link>
                  <Link href="/reviews" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[#FDFFE3]/10 text-[#FDFFE3]/85 transition">
                    ⭐ Reviews
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#FDFFE3]/10 text-[#ffb3b3] transition">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="icon-circle" aria-label="Login">
              <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="flex md:hidden w-10 h-10 rounded-full items-center justify-center border border-[#FDFFE3]/22 hover:bg-[#FDFFE3]/10 transition"
            aria-label="Menu"
          >
            <div className="flex flex-col gap-[5px] w-5">
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all ${mobileOpen ? "translate-y-[6px] rotate-45" : ""}`}/>
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all ${mobileOpen ? "opacity-0" : ""}`}/>
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`}/>
            </div>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {mobileOpen && (
        <div className="absolute top-[72px] left-4 right-4 z-40 rounded-2xl bg-[#00612E] border border-[#FDFFE3]/20 shadow-xl p-4 md:hidden">
          <ul className="space-y-1 mb-4">
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 font-barlow text-sm tracking-[2px] uppercase text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/10 hover:text-[#FDFFE3] transition"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ══ HERO SECTION ══ */}
      <section className="relative w-full min-h-svh bg-[#00612E] flex flex-col justify-between overflow-hidden">
        
        {/* Static Background Elements (No Animations) */}
        <div className="absolute inset-0 z-0">
          <Image src="/hero.png" alt="" fill sizes="100vw" className="object-cover opacity-[0.15]" priority aria-hidden />
        </div>
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(245,247,0,0.12) 0%, transparent 60%)" }}/>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 pt-32 pb-16 px-6 sm:px-10 lg:px-16 gap-12 lg:gap-0">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col w-full lg:w-1/2 xl:w-[55%]">
            <p className="font-barlow text-[#FDFFE3]/70 tracking-[5px] uppercase text-sm sm:text-base mb-3 animate-fadeUp">Limited Edition Drops</p>
            <h1 className="font-anton text-[#FDFFE3] leading-[0.95] select-none">
              <span className="block text-[clamp(64px,12vw,140px)] animate-fadeUp delay-100">EXCLUSIVE</span>
              <span className="block text-[clamp(64px,11vw,140px)] animate-fadeUp delay-200" style={{ WebkitTextStroke:"2px #FDFFE3", color:"transparent" }}>JERSEYS</span>
              <span className="block text-[clamp(64px,11vw,140px)] animate-fadeUp delay-300">FOR YOU</span>
            </h1>
            <p className="font-bentham text-[#FDFFE3]/80 text-base sm:text-lg lg:text-xl leading-relaxed max-w-md mt-6 animate-fadeUp delay-300">
              Premium quality jerseys inspired by your favourite teams. Style, comfort, and performance in one.
            </p>
            <div className="flex items-center gap-5 mt-8 animate-fadeUp delay-500">
              <Link href="/category/top_pick" className="btn-shop flex items-center gap-3 bg-[#FDFFE3] text-[#00612E] font-bentham text-lg sm:text-xl px-7 py-4 rounded-full shadow-lg">
                <span>Shop Now</span>
                <span className="flex items-center justify-center bg-[#00612E] rounded-full w-8 h-8 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#FDFFE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-10 animate-fadeUp delay-500">
              {[{ val:"200+", label:"Styles" }, { val:"50+", label:"Teams" }, { val:"4.9★", label:"Rating" }].map(s => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-anton text-[#FDFFE3] text-2xl sm:text-3xl">{s.val}</span>
                  <span className="font-barlow text-[#FDFFE3]/60 text-xs tracking-[3px] uppercase mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT (IMAGE) */}
          <div className="w-full lg:w-[45%] flex justify-center lg:justify-end items-center animate-slideInRight delay-200">
            <div className="relative" style={{ width:"clamp(280px, 38vw, 600px)" }}>
              <Image 
                src="/pic1.jpg" 
                alt="Jersey Model" 
                width={800} 
                height={1000} 
                priority 
                className="w-full h-auto object-contain filter drop-shadow-2xl"
                style={{ maxHeight: "75svh" }}
              />
              <div className="absolute top-[10%] -left-2 sm:-left-6 bg-[#FDFFE3] text-[#00612E] rounded-xl px-4 py-2 shadow-lg">
                <p className="font-barlow font-bold text-xs tracking-[2px] uppercase text-[#00612E]/70">New Drop</p>
                <p className="font-anton text-[#00612E] text-lg leading-tight">World Cup26</p>
              </div>
              <div className="absolute bottom-[15%] -right-2 sm:-right-4 bg-black/90 border border-[#FDFFE3]/20 text-[#FDFFE3] rounded-xl px-4 py-3 shadow-lg">
                <p className="font-barlow text-xs tracking-[2px] uppercase text-[#FDFFE3]/60">Starting from</p>
                <p className="font-anton text-[#FDFFE3] text-2xl">$99.99</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker Bottom (Simplified Animation) */}
        <div className="relative z-10 w-full border-t border-[#FDFFE3]/15 py-3 overflow-hidden bg-[#00612E]">
          <div className="ticker-track animate-marquee">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center">
                {["EXCLUSIVE DROP","LIMITED EDITION","PREMIUM JERSEYS","FREE SHIPPING","NEW SEASON","WORLD CUP 26","RETRO CLASSICS"].map((word, j) => (
                  <span key={`${i}-${j}`} className="flex items-center">
                    <span className="font-barlow text-[#FDFFE3]/50 text-xs tracking-[4px] uppercase whitespace-nowrap px-6">{word}</span>
                    <span className="text-[#FDFFE3]/30 text-xs">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

      </section>
    </>
  );
}
