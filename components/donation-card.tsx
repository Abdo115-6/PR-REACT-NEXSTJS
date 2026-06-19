import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { CircleDollarSign } from 'lucide-react'

interface DonationCardProps {
  donorName?: string
  amount: number
  message?: string
  anonymous: boolean
  createdAt: string
}

export function DonationCard({
  donorName,
  amount,
  message,
  anonymous,
  createdAt,
}: DonationCardProps) {
  return (
    <Card className="border-border/70 bg-card shadow-sm transition-colors hover:border-red-200 dark:hover:border-red-900">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3.5">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <CircleDollarSign className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold sm:text-sm">
                {anonymous ? 'Anonymous Donor' : donorName || 'Donor'}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </p>
              {message && (
                <p className="mt-2.5 rounded-md border bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground sm:text-sm">
                  &quot;{message}&quot;
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-300 sm:text-sm">
              MAD {amount.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
