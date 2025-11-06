import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase credentials
const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importCourses() {
  try {
    console.log('Starting course import...\n');

    // Read the courses data
    const coursesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'courses-data.json'), 'utf-8')
    );

    let totalCourses = 0;
    let totalHoles = 0;

    for (const courseData of coursesData) {
      console.log(`Importing: ${courseData.name}...`);

      // Insert course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          name: courseData.name,
          location: courseData.location,
          par: courseData.par,
          architect: courseData.architect,
          year_opened: courseData.year_opened,
          total_holes: 18,
        })
        .select()
        .single();

      if (courseError) {
        console.error(`  ✗ Error inserting course:`, courseError.message);
        continue;
      }

      // Insert all holes for this course
      const holesWithCourseId = courseData.holes.map((hole: any) => ({
        course_id: course.id,
        ...hole,
      }));

      const { error: holesError } = await supabase
        .from('holes')
        .insert(holesWithCourseId);

      if (holesError) {
        console.error(`  ✗ Error inserting holes:`, holesError.message);
        // Delete the course if holes failed
        await supabase.from('courses').delete().eq('id', course.id);
        continue;
      }

      totalCourses++;
      totalHoles += courseData.holes.length;
      console.log(`  ✓ Imported ${courseData.holes.length} holes`);
    }

    console.log(`\n✓ Import complete!`);
    console.log(`  Courses imported: ${totalCourses}`);
    console.log(`  Holes imported: ${totalHoles}`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

importCourses();
