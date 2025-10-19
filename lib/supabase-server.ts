import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Sync Auth0 user to Supabase profiles table
export async function syncUserProfile(session: any) {
  if (!session?.user) return null;

  const { user } = session;
  const userId = user.sub; // Auth0 user ID

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          email: user.email,
          name: user.name || null,
          avatar_url: user.picture || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new profile
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          name: user.name || null,
          avatar_url: user.picture || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error syncing user profile:', error);
    return null;
  }
}
