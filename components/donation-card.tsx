import { formatDistanceToNow } from 'date-fns'
import { CalendarDays, EyeOff, MessageSquare, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DonationCardProps {
  donorName: string | null
  amount: number
  message: string | null
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
  const displayName = anonymous ? 'Anonymous supporter' : donorName?.trim() || 'Supporter'
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const createdDate = new Date(createdAt)
  const relativeDate = Number.isNaN(createdDate.getTime())
    ? 'Unknown date'
    : formatDistanceToNow(createdDate, { addSuffix: true })

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm transition-all hover:border-red-200 hover:shadow-md dark:hover:border-red-900">
      <CardHeader className="border-b bg-muted/20 pb-4 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{displayName}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {anonymous ? 'Private donor' : 'Public donor'}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {relativeDate}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold text-green-700 dark:text-green-300">
              MAD {safeAmount.toLocaleString()}
            </p>
            <Badge variant={anonymous ? 'secondary' : 'outline'} className="mt-1">
              {anonymous ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  Anonymous
                </>
              ) : (
                'Public'
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {message ? (
        <CardContent className="space-y-2 py-4">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </p>
          <p className="text-sm leading-6 text-foreground/90">{message}</p>
        </CardContent>
      ) : (
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">No public message was left with this donation.</p>
        </CardContent>
      )}
    </Card>
  )
}
