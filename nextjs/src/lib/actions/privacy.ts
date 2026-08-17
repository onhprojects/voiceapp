'use server'

import { revalidateTag } from 'next/cache'
import { createSSRClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/types'

type AdminSetting = Tables<'admin_settings'>

/**
 * Fetches the admin settings needed to render the privacy page.
 * This is intentionally public (no auth required) so the /privacy page can be
 * viewed by anyone. Only the specific settings used for rendering are returned.
 */
export async function getPrivacySettings(): Promise<AdminSetting[]> {
  const supabase = await createSSRClient()

  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .in('option_name', [
      'privacy_policy',
      'site_title',
      'company_name',
      'support_email',
      'site_tagline',
      'contact_address',
      'support_hours',
      'phone_number',
    ])

  if (error) {
    console.error('Failed to load privacy settings:', error)
    throw new Error('Failed to load privacy settings')
  }

  return (data ?? []) as AdminSetting[]
}

/**
 * Updates the privacy policy content. Only accessible to admin users.
 */
export async function updatePrivacyPolicy(
  content: string
): Promise<AdminSetting> {
  const supabase = await createSSRClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userData } = await supabase
    .from('user_data')
    .select('user_role')
    .eq('user_id', user.id)
    .maybeSingle()
  if (userData?.user_role !== 'admin') {
    throw new Error('Forbidden: admin access required')
  }

  const { data, error } = await supabase
    .from('admin_settings')
    .update({ option_value: content, updated_at: new Date().toISOString() })
    .eq('option_name', 'privacy_policy')
    .select()
    .single()

  if (error) throw new Error(error.message)
  // Invalidate cached admin-setting reads (e.g. site title) so public
  // pages reflect the change.
  revalidateTag('admin-settings')
  return data as AdminSetting
}