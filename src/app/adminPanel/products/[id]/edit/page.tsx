'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { uploadToCloudinary } from '@/app/lib/supabase/cloudinary'

const CATEGORIES = [
  { value: 'top_pick', label: 'Top Pick' },
  { value: 'club', label: 'Club' },
  { value: 'retro', label: 'Retro' },
  { value: 'national', label: 'National' },
]

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

type ProductRow = {
  id: string
  name: string
  description: string | null
  desc_section1_title: string | null
  desc_section1_body: string | null
  desc_section2_title: string | null
  desc_section2_body: string | null
  desc_section3_title: string | null
  desc_section3_body: string | null
  price: number
  original_price: number | null
  full_sleeve_extra_price: number | null
  stock: number
  category: string | null
  categories: string[] | null
  sizes: string[] | null
  image_url: string | null
  extra_images: string[] | null
}

type FormState = {
  name: string
  description: string
  desc_section1_title: string
  desc_section1_body: string
  desc_section2_title: string
  desc_section2_body: string
  desc_section3_title: string
  desc_section3_body: string
  price: string
  original_price: string
  full_sleeve_extra_price: string
  stock: string
  categories: string[]
  sizes: string[]
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  desc_section1_title: '',
  desc_section1_body: '',
  desc_section2_title: '',
  desc_section2_body: '',
  desc_section3_title: '',
  desc_section3_body: '',
  price: '',
  original_price: '',
  full_sleeve_extra_price: '',
  stock: '',
  categories: [],
  sizes: [],
}

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
  function wrap(tag: 'b' | 'i') {
    const ta = document.getElementById(id) as HTMLTextAreaElement | null
    if (!ta) return

    const start = ta.selectionStart
    const end = ta.selectionEnd
    const current = ta.value
    const selected = current.slice(start, end)
    if (!selected) return

    const wrapped = tag === 'b' ? `**${selected}**` : `_${selected}_`
    const next = current.slice(0, start) + wrapped + current.slice(end)

    onChange(next)

    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start, start + wrapped.length)
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

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  const [gallery, setGallery] = useState<string[]>([])
  const [uploadingExtras, setUploadingExtras] = useState(false)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleCategory(cat: string) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(x => x !== cat)
        : [...prev.categories, cat],
    }))
  }

  function toggleSize(size: string) {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(x => x !== size)
        : [...prev.sizes, size],
    }))
  }

  function changeStock(delta: number) {
    setForm(prev => {
      const current = Number(prev.stock || 0)
      const next = Math.max(0, current + delta)
      return { ...prev, stock: String(next) }
    })
  }

  function moveGallery(index: number, direction: -1 | 1) {
    setGallery(prev => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function removeGalleryItem(index: number) {
    setGallery(prev => prev.filter((_, i) => i !== index))
  }

  async function loadProduct() {
    if (!id) return

    setLoading(true)
    setError('')

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single<ProductRow>()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Product not found')

      const categories =
        data.categories && data.categories.length > 0
          ? data.categories
          : data.category
            ? [data.category]
            : []

      setForm({
        name: data.name ?? '',
        description: data.description ?? '',
        desc_section1_title: data.desc_section1_title ?? '',
        desc_section1_body: data.desc_section1_body ?? '',
        desc_section2_title: data.desc_section2_title ?? '',
        desc_section2_body: data.desc_section2_body ?? '',
        desc_section3_title: data.desc_section3_title ?? '',
        desc_section3_body: data.desc_section3_body ?? '',
        price: String(data.price ?? ''),
        original_price: data.original_price != null ? String(data.original_price) : '',
        full_sleeve_extra_price:
          data.full_sleeve_extra_price != null ? String(data.full_sleeve_extra_price) : '0',
        stock: String(data.stock ?? 0),
        categories,
        sizes: data.sizes ?? [],
      })

      setCoverPreview(data.image_url || '')
      setGallery((data.extra_images ?? []).filter(Boolean))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleAddGalleryImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setUploadingExtras(true)
    try {
      const uploaded = await Promise.all(
        files.map(async file => {
          const res = await uploadToCloudinary(file)
          return res.url
        })
      )
      setGallery(prev => [...prev, ...uploaded])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch {
      setError('Extra image upload failed')
    } finally {
      setUploadingExtras(false)
    }
  }

  async function handleSave() {
    setError('')

    if (!form.name.trim()) return setError('Name required')
    if (!form.price || Number.isNaN(Number(form.price))) return setError('Valid sale price required')
    if (!form.stock || Number.isNaN(Number(form.stock))) return setError('Valid stock required')
    if (!form.categories.length) return setError('At least one category required')
    if (Number(form.stock) < 0) return setError('Stock cannot be negative')

    setSaving(true)
    try {
      let imageUrl = coverPreview || ''
      if (coverFile) {
        const uploaded = await uploadToCloudinary(coverFile)
        imageUrl = uploaded.url
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        desc_section1_title: form.desc_section1_title.trim() || null,
        desc_section1_body: form.desc_section1_body.trim() || null,
        desc_section2_title: form.desc_section2_title.trim() || null,
        desc_section2_body: form.desc_section2_body.trim() || null,
        desc_section3_title: form.desc_section3_title.trim() || null,
        desc_section3_body: form.desc_section3_body.trim() || null,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        full_sleeve_extra_price: form.full_sleeve_extra_price ? Number(form.full_sleeve_extra_price) : 0,
        stock: Number(form.stock),
        category: form.categories[0] ?? null,
        categories: form.categories,
        sizes: form.sizes,
        image_url: imageUrl || null,
        extra_images: gallery,
      }

      const { error: updateError } = await supabase.from('products').update(payload).eq('id', id)
      if (updateError) throw updateError

      router.push('/adminPanel/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00612E]/50 focus:ring-2 focus:ring-[#00612E]/8 transition bg-white'
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5'

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-gray-100 mb-4" />
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
      </div>

      <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label className={labelCls}>Cover Image</label>
              <label className="block cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 aspect-square">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No cover image
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100">
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700">
                      Change cover
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
            </div>

            <div>
              <label className={labelCls}>Extra Images</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
                  Upload images
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAddGalleryImages}
                  />
                </label>
                {uploadingExtras && <span className="text-xs text-gray-400">Uploading...</span>}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {gallery.map((img, index) => (
                  <div key={`${img}-${index}`} className="group relative">
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </div>

                    <div className="absolute inset-x-1 top-1 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => moveGallery(index, -1)}
                        className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold shadow-sm"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGallery(index, 1)}
                        className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold shadow-sm"
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGalleryItem(index)}
                      className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-red-500 text-white text-xs shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>Name</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Product name"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Sale Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.price}
                  onChange={e => setField('price', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Original Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.original_price}
                  onChange={e => setField('original_price', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Full Sleeve Extra (৳)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={form.full_sleeve_extra_price}
                    onChange={e => setField('full_sleeve_extra_price', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setField('full_sleeve_extra_price', '0')}
                    className="shrink-0 rounded-xl border border-gray-200 px-3 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Stock</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeStock(-1)}
                  className="h-11 w-11 shrink-0 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.stock}
                  onChange={e => setField('stock', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => changeStock(1)}
                  className="h-11 w-11 shrink-0 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Categories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => {
                  const active = form.categories.includes(c.value)
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleCategory(c.value)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? 'border-[#00612E] bg-[#00612E] text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-[#00612E]/40'
                      }`}
                    >
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className={labelCls}>Sizes</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map(size => {
                  const active = form.sizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? 'border-[#00612E] bg-[#00612E] text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-[#00612E]/40'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        <div>
          <RichTextArea
            id="edit-short-desc"
            label="Short Description"
            value={form.description}
            onChange={v => setField('description', v)}
            placeholder="Short description..."
            rows={3}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#00612E]/10 bg-[#fafdf9] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#00612E]/60 mb-3">
              Description Section 1
            </p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Heading</label>
                <input
                  className={inputCls}
                  value={form.desc_section1_title}
                  onChange={e => setField('desc_section1_title', e.target.value)}
                />
              </div>
              <RichTextArea
                id="edit-sec1-body"
                label="Content"
                value={form.desc_section1_body}
                onChange={v => setField('desc_section1_body', v)}
                placeholder="Section 1 content..."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#00612E]/10 bg-[#fafdf9] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#00612E]/60 mb-3">
              Description Section 2
            </p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Heading</label>
                <input
                  className={inputCls}
                  value={form.desc_section2_title}
                  onChange={e => setField('desc_section2_title', e.target.value)}
                />
              </div>
              <RichTextArea
                id="edit-sec2-body"
                label="Content"
                value={form.desc_section2_body}
                onChange={v => setField('desc_section2_body', v)}
                placeholder="Section 2 content..."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#00612E]/10 bg-[#fafdf9] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#00612E]/60 mb-3">
              Description Section 3
            </p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Heading</label>
                <input
                  className={inputCls}
                  value={form.desc_section3_title}
                  onChange={e => setField('desc_section3_title', e.target.value)}
                />
              </div>
              <RichTextArea
                id="edit-sec3-body"
                label="Content"
                value={form.desc_section3_body}
                onChange={v => setField('desc_section3_body', v)}
                placeholder="Section 3 content..."
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#00612E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00512a] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}