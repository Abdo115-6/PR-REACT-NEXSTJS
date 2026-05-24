"use server"

import { createClient } from '@/lib/supabase/server'

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, message: 'Not authenticated' }

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const goalAmountRaw = String(formData.get('goalAmount') ?? '').trim()
  const category = String(formData.get('category') ?? 'general').trim() || 'general'
  const goalAmount = Number(goalAmountRaw)

  if (!title || !description || !Number.isFinite(goalAmount) || goalAmount <= 0) {
    return { ok: false as const, message: 'Please fill in all required fields with valid values.' }
  }

  const { error } = await supabase.from('campaigns').insert({
    user_id: user.id,
    title,
    description,
    goal_amount: goalAmount,
    category,
    status: 'active',
    current_amount: 0,
  })

  if (error) return { ok: false as const, message: error.message }

  return { ok: true as const }
}
