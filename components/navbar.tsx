'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { DonationBoxLogo } from '@/components/donation-box-logo'
import { Menu, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const supabaseConfigured = isSupabaseConfigured()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Get user on mount
  useEffect(() => {
    const getUser = async () => {
      if (!supabaseConfigured) {
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabaseConfigured])

  const handleLogout = async () => {
    if (!supabaseConfigured) return

    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/90 backdrop-blur-md dark:border-border/70 dark:bg-card/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <DonationBoxLogo className="h-8 w-8 text-red-600 dark:text-red-300" />
            <span className="text-lg font-semibold tracking-tight text-red-700 dark:text-red-100">
              DonationFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/campaigns" className="hover:text-red-600 dark:hover:text-red-200">
              Campaigns
            </Link>
            <Link href="/dashboard" className="hover:text-red-600 dark:hover:text-red-200">
              Dashboard
            </Link>
            <Link href="/dashboard/donations" className="hover:text-red-600 dark:hover:text-red-200">
              Donations
            </Link>
            <Link href="/dashboard/profile" className="hover:text-red-600 dark:hover:text-red-200">
              Profile
            </Link>
            <Link href="/dashboard/settings" className="hover:text-red-600 dark:hover:text-red-200">
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
              className="rounded-md p-2 text-red-700 hover:bg-red-50 dark:text-red-100 dark:hover:bg-muted/70"
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
              className="block hover:text-red-600 dark:hover:text-red-200"
              onClick={() => setIsOpen(false)}
            >
              Campaigns
            </Link>
            <Link
              href="/dashboard"
              className="block hover:text-red-600 dark:hover:text-red-200"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/donations"
              className="block hover:text-red-600 dark:hover:text-red-200"
              onClick={() => setIsOpen(false)}
            >
              Donations
            </Link>
            <Link
              href="/dashboard/profile"
              className="block hover:text-red-600 dark:hover:text-red-200"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className="block hover:text-red-600 dark:hover:text-red-200"
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
