import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true, // This is crucial for Google OAuth
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce', // Use PKCE flow (more secure and works well with Next.js)
  },
})