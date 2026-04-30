'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

interface Slide {
  id: string
  image_url: string
  category: string
  interval_ms?: number | null
}

interface HeroSlideshowProps {
  /** Global fallback interval in ms — overridden per-slide if slide.interval_ms is set */
  defaultInterval?: number
}

export default function HeroSlideshow({ defaultInterval = 3500 }: HeroSlideshowProps) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    async function fetchSlides() {
      const supabase = createClient()
      const { data } = await supabase
        .from('hero_slides')
        .select('id, image_url, category, interval_ms')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      setSlides(data || [])
    }
    fetchSlides()
  }, [])

  // Auto slide — uses per-slide interval_ms or falls back to defaultInterval
  useEffect(() => {
    if (slides.length <= 1) return
    const interval = slides[current]?.interval_ms ?? defaultInterval
    const timer = setTimeout(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, interval)
    return () => clearTimeout(timer)
  }, [slides, current, defaultInterval])

  if (slides.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ height: '100svh' }}>

      {/* Slides */}
      {slides.map((slide, i) => (
        <Link
          key={slide.id}
          href={`/category/${slide.category}`}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
        >
          <Image
            src={slide.image_url}
            alt={slide.category}
            fill
            sizes="100vw"
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
        </Link>
      ))}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent(prev => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}