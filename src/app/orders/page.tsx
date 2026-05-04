'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  size: string
  quantity: number
  price: number
}

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  order_items: OrderItem[]
}

interface ReviewState {
  loading: boolean
  userId: string | null
  alreadyReviewed: boolean
  comment: string
  submitting: boolean
  saved: boolean
}

const statusText: Record<string, string> = {
  pending: 'Waiting for confirmation',
  confirmed: 'Confirmed • Delivery in 1–2 days',
  shipped: 'On the way 🚚',
  delivered: 'Delivered 🎉',
  cancelled: 'Cancelled',
}

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

function InlineReviewBox({ productId }: { productId: string }) {
  const [state, setState] = useState<ReviewState>({
    loading: true,
    userId: null,
    alreadyReviewed: false,
    comment: '',
    submitting: false,
    saved: false,
  })

  useEffect(() => {
    let mounted = true

    async function load() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (!user) {
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      const { data: existingReviews } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)

      if (!mounted) return

      setState(prev => ({
        ...prev,
        loading: false,
        userId: user.id,
        alreadyReviewed: (existingReviews || []).length > 0,
      }))
    }

    load()

    return () => {
      mounted = false
    }
  }, [productId])

  async function handleSubmit() {
    if (!state.comment.trim() || !state.userId) return

    setState(prev => ({ ...prev, submitting: true, saved: false }))

    const supabase = createClient()

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: state.userId,
      rating: 5,
      comment: state.comment.trim(),
    })

    if (!error) {
      setState(prev => ({
        ...prev,
        alreadyReviewed: true,
        comment: '',
        saved: true,
      }))
    }

    setState(prev => ({ ...prev, submitting: false }))
  }

  if (state.loading) {
    return (
      <div className="rounded-xl border border-[#00612E]/10 bg-white p-3">
        <p className="text-xs text-slate-400">Checking review option...</p>
      </div>
    )
  }

  if (state.alreadyReviewed) {
    return (
      <div className="rounded-xl border border-[#00612E]/10 bg-white p-3">
        <p className="text-xs text-slate-500">You already reviewed this product.</p>
      </div>
    )
  }

  if (!state.userId) {
    return (
      <div className="rounded-xl border border-[#00612E]/10 bg-white p-3">
        <p className="text-xs text-slate-500">Review দিতে হলে login করা লাগবে।</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#00612E]/10 bg-white p-3">
      <p className="mb-2 text-sm font-semibold text-slate-800">Review দাও</p>

      <textarea
        value={state.comment}
        onChange={e =>
          setState(prev => ({ ...prev, comment: e.target.value }))
        }
        placeholder="Write a Review"
        className="w-full rounded border border-slate-200 p-2 text-sm outline-none"
      />

      <button
        onClick={handleSubmit}
        disabled={state.submitting}
        className="mt-2 rounded bg-green-700 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {state.submitting ? 'Submitting...' : 'Submit'}
      </button>

      {state.saved && (
        <p className="mt-2 text-xs text-emerald-600">Review saved.</p>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setOrders((data as Order[]) || [])
    setLoading(false)
  }

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00612E]/20 border-t-[#00612E]" />
      </div>
    )

  if (orders.length === 0)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="mb-4 text-4xl">📦</p>
        <p className="mb-4 text-slate-500">No order </p>
        <Link
          href="/"
          className="inline-flex rounded-full bg-[#00612E] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Shop Now →
        </Link>
      </div>
    )

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="mb-6 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
        My Orders
      </h1>

      <div className="space-y-5">
        {orders.map(order => (
          <div
            key={order.id}
            className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
          >
            <div className="space-y-3">
              {order.order_items?.map(item => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#00612E]/10 bg-[#f8fbf8] p-3 sm:p-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      {item.product_image && (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.product_name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        {item.size && (
                          <span>
                            Size:{' '}
                            <b className="text-slate-700">{item.size}</b>
                          </span>
                        )}
                        <span>
                          Qty: <b className="text-slate-700">{item.quantity}</b>
                        </span>
                        <span>৳{(item.price * item.quantity).toLocaleString('en-BD')}</span>
                      </div>
                    </div>
                  </div>

                  {order.status === 'delivered' && item.product_id && (
                    <div className="mt-3 border-t border-[#00612E]/10 pt-3">
                      <InlineReviewBox productId={item.product_id} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Order
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                    statusStyle[order.status] ||
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {statusText[order.status] || order.status}
                </span>
              </div>

              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total
                </p>
                <p className="mt-1 text-2xl font-black text-[#00612E]">
                  ৳{order.total_amount.toLocaleString('en-BD')}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(order.created_at).toLocaleDateString('en-BD')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}