'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: string
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /* focus input when opened */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
      setQuery('')
      setResults([])
    }
  }, [open])

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  /* search */
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timeout = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(8)
      setResults((data as Product[]) || [])
      setLoading(false)
    }, 280)
    return () => clearTimeout(timeout)
  }, [query])

  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes searchIn {
          from { opacity:0; transform: scale(0.97) translateY(-12px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        .search-modal { animation: searchIn 0.25s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        {/* Modal box */}
        <div
          className="search-modal w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(0,97,46,0.97)', border: '1px solid rgba(253,255,227,0.14)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Input row */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#FDFFE3]/10">
            <svg width="18" height="18" fill="none" stroke="#FDFFE3" strokeWidth="1.8" viewBox="0 0 24 24" className="shrink-0 opacity-60">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search jerseys, clubs, nations…"
              className="flex-1 bg-transparent text-[#FDFFE3] placeholder-[#FDFFE3]/40 text-base outline-none font-barlow tracking-wide"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#FDFFE3]/40 hover:text-[#FDFFE3] transition text-xl leading-none">×</button>
            )}
            <button onClick={onClose} className="text-[#FDFFE3]/40 hover:text-[#FDFFE3] transition text-sm font-barlow tracking-widest uppercase ml-1">
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <div className="w-7 h-7 rounded-full border-2 border-[#FDFFE3]/20 border-t-[#FDFFE3] animate-spin"/>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="font-barlow text-[#FDFFE3]/40 tracking-widest uppercase text-sm">No results for "{query}"</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul className="py-2">
                {results.map(p => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-[#FDFFE3]/8 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#FDFFE3]/10">
                        <Image src={p.image_url} alt={p.name} fill sizes="48px" className="object-cover"/>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[#FDFFE3] text-sm font-barlow font-semibold tracking-wide truncate group-hover:text-white transition">
                          {p.name}
                        </p>
                        <p className="text-[#FDFFE3]/50 text-xs capitalize tracking-wider mt-0.5">
                          {p.category.replace('_', ' ')}
                        </p>
                      </div>
                      {/* Price */}
                      <span className="font-barlow font-bold text-[#FDFFE3] text-base shrink-0">
                        ৳{p.price.toLocaleString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!query && (
              <div className="py-10 text-center">
                <p className="font-barlow text-[#FDFFE3]/30 tracking-[4px] uppercase text-xs">Type to search products</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}