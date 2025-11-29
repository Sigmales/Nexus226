
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/supabase-generated'

const supabase = createClient<Database>('', '')

type UserBadgeInsert = Database['public']['Tables']['user_badges']['Insert']

const insertData: UserBadgeInsert = {
    user_id: '1',
    badge_id: '1'
}

// Test user_badges insert
supabase.from('user_badges')
    .insert(insertData)
