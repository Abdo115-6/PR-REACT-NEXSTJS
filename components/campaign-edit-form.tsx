'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'
import { createClient } from '@/lib/supabase/client'
import type { CampaignRecord } from '@/lib/records'

const categories = [
  { value: 'general', label: 'General' },
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'startup', label: 'Startup' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
]

interface CampaignEditFormProps {
  campaign: CampaignRecord
}

export function CampaignEditForm({ campaign }: CampaignEditFormProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: campaign.title ?? '',
    description: campaign.description ?? '',
    goalAmount: String(campaign.goal_amount ?? ''),
    category: campaign.category ?? 'general',
    imageUrl: campaign.image_url ?? '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.goalAmount.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in the title, description, and funding goal.',
        variant: 'destructive',
      })
      return
    }

    const goalAmount = Number(formData.goalAmount)
    if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid funding goal.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          goal_amount: goalAmount,
          category: formData.category,
          image_url: formData.imageUrl.trim() || null,
        })
        .eq('id', campaign.id)

      if (error) throw error

      toast({
        title: 'Campaign updated',
        description: 'The campaign changes were saved successfully.',
      })

      router.push('/dashboard')
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update campaign'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="space-y-1">
          <CardTitle className="text-xl">Edit Campaign</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update the public details shown on the campaign page.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Campaign Title</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <Textarea
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Funding Goal</label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={formData.goalAmount}
                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loading}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Image URL</label>
            <Input
              type="url"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              disabled={loading}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Leave empty to keep the campaign without a hero image.
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-red-600 text-white hover:bg-red-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
