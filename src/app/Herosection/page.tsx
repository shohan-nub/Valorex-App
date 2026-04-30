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
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .animate-fadeUp        { animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-fadeIn        { animation: fadeIn 1s ease-out both; }
        .animate-slideInRight  { animation: slideInRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-marquee       { animation: marquee 25s linear infinite; }

        .delay-100 { animation-delay: 0.15s; }
        .delay-200 { animation-delay: 0.3s; }
        .delay-300 { animation-delay: 0.45s; }
        .delay-500 { animation-delay: 0.6s; }

        .heavy-shadow {
          filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.6));
        }

        .ticker-track { display:flex; width:max-content; }
        .hero-nav-link { position:relative; }
        .hero-nav-link::after {
          content:''; position:absolute; bottom:-4px; left:0;
          width:0; height:2px; background:#FDFFE3;
          transition: width 0.3s ease;
        }
        .hero-nav-link:hover::after { width:100%; }

        .icon-circle {
          width:44px; height:44px; border-radius:9999px;
          display:flex; align-items:center; justify-content:center;
          border: 1.5px solid rgba(253,255,227,0.25);
          transition: all 0.3s ease;
        }
        .icon-circle:hover {
          border-color: rgba(253,255,227,0.8);
          background: rgba(253,255,227,0.12);
          transform: translateY(-2px);
        }
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ══ NAVBAR (Fixed and high Z-index) ══ */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 lg:px-20 py-8">
        
        <div className={`animate-fadeIn ${mounted ? "" : "opacity-0"}`}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={180}
              height={70}
              className="h-14 sm:h-16 w-auto object-contain brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] scale-125 origin-left"
              priority
            />
          </Link>
        </div>

        <div className={`hidden md:flex items-center gap-10 font-barlow text-[14px] tracking-[4px] uppercase text-[#FDFFE3]/80 animate-fadeIn delay-100 ${mounted ? "" : "opacity-0"}`}>
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href} className="hero-nav-link hover:text-[#FDFFE3] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className={`flex items-center gap-4 animate-fadeIn delay-200 ${mounted ? "" : "opacity-0"}`}>
          <button onClick={() => setSearchOpen(true)} className="icon-circle" aria-label="Search">
            <svg width="20" height="20" fill="none" stroke="#FDFFE3" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </button>

          <Link href="/cart" className="icon-circle relative" aria-label="Cart">
            <svg width="20" height="20" fill="none" stroke="#FDFFE3" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#FDFFE3] text-[#00612E] text-[11px] flex items-center justify-center font-black">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setMenuOpen(v => !v)} className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold bg-[#FDFFE3] text-[#00612E] hover:scale-110 transition shadow-lg">
                {avatarLetter}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-14 rounded-2xl shadow-2xl py-2 w-56 z-[60] bg-[#00612E] border border-[#FDFFE3]/20">
                  <div className="px-5 py-3 border-b border-[#FDFFE3]/10">
                    <p className="text-sm font-bold text-[#FDFFE3]">{user.user_metadata?.full_name || "User"}</p>
                    <p className="text-[11px] text-[#FDFFE3]/60 truncate">{user.email}</p>
                  </div>
                  <Link href="/orders" className="block px-5 py-3 text-sm hover:bg-[#FDFFE3]/10 text-[#FDFFE3]">My Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm hover:bg-[#FDFFE3]/10 text-red-300">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="icon-circle" aria-label="Login">
              <svg width="20" height="20" fill="none" stroke="#FDFFE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}

          <button onClick={() => setMobileOpen(v => !v)} className="md:hidden icon-circle">
            <div className="flex flex-col gap-[6px] w-6">
              <span className={`block h-[2px] bg-[#FDFFE3] transition ${mobileOpen ? "translate-y-[8px] rotate-45" : ""}`}/>
              <span className={`block h-[2px] bg-[#FDFFE3] transition ${mobileOpen ? "opacity-0" : ""}`}/>
              <span className={`block h-[2px] bg-[#FDFFE3] transition ${mobileOpen ? "-translate-y-[8px] -rotate-45" : ""}`}/>
            </div>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed top-24 left-6 right-6 z-50 rounded-3xl bg-[#004d25] border border-[#FDFFE3]/20 shadow-2xl p-6 md:hidden animate-fadeIn">
          <ul className="space-y-4">
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <Link href={link.href} onClick={() => setMobileOpen(false)} className="block font-barlow text-lg tracking-[3px] uppercase text-[#FDFFE3]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ══ HERO SECTION ══ */}
      <section className="relative w-full min-h-svh bg-[#00612E] flex flex-col justify-between overflow-hidden">
        
        <div className="absolute inset-0 z-0 opacity-20">
          <Image src="/hero.png" alt="" fill className="object-cover" priority />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 pt-40 pb-20 px-6 sm:px-10 lg:px-20 gap-16">
          
          {/* LEFT: TEXT (Bigger & Bolder) */}
          <div className="flex flex-col w-full lg:w-3/5">
            <p className="font-barlow text-[#FDFFE3]/70 tracking-[8px] uppercase text-sm sm:text-lg mb-4 animate-fadeUp">Season Drop 2026</p>
            <h1 className="font-anton text-[#FDFFE3] leading-[0.85] select-none uppercase">
              <span className="block text-[clamp(80px,14vw,200px)] animate-fadeUp delay-100">EXCLUSIVE</span>
              <span className="block text-[clamp(80px,13vw,200px)] animate-fadeUp delay-200" style={{ WebkitTextStroke:"3px #FDFFE3", color:"transparent" }}>JERSEYS</span>
              <span className="block text-[clamp(80px,13vw,200px)] animate-fadeUp delay-300">FOR YOU</span>
            </h1>
            <p className="font-bentham text-[#FDFFE3]/80 text-lg sm:text-2xl leading-relaxed max-w-xl mt-10 animate-fadeUp delay-300">
              Experience the peak of athletic style. Premium fabric, iconic designs, and unmatched comfort.
            </p>
            
            <div className="mt-12 animate-fadeUp delay-500">
              <Link href="/category/top_pick" className="inline-flex items-center gap-5 bg-[#FDFFE3] text-[#00612E] font-bentham text-xl sm:text-2xl px-10 py-5 rounded-full shadow-2xl hover:scale-105 transition-transform active:scale-95">
                <span>Shop the Collection</span>
                <span className="flex items-center justify-center bg-[#00612E] rounded-full w-10 h-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#FDFFE3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </Link>
            </div>
          </div>

          {/* RIGHT: MODEL IMAGE (Massive & Heavy Shadow) */}
          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end items-center animate-slideInRight delay-200">
            <div className="relative" style={{ width: "clamp(350px, 48vw, 850px)" }}>
              <Image 
                src="/pic1.jpg" 
                alt="Jersey Model" 
                width={1000} 
                height={1200} 
                priority 
                className="w-full h-auto object-contain heavy-shadow"
                style={{ maxHeight: "85svh" }}
              />
              {/* Badges */}
              <div className="absolute top-[15%] -left-4 sm:-left-12 bg-[#FDFFE3] text-[#00612E] rounded-2xl px-6 py-4 shadow-2xl rotate-[-5deg]">
                <p className="font-barlow font-black text-sm tracking-[3px] uppercase opacity-70">Premium</p>
                <p className="font-anton text-2xl sm:text-3xl leading-tight">Authentic</p>
              </div>
              <div className="absolute bottom-[10%] -right-4 sm:-right-8 bg-black/90 border-2 border-[#FDFFE3]/30 text-[#FDFFE3] rounded-2xl px-6 py-5 shadow-2xl rotate-[3deg]">
                <p className="font-barlow text-sm tracking-[3px] uppercase opacity-60">Price from</p>
                <p className="font-anton text-3xl sm:text-4xl">$89.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TICKER */}
        <div className="relative z-10 w-full border-t border-[#FDFFE3]/20 py-5 overflow-hidden bg-[#004d25]">
          <div className="ticker-track animate-marquee">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center">
                {["NEW ARRIVALS","FREE GLOBAL SHIPPING","LIMITED EDITION","PRO QUALITY","CRAFTED FOR FANS"].map((word, j) => (
                  <span key={`${i}-${j}`} className="flex items-center">
                    <span className="font-barlow text-[#FDFFE3]/60 text-sm tracking-[5px] uppercase whitespace-nowrap px-10">{word}</span>
                    <span className="text-[#FDFFE3]/40 text-sm">✦</span>
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