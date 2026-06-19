import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import Navbar from '@/components/navbar'
import { DonationCard } from '@/components/donation-card'
import { DonorLeaderboard } from '@/components/donor-leaderboard'
import { ProgressBar } from '@/components/progress-bar'
import { DonationForm } from '@/components/donation-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton, DonateNowButton } from '@/components/campaign-actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RealtimeDonations } from '@/components/realtime-donations'
import { ArrowLeft } from 'lucide-react'

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!isSupabaseConfigured()) notFound()

  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })

  let creatorName = ''
  let creatorInitial = '?'

  try {
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', campaign.user_id)
      .single()
    if (creatorProfile) {
      creatorName = creatorProfile.full_name || ''
      creatorInitial = creatorName?.[0] || ''
    }
  } catch {
    creatorInitial = campaign.user_id?.[0]?.toUpperCase() || '?'
  }

  // Compute top donors for leaderboard
  const donorMap = new Map<string, { donor_name: string | null; total_amount: number; donation_count: number; anonymous: boolean }>()
  donations?.forEach((d: any) => {
    const key = d.anonymous ? 'anonymous' : (d.donor_email || d.donor_name || 'unknown')
    const existing = donorMap.get(key) || { donor_name: d.donor_name, total_amount: 0, donation_count: 0, anonymous: d.anonymous }
    existing.total_amount += parseFloat(d.amount)
    existing.donation_count += 1
    donorMap.set(key, existing)
  })
  const topDonors = Array.from(donorMap.values())
    .sort((a, b) => b.total_amount - a.total_amount)

  const progress = (parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100

  return (
    <>
      <Navbar />
      <RealtimeDonations />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              {campaign.image_url && (
                <div className="w-full h-96 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={campaign.image_url}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Campaign Info */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">{campaign.category}</p>
                <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
                <p className="text-lg text-muted-foreground">{campaign.description}</p>
              </div>

              {/* Creator Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {creatorInitial}
                    </div>
                    <div>
                      <p className="font-semibold">{creatorName || 'Campaign Creator'}</p>
                      <p className="text-sm text-muted-foreground">Campaign Creator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Donations */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Recent Donations</h3>
                {donations && donations.length > 0 ? (
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <DonationCard
                        key={donation.id}
                        donorName={donation.donor_name}
                        amount={parseFloat(donation.amount)}
                        message={donation.message}
                        anonymous={donation.anonymous}
                        createdAt={donation.created_at}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No donations yet. Be the first to donate!</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <ProgressBar value={Math.min(progress, 100)} />
                    <div className="flex justify-between mt-3 text-sm">
                      <span className="font-semibold">
                        MAD {parseFloat(campaign.current_amount).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        MAD {parseFloat(campaign.goal_amount).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {progress.toFixed(0)}% funded • {donations?.length || 0} donors
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <ShareButton />
                  </div>
                  <div className="pt-2">
                    <DonateNowButton />
                  </div>
                </CardContent>
              </Card>

              {/* Donor Leaderboard */}
              <DonorLeaderboard donors={topDonors} />

              {/* Donation Form */}
              <div id="donation-form">
                <DonationForm campaignId={id} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
