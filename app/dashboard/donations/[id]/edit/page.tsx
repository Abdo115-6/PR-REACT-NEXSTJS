import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/navbar'
import { DonationEditForm } from '@/components/donation-edit-form'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

type DonationRow = {
  id: string
  campaign_id: string
  donor_id: string | null
  donor_email: string | null
  amount: string | number
  donor_name: string | null
  message: string | null
  anonymous: boolean
  created_at: string
}

export default async function EditDonationPage({
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

  const { data: donationByUser } = await supabase
    .from('donations')
    .select('*')
    .eq('id', id)
    .eq('donor_id', user.id)
    .maybeSingle()

  let donation = donationByUser as DonationRow | null

  if (!donation && user.email) {
    const { data: donationByEmail } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .eq('donor_email', user.email)
      .maybeSingle()

    donation = donationByEmail as DonationRow | null
  }

  if (!donation) notFound()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title')
    .eq('id', donation.campaign_id)
    .maybeSingle()

  if (!campaign) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/donations"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to donations
          </Link>

          <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Donation management</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Donation</h1>
            <p className="mt-2 text-muted-foreground">
              Update the donation linked to {campaign.title}.
            </p>
          </div>

          <DonationEditForm donation={donation} campaignTitle={campaign.title} />
        </div>
      </main>
    </>
  )
}
