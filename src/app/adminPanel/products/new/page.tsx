'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadToCloudinary } from '../../../lib/supabase/cloudinary'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'

const CATEGORIES = [
  { value: 'top_pick', label: 'Top Pick' },
  { value: 'club', label: 'Club' },
  { value: 'retro', label: 'Retro' },
  { value: 'national', label: 'National' },
]

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

interface FormState {
  name: string
  description: string
  desc_section1_title: string
  desc_section1_body: string
  desc_section2_title: string
  desc_section2_body: string
  desc_section3_title: string
  desc_section3_body: string
  sale_price: string
  original_price: string
  full_sleeve_extra_price: string
  categories: string[]
  stock: string
  sizes: string[]
}

const INIT: FormState = {
  name: '',
  description: '',
  desc_section1_title: '',
  desc_section1_body: '',
  desc_section2_title: '',
  desc_section2_body: '',
  desc_section3_title: '',
  desc_section3_body: '',
  sale_price: '',
  original_price: '',
  full_sleeve_extra_price: '',
  categories: [],
  stock: '',
  sizes: [],
}

/* ── tiny rich-text toolbar ── */
function RichTextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  function wrap(tag: string) {
    const ta = document.getElementById(id) as HTMLTextAreaElement | null
    if (!ta) return

    const { selectionStart: s, selectionEnd: e, value: v } = ta
    const selected = v.slice(s, e)
    if (!selected) return

    const wrapped = tag === 'b' ? `**${selected}**` : tag === 'i' ? `_${selected}_` : selected
    const next = v.slice(0, s) + wrapped + v.slice(e)

    onChange(next)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(s, s + wrapped.length)
    }, 0)
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-1 mb-1.5">
        <button
          type="button"
          onClick={() => wrap('b')}
          className="px-2.5 py-1 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-100 transition"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => wrap('i')}
          className="px-2.5 py-1 text-xs italic border border-gray-200 rounded-lg hover:bg-gray-100 transition"
        >
          I
        </button>
        <span className="text-[10px] text-gray-400 ml-1">Select text then click</span>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00612E]/50 focus:ring-2 focus:ring-[#00612E]/8 transition resize-none"
      />
      <p className="text-[10px] text-gray-400 mt-1">**bold** _italic_ supported</p>
    </div>
  )
}

export default function AddProductPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState<FormState>(INIT)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [extraFiles, setExtraFiles] = useState<File[]>([])
  const [extraPreviews, setExtraPreviews] = useState<string[]>([])
  const [extraUrls, setExtraUrls] = useState<string[]>([])
  const [uploadingExtra, setUploadingExtra] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(p => ({ ...p, [key]: val }))
  }

  function toggleCategory(cat: string) {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter(c => c !== cat)
        : [...p.categories, cat],
    }))
  }

  function toggleSize(size: string) {
    setForm(p => ({
      ...p,
      sizes: p.sizes.includes(size) ? p.sizes.filter(s => s !== size) : [...p.sizes, size],
    }))
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function handleExtraChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setExtraFiles(files)
    setExtraPreviews(files.map(f => URL.createObjectURL(f)))
    setExtraUrls([])
  }

  async function handleUploadExtra() {
    if (!extraFiles.length) return
    setUploadingExtra(true)
    try {
      const urls = await Promise.all(extraFiles.map(f => uploadToCloudinary(f).then(r => r.url)))
      setExtraUrls(urls)
    } catch {
      alert('Image upload failed')
    } finally {
      setUploadingExtra(false)
    }
  }

  function removeExtra(i: number) {
    setExtraFiles(p => p.filter((_, j) => j !== i))
    setExtraPreviews(p => p.filter((_, j) => j !== i))
    setExtraUrls(p => p.filter((_, j) => j !== i))
  }

  async function handleSubmit() {
    setError('')
    if (!form.name.trim() || !form.sale_price || !form.stock) {
      setError('Name, sale price ও stock দেওয়া দরকার.')
      return
    }
    if (form.categories.length === 0) {
      setError('অন্তত একটি category select করো.')
      return
    }
    if (!coverFile) {
      setError('Cover image select করো.')
      return
    }

    setLoading(true)
    try {
      const { url: coverUrl, public_id } = await uploadToCloudinary(coverFile)

      let finalExtras = extraUrls
      if (extraFiles.length && !extraUrls.length) {
        finalExtras = await Promise.all(extraFiles.map(f => uploadToCloudinary(f).then(r => r.url)))
      }

      const { error: dbErr } = await supabase.from('products').insert({
        name: form.name.trim(),
        description: form.description.trim() || null,

        desc_section1_title: form.desc_section1_title.trim() || null,
        desc_section1_body: form.desc_section1_body.trim() || null,

        desc_section2_title: form.desc_section2_title.trim() || null,
        desc_section2_body: form.desc_section2_body.trim() || null,

        desc_section3_title: form.desc_section3_title.trim() || null,
        desc_section3_body: form.desc_section3_body.trim() || null,

        price: parseFloat(form.sale_price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        full_sleeve_extra_price: parseFloat(form.full_sleeve_extra_price || '0'),
        category: form.categories[0],
        categories: form.categories,
        stock: parseInt(form.stock, 10),
        sizes: form.sizes,
        image_url: coverUrl,
        extra_images: finalExtras,
        cloudinary_public_id: public_id,
        is_active: true,
      })

      if (dbErr) throw dbErr
      router.push('/adminPanel/products')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inp =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00612E]/50 focus:ring-2 focus:ring-[#00612E]/8 transition'
  const lbl = 'block text-sm font-semibold text-gray-700 mb-1.5'

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 transition">
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Add Product</h2>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        {/* Cover image */}
        <div>
          <label className={lbl}>
            Cover Image <span className="text-red-400">*</span>
          </label>
          <label className="block cursor-pointer">
            {coverPreview ? (
              <div className="group relative h-52 w-full overflow-hidden rounded-2xl border border-gray-200">
                <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="text-sm font-medium text-white">Change Image</span>
                </div>
              </div>
            ) : (
              <div className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 transition hover:border-[#00612E]/40">
                <span className="text-3xl">🖼️</span>
                <span className="text-sm text-gray-400">Click to upload cover image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </label>
        </div>

        {/* Extra images */}
        <div>
          <label className={lbl}>
            Extra Images <span className="text-xs font-normal text-gray-400 ml-1">Gallery এর জন্য</span>
          </label>
          <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition">
            📁 Select Images
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleExtraChange} />
          </label>

          {extraPreviews.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {extraPreviews.map((src, i) => (
                  <div key={i} className="group relative">
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200">
                      <Image src={src} alt="" fill className="object-cover" />
                      {extraUrls[i] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                          <span className="text-green-600 text-lg">✓</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExtra(i)}
                      className="absolute -right-1.5 -top-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {extraUrls.length === 0 && (
                <button
                  type="button"
                  onClick={handleUploadExtra}
                  disabled={uploadingExtra}
                  className="rounded-xl bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {uploadingExtra ? 'Uploading...' : `Upload ${extraFiles.length} image${extraFiles.length > 1 ? 's' : ''}`}
                </button>
              )}

              {extraUrls.length > 0 && <p className="text-xs font-medium text-green-600">✓ {extraUrls.length} uploaded</p>}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Name */}
        <div>
          <label className={lbl}>
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Barcelona Home Jersey 2024"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            className={inp}
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={lbl}>
              Sale Price (৳) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="1250"
              value={form.sale_price}
              onChange={e => setField('sale_price', e.target.value)}
              className={inp}
            />
            <p className="mt-1 text-[10px] text-gray-400">এটাই দেখাবে বড় করে</p>
          </div>
          <div>
            <label className={lbl}>Original Price (৳)</label>
            <input
              type="number"
              min="0"
              placeholder="1500"
              value={form.original_price}
              onChange={e => setField('original_price', e.target.value)}
              className={inp}
            />
            <p className="mt-1 text-[10px] text-gray-400">Crossed-out দেখাবে (optional)</p>
          </div>
          <div>
            <label className={lbl}>Full Sleeve Extra (৳)</label>
            <input
              type="number"
              min="0"
              placeholder="100"
              value={form.full_sleeve_extra_price}
              onChange={e => setField('full_sleeve_extra_price', e.target.value)}
              className={inp}
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className={lbl}>
            Stock <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={form.stock}
            onChange={e => setField('stock', e.target.value)}
            className={inp}
          />
        </div>

        {/* Categories */}
        <div>
          <label className={lbl}>
            Categories <span className="text-red-400">*</span>{' '}
            <span className="text-xs font-normal text-gray-400 ml-1">একাধিক select করা যাবে</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleCategory(c.value)}
                className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  form.categories.includes(c.value)
                    ? 'border-[#00612E] bg-[#00612E] text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#00612E]/40'
                }`}
              >
                {form.categories.includes(c.value) && <span className="text-xs">✓</span>}
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className={lbl}>Available Sizes</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  form.sizes.includes(size)
                    ? 'border-[#00612E] bg-[#00612E] text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#00612E]/40'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Short description */}
        <RichTextArea
          id="rta-short-desc"
          label="Short Description"
          value={form.description}
          onChange={v => setField('description', v)}
          placeholder="Jersey সম্পর্কে সংক্ষিপ্ত বিবরণ..."
          rows={3}
        />

        {/* Section 1 */}
        <div className="space-y-3 rounded-2xl border border-[#00612E]/10 bg-[#fafdf9] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00612E]/60">Description Section 1</p>
          <div>
            <label className={lbl}>Heading</label>
            <input
              type="text"
              placeholder="e.g. Features & Material"
              value={form.desc_section1_title}
              onChange={e => setField('desc_section1_title', e.target.value)}
              className={inp}
            />
          </div>
          <RichTextArea
            id="rta-sec1"
            label="Content"
            value={form.desc_section1_body}
            onChange={v => setField('desc_section1_body', v)}
            placeholder="বিস্তারিত লেখো..."
          />
        </div>

        {/* Section 2 */}
        <div className="space-y-3 rounded-2xl border border-[#00612E]/10 bg-[#fafdf9] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00612E]/60">Description Section 2</p>
          <div>
            <label className={lbl}>Heading</label>
            <input
              type="text"
              placeholder="e.g. Size & Fit Guide"
              value={form.desc_section2_title}
              onChange={e => setField('desc_section2_title', e.target.value)}
              className={inp}
            />
          </div>
          <RichTextArea
            id="rta-sec2"
            label="Content"
            value={form.desc_section2_body}
            onChange={v => setField('desc_section2_body', v)}
            placeholder="বিস্তারিত লেখো..."
          />
        </div>

        {/* Section 3 */}
        <div className="space-y-3 rounded-2xl border border-[#00612E]/10 bg-[#fafdf9] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00612E]/60">Description Section 3</p>
          <div>
            <label className={lbl}>Heading</label>
            <input
              type="text"
              placeholder="e.g. Wash Care / Delivery Info"
              value={form.desc_section3_title}
              onChange={e => setField('desc_section3_title', e.target.value)}
              className={inp}
            />
          </div>
          <RichTextArea
            id="rta-sec3"
            label="Content"
            value={form.desc_section3_body}
            onChange={v => setField('desc_section3_body', v)}
            placeholder="বিস্তারিত লেখো..."
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-[#00612E] py-3 text-sm font-semibold text-white transition hover:bg-[#00512a] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  )
}