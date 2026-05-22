import { createClient } from '@/app/lib/supabase/server'
import ProductCard from '../../Productcard'
import { notFound } from 'next/navigation'

const CATEGORY_LABELS: Record<string, string> = {
  top_pick: '🔥 Top Pick',
  club: '🏆 Club Jersey',
  retro: '⏳ Retro',
  national: '🌍 National',
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!CATEGORY_LABELS[slug]) notFound()

  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, original_price, image_url, stock, category, categories')
    .eq('is_active', true)
    .or(`category.eq.${slug},categories.cs.{${slug}}`)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {CATEGORY_LABELS[slug]}
        </h1>
        <p className="text-sm text-red-500">Failed to load products.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {CATEGORY_LABELS[slug]}
      </h1>

      {!products || products.length === 0 ? (
        <p className="text-gray-400 text-sm">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                stock: product.stock ?? 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}