'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'

interface CategorySlide {
  id: string
  image_url: string
  category: string
  interval_ms: number | null
}

interface CategorySlideshowProps {
  categorySlug: string
  categoryLabel: string
}

export default function CategorySlideshow({ categorySlug, categoryLabel }: CategorySlideshowProps) {
  const [slides, setSlides] = useState<CategorySlide[]>([])
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase
        .from('hero_slides')
        .select('id, image_url, category, interval_ms')
        .eq('category', categorySlug)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      setSlides(data || [])
    }
    fetch()
  }, [categorySlug])

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = slides[current]?.interval_ms ?? 4000
    setProgress(0)

    // Progress bar animation
    const step = 50
    const increment = (step / interval) * 100
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + increment, 100))
    }, step)

    // Slide change
    timerRef.current = setTimeout(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, interval)

    return () => {
      if (progressRef.current) clearInterval(progressRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [slides, current])

  if (slides.length === 0) {
    // Fallback: simple label pill
    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-[#00612E]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00612E]/50">
          Featured edit
        </span>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-4" style={{ height: '200px' }}>
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.image_url}
            alt={categoryLabel}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
        </div>
      ))}

      {/* Category label overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60 mb-0.5">Featured edit</p>
        <h2 className="text-lg font-bold text-white">{categoryLabel}</h2>

        {/* Progress bar */}
        {slides.length > 1 && (
          <div className="mt-2 h-[2px] w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setProgress(0) }}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? '16px' : '6px',
                height: '6px',
                background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}