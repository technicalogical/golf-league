import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: session.user.email,
          name: session.user.name,
          avatar_url: session.user.picture,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }

      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      display_name,
      bio,
      phone,
      show_email,
      show_phone,
      complete_onboarding,
    } = body;

    const updates: any = {};

    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (show_email !== undefined) updates.show_email = show_email;
    if (show_phone !== undefined) updates.show_phone = show_phone;

    if (complete_onboarding) {
      updates.profile_completed = true;
      updates.onboarding_completed_at = new Date().toISOString();
    }

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    let profile;
    let error;

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const createData = {
        id: userId,
        email: session.user.email,
        name: session.user.name,
        avatar_url: session.user.picture,
        ...updates,
      };

      const result = await supabaseAdmin
        .from('profiles')
        .insert(createData)
        .select()
        .single();

      profile = result.data;
      error = result.error;
    } else {
      // Update existing profile
      const result = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      profile = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error in PATCH /api/profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
