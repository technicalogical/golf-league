import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyCourses() {
  // Get total course count
  const { count: courseCount, error: courseError } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });

  if (courseError) {
    console.error('Error counting courses:', courseError);
    return;
  }

  // Get total hole count
  const { count: holeCount, error: holeError } = await supabase
    .from('holes')
    .select('*', { count: 'exact', head: true });

  if (holeError) {
    console.error('Error counting holes:', holeError);
    return;
  }

  console.log('\n=== DATABASE STATUS ===');
  console.log(`Total Courses: ${courseCount}`);
  console.log(`Total Holes: ${holeCount}`);
  console.log(`Target: 77 courses`);
  console.log(`Status: ${courseCount >= 77 ? '✓ COMPLETE!' : `Need ${77 - courseCount!} more courses`}`);

  // List first and last 5 courses to verify
  const { data: courses, error: listError } = await supabase
    .from('courses')
    .select('name, par, location')
    .order('name');

  if (!listError && courses) {
    console.log(`\nFirst 5 courses:`);
    courses.slice(0, 5).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} (Par ${c.par})`);
    });

    console.log(`\nLast 5 courses:`);
    courses.slice(-5).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} (Par ${c.par})`);
    });
  }
}

verifyCourses();
