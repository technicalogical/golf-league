import * as fs from 'fs';
import * as path from 'path';

interface Hole {
  hole_number: number;
  par: number;
  handicap_index: number;
  yardage_black: number;
  yardage_gold: number;
  yardage_blue: number;
  yardage_white: number;
  yardage_red: number;
}

interface Course {
  name: string;
  location: string;
  par: number;
  architect: string;
  year_opened: number;
  holes: Hole[];
}

function parseSkillFile(): Course[] {
  const skillPath = path.join(__dirname, '../.claude/plugins/golf-courses/skills/course-database/SKILL.md');
  const content = fs.readFileSync(skillPath, 'utf-8');
  const lines = content.split('\n');

  const courses: Course[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Look for course headers like "## COURSE 58: THE NEW COURSE AT ST ANDREWS"
    if (line.match(/^## COURSE \d+:/)) {
      const name = line.replace(/^## COURSE \d+:\s*/, '').trim();
      console.log(`Parsing: ${name}`);
      i++;

      // Skip empty lines
      while (i < lines.length && lines[i].trim() === '') i++;

      // Parse metadata
      let location = '';
      let architect = '';
      let year_opened = 0;
      let par = 0;

      while (i < lines.length && lines[i].startsWith('**')) {
        const metaLine = lines[i];
        if (metaLine.includes('**Location**:')) {
          location = metaLine.replace(/\*\*Location\*\*:\s*/, '').trim();
        } else if (metaLine.includes('**Architect**:')) {
          architect = metaLine.replace(/\*\*Architect\*\*:\s*/, '').trim();
        } else if (metaLine.includes('**Year Opened**:')) {
          const yearMatch = metaLine.match(/(\d{4})/);
          year_opened = yearMatch ? parseInt(yearMatch[1]) : 0;
        } else if (metaLine.includes('**Par**:')) {
          const parMatch = metaLine.match(/(\d+)/);
          par = parMatch ? parseInt(parMatch[1]) : 0;
        }
        i++;
      }

      // Find the hole-by-hole table
      while (i < lines.length && !lines[i].includes('| Hole | Par |')) i++;

      if (i >= lines.length) {
        console.log(`  ✗ No hole data found for ${name}`);
        continue;
      }

      i++; // Skip header
      i++; // Skip separator line

      const holes: Hole[] = [];

      // Parse hole rows
      while (i < lines.length) {
        const holeLine = lines[i].trim();

        if (!holeLine.startsWith('|') || holeLine.includes('OUT') || holeLine.includes('IN') || holeLine.includes('TOT')) {
          i++;
          if (holeLine === '' || holeLine.startsWith('###') || holeLine.startsWith('---')) {
            break;
          }
          continue;
        }

        const parts = holeLine.split('|').map(p => p.trim()).filter(p => p !== '');

        if (parts.length >= 7) {
          const hole_number = parseInt(parts[0]);
          const holePar = parseInt(parts[1]);

          // Handicap might be like "9/17" for men/women - take first number
          const handicapStr = parts[2].split('/')[0];
          const handicap_index = parseInt(handicapStr);

          const yardage_black = parseInt(parts[3]);
          const yardage_gold = parseInt(parts[4]);
          const yardage_blue = parseInt(parts[5]);
          const yardage_white = parseInt(parts[6]);
          const yardage_red = parseInt(parts[7]);

          if (!isNaN(hole_number) && hole_number >= 1 && hole_number <= 18) {
            holes.push({
              hole_number,
              par: holePar,
              handicap_index,
              yardage_black,
              yardage_gold,
              yardage_blue,
              yardage_white,
              yardage_red
            });
          }
        }

        i++;
      }

      if (holes.length > 0) {
        courses.push({
          name,
          location,
          par,
          architect,
          year_opened,
          holes
        });
        console.log(`  ✓ Parsed ${holes.length} holes`);
      } else {
        console.log(`  ✗ No holes parsed for ${name}`);
      }
    } else {
      i++;
    }
  }

  return courses;
}

// Main execution
const extracted = parseSkillFile();
console.log(`\n✓ Extracted ${extracted.length} courses from SKILL.md`);

// Load existing courses
const coursesDataPath = path.join(__dirname, 'courses-data.json');
const existingCourses: Course[] = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

console.log(`\nExisting courses in JSON: ${existingCourses.length}`);
console.log(`New courses from SKILL.md: ${extracted.length}`);

// Check for duplicates
const existingNames = new Set(existingCourses.map(c => c.name));
const newCourses = extracted.filter(c => !existingNames.has(c.name));

console.log(`\nNew courses to add (no duplicates): ${newCourses.length}`);

if (newCourses.length > 0) {
  // Merge and save
  const merged = [...existingCourses, ...newCourses];
  fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
  console.log(`✓ Updated courses-data.json with ${merged.length} total courses`);

  console.log('\nNew courses added:');
  newCourses.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
  });
} else {
  console.log('No new courses to add - all courses from SKILL.md are already in JSON');
}
