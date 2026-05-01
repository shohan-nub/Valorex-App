'use client';

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

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const u = data.user ?? null;
      setUser(u);
      setIsAdmin(u?.app_metadata?.role === "admin");
    }
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      const u = s?.user ?? null;
      setUser(u);
      setIsAdmin(u?.app_metadata?.role === "admin");
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const avatarLetter = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const NAV_LINKS = [
    { label: "Reviews", href: "/reviews" },
    { label: "Home", href: "/" },
    { label: "Top Pick", href: "/category/top_pick" },
    { label: "Customize", href: "https://wa.me/8801771084820?text=Hi%20I%20want%20to%20customize%20a%20jersey%20from%20Your%20Premium%20shop" }, // এখানে নিজের নম্বর বসাবে
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Barlow+Condensed:wght@400;500;600;700&family=Bentham&display=swap');
        .f-anton   { font-family:'Anton SC',sans-serif; }
        .f-barlow  { font-family:'Barlow Condensed',sans-serif; }
        .f-bentham { font-family:'Bentham',serif; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideR    { from{opacity:0;transform:translateX(28px) scale(.985)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes floatY    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes grain     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(1%,1%)} }
        @keyframes dropIn    { from{opacity:0;transform:translateY(-6px) scale(.985)} to{opacity:1;transform:translateY(0) scale(1)} }

        .a-fadeUp  { animation:fadeUp  .7s cubic-bezier(.22,1,.36,1) both }
        .a-fadeIn  { animation:fadeIn  .75s ease both }
        .a-slideR  { animation:slideR  .85s cubic-bezier(.22,1,.36,1) both }
        .a-float   { animation:floatY  8.5s ease-in-out infinite }
        .a-ticker  { animation:ticker  30s linear infinite; display:flex; width:max-content }
        .a-dropIn  { animation:dropIn  .18s ease both }

        .d1{animation-delay:.08s}.d2{animation-delay:.16s}.d3{animation-delay:.24s}
        .d4{animation-delay:.32s}.d5{animation-delay:.4s}.d7{animation-delay:.56s}.d9{animation-delay:.72s}

        .grain-layer {
          position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.025;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          animation:grain 2.8s steps(1) infinite;
        }

        .ic {
          width:42px;height:42px;border-radius:9999px;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
          border:1.5px solid rgba(253,255,227,.22);color:#FDFFE3;
          transition:border-color .2s,background .2s,transform .18s;
        }
        .ic:hover{border-color:rgba(253,255,227,.6);background:rgba(253,255,227,.09);transform:translateY(-1px)}

        .nl{position:relative}
        .nl::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1.5px;background:#FDFFE3;transition:width .26s ease}
        .nl:hover::after{width:100%}

        .btn-shop{position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s}
        .btn-shop::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,.1);transform:translateX(-100%);transition:transform .3s ease}
        .btn-shop:hover::before{transform:translateX(0)}
        .btn-shop:hover{transform:scale(1.03);box-shadow:0 8px 24px rgba(0,97,49,.32)}

        .ts {text-shadow:0 2px 10px rgba(0,0,0,.34),0 6px 18px rgba(0,0,0,.22)}
        .ts2{text-shadow:0 1px 5px rgba(0,0,0,.24),0 3px 10px rgba(0,0,0,.14)}
        .ds {filter:drop-shadow(0 8px 22px rgba(0,0,0,.28)) drop-shadow(0 3px 10px rgba(0,0,0,.18))}
        .ds2{filter:drop-shadow(0 14px 38px rgba(0,0,0,.42)) drop-shadow(0 4px 14px rgba(0,0,0,.26))}
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-10 lg:px-16 py-5">
        <div className={`a-fadeIn shrink-0 ${mounted ? "" : "opacity-0"}`}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={56}
            className="h-10 sm:h-20 w-auto object-contain brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] scale-110 origin-left ds"
            priority
          />
        </div>

        <ul
          className={`hidden md:flex items-center gap-10 f-barlow font-semibold uppercase text-[#FDFFE3]/80 ts2 a-fadeIn d2 ${mounted ? "" : "opacity-0"}`}
          style={{ fontSize: 13, letterSpacing: "0.24em" }}
        >
          {NAV_LINKS.map((l) => {
            const isExternal = l.href.startsWith("http");
            return (
              <li key={l.label}>
                {isExternal ? (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nl hover:text-[#FDFFE3] transition-colors duration-200"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href} className="nl hover:text-[#FDFFE3] transition-colors duration-200">
                    {l.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className={`flex items-center gap-2 a-fadeIn d3 ${mounted ? "" : "opacity-0"}`}>
          <button onClick={() => setSearchOpen(true)} className="ic ds" aria-label="Search">
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/cart" className="ic ds relative" aria-label="Cart">
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FDFFE3] text-[#00612E] text-[10px] flex items-center justify-center font-bold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {mounted &&
            (user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-sm font-bold bg-[#FDFFE3] text-[#00612E] ds transition hover:scale-105 shrink-0"
                >
                  {avatarLetter}
                </button>

                {menuOpen && (
                  <div
                    className="a-dropIn absolute right-0 top-[52px] w-56 rounded-2xl overflow-hidden shadow-2xl border border-[#FDFFE3]/12 z-50"
                    style={{ background: "rgba(0,80,38,0.97)", backdropFilter: "blur(14px)" }}
                  >
                    <div className="px-4 py-3 border-b border-[#FDFFE3]/10">
                      <p className="text-sm font-semibold text-[#FDFFE3] truncate">{user.user_metadata?.full_name || "User"}</p>
                      <p className="text-xs text-[#FDFFE3]/50 truncate mt-0.5">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/adminPanel"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3] hover:bg-[#FDFFE3]/8 transition"
                      >
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3]/82 hover:bg-[#FDFFE3]/8 transition"
                    >
                      📦 My Orders
                    </Link>
                    <Link
                      href="/reviews"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3]/82 hover:bg-[#FDFFE3]/8 transition"
                    >
                      ⭐ Reviews
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#ffb3b3] hover:bg-[#FDFFE3]/8 transition"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ic f-barlow font-semibold uppercase text-[#FDFFE3]/88 ds"
                style={{ width: "auto", paddingInline: 16, fontSize: 11, letterSpacing: "0.22em" }}
              >
                Login
              </Link>
            ))}

          <button onClick={() => setMobileOpen((v) => !v)} className="ic md:hidden" aria-label="Menu">
            <div className="flex flex-col gap-[5px] w-5">
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div
          className="a-dropIn absolute top-[72px] left-3 right-3 z-40 rounded-3xl border border-[#FDFFE3]/12 p-4 md:hidden"
          style={{ background: "rgba(0, 80, 39, 0.58)", backdropFilter: "blur(14px)" }}
        >
          <ul className="space-y-1 mb-3">
            {NAV_LINKS.map((l) => {
              const isExternal = l.href.startsWith("http");
              return (
                <li key={l.label}>
                  {isExternal ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-4 py-3 f-barlow font-semibold uppercase text-[#FDFFE3]/75 hover:bg-[#FDFFE3]/8 hover:text-[#FDFFE3] transition"
                      style={{ fontSize: 13, letterSpacing: "0.2em" }}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-4 py-3 f-barlow font-semibold uppercase text-[#FDFFE3]/75 hover:bg-[#FDFFE3]/8 hover:text-[#FDFFE3] transition"
                      style={{ fontSize: 13, letterSpacing: "0.2em" }}
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="rounded-xl border border-[#FDFFE3]/12 py-3 text-center f-barlow text-sm text-[#FDFFE3]/78 hover:bg-[#FDFFE3]/8 transition"
            >
              🔍 Search
            </button>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-[#FDFFE3]/12 py-3 text-center f-barlow text-sm text-[#FDFFE3]/78 hover:bg-[#FDFFE3]/8 transition"
            >
              🛒 Cart {mounted && totalItems > 0 ? `(${totalItems})` : ""}
            </Link>
            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 rounded-xl bg-[#FDFFE3] py-3 text-center f-barlow text-sm font-semibold text-[#00612E] hover:opacity-90 transition"
              >
                Login
              </Link>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href="/adminPanel"
                    onClick={() => setMobileOpen(false)}
                    className="col-span-2 rounded-xl border border-[#FDFFE3]/10 py-3 text-center f-barlow text-sm text-[#FDFFE3]/78 hover:bg-[#FDFFE3]/8 transition"
                  >
                    ⚙️ Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="col-span-2 rounded-xl border border-[#FDFFE3]/10 py-3 f-barlow text-sm text-[#ffb3b3] hover:bg-[#FDFFE3]/8 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <section
        id="hero-section"
        className="relative w-full bg-[#5FAF7B] overflow-hidden flex flex-col"
        style={{ minHeight: "100svh" }}
      >
        <div className="absolute inset-0 z-0">
          <Image src="/hero.png" alt="" fill sizes="100vw" className="object-cover opacity-[0.12]" priority aria-hidden />
        </div>

        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 80% at 45% 55%, rgba(245,247,0,0.13) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 100% at 72% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.24) 100%)" }}
        />
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          <div className="grain-layer" />
        </div>

        <div
          className="absolute z-[2] pointer-events-none rounded-full hidden lg:block"
          style={{
            width: "420px",
            height: "420px",
            background: "radial-gradient(circle,rgba(245,247,0,0.06) 0%,transparent 70%)",
            top: "50%",
            left: "48%",
            transform: "translate(-50%,-50%)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1 px-5 sm:px-10 lg:px-16 pt-24 sm:pt-28 pb-10 gap-8 lg:gap-0">
          <div className="flex flex-col justify-center w-full lg:w-1/2 xl:w-[54%]">
            <p
              className={`f-barlow font-semibold text-[#FDFFE3]/58 uppercase mb-3 ts2 a-fadeUp ${mounted ? "" : "opacity-0"}`}
              style={{ fontSize: 12, letterSpacing: "0.44em" }}
            >
              Limited Edition Drops
            </p>

            <h1 className="f-anton text-[#FDFFE3] leading-[0.88] select-none ts">
              <span className={`block a-fadeUp d1 ${mounted ? "" : "opacity-0"}`} style={{ fontSize: "clamp(56px,10.5vw,144px)" }}>
                EXCLUSIVE
              </span>
              <span
                className={`block a-fadeUp d2 ${mounted ? "" : "opacity-0"}`}
                style={{ fontSize: "clamp(56px,10.5vw,144px)", WebkitTextStroke: "2px #FDFFE3", color: "transparent" }}
              >
                JERSEYS
              </span>
              <span className={`block a-fadeUp d3 ${mounted ? "" : "opacity-0"}`} style={{ fontSize: "clamp(56px,10.5vw,144px)" }}>
                FOR YOU
              </span>
            </h1>

            <p
              className={`f-bentham text-[#FDFFE3]/70 leading-relaxed max-w-sm mt-5 ts2 a-fadeUp d4 ${mounted ? "" : "opacity-0"}`}
              style={{ fontSize: "clamp(14px,1.35vw,18px)" }}
            >
              Premium quality jerseys inspired by your favourite teams.
              Style, comfort, and performance in one.
            </p>

            <div className={`flex flex-wrap items-center gap-4 mt-7 a-fadeUp d5 ${mounted ? "" : "opacity-0"}`}>
              <Link
                href="/category/top_pick"
                className="btn-shop flex items-center gap-3 bg-[#FDFFE3] text-[#00612E] f-bentham px-6 py-3.5 rounded-[50px] ds"
                style={{ fontSize: "clamp(15px,1.25vw,19px)" }}
              >
                <span>Shop Now</span>
                <span className="flex items-center justify-center bg-black rounded-full shrink-0" style={{ width: 34, height: 34 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="#FDFFE3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/reviews"
                className="f-barlow font-semibold text-[#FDFFE3]/48 hover:text-[#FDFFE3] transition-colors ts2 hidden sm:block"
                style={{ fontSize: 11, letterSpacing: "0.32em" }}
              >
                SEE REVIEWS →
              </Link>
            </div>

            <div className={`flex items-center gap-8 mt-8 a-fadeUp d7 ${mounted ? "" : "opacity-0"}`}>
              {[
                { val: "200+", label: "Styles" },
                { val: "50+", label: "Teams" },
                { val: "4.9★", label: "Rating" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="f-anton text-[#FDFFE3] ts" style={{ fontSize: "clamp(20px,2.3vw,30px)" }}>
                    {s.val}
                  </span>
                  <span className="f-barlow text-[#FDFFE3]/45 uppercase mt-0.5 ts2" style={{ fontSize: 10, letterSpacing: "0.28em" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`w-full lg:w-[44%] flex justify-center lg:justify-end items-end self-end a-slideR d3 ${mounted ? "" : "opacity-0"}`}>
            <div className="relative" style={{ width: "clamp(220px,36vw,520px)" }}>
              <Image
                src="/pic1.jpg"
                alt="Jersey Model"
                width={700}
                height={950}
                priority
                sizes="(max-width:768px) 78vw, 38vw"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "78svh",
                  objectFit: "contain",
                  objectPosition: "bottom center",
                  filter: "drop-shadow(0 14px 38px rgba(0,0,0,0.42)) drop-shadow(0 4px 14px rgba(0,0,0,0.24))",
                }}
              />

              <div className={`absolute top-[10%] -left-3 sm:-left-6 bg-[#FDFFE3] text-[#00612E] rounded-2xl px-3.5 py-2 ds a-fadeIn d9 ${mounted ? "" : "opacity-0"}`}>
                <p className="f-barlow font-semibold uppercase text-[#00612E]/52" style={{ fontSize: 9, letterSpacing: "0.2em" }}>
                  New Drop
                </p>
                <p className="f-anton text-[#00612E] leading-tight" style={{ fontSize: 16 }}>
                  World Cup26
                </p>
              </div>

              <div className={`absolute bottom-[16%] -right-2 sm:-right-5 bg-black/80 backdrop-blur-sm border border-[#FDFFE3]/10 text-[#FDFFE3] rounded-2xl px-3.5 py-2.5 ds a-fadeIn d9 ${mounted ? "" : "opacity-0"}`}>
                <p className="f-barlow uppercase text-[#FDFFE3]/45" style={{ fontSize: 9, letterSpacing: "0.22em" }}>
                  Starting from
                </p>
                <p className="f-anton text-[#FDFFE3] ts" style={{ fontSize: 22 }}>
                  1250Tk
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full border-t border-[#FDFFE3]/10 py-3 overflow-hidden mt-auto">
          <div className="a-ticker">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center">
                {["EXCLUSIVE DROP", "LIMITED EDITION", "PREMIUM JERSEYS", "FREE SHIPPING", "NEW SEASON", "WORLD CUP 26", "RETRO CLASSICS"].map((w, j) => (
                  <span key={`${i}-${j}`} className="flex items-center">
                    <span className="f-barlow text-[#FDFFE3]/36 uppercase whitespace-nowrap px-6 ts2" style={{ fontSize: 10, letterSpacing: "0.38em" }}>
                      {w}
                    </span>
                    <span className="text-[#FDFFE3]/18" style={{ fontSize: 10 }}>
                      ✦
                    </span>
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