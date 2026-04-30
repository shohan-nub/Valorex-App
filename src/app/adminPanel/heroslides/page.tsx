'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { uploadToCloudinary } from '@/app/lib/supabase/cloudinary'

const CATEGORIES = [
  { value: 'top_pick', label: 'Top Pick',       emoji: '⭐' },
  { value: 'club',     label: 'Club',            emoji: '🏟️' },
  { value: 'retro',    label: 'Retro Classics',  emoji: '🕹️' },
  { value: 'national', label: 'National Pride',  emoji: '🌍' },
]

// Preset intervals the user can pick from
const INTERVAL_OPTIONS = [
  { label: '2s',  value: 2000  },
  { label: '3s',  value: 3000  },
  { label: '4s',  value: 4000  },
  { label: '5s',  value: 5000  },
  { label: '7s',  value: 7000  },
  { label: '10s', value: 10000 },
]

interface Slide {
  id: string
  image_url: string
  category: string
  sort_order: number
  is_active: boolean
  interval_ms: number | null
}

// ── Per-category upload form ──────────────────────────────────────────────────
function CategorySection({ cat }: { cat: typeof CATEGORIES[number] }) {
  const [slides, setSlides]         = useState<Slide[]>([])
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [intervalMs, setIntervalMs] = useState<number>(4000)

  useEffect(() => { fetchSlides() }, [])

  async function fetchSlides() {
    const supabase = createClient()
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('category', cat.value)
      .order('sort_order', { ascending: true })
    setSlides(data || [])
    setLoading(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleAdd() {
    if (!imageFile) return alert('Image select করো')
    setUploading(true)
    try {
      const { url } = await uploadToCloudinary(imageFile)
      const supabase = createClient()
      const { data } = await supabase
        .from('hero_slides')
        .insert({
          image_url: url,
          category: cat.value,
          sort_order: slides.length,
          interval_ms: intervalMs,
        })
        .select()
        .single()
      if (data) setSlides(prev => [...prev, data])
      setImageFile(null)
      setImagePreview(null)
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete করবে?')) return
    const supabase = createClient()
    await supabase.from('hero_slides').delete().eq('id', id)
    setSlides(prev => prev.filter(s => s.id !== id))
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('hero_slides').update({ is_active: !current }).eq('id', id)
    setSlides(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  async function updateInterval(id: string, ms: number) {
    const supabase = createClient()
    await supabase.from('hero_slides').update({ interval_ms: ms }).eq('id', id)
    setSlides(prev => prev.map(s => s.id === id ? { ...s, interval_ms: ms } : s))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#00612E]/5 to-transparent">
        <span className="text-xl">{cat.emoji}</span>
        <div>
          <h3 className="font-bold text-gray-800 text-base">{cat.label}</h3>
          <p className="text-xs text-gray-400">{slides.length} slide{slides.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Add new slide ── */}
        <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">নতুন Slide যোগ করো</p>
          <div className="flex items-start gap-4 flex-wrap">

            {/* Preview */}
            <div className="w-28 h-18 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0" style={{ height: 72 }}>
              {imagePreview ? (
                <Image src={imagePreview} alt="preview" width={112} height={72} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 text-2xl">🖼️</span>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
              {/* Image pick */}
              <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#00612E]/40 text-gray-700 text-sm px-3 py-2 rounded-lg transition w-fit">
                📎 Image বেছে নাও
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>

              {/* Interval selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Interval:</span>
                {INTERVAL_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setIntervalMs(opt.value)}
                    className="text-xs px-2.5 py-1 rounded-full border transition font-medium"
                    style={{
                      borderColor: intervalMs === opt.value ? '#00612E' : '#e5e7eb',
                      background:  intervalMs === opt.value ? '#00612E' : 'white',
                      color:       intervalMs === opt.value ? 'white'    : '#374151',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                disabled={uploading || !imageFile}
                className="bg-[#00612E] text-white text-sm px-5 py-2 rounded-lg hover:bg-[#00512a] transition disabled:opacity-40 w-fit"
              >
                {uploading ? 'Uploading...' : '+ Slide Add করো'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Existing slides ── */}
        {loading ? (
          <p className="text-xs text-gray-400">Loading...</p>
        ) : slides.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">এই category তে এখনো কোনো slide নেই।</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slides.map((slide, i) => (
              <div key={slide.id} className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                {/* Image */}
                <div className="relative w-full" style={{ height: 100 }}>
                  <Image src={slide.image_url} alt="slide" fill className="object-cover" />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    #{i + 1}
                  </div>
                </div>

                {/* Controls */}
                <div className="p-2 space-y-2">
                  {/* Interval pills */}
                  <div className="flex flex-wrap gap-1">
                    {INTERVAL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateInterval(slide.id, opt.value)}
                        className="text-[10px] px-1.5 py-0.5 rounded-full border transition"
                        style={{
                          borderColor: slide.interval_ms === opt.value ? '#00612E' : '#e5e7eb',
                          background:  slide.interval_ms === opt.value ? '#00612E' : '#f9fafb',
                          color:       slide.interval_ms === opt.value ? 'white'    : '#6b7280',
                        }}
                        title={`${opt.label} পর বদলাবে`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    {/* Active toggle */}
                    <button
                      onClick={() => toggleActive(slide.id, slide.is_active)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {slide.is_active ? '✓ Active' : 'Hidden'}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="text-[10px] text-red-400 hover:text-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main admin page ───────────────────────────────────────────────────────────
export default function HeroSlidesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hero Slides</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            প্রতিটা category র জন্য আলাদা slideshow ছবি ও time সেট করো
          </p>
        </div>
      </div>

      {/* One section per category */}
      <div className="space-y-6">
        {CATEGORIES.map(cat => (
          <CategorySection key={cat.value} cat={cat} />
        ))}
      </div>
    </div>
  )
}