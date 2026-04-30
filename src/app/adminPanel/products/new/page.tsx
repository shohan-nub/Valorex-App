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

export default function AddProductPage() {
  const router = useRouter()
  const supabase=createClient();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'top_pick',
    stock: '',
    sizes: [] as string[],
  })

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  // Extra images (description এর জন্য)
  const [extraFiles, setExtraFiles] = useState<File[]>([])
  const [extraPreviews, setExtraPreviews] = useState<string[]>([])
  const [extraUrls, setExtraUrls] = useState<string[]>([]) // uploaded cloudinary urls
  const [uploadingExtra, setUploadingExtra] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cover image select
  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  // Extra images select (multiple)
  function handleExtraChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setExtraFiles(files)
    setExtraPreviews(files.map((f) => URL.createObjectURL(f)))
    setExtraUrls([]) // reset uploaded urls
  }

  // Extra images Cloudinary তে upload
  async function handleUploadExtra() {
    if (!extraFiles.length) return
    setUploadingExtra(true)
    try {
      const urls = await Promise.all(extraFiles.map((f) => uploadToCloudinary(f).then((r) => r.url)))
      setExtraUrls(urls)
    } catch {
      alert('Image upload failed')
    } finally {
      setUploadingExtra(false)
    }
  }

  // Extra image remove
  function removeExtra(index: number) {
    setExtraFiles((prev) => prev.filter((_, i) => i !== index))
    setExtraPreviews((prev) => prev.filter((_, i) => i !== index))
    setExtraUrls((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleSize(size: string) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }

  async function handleSubmit() {
    setError('')

    if (!form.name || !form.price || !form.stock) {
      setError('Name, price এবং stock দেওয়া দরকার।')
      return
    }
    if (!coverFile) {
      setError('Cover image select করো।')
      return
    }

    setLoading(true)

    try {
      // Cover image upload
      const { url: coverUrl, public_id } = await uploadToCloudinary(coverFile)

      // Extra images যদি এখনো upload না হয়ে থাকে
      let finalExtraUrls = extraUrls
      if (extraFiles.length && extraUrls.length === 0) {
        finalExtraUrls = await Promise.all(
          extraFiles.map((f) => uploadToCloudinary(f).then((r) => r.url))
        )
      }

      const { error: dbError } = await supabase.from('products').insert({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock),
        sizes: form.sizes,
        image_url: coverUrl,
        extra_images: finalExtraUrls,   // array of cloudinary urls
        cloudinary_public_id: public_id,
        is_active: true,
      })

      if (dbError) throw dbError

      router.push('/adminPanel/products')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Add Product</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">

        {/* ── Cover Image ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Cover Image <span className="text-red-400">*</span>
            <span className="text-xs font-normal text-gray-400 ml-2">Product card এ দেখাবে</span>
          </label>

          <label className="cursor-pointer block">
            {coverPreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
                <Image
                  src={coverPreview}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Change Image</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-blue-300 hover:bg-blue-50 transition">
                <span className="text-3xl">🖼️</span>
                <span className="text-sm text-gray-400">Click to upload cover image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </label>
        </div>

        {/* ── Extra Images ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Extra Images
            <span className="text-xs font-normal text-gray-400 ml-2">Description / gallery এর জন্য</span>
          </label>

          {/* Select files */}
          <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition mb-3">
            <span>📁</span> Select Images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleExtraChange}
            />
          </label>

          {/* Previews */}
          {extraPreviews.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {extraPreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <Image src={src} alt={`extra-${i}`} fill className="object-cover" />
                      {/* Uploaded badge */}
                      {extraUrls[i] && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <span className="text-green-600 text-lg">✓</span>
                        </div>
                      )}
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeExtra(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload button */}
              {extraUrls.length === 0 && (
                <button
                  type="button"
                  onClick={handleUploadExtra}
                  disabled={uploadingExtra}
                  className="text-sm bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {uploadingExtra ? 'Uploading...' : `Upload ${extraFiles.length} image${extraFiles.length > 1 ? 's' : ''} to Cloudinary`}
                </button>
              )}

              {extraUrls.length > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ {extraUrls.length} image uploaded successfully
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* ── Name ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Barcelona Home Jersey 2024"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* ── Price & Stock ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Price (৳) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              placeholder="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Stock <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              placeholder="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* ── Category ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* ── Sizes ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Available Sizes</label>
          <div className="flex gap-2 flex-wrap">
            {ALL_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  form.sizes.includes(size)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Jersey এর বিবরণ লেখো..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>

      </div>
    </div>
  )
}