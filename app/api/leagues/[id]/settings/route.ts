import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leagueId } = await params;

    // Check if user is league admin or site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    const isSiteAdmin = profile?.is_site_admin || false;

    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    const isLeagueAdmin = membership?.role === 'league_admin';

    if (!isLeagueAdmin && !isSiteAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only league admins and site admins can view settings' },
        { status: 403 }
      );
    }

    // Fetch league settings
    const { data: league, error } = await supabaseAdmin
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (error || !league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(league);
  } catch (error: any) {
    console.error('Error in GET /api/leagues/[id]/settings:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leagueId } = await params;

    // Check if user is league admin or site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    const isSiteAdmin = profile?.is_site_admin || false;

    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    const isLeagueAdmin = membership?.role === 'league_admin';

    if (!isLeagueAdmin && !isSiteAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only league admins and site admins can update settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      league_day,
      league_time,
      is_public,
      landing_page_enabled,
      league_info,
      contact_name,
      contact_email,
      contact_phone,
      registration_open,
      registration_info,
      custom_rules,
    } = body;

    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (league_day !== undefined) updates.day_of_week = league_day;
    if (league_time !== undefined) updates.time_of_day = league_time;
    if (is_public !== undefined) updates.is_public = is_public;
    if (landing_page_enabled !== undefined) updates.landing_page_enabled = landing_page_enabled;
    if (league_info !== undefined) updates.league_info = league_info;
    if (contact_name !== undefined) updates.contact_name = contact_name;
    if (contact_email !== undefined) updates.contact_email = contact_email;
    if (contact_phone !== undefined) updates.contact_phone = contact_phone;
    if (registration_open !== undefined) updates.registration_open = registration_open;
    if (registration_info !== undefined) updates.registration_info = registration_info;
    if (custom_rules !== undefined) updates.custom_rules = custom_rules;

    // Update league
    const { data: league, error } = await supabaseAdmin
      .from('leagues')
      .update(updates)
      .eq('id', leagueId)
      .select()
      .single();

    if (error) {
      console.error('Error updating league settings:', error);
      return NextResponse.json(
        { error: 'Failed to update league settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(league);
  } catch (error: any) {
    console.error('Error in PATCH /api/leagues/[id]/settings:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
