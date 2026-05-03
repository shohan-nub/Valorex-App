'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useCart } from "../Cartcontext";
import { createClient } from "../lib/supabase/client";
import SearchModal from "../Searchmodal";

export default function Navbar() {
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
    async function load() {
      const { data } = await supabase.auth.getUser();
      const u = data.user ?? null;
      setUser(u);
      setIsAdmin(u?.app_metadata?.role === "admin");
    }
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
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
    { label: "Customize", href: "https://wa.me/01612389216?text=Hi%20I%20want%20to%20customize%20a%20jersey%20from%20Your%20Premium%20shop" },
  ];

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* NAVBAR - Absolute positioned for transparency */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 lg:px-16 py-5">
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

        <ul className={`hidden md:flex items-center gap-10 f-barlow font-semibold uppercase text-[#FDFFE3]/80 ts2 a-fadeIn d2 ${mounted ? "" : "opacity-0"}`} style={{ fontSize: 13, letterSpacing: "0.24em" }}>
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              {l.href.startsWith("http") ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="nl hover:text-[#FDFFE3] transition-colors duration-200">{l.label}</a>
              ) : (
                <Link href={l.href} className="nl hover:text-[#FDFFE3] transition-colors duration-200">{l.label}</Link>
              )}
            </li>
          ))}
        </ul>

        <div className={`flex items-center gap-2 a-fadeIn d3 ${mounted ? "" : "opacity-0"}`}>
          <button onClick={() => setSearchOpen(true)} className="ic ds" aria-label="Search">
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/cart" className="ic ds relative" aria-label="Cart">
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FDFFE3] text-[#00612E] text-[10px] flex items-center justify-center font-bold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {mounted && (user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setMenuOpen((v) => !v)} className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-sm font-bold bg-[#FDFFE3] text-[#00612E] ds transition hover:scale-105 shrink-0">
                {avatarLetter}
              </button>
              {menuOpen && (
                <div className="a-dropIn absolute right-0 top-[52px] w-56 rounded-2xl overflow-hidden shadow-2xl border border-[#FDFFE3]/12 z-50" style={{ background: "rgba(0,80,38,0.97)", backdropFilter: "blur(14px)" }}>
                  <div className="px-4 py-3 border-b border-[#FDFFE3]/10">
                    <p className="text-sm font-semibold text-[#FDFFE3] truncate">{user.user_metadata?.full_name || "User"}</p>
                    <p className="text-xs text-[#FDFFE3]/50 truncate mt-0.5">{user.email}</p>
                  </div>
                  {isAdmin && <Link href="/adminPanel" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3] hover:bg-[#FDFFE3]/8 transition">⚙️ Admin Panel</Link>}
                  <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3]/82 hover:bg-[#FDFFE3]/8 transition">📦 My Orders</Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#ffb3b3] hover:bg-[#FDFFE3]/8 transition">🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="ic f-barlow font-semibold uppercase text-[#FDFFE3]/88 ds" style={{ width: "auto", paddingInline: 16, fontSize: 11, letterSpacing: "0.22em" }}>Login</Link>
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
        <div className="a-dropIn absolute top-[72px] left-3 right-3 z-40 rounded-3xl border border-[#FDFFE3]/12 p-4 md:hidden" style={{ background: "rgba(0, 80, 39, 0.58)", backdropFilter: "blur(14px)" }}>
          <ul className="space-y-1 mb-3">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 f-barlow font-semibold uppercase text-[#FDFFE3]/75 hover:bg-[#FDFFE3]/8 hover:text-[#FDFFE3] transition" style={{ fontSize: 13, letterSpacing: "0.2em" }}>{l.label}</Link>
              </li>
            ))}
          </ul>
          {/* ... Cart/Login buttons inside mobile menu as per your original code ... */}
        </div>
      )}
    </>
  );
}