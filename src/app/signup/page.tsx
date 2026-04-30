'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('নাম দাও।'); return }
    if (!email.trim()) { setError('Email দাও।'); return }
    if (password.length < 6) { setError('Password কমপক্ষে ৬ character হতে হবে।'); return }

    setLoading(true)

    const supabase = createClient()

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      })

      if (signupError) throw signupError

      // Email confirmation off থাকলে সরাসরি session পাবে
      if (data.session) {
        router.push(next)
        router.refresh()
        return
      }

      // Confirmation on থাকলে
      if (data.user && !data.session) {
        setError('✉️ Email চেক করো — confirmation link পাঠানো হয়েছে।')
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed'
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        setError('এই email দিয়ে আগেই account আছে।')
      } else if (msg.includes('Database error')) {
        setError('Database সমস্যা — Supabase SQL trigger ঠিক করো।')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-1)' }}>
            ⚽ JerseyShop
          </Link>
          <p className="text-sm mt-2" style={{ color: 'var(--text-3)' }}>নতুন account বানাও</p>
        </div>

        <div className="rounded-2xl border p-6"
          style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border text-sm font-medium transition hover:opacity-80 mb-4"
            style={{ borderColor: 'var(--border-2)', color: 'var(--text-1)', background: 'var(--bg-3)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />

            {error && (
              <p className="text-xs px-1" style={{ color: error.startsWith('✉️') ? 'var(--accent)' : 'var(--red)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 btn-accent"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-3)' }}>
            আগেই account আছে?{' '}
            <Link href={`/login${next !== '/' ? `?next=${next}` : ''}`}
              className="font-semibold hover:underline"
              style={{ color: 'var(--accent)' }}>
              Login করো
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}