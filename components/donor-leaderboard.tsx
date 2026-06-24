import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DonorSummary {
  donor_name: string | null
  total_amount: number
  donation_count: number
  anonymous: boolean
}

interface DonorLeaderboardProps {
  donors: DonorSummary[]
}

export function DonorLeaderboard({ donors }: DonorLeaderboardProps) {
  const visibleDonors = donors.slice(0, 5)

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border-border/70 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-sm font-semibold">Top Donors</CardTitle>
        <p className="text-[11px] text-muted-foreground">Supporters ranked by the total amount they contributed.</p>
      </CardHeader>

      <CardContent className="space-y-3 pt-5">
        {visibleDonors.length > 0 ? (
          <ul className="space-y-3">
            {visibleDonors.map((donor, index) => {
              const displayName = donor.anonymous ? 'Anonymous supporter' : donor.donor_name?.trim() || 'Supporter'
              const rank = index + 1

              return (
                <li
                  key={`${displayName}-${rank}-${donor.total_amount}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-3 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-700 dark:bg-muted dark:text-red-100">
                    {rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{displayName}</p>
                      {donor.anonymous && (
                        <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {donor.donation_count} donation{donor.donation_count === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      MAD {Number(donor.total_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            No donors yet. The leaderboard will populate after the first donations arrive.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
