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

  const [mounted, setMounted]     = useState(false);
  const [user, setUser]           = useState<User | null>(null);
  const [isAdmin, setIsAdmin]     = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const heroRef     = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null); // ← পারফরম্যান্সের জন্য নতুন Ref

  useEffect(() => { setMounted(true); }, []);

  // সুপার স্মুথ মাউস মুভমেন্ট (React Re-render ছাড়া)
  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current || !glowRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(calc(-50% + ${x * 30}px), calc(-50% + ${y * 30}px))`;
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
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
    { label: "Reviews",  href: "/reviews"          },
    { label: "Home",     href: "/"                 },
    { label: "About",    href: "/about"             },
    { label: "Contact",  href: "/contact"           },
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
          from { opacity: 0; transform: translateX(60px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(-0.08deg); }
          50%     { transform: translateY(-18px) rotate(0.08deg); }
        }
        @keyframes marquee {
          from { transform: translateX(0) translateZ(0); }
          to   { transform: translateX(-50%) translateZ(0); }
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

        /* পারফরম্যান্স বুস্টের জন্য will-change অ্যাড করা হয়েছে */
        .animate-fadeUp        { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) both; will-change: transform, opacity; }
        .animate-fadeIn        { animation: fadeIn 1s ease both; will-change: opacity; }
        .animate-slideInRight  { animation: slideInRight 1.1s cubic-bezier(.22,1,.36,1) both; will-change: transform, opacity; }
        .animate-float         { animation: float 6s ease-in-out infinite; will-change: transform; }
        .animate-marquee       { animation: marquee 18s linear infinite; will-change: transform; }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-900 { animation-delay: 0.9s; }

        .btn-shop {
          position: relative; overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .btn-shop::before {
          content:''; position:absolute; inset:0;
          background: rgba(0,0,0,0.12);
          transform: translateX(-100%);
          transition: transform 0.35s ease;
        }
        .btn-shop:hover::before { transform: translateX(0); }
        .btn-shop:hover { transform: scale(1.04); box-shadow: 0 8px 32px rgba(0,97,49,0.35); }

        .grain-overlay {
          position:absolute; inset:-50%; width:200%; height:200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity:0.04; pointer-events:none;
          animation: grain 0.5s steps(1) infinite;
        }
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

        .premium-text { text-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.28); }
        .premium-text-soft { text-shadow: 0 1px 4px rgba(0,0,0,0.28), 0 4px 14px rgba(0,0,0,0.18); }
        .premium-drop { filter: drop-shadow(0 14px 36px rgba(0,0,0,0.35)) drop-shadow(0 4px 14px rgba(0,0,0,0.22)); }
      `}</style>

      {/* Search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ══ ফ্লোটিং টপ এরিয়া (Navbar এর বদলে) ══ */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5 pointer-events-none">
        
        {/* LOGO */}
        <div className={`pointer-events-auto animate-fadeIn ${mounted ? "" : "opacity-0"}`}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={160}
            height={60}
            className="h-12 sm:h-14 w-auto object-contain brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] scale-125 origin-left premium-drop"
            priority
          />
        </div>

        {/* DESKTOP LINKS */}
        <div className={`hidden md:flex pointer-events-auto items-center gap-8 font-barlow text-[11px] tracking-[3px] uppercase text-[#FDFFE3]/70 animate-fadeIn delay-200 premium-text-soft ${mounted ? "" : "opacity-0"}`}>
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href} className="hero-nav-link hover:text-[#FDFFE3] transition-colors duration-200">
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT ICONS */}
        <div className={`pointer-events-auto flex items-center gap-2 sm:gap-3 animate-fadeIn delay-300 ${mounted ? "" : "opacity-0"}`}>
          
          {/* Search Icon */}
          <button onClick={() => setSearchOpen(true)} className="icon-circle" aria-label="Search">
            <svg width="17" height="17" fill="none" stroke="#FDFFE3" strokeWidth="1.7" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Cart Icon */}
          <Link href="/cart" className="icon-circle relative" aria-label="Cart">
            <svg width="17" height="17" fill="none" stroke="#FDFFE3" strokeWidth="1.7" viewBox="0 0 24 24">
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

          {/* Avatar / Login Icon */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#FDFFE3] text-[#00612E] premium-drop transition hover:scale-105"
              >
                {avatarLetter}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 rounded-2xl shadow-2xl py-1.5 w-52 z-50 border bg-[#00612E] border-[#FDFFE3]/15 premium-drop">
                  <div className="px-4 py-2.5 border-b border-[#FDFFE3]/10">
                    <p className="text-xs font-semibold truncate text-[#FDFFE3]">{user.user_metadata?.full_name || "User"}</p>
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
            <Link href="/login" className="icon-circle" aria-label="Login">
              <svg width="17" height="17" fill="none" stroke="#FDFFE3" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="flex md:hidden w-10 h-10 rounded-full items-center justify-center border border-[#FDFFE3]/22 hover:border-[#FDFFE3]/60 hover:bg-[#FDFFE3]/8 transition"
            aria-label="Menu"
          >
            <div className="flex flex-col gap-[5px] w-5">
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`}/>
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}/>
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`}/>
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileOpen && (
        <div
          className="absolute top-[72px] left-4 right-4 z-40 rounded-3xl border border-[#FDFFE3]/12 p-4 md:hidden"
          style={{ background: "rgba(0,97,46,0.97)", backdropFilter: "blur(20px)", animation: "mobileSlide 0.25s ease both" }}
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
              onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
              className="rounded-2xl border border-[#FDFFE3]/12 px-4 py-3 text-center font-barlow text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/8 transition"
            >
              🔍 Search
            </button>
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-[#FDFFE3]/12 px-4 py-3 text-center font-barlow text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/8 transition">
              Cart {mounted && totalItems > 0 ? `(${totalItems})` : ""}
            </Link>
            {!user ? (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="col-span-2 rounded-2xl bg-[#FDFFE3] px-4 py-3 text-center font-barlow text-sm font-semibold text-[#00612E] transition hover:opacity-90">
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

      {/* ══ HERO SECTION ══ */}
      <section
        id="hero-section"
        ref={heroRef}
        className="relative w-full min-h-svh bg-[#00612E] overflow-hidden flex flex-col"
      >
        <div className="absolute inset-0 z-0">
          <Image src="/hero.png" alt="" fill sizes="100vw" className="object-cover opacity-[0.13]" priority aria-hidden />
        </div>
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 80% at 48% 55%, rgba(245,247,0,0.16) 0%, transparent 70%)" }}/>
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 100% at 70% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 100%)" }}/>
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden"><div className="grain-overlay"/></div>
        <div className="absolute top-0 right-[38%] w-[1px] h-full z-[3] pointer-events-none hidden lg:block" style={{ background: "linear-gradient(to bottom, transparent, rgba(253,255,227,0.08) 30%, rgba(253,255,227,0.08) 70%, transparent)" }}/>
        
        {/* Glow Ref for Mouse movement */}
        <div ref={glowRef} className="absolute z-[2] pointer-events-none rounded-full hidden lg:block" style={{ width:"520px", height:"520px", background:"radial-gradient(circle, rgba(245,247,0,0.08) 0%, transparent 70%)", top:"50%", left:"50%", transform:`translate(-50%, -50%)`, transition:"transform 0.1s ease-out" }}/>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 pt-28 pb-16 px-6 sm:px-10 lg:px-16 gap-12 lg:gap-0">
          {/* LEFT */}
          <div className="flex flex-col justify-center w-full lg:w-1/2 xl:w-[55%]">
            <p className={`font-barlow text-[#FDFFE3]/60 tracking-[5px] uppercase text-sm sm:text-base mb-3 animate-fadeUp premium-text-soft ${mounted ? "" : "opacity-0"}`}>Limited Edition Drops</p>
            <h1 className="font-anton text-[#FDFFE3] leading-[0.9] select-none premium-text">
              <span className={`block text-[clamp(72px,13vw,160px)] animate-fadeUp delay-100 ${mounted ? "" : "opacity-0"}`}>EXCLUSIVE</span>
              <span className={`block text-[clamp(72px,11vw,160px)] animate-fadeUp delay-200 ${mounted ? "" : "opacity-0"}`} style={{ WebkitTextStroke:"2px #FDFFE3", color:"transparent" }}>JERSEYS</span>
              <span className={`block text-[clamp(72px,11vw,160px)] animate-fadeUp delay-300 ${mounted ? "" : "opacity-0"}`}>FOR YOU</span>
            </h1>
            <p className={`font-bentham text-[#FDFFE3]/75 text-base sm:text-lg lg:text-xl leading-relaxed max-w-md mt-6 animate-fadeUp delay-400 premium-text-soft ${mounted ? "" : "opacity-0"}`}>
              Premium quality jerseys inspired by your favourite teams. Style, comfort, and performance in one.
            </p>
            <div className={`flex items-center gap-5 mt-8 animate-fadeUp delay-500 ${mounted ? "" : "opacity-0"}`}>
              <Link href="/category/top_pick" className="btn-shop flex items-center gap-3 bg-[#FDFFE3] text-[#00612E] font-bentham text-lg sm:text-xl px-7 py-4 rounded-[55px] premium-drop">
                <span>Shop Now</span>
                <span className="flex items-center justify-center bg-black rounded-full w-9 h-9 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#FDFFE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </Link>
              <Link href="/reviews" className="font-barlow text-[#FDFFE3]/50 tracking-[3px] uppercase text-sm hover:text-[#FDFFE3] transition-colors duration-300 hidden sm:block premium-text-soft">
                See Reviews →
              </Link>
            </div>
            <div className={`flex items-center gap-8 mt-10 animate-fadeUp delay-700 ${mounted ? "" : "opacity-0"}`}>
              {[{ val:"200+", label:"Styles" }, { val:"50+", label:"Teams" }, { val:"4.9★", label:"Rating" }].map(s => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-anton text-[#FDFFE3] text-2xl sm:text-3xl premium-text">{s.val}</span>
                  <span className="font-barlow text-[#FDFFE3]/50 text-xs tracking-[3px] uppercase mt-0.5 premium-text-soft">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className={`w-full lg:w-[42%] flex justify-center lg:justify-end items-center animate-slideInRight delay-300 ${mounted ? "" : "opacity-0"}`}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none hidden lg:block" style={{ width:"340px", height:"340px", background:"radial-gradient(circle, rgba(245,247,0,0.12) 0%, transparent 70%)" }}/>
            <div className="relative animate-float" style={{ width:"clamp(260px, 36vw, 560px)" }}>
              <Image src="/pic1.jpg" alt="Jersey Model" width={760} height={1000} priority style={{ width:"clamp(420px, 40vw, 1300px)", height:"auto", maxHeight:"80svh", display:"block", objectFit:"contain", objectPosition:"center", filter:"drop-shadow(0 20px 60px rgba(0,0,0,0.55)) drop-shadow(0 5px 20px rgba(0,0,0,0.35))" }}/>
              <div className={`absolute top-[12%] -left-4 sm:-left-8 bg-[#FDFFE3] text-[#00612E] rounded-2xl px-4 py-2 shadow-xl animate-fadeIn delay-900 premium-drop ${mounted ? "" : "opacity-0"}`}>
                <p className="font-barlow font-semibold text-xs tracking-[2px] uppercase text-[#00612E]/60">New Drop</p>
                <p className="font-anton text-[#00612E] text-lg leading-tight">World Cup26</p>
              </div>
              <div className={`absolute bottom-[18%] -right-2 sm:-right-6 bg-black/80 backdrop-blur-sm border border-[#FDFFE3]/10 text-[#FDFFE3] rounded-2xl px-4 py-3 animate-fadeIn delay-900 premium-drop ${mounted ? "" : "opacity-0"}`}>
                <p className="font-barlow text-xs tracking-[2px] uppercase text-[#FDFFE3]/50">Starting from</p>
                <p className="font-anton text-[#FDFFE3] text-2xl premium-text">$99.99</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative z-10 w-full border-t border-[#FDFFE3]/10 py-3 overflow-hidden mt-auto">
          <div className="ticker-track animate-marquee">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center">
                {["EXCLUSIVE DROP","LIMITED EDITION","PREMIUM JERSEYS","FREE SHIPPING","NEW SEASON","WORLD CUP 26","RETRO CLASSICS"].map((word, j) => (
                  <span key={`${i}-${j}`} className="flex items-center">
                    <span className="font-barlow text-[#FDFFE3]/40 text-xs tracking-[4px] uppercase whitespace-nowrap px-6 premium-text-soft">{word}</span>
                    <span className="text-[#FDFFE3]/20 text-xs">✦</span>
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