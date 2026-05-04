'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useCart } from "../Cartcontext";
import { createClient } from "../lib/supabase/client";
import SearchModal from "../Searchmodal";

export default function HeroNav() {
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  const avatarLetter = (
    user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"
  ).toUpperCase();

  const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "National", href: "/category/national" },
    { label: "Top Pick", href: "/category/top_pick" },
    {
      label: "Customize",
      href: "https://wa.me/01612389216?text=Hi%20I%20want%20to%20customize%20a%20jersey%20from%20Your%20Premium%20shop",
    },
  ];

  const linkClass =
    "relative inline-flex items-center transition-all duration-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-[#FDFFE3] after:transition-all after:duration-300 hover:after:w-full";

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-5 sm:px-10 lg:px-16">
        <div className={`a-fadeIn shrink-0 ${mounted ? "" : "opacity-0"}`}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={56}
            className="ds h-10 w-auto origin-left scale-110 object-contain brightness-0 invert sepia saturate-[3] hue-rotate-[55deg] sm:h-20"
            priority
          />
        </div>

        <ul
          className={`f-barlow ts2 a-fadeIn d2 hidden items-center gap-10 font-semibold uppercase text-[#FDFFE3]/80 md:flex ${mounted ? "" : "opacity-0"}`}
          style={{ fontSize: 13, letterSpacing: "0.24em" }}
        >
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              {l.href.startsWith("http") ? (
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {l.label}
                </a>
              ) : (
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className={`a-fadeIn d3 flex items-center gap-2 ${mounted ? "" : "opacity-0"}`}>
          <button
            onClick={() => setSearchOpen(true)}
            className="ic ds"
            aria-label="Search"
          >
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
              <span className="absolute -top-1 -right-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FDFFE3] px-1 text-[10px] font-bold text-[#00612E]">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {mounted &&
            (user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="ds flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#FDFFE3] text-sm font-bold text-[#00612E] transition hover:scale-105"
                >
                  {avatarLetter}
                </button>

                {menuOpen && (
                  <div
                    className="a-dropIn absolute right-0 top-[52px] z-50 w-56 overflow-hidden rounded-2xl border border-[#FDFFE3]/12 shadow-2xl"
                    style={{
                      background: "rgba(0,80,38,0.97)",
                      backdropFilter: "blur(14px)",
                    }}
                  >
                    <div className="border-b border-[#FDFFE3]/10 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#FDFFE3]">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#FDFFE3]/50">
                        {user.email}
                      </p>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/adminPanel"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3] transition hover:bg-[#FDFFE3]/8"
                      >
                        ⚙️ Admin Panel
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#FDFFE3]/82 transition hover:bg-[#FDFFE3]/8"
                    >
                      📦 My Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#ffb3b3] transition hover:bg-[#FDFFE3]/8"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ic f-barlow ds inline-flex items-center justify-center px-4 font-semibold uppercase text-[#FDFFE3]/88"
                style={{ width: "auto", fontSize: 11, letterSpacing: "0.22em" }}
              >
                Login
              </Link>
            ))}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="ic md:hidden"
            aria-label="Menu"
          >
            <div className="flex w-5 flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-[1.5px] rounded bg-[#FDFFE3] transition-all duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="a-dropIn absolute left-3 right-3 top-[72px] z-40 rounded-3xl border border-[#FDFFE3]/12 p-4 md:hidden"
          style={{
            background: "rgba(0, 80, 39, 0.58)",
            backdropFilter: "blur(14px)",
          }}
        >
          <ul className="mb-3 space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                {l.href.startsWith("http") ? (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 f-barlow font-semibold uppercase text-[#FDFFE3]/75 transition-all duration-300 hover:bg-[#FDFFE3]/10 hover:text-white"
                    style={{ fontSize: 13, letterSpacing: "0.2em" }}
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 f-barlow font-semibold uppercase text-[#FDFFE3]/75 transition-all duration-300 hover:bg-[#FDFFE3]/10 hover:text-white"
                    style={{ fontSize: 13, letterSpacing: "0.2em" }}
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-[#FDFFE3]/12 px-4 py-3 text-center text-sm font-semibold text-[#FDFFE3] transition hover:bg-[#FDFFE3]/10"
            >
              🛒 Cart
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="rounded-xl border border-[#FDFFE3]/12 px-4 py-3 text-center text-sm font-semibold text-[#ffb3b3] transition hover:bg-[#FDFFE3]/10"
              >
                🚪 Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-[#FDFFE3]/12 px-4 py-3 text-center text-sm font-semibold text-[#FDFFE3] transition hover:bg-[#FDFFE3]/10"
              >
                Login
              </Link>
            )}
          </div>

          {user && isAdmin && (
            <Link
              href="/adminPanel"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-xl border border-[#FDFFE3]/12 px-4 py-3 text-center text-sm font-semibold text-[#FDFFE3] transition hover:bg-[#FDFFE3]/10"
            >
              ⚙️ Admin Panel
            </Link>
          )}
        </div>
      )}
    </>
  );
}