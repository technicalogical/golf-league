import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listPart4Courses() {
  // Part 4 course names
  const part4Courses = [
    'Peligro Range',
    'Pine Needles Golf Club',
    'Pine Rivers Championship Golf Club',
    'Bay Harbor - The Preserve',
    'Red Rock Valley',
    'TPC Sawgrass',
    'Scottish Brae Country Club',
    'TPC Scottsdale',
    'Shady Dunes',
    'SheShan International Golf Club',
    'The Links at Spanish Bay (Archive 2012)',
    'The Links at Spanish Bay (Current 2016)',
    'Spyglass Hill Golf Course (Archive 2011)',
    'Spyglass Hill Golf Course (Current 2016)',
    'The Jubilee Course at St Andrews (Archive 2011)',
    'The Jubilee Course at St Andrews (Current 2016)',
    'The New Course at St Andrews (Archive 2011)'
  ];

  console.log('Checking for Part 4 courses in database...\n');

  let foundCount = 0;
  let missingCourses: string[] = [];

  for (const courseName of part4Courses) {
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, par')
      .eq('name', courseName)
      .maybeSingle();

    if (data) {
      console.log(`✓ ${courseName} (Par ${data.par})`);
      foundCount++;
    } else {
      console.log(`✗ ${courseName} - NOT FOUND`);
      missingCourses.push(courseName);
    }
  }

  console.log(`\n=== Part 4 Summary ===`);
  console.log(`Found: ${foundCount}/${part4Courses.length}`);
  console.log(`Missing: ${missingCourses.length}`);

  if (missingCourses.length > 0) {
    console.log('\nMissing courses:');
    missingCourses.forEach(c => console.log(`  - ${c}`));
  }
}

listPart4Courses();
