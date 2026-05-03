'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  // homepage এ navbar দেখাবে না
  if (pathname === '/') return null
  return <Navbar />
}