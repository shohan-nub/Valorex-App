'use client'

import { usePathname } from 'next/navigation'
import HeroNav from './heronav'
import Navbar from './Navbar'// 👉 তোমার normal navbar

export default function ConditionalNavbar() {
  const pathname = usePathname()

  // ❌ admin panel-এ কিছুই না
  if (pathname.startsWith('/adminPanel')) return null

  // ✅ home page → HeroNav
  if (pathname === '/') return <HeroNav />

  // ✅ other সব page → normal navbar
  return <Navbar />
}