import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error in GET /api/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
