import Navbar from '@/components/navbar'
import { CampaignEditForm } from '@/components/campaign-edit-form'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!campaign || error) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Edit Campaign</h1>
            <p className="text-muted-foreground mt-2">Update your campaign details</p>
          </div>

          <CampaignEditForm campaign={campaign} />
        </div>
      </main>
    </>
  )
}
