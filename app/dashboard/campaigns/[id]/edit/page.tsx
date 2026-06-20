import Navbar from '@/components/navbar'
import { CampaignEditForm } from '@/components/campaign-edit-form'
import { isAdmin } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!isSupabaseConfigured()) redirect('/auth/login')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  if (!isAdmin(user)) redirect('/dashboard')

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Edit Campaign</h1>
            <p className="mt-2 text-muted-foreground">Only admins can update campaign details.</p>
          </div>

          <CampaignEditForm campaign={campaign} />
        </div>
      </main>
    </>
  )
}
