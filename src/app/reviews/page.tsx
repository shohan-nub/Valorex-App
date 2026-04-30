// app/reviews/page.tsx  (Server Component)
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

interface ReviewImage {
  id: string
  image_url: string
  caption: string | null
  product_id: string | null
  created_at: string
  product?: { name: string } | null
}

async function getReviewImages(): Promise<ReviewImage[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('review_images')
    .select('*, product:products(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return (data as ReviewImage[]) || []
}

export default async function ReviewsPage() {
  const images = await getReviewImages()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Barlow+Condensed:wght@300;400;600&family=Bentham&display=swap');
        .font-anton   { font-family: 'Anton SC', sans-serif; }
        .font-barlow  { font-family: 'Barlow Condensed', sans-serif; }
        .font-bentham { font-family: 'Bentham', serif; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }

        .review-card {
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .review-card:hover {
          transform: translateY(-6px) scale(1.015);
          box-shadow: 0 24px 60px rgba(0,0,0,0.14);
        }
        .review-card img {
          transition: transform 0.5s ease;
        }
        .review-card:hover img {
          transform: scale(1.06);
        }
      `}</style>

      <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(160deg,#f0f4ef 0%,#fafaf8 50%,#f5f7f2 100%)' }}>

        {/* ── Header ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center fade-up">
          <p className="font-barlow text-[10px] tracking-[5px] uppercase text-[#00612E]/60 mb-3">Customer Stories</p>
          <h1 className="font-anton text-[#0f172a] text-[clamp(40px,8vw,90px)] leading-[0.9]">
            REAL<br/>
            <span style={{ WebkitTextStroke: '2px #00612E', color: 'transparent' }}>REVIEWS</span>
          </h1>
          <p className="font-bentham text-gray-500 mt-4 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            See how our jerseys look in real life — shared by our community.
          </p>
        </div>

        {/* ── Gallery ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-[#00612E]/8 flex items-center justify-center text-4xl">📸</div>
              <p className="font-barlow text-sm tracking-[3px] uppercase text-gray-400">No reviews yet</p>
            </div>
          ) : (
            /* Masonry-style grid */
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="review-card break-inside-avoid rounded-2xl overflow-hidden bg-white shadow-sm"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '1/1' : '4/5' }}>
                    <Image
                      src={img.image_url}
                      alt={img.caption || 'Customer review'}
                      fill
                      sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
                      className="object-cover"
                    />
                    {/* overlay */}
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3" style={{ background: 'linear-gradient(to top, rgba(0,97,46,0.75) 0%, transparent 60%)' }}>
                      {img.product_id && (
                        <Link
                          href={`/products/${img.product_id}`}
                          className="font-barlow text-[10px] tracking-[2px] uppercase text-[#FDFFE3] bg-[#00612E] px-3 py-1.5 rounded-full"
                        >
                          View Product →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Caption */}
                  {(img.caption || img.product?.name) && (
                    <div className="px-3 py-2.5">
                      {img.product?.name && (
                        <p className="font-barlow text-[9px] tracking-[2px] uppercase text-[#00612E]/60 mb-0.5">{img.product.name}</p>
                      )}
                      {img.caption && (
                        <p className="font-bentham text-xs text-gray-600 leading-snug">{img.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}