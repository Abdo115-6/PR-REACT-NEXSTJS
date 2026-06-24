'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, PlusCircle } from 'lucide-react'
import { isAdmin } from '@/lib/auth'
import { getErrorMessage } from '@/lib/errors'

const categories = [
  { value: 'general', label: 'General' },
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'startup', label: 'Startup' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
]

export function CampaignForm() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: 'general',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.goalAmount || !formData.description) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    const goalAmount = parseFloat(formData.goalAmount)
    if (!goalAmount || goalAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid goal amount',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast({
          title: 'Not authenticated',
          description: 'Please log in to create a campaign',
          variant: 'destructive',
        })
        router.push('/auth/login')
        return
      }

      if (!isAdmin(user)) {
        toast({
          title: 'Not allowed',
          description: 'Only admins can create campaigns.',
          variant: 'destructive',
        })
        return
      }

      const { error } = await supabase.from('campaigns').insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        goal_amount: goalAmount,
        category: formData.category,
        status: 'active',
        current_amount: 0,
      })

      if (error) {
        console.error('Supabase insert error:', error)
        if (error.code === '23503') {
          throw new Error('Database setup issue. Check the campaigns.user_id foreign key in Supabase.')
        }
        throw new Error(error.message)
      }

      toast({
        title: 'Campaign Created!',
        description: 'Your campaign is now live and accepting donations',
      })

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } catch (error: unknown) {
      console.error('Campaign creation error:', error)
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to create campaign. Check the database schema.'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Funding Goal ($) *</label>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="Enter target amount"
                value={formData.goalAmount}
                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loading}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Creating...' : <><PlusCircle className="w-4 h-4 mr-2" /> Create Campaign</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
