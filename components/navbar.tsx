'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { DonationBoxLogo } from '@/components/donation-box-logo'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Get user on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-red-100 bg-white/90 backdrop-blur-md dark:border-red-950 dark:bg-red-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <DonationBoxLogo className="h-8 w-8 text-red-600 dark:text-red-300" />
            <span className="text-lg font-semibold tracking-tight text-red-700 dark:text-red-50">
              DonationFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/campaigns" className="hover:text-primary">
              Campaigns
            </Link>
            <Link href="/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
            <Link href="/dashboard/donations" className="hover:text-primary">
              Donations
            </Link>
            <Link href="/dashboard/profile" className="hover:text-primary">
              Profile
            </Link>
            <Link href="/dashboard/settings" className="hover:text-primary">
              Settings
            </Link>
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
            className="rounded-md p-2 text-red-700 hover:bg-red-50 dark:text-red-100 dark:hover:bg-red-900/50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <Link
              href="/campaigns"
              className="block hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Campaigns
            </Link>
            <Link
              href="/dashboard"
              className="block hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/donations"
              className="block hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Donations
            </Link>
            <Link
              href="/dashboard/profile"
              className="block hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className="block hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            {user ? (
              <>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
