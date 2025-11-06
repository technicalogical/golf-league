import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findDuplicates() {
  console.log('Finding duplicate courses...\n');

  // Get all courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name, location, par, created_at')
    .order('name')
    .order('created_at');

  if (error) {
    console.error('Error fetching courses:', error);
    return;
  }

  // Group by name to find duplicates
  const coursesByName = new Map<string, any[]>();

  courses?.forEach(course => {
    const existing = coursesByName.get(course.name) || [];
    existing.push(course);
    coursesByName.set(course.name, existing);
  });

  // Find duplicates
  const duplicates = Array.from(coursesByName.entries())
    .filter(([_, courses]) => courses.length > 1);

  console.log(`Total unique course names: ${coursesByName.size}`);
  console.log(`Course names with duplicates: ${duplicates.length}`);
  console.log(`Total course records: ${courses?.length}`);
  console.log(`Expected after cleanup: ${coursesByName.size}\n`);

  // Show details of duplicates
  console.log('Duplicate courses:');
  duplicates.forEach(([name, courseDupes]) => {
    console.log(`\n${name} (${courseDupes.length} copies):`);
    courseDupes.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ID: ${c.id}, Created: ${c.created_at}`);
    });
  });

  // Summary
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total duplicates to remove: ${courses!.length - coursesByName.size}`);
}

findDuplicates();
