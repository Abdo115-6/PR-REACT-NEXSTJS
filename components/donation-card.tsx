import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { Heart } from 'lucide-react'

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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="font-semibold text-sm">
                {anonymous ? 'Anonymous Donor' : donorName || 'Donor'}
              </p>
            </div>
            {message && <p className="text-sm text-muted-foreground italic mb-2">"{message}"</p>}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-lg text-green-600">MAD {amount.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
