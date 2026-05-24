import Navbar from '@/components/navbar'
import { CampaignForm } from '@/components/campaign-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CreateCampaignPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Create a Campaign</h1>
            <p className="text-muted-foreground mt-2">Start fundraising for your cause today</p>
          </div>

          <CampaignForm />
        </div>
      </main>
    </>
  )
}
