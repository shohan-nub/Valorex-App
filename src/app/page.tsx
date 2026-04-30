import ProductCard from '../app/Productcard'
import Link from 'next/link'
import PromoPopup from '../app/Promopopup'
import { createClient } from './lib/supabase/client'
import HeroSlideshow from './Herosection/HeroSlideshow'
import CategorySlideshow from './CategorySlideshow'
import HeroSection from './Herosection/page'

type CategoryMeta = {
  slug: string
  label: string
  short: string
  title: string
  subtitle: string
}

type Product = {
  id: string
  name: string
  price: number
  image_url: string
  stock?: number | null
}

const CATEGORIES: CategoryMeta[] = [
  { slug: 'top_pick', label: 'Top Pick', short: 'TP', title: 'Top Picks', subtitle: "Best sellers" },
  { slug: 'club', label: 'Club', short: 'CL', title: 'Club Jerseys', subtitle: "Fresh drops" },
  { slug: 'retro', label: 'Retro', short: 'RT', title: 'Retro Classics', subtitle: "Old-school vibe" },
  { slug: 'national', label: 'National', short: 'NT', title: 'National Teams', subtitle: "Play with pride" },
]

const PRODUCTS_PER_CATEGORY = 8

async function getCategoryProducts(category: string): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, price, image_url, stock')
    .eq('category', category)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(PRODUCTS_PER_CATEGORY)

  return (data as Product[]) || []
}

async function getNewestProduct(): Promise<Product | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, price, image_url, stock')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (data as Product | null) || null
}

export default async function HomePage() {
  const [topPick, club, retro, national, promoProduct] = await Promise.all([
    getCategoryProducts('top_pick'),
    getCategoryProducts('club'),
    getCategoryProducts('retro'),
    getCategoryProducts('national'),
    getNewestProduct(),
  ])

  const categoryData = [
    { ...CATEGORIES[0], products: topPick },
    { ...CATEGORIES[1], products: club },
    { ...CATEGORIES[2], products: retro },
    { ...CATEGORIES[3], products: national },
  ]

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
      
      {/* PROMO */}
      <PromoPopup product={promoProduct} />

      {/* HERO */}
      <HeroSection />

      {/* SLIDESHOW (slightly separated for smoothness) */}
      <div className="mt-2 sm:mt-4">
        <HeroSlideshow />
      </div>

      {/* FEATURES */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

          {[
            { title: 'ORIGINAL', sub: 'Premium Quality' },
            { title: 'FAST', sub: 'Delivery BD' },
            { title: 'LATEST', sub: '2026 Drop' },
            { title: 'BEST', sub: 'Affordable' },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-[#00612E]/10 p-4 sm:p-6 text-center transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {item.sub}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* CATEGORY SECTIONS */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 space-y-12">

        {categoryData.map((cat) => (
          <section key={cat.slug} className="scroll-mt-24">

            {/* CATEGORY SLIDER */}
            <div className="rounded-2xl overflow-hidden">
              <CategorySlideshow
                categorySlug={cat.slug}
                categoryLabel={cat.title}
              />
            </div>

            {/* HEADER */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-slate-500">
                {cat.products.length > 0
                  ? `${cat.products.length}+ items`
                  : 'Coming soon'}
              </p>

              <Link
                href={`/category/${cat.slug}`}
                className="text-sm font-medium text-[#00612E] hover:underline"
              >
                See All →
              </Link>
            </div>

            {/* PRODUCTS */}
            {cat.products.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No products yet
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5 mt-4">
                {cat.products.map((product) => (
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
          </section>
        ))}

      </div>
    </div>
  )
}