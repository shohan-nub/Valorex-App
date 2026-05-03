'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { uploadToCloudinary } from '@/app/lib/supabase/cloudinary'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'

const CATEGORIES = [
  { value: 'top_pick', label: 'Top Pick' },
  { value: 'club', label: 'Club' },
  { value: 'retro', label: 'Retro' },
  { value: 'national', label: 'National' },
]

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'top_pick',
    stock: '',
    sizes: [] as string[],
  })

  // Images state
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [extraUrls, setExtraUrls] = useState<string[]>([])
  const [extraFiles, setExtraFiles] = useState<File[]>([])
  const [extraPreviews, setExtraPreviews] = useState<string[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ১. প্রোডাক্টের বর্তমান ডাটা ফেচ করা
  useEffect(() => {
    async function getProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError('Product not found')
        setLoading(false)
        return
      }

      setForm({
        name: data.name,
        description: data.description || '',
        price: data.price.toString(),
        category: data.category,
        stock: data.stock.toString(),
        sizes: data.sizes || [],
      })
      setCoverUrl(data.image_url)
      setExtraUrls(data.extra_images || [])
      setLoading(false)
    }
    getProduct()
  }, [id, supabase])

  // ২. ইমেজ হ্যান্ডলিং
  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function handleExtraChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setExtraFiles(files)
    setExtraPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  function toggleSize(size: string) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }

  // ৩. আপডেট সাবমিট করা
  async function handleSubmit() {
    setError('')
    setSaving(true)

    try {
      let finalCoverUrl = coverUrl
      // যদি নতুন কভার ইমেজ সিলেক্ট করা হয়
      if (coverFile) {
        const { url } = await uploadToCloudinary(coverFile)
        finalCoverUrl = url
      }

      let finalExtraUrls = extraUrls
      // যদি নতুন এক্সট্রা ইমেজ সিলেক্ট করা হয়
      if (extraFiles.length > 0) {
        const uploadedExtra = await Promise.all(
          extraFiles.map((f) => uploadToCloudinary(f).then((r) => r.url))
        )
        finalExtraUrls = [...extraUrls, ...uploadedExtra] // আগের গুলোর সাথে নতুন গুলো যোগ হবে
      }

      const { error: dbError } = await supabase
        .from('products')
        .update({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category,
          stock: parseInt(form.stock),
          sizes: form.sizes,
          image_url: finalCoverUrl,
          extra_images: finalExtraUrls,
        })
        .eq('id', id)

      if (dbError) throw dbError

      router.push('/adminPanel/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-gray-500">Loading Product Data...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">← Back</button>
        <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Cover Image Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Cover Image</label>
          <label className="cursor-pointer block">
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
              <Image 
                src={coverPreview || coverUrl || ''} 
                alt="Preview" 
                fill 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <span className="text-white text-xs bg-black/50 px-3 py-1 rounded-full">Change Image</span>
              </div>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </label>
        </div>

        {/* Name, Price, Stock - Similar to Add Page */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 rounded-lg mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Price (৳)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border p-2 rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border p-2 rounded-lg mt-1"
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sizes</label>
            <div className="flex gap-2">
              {ALL_SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1 border rounded ${form.sizes.includes(size) ? 'bg-blue-600 text-white' : 'bg-white'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border p-2 rounded-lg mt-1"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Product'}
        </button>
      </div>
    </div>
  )
}