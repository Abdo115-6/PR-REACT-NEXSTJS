'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProgressBar } from '@/components/progress-bar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Edit2, Trash2, Eye, Search, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  goal_amount: string
  current_amount: string
  category: string
  status: string
  created_at: string
}

interface CampaignListProps {
  campaigns: Campaign[]
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [campaigns, searchQuery, statusFilter])

  const handleDelete = async (campaignId: string) => {
    setDeleting(campaignId)
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', campaignId)
      if (error) throw error
      toast({ title: 'Success', description: 'Campaign deleted' })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete campaign',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleStatus = async (campaign: Campaign) => {
    setToggling(campaign.id)
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id)

      if (error) throw error
      toast({
        title: 'Status Updated',
        description: `Campaign is now ${newStatus}`,
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'No campaigns match your search criteria.'
                : 'No campaigns yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredCampaigns.map((campaign) => {
          const progress = (parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100

          return (
            <Card key={campaign.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{campaign.category}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        campaign.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : campaign.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}
                    >
                      {campaign.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(campaign)}
                      disabled={toggling === campaign.id}
                      title={campaign.status === 'active' ? 'Pause campaign' : 'Activate campaign'}
                    >
                      {toggling === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : campaign.status === 'active' ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>

                <div>
                  <ProgressBar value={Math.min(progress, 100)} />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="font-semibold">
                      MAD {parseFloat(campaign.current_amount).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      MAD {parseFloat(campaign.goal_amount).toLocaleString()} ({progress.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/campaigns/${campaign.id}/edit`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        disabled={deleting === campaign.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleting === campaign.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{campaign.title}&quot;? This action cannot be undone.
                          All donation data associated with this campaign will also be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(campaign.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
