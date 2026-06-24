import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import Navbar from '@/components/navbar'
import { DonationCard } from '@/components/donation-card'
import { DonorLeaderboard } from '@/components/donor-leaderboard'
import { ProgressBar } from '@/components/progress-bar'
import { DonationForm } from '@/components/donation-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton, DonateNowButton } from '@/components/campaign-actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RealtimeDonations } from '@/components/realtime-donations'
import { ArrowLeft, CalendarDays, CircleDollarSign, Users } from 'lucide-react'
import type { DonationRecord } from '@/lib/records'

function toNumber(value: string | number | null | undefined) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

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

  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', campaign.user_id)
    .maybeSingle()

  if (creatorProfile) {
    creatorName = creatorProfile.full_name || ''
    creatorInitial = creatorName?.[0]?.toUpperCase() || '?'
  } else {
    creatorInitial = campaign.user_id?.[0]?.toUpperCase() || '?'
  }

  const donorMap = new Map<
    string,
    { donor_name: string | null; total_amount: number; donation_count: number; anonymous: boolean }
  >()
  ;(donations as DonationRecord[] | null)?.forEach((d) => {
    const key = d.anonymous ? 'anonymous' : d.donor_email || d.donor_name || 'unknown'
    const existing =
      donorMap.get(key) || {
        donor_name: d.donor_name,
        total_amount: 0,
        donation_count: 0,
        anonymous: d.anonymous,
      }
    existing.total_amount += toNumber(d.amount)
    existing.donation_count += 1
    donorMap.set(key, existing)
  })
  const topDonors = Array.from(donorMap.values()).sort((a, b) => b.total_amount - a.total_amount)

  const currentAmount = toNumber(campaign.current_amount)
  const goalAmount = toNumber(campaign.goal_amount)
  const progress = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0
  const fundingPct = Math.min(progress, 100)

  return (
    <>
      <Navbar />
      <RealtimeDonations />
      <main className="relative min-h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.12),transparent_60%),radial-gradient(circle_at_right,rgba(249,115,22,0.08),transparent_45%)]" />

        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to campaigns
          </Link>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(360px,0.9fr)]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
                  <div className="space-y-5 p-6 sm:p-8 lg:p-9">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-secondary-foreground">
                        {campaign.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-[10px] font-medium text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Campaign overview
                      </span>
                      <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[10px] font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                        {fundingPct.toFixed(0)}% funded
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <h1 className="max-w-3xl break-words text-2xl font-semibold leading-[1.12] tracking-tight sm:text-3xl lg:text-[2.5rem]">
                        {campaign.title}
                      </h1>
                      <p className="max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
                        {campaign.description}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                        <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                          <CircleDollarSign className="h-4 w-4" />
                          Raised
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          MAD {currentAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                        <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                          <CircleDollarSign className="h-4 w-4" />
                          Goal
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          MAD {goalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                        <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                          <Users className="h-4 w-4" />
                          Donors
                        </p>
                        <p className="mt-2 text-lg font-semibold">{donations?.length || 0}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <ShareButton />
                      <div className="min-w-40 flex-1 sm:flex-none">
                        <DonateNowButton />
                      </div>
                    </div>
                  </div>

                  <div className="relative min-h-[280px] lg:min-h-full">
                    {campaign.image_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={campaign.image_url}
                          alt={campaign.title}
                          className="h-full w-full object-cover lg:absolute lg:inset-0"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-black/0 to-transparent" />
                      </>
                    ) : (
                      <div className="flex h-full min-h-[280px] items-center justify-center bg-gradient-to-br from-muted via-background to-secondary/50 px-8 text-center">
                        <div className="max-w-sm space-y-3">
                          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                            Campaign story
                          </p>
                          <p className="text-lg font-semibold tracking-tight">
                            Clear, focused presentation for supporters.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <Card className="rounded-[1.75rem] border-border/70 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                      {creatorInitial}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{creatorName || 'Campaign Creator'}</p>
                      <p className="text-[11px] text-muted-foreground">Campaign creator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <section className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm sm:p-8">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">Recent Donations</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Latest supporters and campaign messages.
                    </p>
                  </div>
                  {donations && donations.length > 0 && (
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                      {donations.length} total
                    </span>
                  )}
                </div>

                {donations && donations.length > 0 ? (
                  <div className="space-y-3.5">
                    {donations.map((donation) => (
                      <DonationCard
                        key={donation.id}
                        donorName={donation.donor_name}
                        amount={toNumber(donation.amount)}
                        message={donation.message}
                        anonymous={donation.anonymous}
                        createdAt={donation.created_at}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed py-10 text-center text-xs text-muted-foreground">
                    No donations yet. Be the first to support this campaign.
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <Card className="overflow-hidden rounded-[1.75rem] border-border/70 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-sm font-semibold">Campaign Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div>
                    <ProgressBar value={fundingPct} />
                    <div className="mt-3 flex justify-between text-[11px]">
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        MAD {currentAmount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        MAD {goalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {progress.toFixed(0)}% funded / {donations?.length || 0} donors
                    </p>
                  </div>

                  <div className="flex gap-2 border-t pt-4">
                    <ShareButton />
                  </div>
                </CardContent>
              </Card>

              <DonorLeaderboard donors={topDonors} />

              <div id="donation-form">
                <DonationForm campaignId={id} />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
