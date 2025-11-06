import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeDuplicates() {
  // Get all courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name')
    .order('name, id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Find duplicates
  const seen = new Map<string, string>();
  const duplicateIds: string[] = [];

  for (const course of courses) {
    if (seen.has(course.name)) {
      // This is a duplicate - mark the newer one for deletion
      duplicateIds.push(course.id);
      console.log(`Found duplicate: ${course.name} (id: ${course.id})`);
    } else {
      seen.set(course.name, course.id);
    }
  }

  if (duplicateIds.length === 0) {
    console.log('No duplicates found!');
    return;
  }

  console.log(`\nRemoving ${duplicateIds.length} duplicate courses...`);

  // Delete holes first (foreign key constraint)
  for (const courseId of duplicateIds) {
    const { error: holesError } = await supabase
      .from('holes')
      .delete()
      .eq('course_id', courseId);

    if (holesError) {
      console.error(`Error deleting holes for course ${courseId}:`, holesError);
    }
  }

  // Delete duplicate courses
  const { error: deleteError } = await supabase
    .from('courses')
    .delete()
    .in('id', duplicateIds);

  if (deleteError) {
    console.error('Error deleting courses:', deleteError);
    return;
  }

  console.log(`✓ Removed ${duplicateIds.length} duplicate courses`);

  // Show remaining courses
  const { data: remaining } = await supabase
    .from('courses')
    .select('id, name')
    .order('name');

  console.log(`\nRemaining courses: ${remaining?.length || 0}`);
}

removeDuplicates();
