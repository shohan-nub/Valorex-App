'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link' // এটি অবশ্যই লাগবে Edit লিঙ্কের জন্য

interface Product {
  id: string
  name: string
  price: number
  category: string
  image_url: string
  stock: number
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return

    setDeletingId(id)
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(products.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading products...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
          <p className="text-gray-500 text-sm">Manage your store inventory and prices</p>
        </div>
        <Link
          href="/adminPanel/products/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      <Image
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{product.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium capitalize">
                    {product.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">৳{product.price}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm ${product.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                    {product.stock} pcs
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-4">
                    {/* --- এডিট বাটন শুরু --- */}
                    <Link
                      href={`/adminPanel/products/${product.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors p-1"
                      title="Edit Product"
                    >
                      Edit
                    </Link>
                    {/* --- এডিট বাটন শেষ --- */}

                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-30 p-1"
                      title="Delete Product"
                    >
                      {deletingId === product.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="p-20 text-center text-gray-400">
            No products found. Start by adding one!
          </div>
        )}
      </div>
    </div>
  )
}