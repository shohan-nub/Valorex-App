'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  image_url: string
  is_active: boolean
  created_at: string
}

const categoryLabels: Record<string, string> = {
  top_pick: 'Top Pick',
  club: 'Club',
  retro: 'Retro',
  national: 'National',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
 const supabase=createClient();
  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
   
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('এই product delete করবে?')) return
    setDeletingId(id)
 
    await supabase.from('products').delete().eq('id', id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeletingId(null)
  }

  async function toggleActive(id: string, current: boolean) {

    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p))
    )
  }

  if (loading) return <div className="text-gray-500 text-sm">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <Link
          href="/adminPanel/products/new"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm">
          <p className="text-lg mb-2">No products yet</p>
          <Link href="/adminPanel/products/new" className="text-blue-600 text-sm hover:underline">
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover w-10 h-10"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                          📷
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {categoryLabels[product.category] || product.category}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800">৳{product.price}</td>
                  <td className="px-5 py-3 text-gray-600">{product.stock} pcs</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(product.id, product.is_active)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="text-red-500 hover:text-red-700 text-xs disabled:opacity-40"
                    >
                      {deletingId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}