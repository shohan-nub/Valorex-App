'use client'
import Image from "next/image";
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

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Required: All fields (Password min 6 chars).')
      return
    }
    setLoading(true)
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      })
      if (signupError) throw signupError
      if (data.session) { router.push(next); router.refresh() }
      else { setError('Account created! Please check your email to verify.') }
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
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
          
          <p className="text-xl text-gray-500">Join the Valorex family</p>
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
            Sign up with Google
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition focus:border-green-600"
              style={{ background: 'var(--bg-3)', borderColor: 'var(--border)', color: 'var(--text-1)' }} />
            
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition focus:border-green-600"
              style={{ background: 'var(--bg-3)', borderColor: 'var(--border)', color: 'var(--text-1)' }} />
            
            <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition focus:border-green-600"
              style={{ background: 'var(--bg-3)', borderColor: 'var(--border)', color: 'var(--text-1)' }} />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 btn-accent">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already have an account?</span>{' '}
            <Link href={`/login?next=${next}`} className="font-bold text-green-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() { return (<Suspense><SignupForm /></Suspense>) }