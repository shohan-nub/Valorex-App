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
      // মাউস পজিশন ক্যালকুলেশন আরও স্মুথ করা হয়েছে
      setMousePos({
        x: (e.clientX - left) / width - 0.5,
        y: (e.clientY - top) / height - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
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

  // ক্লোজ ড্রপডাউন অন ক্লিক আউটসাইড
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

  const avatarLetter = (
    user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"
  ).toUpperCase();

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
        
        .font-anton   { font-family: 'Anton SC', sans-serif; }
        .font-barlow  { font-family: 'Barlow Condensed', sans-serif; }
        .font-bentham { font-family: 'Bentham', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-0.05deg); }
          50%      { transform: translateY(-15px) rotate(0.05deg); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10% { transform: translate(-1%,-1%); }
          30% { transform: translate(1%,1%); }
          50% { transform: translate(-0.5%, 1.5%); }
          70% { transform: translate(1.5%, -0.5%); }
          90% { transform: translate(-1%, 0.5%); }
        }

        .animate-fadeUp { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-float  { animation: float 5s ease-in-out infinite; }
        .animate-marquee { animation: marquee 25s linear infinite; }
        
        .grain-overlay {
          position: absolute; inset: -50%; width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.05; pointer-events: none; animation: grain 0.8s steps(2) infinite;
        }

        .btn-shop {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-shop:hover { 
          transform: translateY(-2px) scale(1.02); 
          box-shadow: 0 12px 40px rgba(253,255,227,0.2); 
        }

        .icon-circle {
          width: 42px; height: 42px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(253,255,227,0.15);
          background: rgba(253,255,227,0.03);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }
        .icon-circle:hover {
          border-color: rgba(253,255,227,0.5);
          background: rgba(253,255,227,0.1);
        }

        .premium-text { text-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ══ NAV ══ */}
      <nav className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-12 py-6">
        {/* LOGO */}
        <Link href="/" className={`transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={50}
            className="h-10 sm:h-12 w-auto brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] premium-drop"
            priority
          />
        </Link>

        {/* DESKTOP LINKS */}
        <ul className={`hidden md:flex items-center gap-10 font-barlow text-[11px] tracking-[3px] uppercase text-[#FDFFE3]/60 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <Link href={link.href} className="hover:text-[#FDFFE3] transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#FDFFE3] transition-all group-hover:width-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(true)} className="icon-circle" aria-label="Search">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </button>

          <Link href="/cart" className="icon-circle relative" aria-label="Cart">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FDFFE3] text-[#00612E] text-[10px] flex items-center justify-center font-bold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* USER AUTH SECTION */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#FDFFE3] text-[#00612E] hover:scale-105 transition shadow-lg"
              >
                {avatarLetter}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-[#00612E] border border-[#FDFFE3]/20 rounded-2xl py-2 shadow-2xl animate-fadeUp">
                   <div className="px-4 py-2 border-b border-[#FDFFE3]/10 mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-[#FDFFE3]/50">Signed in as</p>
                    <p className="text-sm font-semibold text-[#FDFFE3] truncate">{user.email}</p>
                  </div>
                  {isAdmin && <Link href="/adminPanel" className="block px-4 py-2 text-sm text-[#FDFFE3] hover:bg-[#FDFFE3]/10">⚙️ Admin Panel</Link>}
                  <Link href="/orders" className="block px-4 py-2 text-sm text-[#FDFFE3] hover:bg-[#FDFFE3]/10">📦 My Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/10">🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="icon-circle" aria-label="Login">
              <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}

          {/* HAMBURGER (Mobile) */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden icon-circle">
            <div className="w-5 flex flex-col gap-1">
              <span className={`h-0.5 bg-[#FDFFE3] transition-all ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`h-0.5 bg-[#FDFFE3] transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 bg-[#FDFFE3] transition-all ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-[#00612E]/95 backdrop-blur-xl md:hidden flex flex-col pt-32 px-8">
          <ul className="space-y-6">
            {NAV_LINKS.map(link => (
              <li key={link.label} className="animate-fadeUp">
                <Link href={link.href} onClick={() => setMobileOpen(false)} className="text-4xl font-anton uppercase text-[#FDFFE3] opacity-80 hover:opacity-100">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ══ HERO SECTION ══ */}
      <section ref={heroRef} className="relative w-full min-h-screen bg-[#00612E] overflow-hidden flex flex-col">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <Image src="/hero.png" alt="bg" fill className="object-cover opacity-[0.12]" priority />
        </div>
        <div className="absolute inset-0 z-[1] grain-overlay" />
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(245,247,0,0.08) 0%, transparent 70%)" }} />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 px-6 sm:px-16 pt-32 pb-12 gap-12">
          {/* Text Side */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <p className="animate-fadeUp font-barlow text-[#FDFFE3]/50 tracking-[6px] uppercase text-xs sm:text-sm mb-4">New Season Arrival</p>
            <h1 className="font-anton text-[#FDFFE3] leading-[0.85] select-none premium-text">
              <span className="block text-[clamp(60px,12vw,150px)] animate-fadeUp">EXCLUSIVE</span>
              <span className="block text-[clamp(60px,12vw,150px)] animate-fadeUp" style={{ WebkitTextStroke:"1px #FDFFE3", color:"transparent" }}>JERSEYS</span>
              <span className="block text-[clamp(60px,12vw,150px)] animate-fadeUp">FOR YOU</span>
            </h1>
            <p className="animate-fadeUp font-bentham text-[#FDFFE3]/70 text-lg sm:text-xl max-w-md mt-6 leading-relaxed">
              Experience premium quality and authentic designs inspired by your favorite icons. Style meets performance.
            </p>
            
            <div className="animate-fadeUp flex flex-wrap justify-center lg:justify-start gap-6 mt-10">
              <Link href="/category/top_pick" className="btn-shop flex items-center gap-4 bg-[#FDFFE3] text-[#00612E] px-8 py-4 rounded-full font-bold text-lg">
                Shop Now
                <span className="bg-black/10 rounded-full p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
              </Link>
              <Link href="/reviews" className="flex items-center text-[#FDFFE3]/60 uppercase tracking-widest text-xs hover:text-[#FDFFE3] transition">See Reviews →</Link>
            </div>

            <div className="animate-fadeUp flex gap-10 mt-12 border-t border-[#FDFFE3]/10 pt-8 w-full lg:w-auto">
              {[{v:"200+", l:"Styles"}, {v:"50+", l:"Teams"}, {v:"4.9★", l:"Rating"}].map(s => (
                <div key={s.l}>
                  <p className="font-anton text-2xl text-[#FDFFE3]">{s.v}</p>
                  <p className="font-barlow text-[10px] tracking-widest uppercase text-[#FDFFE3]/40">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image Side */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative h-full">
            {/* Dynamic Glow */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient from-yellow-400/10 to-transparent blur-3xl pointer-events-none transition-transform duration-700 ease-out"
              style={{ transform: `translate(calc(-50% + ${mousePos.x * 40}px), calc(-50% + ${mousePos.y * 40}px))` }}
            />
            
            <div className="relative animate-float">
              <Image 
                src="/pic1.jpg" 
                alt="Model" 
                width={800} 
                height={1000} 
                className="w-[300px] sm:w-[450px] lg:w-[550px] xl:w-[650px] h-auto object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                priority 
              />
              
              {/* Badge 1 */}
              <div className="absolute top-10 -left-6 bg-[#FDFFE3] p-3 sm:p-4 rounded-2xl shadow-2xl animate-fadeUp rotate-[-5deg]">
                <p className="text-[10px] font-bold text-[#00612E]/50 uppercase tracking-tighter">New Drop</p>
                <p className="font-anton text-[#00612E] text-base sm:text-xl">WORLD CUP '26</p>
              </div>

              {/* Badge 2 */}
              <div className="absolute bottom-10 -right-4 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl animate-fadeUp">
                <p className="text-[10px] text-white/50 uppercase">Starts at</p>
                <p className="font-anton text-[#FDFFE3] text-2xl">$99.99</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative z-20 w-full border-t border-[#FDFFE3]/5 py-4 bg-[#00612E]">
          <div className="animate-marquee flex whitespace-nowrap gap-12">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12 items-center">
                {["EXCLUSIVE DROP", "FREE SHIPPING", "NEW SEASON", "LIMITED EDITION", "PREMIUM QUALITY"].map(text => (
                  <div key={text} className="flex items-center gap-12">
                    <span className="font-barlow text-[10px] tracking-[5px] text-[#FDFFE3]/30 uppercase font-semibold">{text}</span>
                    <span className="text-[#FDFFE3]/10 text-xs">✦</span>
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