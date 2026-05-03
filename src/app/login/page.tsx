'use client'
import Image from "next/image";
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setMessage('')
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
      router.push(next); router.refresh()
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Please enter your email to get reset link.')
      return
    }
    setResetLoading(true); setError(''); setMessage('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setMessage('Password reset link sent to your email!')
    } catch (err: any) { setError(err.message) }
    finally { setResetLoading(false) }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center">
            <Image src="/v2.png" alt="Valorex Logo" width={220} height={100} priority />
          </Link>
        
          <p className="text-xl text-gray-500">Login to your account</p>
        </div>

        <div className="rounded-3xl border p-8" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
          {/* Original Colorful Google Icon */}
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-medium transition hover:opacity-80 mb-6"
            style={{ borderColor: 'var(--border-2)', color: 'var(--text-1)', background: 'var(--bg-3)' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition focus:border-green-600"
              style={{ background: 'var(--bg-3)', borderColor: 'var(--border)', color: 'var(--text-1)' }} />
            
            <div className="space-y-1">
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition focus:border-green-600"
                style={{ background: 'var(--bg-3)', borderColor: 'var(--border)', color: 'var(--text-1)' }} />
              <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-[11px] text-gray-500 hover:text-green-600 transition">
                  {resetLoading ? 'Sending link...' : 'Forgot Password?'}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {message && <p className="text-xs text-green-500 font-medium">{message}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 btn-accent">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don't have an account?</span>{' '}
            <Link href={`/signup?next=${next}`} className="font-bold text-green-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() { return (<Suspense><LoginForm /></Suspense>) }