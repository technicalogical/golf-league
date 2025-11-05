import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCourses() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, name')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\nTotal courses in database: ${courses.length}\n`);
  courses.forEach((course, idx) => {
    console.log(`${idx + 1}. ${course.name}`);
  });
}

checkCourses();
