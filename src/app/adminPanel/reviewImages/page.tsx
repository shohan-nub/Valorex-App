'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { uploadToCloudinary } from '@/app/lib/supabase/cloudinary'

interface Product { id: string; name: string }
interface ReviewImage {
  id: string
  image_url: string
  caption: string | null
  product_id: string | null
  is_active: boolean
  created_at: string
}

export default function AdminReviewImagesPage() {
  const [images, setImages]       = useState<ReviewImage[]>([])
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)

  // form state
  const [file, setFile]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [caption, setCaption]     = useState('')
  const [productId, setProductId] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const supabase = createClient()
    const [{ data: imgs }, { data: prods }] = await Promise.all([
      supabase.from('review_images').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name').eq('is_active', true).order('name'),
    ])
    setImages((imgs as ReviewImage[]) || [])
    setProducts((prods as Product[]) || [])
    setLoading(false)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file) return alert('ছবি বেছে নাও')
    setUploading(true)
    try {
      const { url } = await uploadToCloudinary(file)
      const supabase = createClient()
      const { data } = await supabase
        .from('review_images')
        .insert({ image_url: url, caption: caption || null, product_id: productId || null })
        .select()
        .single()
      if (data) setImages(prev => [data, ...prev])
      setFile(null)
      setPreview(null)
      setCaption('')
      setProductId('')
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('review_images').update({ is_active: !current }).eq('id', id)
    setImages(prev => prev.map(img => img.id === id ? { ...img, is_active: !current } : img))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete করবে?')) return
    const supabase = createClient()
    await supabase.from('review_images').delete().eq('id', id)
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Review Images</h2>
        <p className="text-sm text-gray-400 mt-0.5">Customer review এর ছবি আপলোড করো — homepage ও review page এ দেখাবে</p>
      </div>

      {/* ── Upload form ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">নতুন Review Image যোগ করো</p>
        <div className="flex items-start gap-5 flex-wrap">

          {/* Preview */}
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0">
            {preview ? (
              <Image src={preview} alt="preview" width={128} height={128} className="w-full h-full object-cover"/>
            ) : (
              <span className="text-gray-300 text-3xl">🖼️</span>
            )}
          </div>

          <div className="flex flex-col gap-3 flex-1 min-w-[220px]">
            {/* File pick */}
            <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-[#00612E]/40 text-gray-700 text-sm px-4 py-2 rounded-xl transition w-fit">
              📎 ছবি বেছে নাও
              <input type="file" accept="image/*" className="hidden" onChange={handleFile}/>
            </label>

            {/* Caption */}
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Caption (optional) — e.g. 'Looks amazing!'"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00612E]/50 bg-white"
            />

            {/* Link to product */}
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00612E]/50 bg-white"
            >
              <option value="">Product link করো (optional)</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="bg-[#00612E] text-white text-sm px-5 py-2.5 rounded-xl hover:bg-[#00512a] transition disabled:opacity-40 w-fit font-medium"
            >
              {uploading ? 'Uploading…' : '+ Upload করো'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Image grid ── */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
          এখনো কোনো ছবি নেই।
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative" style={{ aspectRatio: '1/1' }}>
                <Image src={img.image_url} alt="review" fill sizes="(max-width:640px) 50vw,25vw" className="object-cover"/>
                {!img.is_active && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold tracking-widest uppercase">Hidden</span>
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                {img.caption && <p className="text-xs text-gray-600 line-clamp-2">{img.caption}</p>}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleActive(img.id, img.is_active)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${img.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {img.is_active ? '✓ Active' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
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
  )
}