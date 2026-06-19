'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { Heart, Target, UserPlus, Activity } from 'lucide-react'

interface ActivityEvent {
  id: string
  type: 'donation' | 'campaign_created' | 'campaign_updated'
  title: string
  description: string
  amount?: number
  timestamp: string
  icon: React.ReactNode
}

interface ActivityFeedProps {
  userId: string
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const supabase = createClient()
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, title, created_at')
        .eq('user_id', userId)

      if (!campaigns || campaigns.length === 0) {
        setLoading(false)
        return
      }

      const campaignIds = campaigns.map(c => c.id)
      const campaignMap = Object.fromEntries(campaigns.map(c => [c.id, c.title]))

      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false })
        .limit(20)

      const events: ActivityEvent[] = []

      donations?.forEach(d => {
        events.push({
          id: `d-${d.id}`,
          type: 'donation',
          title: `Donation received`,
          description: `${d.anonymous ? 'Someone' : d.donor_name || 'A donor'} donated to "${campaignMap[d.campaign_id] || 'Unknown'}"`,
          amount: parseFloat(d.amount),
          timestamp: d.created_at,
          icon: <Heart className="w-4 h-4 text-red-500" />,
        })
      })

      campaigns.forEach(c => {
        events.push({
          id: `c-${c.id}`,
          type: 'campaign_created',
          title: 'Campaign created',
          description: `You created "${c.title}"`,
          timestamp: c.created_at,
          icon: <Target className="w-4 h-4 text-blue-500" />,
        })
      })

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(events.slice(0, 20))
      setLoading(false)
    }

    loadActivities()

    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        () => {
          loadActivities()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No activity yet. Create a campaign to get started!</p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {activities.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                    {event.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {event.amount && (
                        <span className="text-xs font-semibold text-green-600">
                          +MAD {event.amount.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
