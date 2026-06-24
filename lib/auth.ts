import type { User } from '@supabase/supabase-js'

const DEFAULT_ADMIN_EMAILS = ['admin@donation.com']

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || ''
}

function getAdminEmails() {
  const configuredEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')
    .map(normalizeEmail)
    .filter((value) => value.length > 0)

  return configuredEmails && configuredEmails.length > 0 ? configuredEmails : DEFAULT_ADMIN_EMAILS
}

export function isAdminEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return false
  }

  return getAdminEmails().includes(normalizedEmail)
}

export function isAdmin(user: Pick<User, 'app_metadata' | 'email'> | null | undefined) {
  return Boolean(user && (isAdminEmail(user.email) || user.app_metadata?.role === 'admin'))
}
