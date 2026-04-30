'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  stock: number
}

export default function ProductCard({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(48px)',
      }}
    >
      <Link href={`/products/${product.id}`} className="group block">
        {/* Image container */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            borderRadius: '20px',
            background: '#e8e0d5',
            aspectRatio: '3/4',
          }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-stone-400">
              👕
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[20px]">
              <span className="text-white text-xs font-medium tracking-widest uppercase">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 px-1">
          <p
            className="text-stone-800 font-medium leading-snug line-clamp-2"
            style={{ fontSize: '0.9rem' }}
          >
            {product.name}
          </p>
          <p
            className="mt-1 text-stone-600 font-semibold"
            style={{ fontSize: '0.95rem' }}
          >
            ৳{product.price.toLocaleString('en-BD')}
          </p>
        </div>
      </Link>
    </div>
  )
}