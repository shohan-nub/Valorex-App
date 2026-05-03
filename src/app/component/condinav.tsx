'use client'

import { usePathname } from 'next/navigation'
import HeroNav from './heronav'
export default function ConditionalNavbar() {
  const pathname = usePathname()

  // 🔥 navbar hide routes
  const hideNavbar =
    pathname === '/' || pathname.startsWith('/adminPanel')

  if (hideNavbar) return null

  return <HeroNav />
}