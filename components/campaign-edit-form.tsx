'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface CampaignEditFormProps {
  campaign: any
}

export function CampaignEditForm({ campaign }: CampaignEditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: campaign.title,
    description: campaign.description,
    category: campaign.category,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
        })
        .eq('id', campaign.id)

      if (error) throw error

      toast({
        title: 'Success!',
        description: 'Your campaign has been updated',
      })

      router.push(`/campaigns/${campaign.id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update campaign',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'general',
    'medical',
    'education',
    'emergency',
    'startup',
    'community',
    'other',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Title *</label>
            <Input
              type="text"
              placeholder="Give your campaign a compelling title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              placeholder="Tell the story of your campaign. Why are you raising funds? What will the money be used for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={5}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>


          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Updating...' : 'Update Campaign'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
