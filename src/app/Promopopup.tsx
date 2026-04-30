'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface PromoProduct {
  id: string
  name: string
  price: number
  image_url: string
}

interface PromoPopupProps {
  product: PromoProduct | null
}

export default function PromoPopup({ product }: PromoPopupProps) {
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!product) return

    // Session এ একবার দেখানোর জন্য check
    const alreadySeen = sessionStorage.getItem('promo_seen')
    if (alreadySeen) return

    // ৩ সেকেন্ড পর show করবে
    const timer = setTimeout(() => {
      setVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [product])

  function handleClose() {
    sessionStorage.setItem('promo_seen', 'true')
    setVisible(false)
  }

  function handleClick() {
    if (!product) return
    handleClose()
    router.push(`/products/${product.id}`)
  }

  if (!visible || !product) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm relative animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition text-lg leading-none"
          >
            ×
          </button>

          {/* Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              🔥 New Arrival
            </span>
          </div>

          {/* Product image */}
          <div className="relative aspect-square bg-gray-50 w-full">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">👕</div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
              Just Arrived
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-2xl font-extrabold text-blue-600 mb-4">
              ৳{product.price.toLocaleString('en-BD')}
            </p>

            <button
              onClick={handleClick}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
            >
              View Product →
            </button>

            <button
              onClick={handleClose}
              className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition py-1"
            >
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </div>
    </>
  )
}