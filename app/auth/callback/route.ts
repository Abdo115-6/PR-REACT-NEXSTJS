import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { resolveProfileSyncData } from '@/lib/profile-data'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const profileData = resolveProfileSyncData(user)
        const payload: Record<string, string> = {
          id: user.id,
          updated_at: new Date().toISOString(),
        }

        if (profileData.full_name) {
          payload.full_name = profileData.full_name
        }

        if (profileData.avatar_url) {
          payload.avatar_url = profileData.avatar_url
        }

        await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
