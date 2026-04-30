"use client";

import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1ZiA4jG1go/",
    short: "FB",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/valorex_offficial?igsh=MXZkY284d2kxOXEw",
    short: "IG",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0A7A3A] text-[#FDFFE3]">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="footer-glow footer-glow-1" />
        <div className="footer-glow footer-glow-2" />
        <div className="footer-glow footer-glow-3" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_18%,transparent_82%,rgba(0,0,0,0.08))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="group inline-flex items-center gap-3">
              <div className="relative rounded-2xl bg-white/10 p-2 shadow-[0_0_40px_rgba(255,255,255,0.10)] backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Valorex logo"
                  width={150}
                  height={54}
                  style={{ width: "auto", height: "auto" }}
                  className="brightness-0 invert"
                  priority
                />
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-6 text-[#FDFFE3]/75">
              Premium jerseys crafted for true fans. Style meets performance, with a clean
              finish that feels modern and bold.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs tracking-[0.22em] text-[#FDFFE3]/80 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#FDFFE3] shadow-[0_0_14px_rgba(253,255,227,0.75)] animate-pulse" />
              PREMIUM SPORTSWEAR
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FDFFE3]/70">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-[#FDFFE3]/80 transition-all duration-300 hover:translate-x-1 hover:text-white"
                  >
                    <span className="h-px w-4 bg-[#FDFFE3]/30 transition-all duration-300 group-hover:w-7 group-hover:bg-white" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FDFFE3]/70">
              Contact
            </h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/12">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#FDFFE3]/55">
                  Address
                </p>
                <p className="mt-2 text-sm leading-6 text-[#FDFFE3]/85">
                  House -14, Road No -5, Sector - 11, Uttara, Dhaka-1230
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/12">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#FDFFE3]/55">
                  Phone
                </p>
                <a
                  href="tel:01328388457"
                  className="mt-2 inline-block text-sm font-medium text-[#FDFFE3]/90 transition-colors hover:text-white"
                >
                  01328388457
                </a>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/12">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#FDFFE3]/55">
                  Email
                </p>
                <a
                  href="mailto:valorex.business@gmail.com"
                  className="mt-2 inline-block text-sm font-medium text-[#FDFFE3]/90 transition-colors hover:text-white"
                >
                  valorex.business@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FDFFE3]/70">
              Connect
            </h3>

            <div className="mt-5 flex gap-3">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="group inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-sm font-semibold text-[#FDFFE3]/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-white/16 hover:shadow-[0_0_30px_rgba(255,255,255,0.18)]"
                >
                  {item.short}
                </a>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#FDFFE3]/55">
                Location
              </p>
              <p className="mt-2 text-sm leading-6 text-[#FDFFE3]/85">
                Dhaka, Bangladesh
              </p>
            </div>

            <p className="mt-5 text-sm leading-6 text-[#FDFFE3]/70">
              Follow us for new drops, behind-the-scenes updates, and latest collections.
            </p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#FDFFE3]/55">
            © {new Date().getFullYear()} Valorex. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs text-[#FDFFE3]/55">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FDFFE3] animate-pulse" />
              Crafted for premium sportswear lovers
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(40px);
          opacity: 0.35;
          animation: floatGlow 9s ease-in-out infinite;
        }
        .footer-glow-1 {
          width: 18rem;
          height: 18rem;
          top: -4rem;
          left: -3rem;
          background: rgba(255, 255, 120, 0.12);
        }
        .footer-glow-2 {
          width: 16rem;
          height: 16rem;
          right: 10%;
          top: 20%;
          background: rgba(255, 255, 255, 0.08);
          animation-delay: 1.5s;
        }
        .footer-glow-3 {
          width: 22rem;
          height: 22rem;
          right: -6rem;
          bottom: -7rem;
          background: rgba(255, 255, 120, 0.1);
          animation-delay: 3s;
        }

        @keyframes floatGlow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-18px) translateX(10px) scale(1.05);
          }
        }
      `}</style>
    </footer>
  );
}