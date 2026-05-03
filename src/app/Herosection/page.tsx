"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";


import HeroNav from "../component/heronav";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Barlow+Condensed:wght@400;500;600;700&family=Bentham&display=swap');
        .f-anton   { font-family:'Anton SC',sans-serif; }
        .f-barlow  { font-family:'Barlow Condensed',sans-serif; }
        .f-bentham { font-family:'Bentham',serif; }

        /* ── Smooth, GPU-friendly animations only ── */
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideR { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .a-up    { animation:fadeUp .65s cubic-bezier(.22,1,.36,1) both }
        .a-in    { animation:fadeIn .6s ease both }
        .a-right { animation:slideR .75s cubic-bezier(.22,1,.36,1) both }
        .a-float { animation:floatY 7s ease-in-out infinite }
        .a-tick  { animation:ticker 28s linear infinite; display:flex; width:max-content }

        .d1{animation-delay:.07s}.d2{animation-delay:.14s}.d3{animation-delay:.21s}
        .d4{animation-delay:.28s}.d5{animation-delay:.35s}.d7{animation-delay:.49s}.d9{animation-delay:.63s}

        /* No grain animation — static noise, much lighter */
        .noise-layer {
          position:absolute;inset:0;pointer-events:none;opacity:.04;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .btn-shop {
          position:relative;overflow:hidden;
          transition:transform .18s,box-shadow .18s;
        }
        .btn-shop:hover { transform:scale(1.03);box-shadow:0 8px 24px rgba(0,97,49,.3); }

        .ts  { text-shadow:0 2px 8px rgba(0,0,0,.3),0 5px 16px rgba(0,0,0,.18); }
        .ts2 { text-shadow:0 1px 4px rgba(0,0,0,.22); }
        .ds  { filter:drop-shadow(0 6px 18px rgba(0,0,0,.24)); }
        .ds2 { filter:drop-shadow(0 12px 32px rgba(0,0,0,.38)); }
      `}</style>
      <HeroNav/>

      <section
        id="hero-section"
        className="relative w-full overflow-hidden flex flex-col"
        style={{ minHeight: "100svh", background: "#5FAF7B" /* ← BG COLOR */ }}
      >
        {/* BG image — static, no animation */}
        <div className="absolute inset-0 z-0">
          <Image src="/hero.png" alt="" fill sizes="100vw"
            className="object-cover opacity-[0.11]" priority aria-hidden />
        </div>

        {/* Gradients */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 75% 75% at 45% 52%, rgba(245,247,0,0.11) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.18) 100%)" }} />

        {/* Static noise — no animation, GPU friendly */}
        <div className="noise-layer absolute inset-0 z-[2]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between flex-1
                        px-5 sm:px-10 lg:px-16
                        pt-20 sm:pt-24 pb-10
                        gap-6 lg:gap-0">

          {/* ── LEFT ── */}
          <div className="flex flex-col justify-center w-full lg:w-1/2 xl:w-[54%]">

            <p className={`f-barlow font-semibold text-[#FDFFE3]/55 uppercase mb-2 ts2 a-up ${mounted?"":"opacity-0"}`}
               style={{ fontSize: 11, letterSpacing: "0.44em" }}>
              Limited Edition Drops
            </p>

            <h1 className="f-anton text-[#FDFFE3] leading-[0.88] select-none ts">
              <span className={`block a-up d1 ${mounted?"":"opacity-0"}`}
                    style={{ fontSize: "clamp(54px,10vw,140px)" }}>EXCLUSIVE</span>
              <span className={`block a-up d2 ${mounted?"":"opacity-0"}`}
                    style={{ fontSize: "clamp(54px,10vw,140px)", WebkitTextStroke: "2px #FDFFE3", color: "transparent" }}>JERSEYS</span>
              <span className={`block a-up d3 ${mounted?"":"opacity-0"}`}
                    style={{ fontSize: "clamp(54px,10vw,140px)" }}>FOR YOU</span>
            </h1>

            <p className={`f-bentham text-[#FDFFE3]/68 leading-relaxed max-w-sm mt-4 ts2 a-up d4 ${mounted?"":"opacity-0"}`}
               style={{ fontSize: "clamp(14px,1.3vw,17px)" }}>
              Premium quality jerseys inspired by your favourite teams.
              Style, comfort, and performance in one.
            </p>

            <div className={`flex flex-wrap items-center gap-4 mt-6 a-up d5 ${mounted?"":"opacity-0"}`}>
              <Link href="/category/top_pick"
                className="btn-shop flex items-center gap-3 bg-[#FDFFE3] text-[#00612E] f-bentham px-6 py-3.5 rounded-[50px] ds"
                style={{ fontSize: "clamp(14px,1.2vw,18px)" }}>
                <span>Shop Now</span>
                <span className="flex items-center justify-center bg-black rounded-full shrink-0" style={{ width: 33, height: 33 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="#FDFFE3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>

              <Link href="/reviews"
                className="f-barlow font-semibold text-[#FDFFE3]/45 hover:text-[#FDFFE3] transition-colors ts2 hidden sm:block"
                style={{ fontSize: 11, letterSpacing: "0.32em" }}>
                SEE REVIEWS →
              </Link>
            </div>

            <div className={`flex items-center gap-8 mt-7 a-up d7 ${mounted?"":"opacity-0"}`}>
              {[{ val: "200+", label: "Styles" }, { val: "50+", label: "Teams" }, { val: "4.9★", label: "Rating" }].map(s => (
                <div key={s.label} className="flex flex-col">
                  <span className="f-anton text-[#FDFFE3] ts" style={{ fontSize: "clamp(19px,2.2vw,28px)" }}>{s.val}</span>
                  <span className="f-barlow text-[#FDFFE3]/42 uppercase mt-0.5 ts2" style={{ fontSize: 9, letterSpacing: "0.28em" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className={`w-full lg:w-[44%] flex justify-center lg:justify-end items-end self-end a-right d2 ${mounted?"":"opacity-0"}`}>
            <div className="relative a-float" style={{ width: "clamp(210px,34vw,500px)" }}>

              <Image src="/pic1.jpg" alt="Jersey Model" width={700} height={950} priority
                sizes="(max-width:768px) 75vw, 36vw"
                style={{
                  width: "100%", height: "auto", maxHeight: "76svh",
                  objectFit: "contain", objectPosition: "bottom center",
                  filter: "drop-shadow(0 12px 32px rgba(0,0,0,.38)) drop-shadow(0 3px 12px rgba(0,0,0,.22))",
                }} />

              {/* New Drop badge */}
              <div className={`absolute top-[10%] -left-3 sm:-left-5 bg-[#FDFFE3] text-[#00612E] rounded-2xl px-3.5 py-2 ds a-in d9 ${mounted?"":"opacity-0"}`}>
                <p className="f-barlow font-semibold uppercase text-[#00612E]/50" style={{ fontSize: 9, letterSpacing: "0.2em" }}>New Drop</p>
                <p className="f-anton text-[#00612E] leading-tight" style={{ fontSize: 15 }}>World Cup26</p>
              </div>

              {/* Price badge */}
              <div className={`bg-black absolute bottom-[15%] -right-2 sm:-right-4 bg-black/78 backdrop-blur-[6px] border border-[#FDFFE3]/10 text-[#FDFFE3] rounded-2xl px-3.5 py-2.5 ds a-in d9 ${mounted?"":"opacity-0"}`}>
                <p className="f-barlow uppercase text-[#FDFFE3]/42" style={{ fontSize: 9, letterSpacing: "0.22em" }}>Starting from</p>
                <p className="f-anton text-[#FDFFE3] ts" style={{ fontSize: 21 }}>1250Tk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative z-10 w-full border-t border-[#FDFFE3]/10 py-2.5 overflow-hidden mt-auto">
          <div className="a-tick">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center">
                {["EXCLUSIVE DROP","LIMITED EDITION","PREMIUM JERSEYS","FREE SHIPPING","NEW SEASON","WORLD CUP 26","RETRO CLASSICS"].map((w,j) => (
                  <span key={`${i}-${j}`} className="flex items-center">
                    <span className="f-barlow text-[#FDFFE3]/32 uppercase whitespace-nowrap px-6 ts2"
                          style={{ fontSize: 9, letterSpacing: "0.38em" }}>{w}</span>
                    <span className="text-[#FDFFE3]/15" style={{ fontSize: 9 }}>✦</span>
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