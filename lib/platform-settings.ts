import type { SupabaseClient } from '@supabase/supabase-js'

export const DEFAULT_PLATFORM_FEE_PERCENTAGE = 5

export async function getPlatformFeePercentage(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('fee_percentage')
    .eq('id', 1)
    .maybeSingle()

  if (error || !data || typeof data.fee_percentage !== 'number') {
    return DEFAULT_PLATFORM_FEE_PERCENTAGE
  }

  return data.fee_percentage
}
