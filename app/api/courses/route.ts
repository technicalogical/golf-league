import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Get all courses with their holes
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        holes(*)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    return NextResponse.json(courses || []);
  } catch (error: any) {
    console.error('Error in GET /api/courses:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, location, par, architect, year_opened, holes } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      );
    }

    if (!holes || !Array.isArray(holes) || holes.length === 0) {
      return NextResponse.json(
        { error: 'Course must have at least one hole' },
        { status: 400 }
      );
    }

    // Validate holes
    const validationErrors: string[] = [];
    holes.forEach((hole, index) => {
      if (!hole.hole_number || hole.hole_number < 1 || hole.hole_number > 18) {
        validationErrors.push(`Hole ${index + 1}: Invalid hole number`);
      }
      if (!hole.par || ![3, 4, 5].includes(hole.par)) {
        validationErrors.push(`Hole ${index + 1}: Par must be 3, 4, or 5`);
      }
      if (!hole.handicap_index || hole.handicap_index < 1 || hole.handicap_index > 18) {
        validationErrors.push(`Hole ${index + 1}: Handicap index must be between 1 and 18`);
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation errors', details: validationErrors },
        { status: 400 }
      );
    }

    // Create course
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert({
        name,
        location,
        par: par || 72,
        architect,
        year_opened,
        total_holes: holes.length,
      })
      .select()
      .single();

    if (courseError) {
      console.error('Error creating course:', courseError);
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      );
    }

    // Create holes
    const holesData = holes.map((hole: any) => ({
      course_id: course.id,
      hole_number: hole.hole_number,
      par: hole.par,
      handicap_index: hole.handicap_index,
      yardage: hole.yardage || null,
      yardage_black: hole.yardage_black || null,
      yardage_gold: hole.yardage_gold || null,
      yardage_blue: hole.yardage_blue || null,
      yardage_white: hole.yardage_white || null,
      yardage_red: hole.yardage_red || null,
    }));

    const { error: holesError } = await supabaseAdmin
      .from('holes')
      .insert(holesData);

    if (holesError) {
      console.error('Error creating holes:', holesError);
      // Rollback course creation
      await supabaseAdmin.from('courses').delete().eq('id', course.id);
      return NextResponse.json(
        { error: 'Failed to create course holes' },
        { status: 500 }
      );
    }

    // Fetch the complete course with holes
    const { data: completeCourse } = await supabaseAdmin
      .from('courses')
      .select('*, holes(*)')
      .eq('id', course.id)
      .single();

    return NextResponse.json(completeCourse, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/courses:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
