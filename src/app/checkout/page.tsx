'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '../Cartcontext'
import { createClient } from '@/app/lib/supabase/client'

const BKASH_NUMBER = '01612389216'

type Step = 'info' | 'payment' | 'done'
type PaymentMethod = 'bkash' | 'cod'

const STEPS: Step[] = ['info', 'payment', 'done']
const STEP_LABELS = ['Delivery', 'Payment', 'Done']

function PageWrap({
  step,
  currentStepIndex,
  children,
}: {
  step: Step
  currentStepIndex: number
  children: ReactNode
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbfcfa_0%,#f4f7f4_100%)] px-4 py-6 sm:px-6 lg:py-10">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease both; }

        @keyframes floatSoft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float-soft { animation: floatSoft 7s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00612E]/10 blur-3xl float-soft" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#FDFFE3]/80 blur-3xl float-soft" style={{ animationDelay: '1.2s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        {step !== 'done' && (
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.05)] backdrop-blur sm:gap-3">
              {STEP_LABELS.map((label, i) => {
                const active = i <= currentStepIndex
                const done = i < currentStepIndex

                return (
                  <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${active ? 'shadow-md' : ''}`}
                        style={{
                          background: active ? '#00612E' : '#eef2ef',
                          color: active ? '#ffffff' : '#94a3b8',
                        }}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <span
                        className="text-[10px] font-medium uppercase tracking-[3px]"
                        style={{ color: active ? '#00612E' : '#94a3b8' }}
                      >
                        {label}
                      </span>
                    </div>

                    {i < STEP_LABELS.length - 1 && (
                      <div
                        className="mx-3 mb-4 h-0.5 w-10 rounded-full transition-all duration-500 sm:w-16"
                        style={{ background: i < currentStepIndex ? '#00612E' : '#dbe4dd' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="fade-up">{children}</div>
      </div>
    </div>
  )
}

function OrderSummary({
  items,
  subtotal,
  deliveryCharge,
  total,
}: {
  items: ReturnType<typeof useCart>['items']
  subtotal: number
  deliveryCharge: number
  total: number
}) {
  return (
    <div className="rounded-[26px] border border-[#00612E]/10 bg-white/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.05)] backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[4px] text-[#00612E]/55">Order Summary</p>
        <span className="rounded-full bg-[#00612E]/8 px-3 py-1 text-[11px] font-semibold text-[#00612E]">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.size}`}
            className="flex items-center gap-3 rounded-2xl border border-[#edf2ed] bg-[#fafdfb] p-2.5"
          >
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#f3f6f3]">
              <Image
                src={item.image_url || '/placeholder.png'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                {item.size && (
                  <span className="rounded-full border border-[#e8efe8] bg-white px-2 py-0.5">
                    Size: {item.size}
                  </span>
                )}
                <span className="rounded-full border border-[#e8efe8] bg-white px-2 py-0.5">
                  Qty: {item.quantity}
                </span>
              </div>
            </div>

            <p className="flex-shrink-0 text-sm font-bold text-[#00612E]">
              ৳{(item.price * item.quantity).toLocaleString('en-BD')}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-[#edf2ed] pt-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>৳{subtotal.toLocaleString('en-BD')}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Delivery</span>
          <span>৳{deliveryCharge.toLocaleString('en-BD')}</span>
        </div>
        <div className="flex items-center justify-between border-t border-[#edf2ed] pt-2">
          <span className="text-sm font-medium text-slate-600">Total</span>
          <span className="text-xl font-black text-[#00612E]">৳{total.toLocaleString('en-BD')}</span>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, hydrated } = useCart()
  const router = useRouter()

  const [step, setStep] = useState<Step>('info')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash')
  const [info, setInfo] = useState({ name: '', phone: '', address: '', city: '' })
  const [trxId, setTrxId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const redirectedRef = useRef(false)

  const deliveryCharge = info.city?.trim()
    ? info.city.trim().toLowerCase() === 'dhaka'
      ? 70
      : 120
    : 0

  const finalTotal = totalPrice + deliveryCharge
  const currentStepIndex = useMemo(() => STEPS.indexOf(step), [step])
  const shouldRedirect = hydrated && items.length === 0 && step !== 'done'

  useEffect(() => {
    if (shouldRedirect && !redirectedRef.current) {
      redirectedRef.current = true
      router.replace('/')
    }
  }, [shouldRedirect, router])

  useEffect(() => {
    if (items.length > 0) redirectedRef.current = false
  }, [items.length])

  if (!hydrated) return null
  if (shouldRedirect) return null

async function handlePlaceOrder() {
    setError('')

    if (paymentMethod === 'bkash' && !trxId.trim()) {
      setError('Enter your bKash Transaction ID.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // ✅ আগে stock check করো
      for (const item of items) {
        const { data: p } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single()

        if (!p || p.stock < item.quantity) {
          setError(`"${item.name}" এর পর্যাপ্ত stock নেই।`)
          setLoading(false)
          return
        }
      }

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          customer_name: info.name,
          total_amount: finalTotal,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'unpaid' : 'pending_verification',
          bkash_trx_id: paymentMethod === 'bkash' ? trxId.trim() : null,
          shipping_address: info.address,
          shipping_city: info.city,
          phone: info.phone,
        })
        .select()
        .single()

      if (orderErr) throw orderErr
      if (!order) throw new Error('Order could not be created.')

      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image_url,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        }))
      )

      if (itemsErr) throw itemsErr

    // stcok 
      for (const item of items) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.id,
          p_qty: item.quantity,
        })
      }

      clearCart()
      setTimeout(() => setStep('done'), 80)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Order failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function goToPayment() {
    if (!info.name || !info.phone || !info.address || !info.city) {
      setError('Please fill in all fields.')
      return
    }

    setError('')
    setTimeout(() => setStep('payment'), 120)
  }

  const heroSummary = (
    <div className="rounded-[26px] border border-[#00612E]/10 bg-white/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.05)] backdrop-blur sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[4px] text-[#00612E]/55">Checkout</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Secure Checkout
          </h1>
        </div>
        <div className="hidden rounded-full bg-[#FDFFE3] px-3 py-1 text-[11px] font-semibold text-[#8a6d1a] sm:block">
          Safe & fast
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Complete your order in a few simple steps. The layout stays clean on mobile and spacious on large screens.
      </p>
    </div>
  )

  if (step === 'info') {
    return (
      <PageWrap step={step} currentStepIndex={currentStepIndex}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div className="space-y-5">
              {heroSummary}

              <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)] sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">Delivery Info</h2>
                <p className="mt-1 text-sm text-slate-500">Fill in your details to continue to payment.</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { key: 'name', placeholder: 'Full Name', type: 'text' },
                    { key: 'phone', placeholder: 'Phone Number', type: 'tel' },
                    { key: 'address', placeholder: 'Full Address', type: 'text' },
                    { key: 'city', placeholder: 'City', type: 'text' },
                  ].map(({ key, placeholder, type }) => (
                    <input
                      key={key}
                      type={type}
                      placeholder={placeholder}
                      value={info[key as keyof typeof info]}
                      onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#00612E] focus:ring-2 focus:ring-[#00612E]/10"
                      style={{
                        background: '#f7faf7',
                        border: '1px solid #dfe8e0',
                        color: '#0f172a',
                      }}
                    />
                  ))}
                </div>

                {error && <p className="mt-3 text-xs font-medium text-[#dc2626]">{error}</p>}

                <button
                  onClick={goToPayment}
                  className="mt-5 w-full rounded-2xl bg-[#00612E] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,97,46,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,97,46,0.28)]"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>

            <div className="lg:sticky lg:top-6">
              <OrderSummary
                items={items}
                subtotal={totalPrice}
                deliveryCharge={deliveryCharge}
                total={finalTotal}
              />
            </div>
          </div>
        </div>
      </PageWrap>
    )
  }

  if (step === 'payment') {
    return (
      <PageWrap step={step} currentStepIndex={currentStepIndex}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div className="space-y-5">
              {heroSummary}

              <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)] sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
                <p className="mt-1 text-sm text-slate-500">Choose bKash or cash on delivery.</p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { id: 'bkash', emoji: '📱', label: 'bKash', accent: '#E91E8C' },
                    { id: 'cod', emoji: '💵', label: 'Cash on Delivery', accent: '#22c55e' },
                  ].map(({ id, emoji, label, accent }) => {
                    const active = paymentMethod === id
                    return (
                      <button
                        key={id}
                        onClick={() => setPaymentMethod(id as PaymentMethod)}
                        className="rounded-[22px] border p-4 text-left transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                          borderColor: active ? accent : '#e5ece6',
                          background: active ? `${accent}10` : '#fafdfb',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{emoji}</span>
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: active ? accent : '#cbd5d1' }}
                          />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-900">{label}</p>
                      </button>
                    )
                  })}
                </div>

                {paymentMethod === 'bkash' && (
                  <div className="mt-5 rounded-[24px] border border-[#E91E8C]/20 bg-[#E91E8C]/5 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-[#E91E8C]">bKash Send Money</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Send the exact amount and copy the transaction ID.
                        </p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#E91E8C] shadow-sm">
                        Secure pay
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[3px] text-slate-400">Send to</p>
                      <p className="mt-2 text-2xl font-black tracking-widest text-slate-900">{BKASH_NUMBER}</p>
                    </div>

                    <ol className="mt-4 space-y-2 text-xs leading-6 text-slate-500">
                      <li>1. Open bKash app and choose Send Money</li>
                      <li>2. Send ৳{finalTotal.toLocaleString('en-BD')} to the number above</li>
                      <li>3. Copy the Transaction ID</li>
                      <li>4. Enter it below</li>
                    </ol>

                    <input
                      type="text"
                      placeholder="Transaction ID (e.g. 8N7A3X2K1M)"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-mono tracking-wider outline-none transition-all duration-300 focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10"
                      style={{
                        background: '#fff',
                        border: '1px solid #f3b3cf',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="mt-5 rounded-[24px] border border-[#22c55e]/20 bg-[#22c55e]/5 p-4 sm:p-5">
                    <p className="text-base font-bold text-[#22c55e]">Cash on Delivery</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Pay when your product is delivered. No advance payment required.
                    </p>
                  </div>
                )}

                {error && <p className="mt-3 text-xs font-medium text-[#dc2626]">{error}</p>}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="mt-5 w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: paymentMethod === 'bkash' ? '#E91E8C' : '#22c55e',
                    boxShadow: paymentMethod === 'bkash'
                      ? '0 12px 30px rgba(233,30,140,0.22)'
                      : '0 12px 30px rgba(34,197,94,0.22)',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Placing Order...
                    </span>
                  ) : (
                    'Confirm Order ✓'
                  )}
                </button>

                <button
                  onClick={() => setTimeout(() => setStep('info'), 100)}
                  className="mt-3 w-full text-xs font-medium text-slate-500 transition hover:text-slate-800"
                >
                  ← Back to Delivery Info
                </button>
              </div>
            </div>

            <div className="lg:sticky lg:top-6">
              <OrderSummary
                items={items}
                subtotal={totalPrice}
                deliveryCharge={deliveryCharge}
                total={finalTotal}
              />
            </div>
          </div>
        </div>
      </PageWrap>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fbfcfa_0%,#f4f7f4_100%)] px-4 py-10">
      <style>{`
        @keyframes pop {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .pop { animation: pop 0.6s ease both; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00612E]/10 blur-3xl" />
      </div>

      <div className="pop relative w-full max-w-md rounded-[30px] border border-white/80 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#00612E]/20 bg-[#00612E]/8">
          <span className="text-4xl">🎉</span>
        </div>

        <h2 className="text-3xl font-black tracking-tight text-slate-900">Order Placed!</h2>
        <p className="mt-2 text-sm text-slate-500">We will contact you shortly.</p>
        <p className="mt-1 text-xs text-slate-400">Thank you for your order 🙏</p>

        <div className="mt-7 space-y-3">
          <button
            onClick={() => router.push('/orders')}
            className="w-full rounded-2xl bg-[#00612E] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,97,46,0.22)] transition-all duration-300 hover:-translate-y-0.5"
          >
            Track My Order →
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-2xl border border-[#00612E]/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00612E]/5"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
