export interface CampaignRecord {
  id: string
  user_id?: string | null
  title: string
  description: string | null
  goal_amount: string | number
  current_amount: string | number
  category: string | null
  status?: string | null
  image_url?: string | null
  created_at?: string | null
}

export interface CampaignWithDonorCount extends CampaignRecord {
  donorCount: number
}

export interface DonationRecord {
  id: string
  campaign_id?: string | null
  donor_id?: string | null
  donor_name: string | null
  donor_email?: string | null
  amount: string | number
  message: string | null
  anonymous: boolean
  platform_fee?: string | number | null
  created_at: string
}

export interface DonationInsert {
  campaign_id: string
  donor_id: string | null
  amount: number
  donor_name: string | null
  donor_email: string | null
  message: string | null
  anonymous: boolean
  platform_fee?: number
  platform_fee_percentage?: number
}
