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
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      const u = data.user ?? null;
      setUser(u);
      setIsAdmin(u?.app_metadata?.role === "admin");
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsAdmin(u?.app_metadata?.role === "admin");
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  const avatarLetter = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const NAV_LINKS = [
    { label: "Home", href: "/#hero-section" },
    { label: "Reviews", href: "/reviews" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }

        @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Barlow+Condensed:wght@300;400;600&family=Bentham&display=swap');
        .font-anton   { font-family: 'Anton SC', sans-serif; }
        .font-barlow  { font-family: 'Barlow Condensed', sans-serif; }
        .font-bentham { font-family: 'Bentham', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-10px); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .animate-fadeUp { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .animate-fadeIn { animation: fadeIn 0.7s ease both; }
        .animate-float  { animation: float 5s ease-in-out infinite; }
        .animate-marquee { animation: marquee 16s linear infinite; }

        .hero-nav-link {
          position: relative;
          transition: color 0.2s ease;
        }
        .hero-nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0;
          height: 1px;
          background: #FDFFE3;
          transition: width 0.25s ease;
        }
        .hero-nav-link:hover::after {
          width: 100%;
        }

        .icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(253,255,227,0.22);
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
          will-change: transform;
        }
        .icon-circle:hover {
          transform: translateY(-1px);
          border-color: rgba(253,255,227,0.6);
          background: rgba(253,255,227,0.08);
        }

        .btn-shop {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          will-change: transform;
        }
        .btn-shop:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,97,49,0.28);
        }
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <section
        id="hero-section"
        ref={heroRef}
        className="relative w-full min-h-svh bg-[#00612E] overflow-hidden flex flex-col"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.12]"
            priority
            aria-hidden
          />
        </div>

        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 80% at 48% 55%, rgba(245,247,0,0.12) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden" style={{ opacity: 0.35 }} />

        <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5">
          <Link href="/#hero-section" className={`animate-fadeIn ${mounted ? "" : "opacity-0"}`}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={60}
              className="h-12 sm:h-14 w-auto object-contain brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] scale-125 origin-left"
              priority
            />
          </Link>

          <ul className={`hidden md:flex items-center gap-8 font-barlow text-[11px] tracking-[3px] uppercase text-[#FDFFE3]/70 animate-fadeIn ${mounted ? "" : "opacity-0"}`}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hero-nav-link hover:text-[#FDFFE3] transition-colors duration-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={`flex items-center gap-2 sm:gap-3 animate-fadeIn ${mounted ? "" : "opacity-0"}`}>
            <button onClick={() => setSearchOpen(true)} className="icon-circle" aria-label="Search">
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
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#FDFFE3] text-[#00612E] transition hover:scale-105"
                >
                  {avatarLetter}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 rounded-2xl shadow-2xl py-1.5 w-52 z-50 border bg-[#00612E] border-[#FDFFE3]/15">
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
              <Link href="/login" className="icon-circle px-4 font-barlow text-[11px] font-semibold uppercase tracking-[3px] text-[#FDFFE3]/90 w-auto">
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex md:hidden w-10 h-10 rounded-full items-center justify-center border border-[#FDFFE3]/22 hover:border-[#FDFFE3]/60 hover:bg-[#FDFFE3]/8 transition"
              aria-label="Menu"
            >
              <div className="flex flex-col gap-[5px] w-5">
                <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div
            className="absolute top-[72px] left-4 right-4 z-40 rounded-3xl border border-[#FDFFE3]/12 p-4 md:hidden"
            style={{ background: "rgba(0,97,46,0.97)", backdropFilter: "blur(18px)" }}
          >
            <ul className="space-y-1 mb-3">
              {NAV_LINKS.map((link) => (
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
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="rounded-2xl border border-[#FDFFE3]/12 px-4 py-3 text-center font-barlow text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/8 transition"
              >
                🔍 Search
              </button>
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl border border-[#FDFFE3]/12 px-4 py-3 text-center font-barlow text-sm text-[#FDFFE3]/80 hover:bg-[#FDFFE3]/8 transition"
              >
                Cart {mounted && totalItems > 0 ? `(${totalItems})` : ""}
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

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 pt-28 pb-16 px-6 sm:px-10 lg:px-16 gap-12 lg:gap-0">
          <div className="flex flex-col justify-center w-full lg:w-1/2 xl:w-[55%]">
            <p className={`font-barlow text-[#FDFFE3]/60 tracking-[5px] uppercase text-sm sm:text-base mb-3 animate-fadeUp ${mounted ? "" : "opacity-0"}`}>
              Limited Edition Drops
            </p>

            <h1 className="font-anton text-[#FDFFE3] leading-[0.9] select-none">
              <span className={`block text-[clamp(72px,13vw,160px)] animate-fadeUp ${mounted ? "" : "opacity-0"}`}>EXCLUSIVE</span>
              <span className={`block text-[clamp(72px,11vw,160px)] animate-fadeUp ${mounted ? "" : "opacity-0"}`} style={{ WebkitTextStroke: "2px #FDFFE3", color: "transparent" }}>
                JERSEYS
              </span>
              <span className={`block text-[clamp(72px,11vw,160px)] animate-fadeUp ${mounted ? "" : "opacity-0"}`}>FOR YOU</span>
            </h1>

            <p className={`font-bentham text-[#FDFFE3]/75 text-base sm:text-lg lg:text-xl leading-relaxed max-w-md mt-6 animate-fadeUp ${mounted ? "" : "opacity-0"}`}>
              Premium quality jerseys inspired by your favourite teams. Style, comfort, and performance in one.
            </p>

            <div className={`flex items-center gap-5 mt-8 animate-fadeUp ${mounted ? "" : "opacity-0"}`}>
              <Link href="/category/top_pick" className="btn-shop flex items-center gap-3 bg-[#FDFFE3] text-[#00612E] font-bentham text-lg sm:text-xl px-7 py-4 rounded-[55px]">
                <span>Shop Now</span>
                <span className="flex items-center justify-center bg-black rounded-full w-9 h-9 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="#FDFFE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>

              <Link href="/reviews" className="font-barlow text-[#FDFFE3]/50 tracking-[3px] uppercase text-sm hover:text-[#FDFFE3] transition-colors duration-300 hidden sm:block">
                See Reviews →
              </Link>
            </div>
          </div>

          <div className={`w-full lg:w-[42%] flex justify-center lg:justify-end items-center animate-fadeIn ${mounted ? "" : "opacity-0"}`}>
            <div className="relative animate-float" style={{ width: "clamp(260px, 36vw, 560px)" }}>
              <Image
                src="/pic1.jpg"
                alt="Jersey Model"
                width={760}
                height={1000}
                priority
                style={{
                  width: "clamp(420px, 40vw, 1300px)",
                  height: "auto",
                  maxHeight: "80svh",
                  display: "block",
                  objectFit: "contain",
                  objectPosition: "center",
                  filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.45))",
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full border-t border-[#FDFFE3]/10 py-3 overflow-hidden mt-auto">
          <div className="flex w-max animate-marquee">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center">
                {["EXCLUSIVE DROP", "LIMITED EDITION", "PREMIUM JERSEYS", "FREE SHIPPING", "NEW SEASON", "WORLD CUP 26", "RETRO CLASSICS"].map((word, j) => (
                  <span key={`${i}-${j}`} className="flex items-center">
                    <span className="font-barlow text-[#FDFFE3]/40 text-xs tracking-[4px] uppercase whitespace-nowrap px-6">
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
  );
}