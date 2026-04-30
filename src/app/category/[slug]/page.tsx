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
  params: Promise<{ slug: string }>  // ← Promise করো
}) {
  const { slug } = await params  // ← await করো

  if (!CATEGORY_LABELS[slug]) notFound()

  const supabase = await createClient()  // ← server client, await সহ

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, image_url, stock')
    .eq('category', slug)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}