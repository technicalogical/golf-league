import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET - Fetch a single course with holes (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    if (!profile?.is_site_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Site admin access required' },
        { status: 403 }
      );
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        holes(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error: any) {
    console.error('Error in GET /api/admin/courses/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a course and its holes (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    if (!profile?.is_site_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Site admin access required' },
        { status: 403 }
      );
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

    if (holes && Array.isArray(holes) && holes.length > 0) {
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
    }

    // Update course
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .update({
        name,
        location,
        par: par || 72,
        architect,
        year_opened,
        total_holes: holes?.length || 18,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (courseError) {
      console.error('Error updating course:', courseError);
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      );
    }

    // If holes are provided, update them
    if (holes && Array.isArray(holes) && holes.length > 0) {
      // Delete existing holes
      await supabaseAdmin.from('holes').delete().eq('course_id', params.id);

      // Create new holes
      const holesData = holes.map((hole: any) => ({
        course_id: params.id,
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
        console.error('Error updating holes:', holesError);
        return NextResponse.json(
          { error: 'Failed to update course holes' },
          { status: 500 }
        );
      }
    }

    // Fetch the complete updated course with holes
    const { data: completeCourse } = await supabaseAdmin
      .from('courses')
      .select('*, holes(*)')
      .eq('id', params.id)
      .single();

    return NextResponse.json(completeCourse);
  } catch (error: any) {
    console.error('Error in PUT /api/admin/courses/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course and its holes (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    if (!profile?.is_site_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Site admin access required' },
        { status: 403 }
      );
    }

    // Check if course exists
    const { data: course, error: fetchError } = await supabaseAdmin
      .from('courses')
      .select('id, name')
      .eq('id', params.id)
      .single();

    if (fetchError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete holes first (cascade)
    const { error: holesError } = await supabaseAdmin
      .from('holes')
      .delete()
      .eq('course_id', params.id);

    if (holesError) {
      console.error('Error deleting holes:', holesError);
      return NextResponse.json(
        { error: 'Failed to delete course holes' },
        { status: 500 }
      );
    }

    // Delete course
    const { error: courseError } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', params.id);

    if (courseError) {
      console.error('Error deleting course:', courseError);
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Course "${course.name}" deleted successfully`,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/courses/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
