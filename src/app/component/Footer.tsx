"use client";

import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Home",       href: "/"          },
  { label: "Collection", href: "/products"  },
  { label: "About",      href: "/about"     },
  { label: "Contact",    href: "/contact"   },
  { label: "Reviews",    href: "/reviews"   },
];

const socials = [
  {
    label: "Facebook",
    href:  "https://www.facebook.com/share/1ZiA4jG1go/",
    icon:  "/facebook.png",
  },
  {
    label: "Instagram",
    href:  "https://www.instagram.com/valorex_offficial?igsh=MXZkY284d2kxOXEw",
    icon:  "/instagram.png",
  },
];

/* ── colours derived from #AAB99A ── */
const C = {
  bg:       "#AAB99A",          /* ← MAIN BG — change here */
  bgDeep:   "#96a888",          /* slightly darker for depth */
  text:     "#1a2614",          /* deep forest text           */
  textSoft: "rgba(26,38,20,.6)",
  white:    "#FDFFE3",
  border:   "rgba(26,38,20,.12)",
  card:     "rgba(255,255,255,.18)",
  cardHov:  "rgba(255,255,255,.28)",
};

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: C.bg, color: C.text }}
    >
      <style>{`
        /* noise texture overlay */
        .ft-noise::before {
          content:'';
          position:absolute;inset:0;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity:.04;z-index:0;
        }
        @keyframes ftFloat {
          0%,100%{transform:translateY(0) scale(1)}
          50%    {transform:translateY(-14px) scale(1.04)}
        }
        .ft-glow { animation:ftFloat 10s ease-in-out infinite; }
        .ft-glow2{ animation:ftFloat 13s ease-in-out infinite; animation-delay:2s; }
        .ft-glow3{ animation:ftFloat 8s  ease-in-out infinite; animation-delay:4s; }

        .ft-link {
          position:relative;
          transition:color .22s,transform .22s;
        }
        .ft-link::after {
          content:'';position:absolute;bottom:-2px;left:0;
          width:0;height:1px;
          background:${C.text};
          transition:width .25s;
        }
        .ft-link:hover { color:${C.text} !important; transform:translateX(4px); }
        .ft-link:hover::after { width:100%; }

        .ft-card {
          background:${C.card};
          border:1px solid ${C.border};
          border-radius:18px;
          padding:16px;
          backdrop-filter:blur(8px);
          transition:background .25s, transform .25s, box-shadow .25s;
        }
        .ft-card:hover {
          background:${C.cardHov};
          transform:translateY(-3px);
          box-shadow:0 12px 32px rgba(0,0,0,.10);
        }

        .ft-social {
          width:52px;height:52px;border-radius:16px;
          display:flex;align-items:center;justify-content:center;
          background:${C.card};
          border:1px solid ${C.border};
          backdrop-filter:blur(8px);
          transition:background .22s,transform .22s,box-shadow .22s;
          overflow:hidden;
        }
        .ft-social:hover {
          background:${C.cardHov};
          transform:translateY(-4px) scale(1.08);
          box-shadow:0 10px 28px rgba(0,0,0,.14);
        }

        .ft-divider { background:${C.border}; height:1px; }
        .ft-pulse   { animation:pulse 2.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      {/* ── Ambient glows ── */}
      <div className="ft-noise pointer-events-none absolute inset-0 z-0">
        <div className="ft-glow  absolute -top-20 -left-16 w-72 h-72 rounded-full opacity-30"
             style={{background:"radial-gradient(circle,rgba(255,255,200,.45) 0%,transparent 70%)"}}/>
        <div className="ft-glow2 absolute top-1/3 right-10 w-56 h-56 rounded-full opacity-20"
             style={{background:"radial-gradient(circle,rgba(255,255,255,.5) 0%,transparent 70%)"}}/>
        <div className="ft-glow3 absolute -bottom-16 right-0 w-80 h-80 rounded-full opacity-25"
             style={{background:"radial-gradient(circle,rgba(255,255,200,.35) 0%,transparent 70%)"}}/>
        {/* diagonal lines — premium texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diag" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="24" stroke={C.text} strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)"/>
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-10 lg:px-16 pt-16 pb-10">

        {/* TOP: logo + tagline spanning full width */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-10"
             style={{borderBottom:`1px solid ${C.border}`}}>

          {/* Logo */}
          <div className="flex flex-col gap-4">
            <div className="relative w-fit rounded-2xl overflow-hidden"
                 style={{background:"rgba(255,255,255,.22)",padding:"10px 16px",backdropFilter:"blur(10px)",border:`1px solid ${C.border}`}}>
              <Image src="/v2.png" alt="Valorex" width={256} height={120}
                className="h-20 w-auto object-contain" priority/>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{color:C.textSoft}}>
              Premium jerseys crafted for true fans. Style meets performance — bold, clean, and iconic.
            </p>
            {/* live badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                 style={{background:"rgba(255,255,255,.22)",border:`1px solid ${C.border}`,letterSpacing:'0.22em',color:C.text}}>
              <span className="ft-pulse w-2 h-2 rounded-full" style={{background:C.text}}/>
              PREMIUM SPORTSWEAR
            </div>
          </div>

          {/* Big brand name */}
          <div className="hidden lg:block select-none opacity-10"
               style={{fontFamily:"'Anton SC',sans-serif",fontSize:96,lineHeight:1,color:C.text,letterSpacing:'-2px'}}>
            VALOREX
          </div>
        </div>

        {/* GRID */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Navigation */}
          <div>
            <h3 className="text-[10px] font-bold uppercase mb-5"
                style={{color:C.textSoft,letterSpacing:'0.38em'}}>Navigation</h3>
            <ul className="space-y-3">
              {navLinks.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="ft-link text-sm font-medium"
                        style={{color:C.textSoft}}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-[10px] font-bold uppercase mb-5"
                style={{color:C.textSoft,letterSpacing:'0.38em'}}>Contact</h3>
            <div className="space-y-3">
              <div className="ft-card">
                <p className="text-[10px] uppercase font-semibold mb-1" style={{color:C.textSoft,letterSpacing:'0.28em'}}>Address</p>
                <p className="text-sm leading-5" style={{color:C.text}}>House-14, Road-5, Sector-11, Uttara, Dhaka-1230</p>
              </div>
              <div className="ft-card">
                <p className="text-[10px] uppercase font-semibold mb-1" style={{color:C.textSoft,letterSpacing:'0.28em'}}>Phone</p>
                <a href="tel:01328388457" className="text-sm font-medium hover:underline" style={{color:C.text}}>01328388457</a>
              </div>
              <div className="ft-card">
                <p className="text-[10px] uppercase font-semibold mb-1" style={{color:C.textSoft,letterSpacing:'0.28em'}}>Email</p>
                <a href="mailto:valorex.business@gmail.com" className="text-sm font-medium hover:underline break-all" style={{color:C.text}}>
                  valorex.business@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Social + Location */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-[10px] font-bold uppercase mb-5"
                style={{color:C.textSoft,letterSpacing:'0.38em'}}>Connect</h3>

            {/* Social icons with image */}
            <div className="flex gap-3 mb-6">
              {socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                   aria-label={s.label} className="ft-social">
                  <Image src={s.icon} alt={s.label} width={28} height={28}
                    className="w-7 h-7 object-contain"/>
                </a>
              ))}
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{color:C.textSoft}}>
              Follow us for new drops, behind-the-scenes updates, and the latest collections.
            </p>

            {/* Location card */}
            <div className="ft-card flex items-start gap-3">
              <span style={{fontSize:20}}>📍</span>
              <div>
                <p className="text-[10px] uppercase font-semibold mb-0.5" style={{color:C.textSoft,letterSpacing:'0.28em'}}>Location</p>
                <p className="text-sm" style={{color:C.text}}>Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="ft-divider mt-12 mb-6"/>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{color:C.textSoft}}>
            © {new Date().getFullYear()} Valorex. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs" style={{color:C.textSoft}}>
            <span className="ft-pulse w-1.5 h-1.5 rounded-full inline-block" style={{background:C.text}}/>
            Crafted for premium sportswear lovers
          </div>
        </div>
      </div>
    </footer>
  );
}