import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeDuplicates() {
  console.log('Starting duplicate removal process...\n');

  // Get all courses ordered by name and creation date
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, created_at')
    .order('name')
    .order('created_at');

  if (error) {
    console.error('Error fetching courses:', error);
    return;
  }

  // Group by name
  const coursesByName = new Map<string, any[]>();

  courses?.forEach(course => {
    const existing = coursesByName.get(course.name) || [];
    existing.push(course);
    coursesByName.set(course.name, existing);
  });

  // Find IDs to delete (keep the oldest, delete the rest)
  const idsToDelete: string[] = [];
  const coursesToKeep: string[] = [];

  coursesByName.forEach((courseDupes, name) => {
    if (courseDupes.length > 1) {
      // Keep the first (oldest) one
      coursesToKeep.push(courseDupes[0].id);

      // Delete the rest
      for (let i = 1; i < courseDupes.length; i++) {
        idsToDelete.push(courseDupes[i].id);
      }

      console.log(`${name}: keeping oldest (${courseDupes[0].created_at}), deleting ${courseDupes.length - 1} duplicate(s)`);
    }
  });

  console.log(`\n=== SUMMARY ===`);
  console.log(`Courses to keep: ${coursesByName.size}`);
  console.log(`Duplicates to delete: ${idsToDelete.length}`);
  console.log(`\nStarting deletion...\n`);

  // Delete duplicates in batches
  let deleted = 0;
  const batchSize = 10;

  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);

    // First, delete associated holes
    const { error: holesError } = await supabase
      .from('holes')
      .delete()
      .in('course_id', batch);

    if (holesError) {
      console.error(`Error deleting holes for batch ${i / batchSize + 1}:`, holesError.message);
      continue;
    }

    // Then delete the courses
    const { error: courseError } = await supabase
      .from('courses')
      .delete()
      .in('id', batch);

    if (courseError) {
      console.error(`Error deleting courses for batch ${i / batchSize + 1}:`, courseError.message);
      continue;
    }

    deleted += batch.length;
    console.log(`Deleted batch ${Math.floor(i / batchSize) + 1}: ${deleted}/${idsToDelete.length} duplicates removed`);
  }

  console.log(`\n✓ Cleanup complete!`);
  console.log(`  Deleted ${deleted} duplicate courses`);
  console.log(`  Remaining courses: ${coursesByName.size}`);

  // Verify final count
  const { count: finalCount, error: countError } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`  Database verification: ${finalCount} courses`);
  }
}

removeDuplicates();
