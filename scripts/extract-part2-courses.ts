import * as fs from 'fs';
import * as path from 'path';

// Part 2 Courses - extracted from part2.pdf
const part2Courses = [
  {
    name: "PGA Centenary at Gleneagles",
    location: "Auchterarder, Perth and Kinross UK",
    par: 72,
    architect: "Jack Nicklaus",
    year_opened: 1993,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 9, yardage_black: 420, yardage_gold: 388, yardage_blue: 358, yardage_white: 346, yardage_red: 296},
      {hole_number: 2, par: 5, handicap_index: 7, yardage_black: 513, yardage_gold: 498, yardage_blue: 472, yardage_white: 454, yardage_red: 426},
      {hole_number: 3, par: 4, handicap_index: 3, yardage_black: 447, yardage_gold: 404, yardage_blue: 385, yardage_white: 311, yardage_red: 303},
      {hole_number: 4, par: 3, handicap_index: 13, yardage_black: 246, yardage_gold: 215, yardage_blue: 195, yardage_white: 186, yardage_red: 154},
      {hole_number: 5, par: 4, handicap_index: 1, yardage_black: 456, yardage_gold: 414, yardage_blue: 380, yardage_white: 357, yardage_red: 274},
      {hole_number: 6, par: 3, handicap_index: 15, yardage_black: 204, yardage_gold: 178, yardage_blue: 164, yardage_white: 159, yardage_red: 140},
      {hole_number: 7, par: 4, handicap_index: 5, yardage_black: 460, yardage_gold: 396, yardage_blue: 369, yardage_white: 362, yardage_red: 322},
      {hole_number: 8, par: 4, handicap_index: 17, yardage_black: 429, yardage_gold: 406, yardage_blue: 343, yardage_white: 314, yardage_red: 276},
      {hole_number: 9, par: 5, handicap_index: 11, yardage_black: 605, yardage_gold: 546, yardage_blue: 518, yardage_white: 492, yardage_red: 456},
      {hole_number: 10, par: 3, handicap_index: 12, yardage_black: 211, yardage_gold: 192, yardage_blue: 157, yardage_white: 148, yardage_red: 129},
      {hole_number: 11, par: 4, handicap_index: 16, yardage_black: 337, yardage_gold: 319, yardage_blue: 298, yardage_white: 282, yardage_red: 263},
      {hole_number: 12, par: 4, handicap_index: 6, yardage_black: 462, yardage_gold: 444, yardage_blue: 429, yardage_white: 380, yardage_red: 355},
      {hole_number: 13, par: 4, handicap_index: 2, yardage_black: 490, yardage_gold: 475, yardage_blue: 452, yardage_white: 442, yardage_red: 401},
      {hole_number: 14, par: 4, handicap_index: 14, yardage_black: 326, yardage_gold: 316, yardage_blue: 294, yardage_white: 276, yardage_red: 241},
      {hole_number: 15, par: 4, handicap_index: 4, yardage_black: 470, yardage_gold: 446, yardage_blue: 411, yardage_white: 370, yardage_red: 331},
      {hole_number: 16, par: 5, handicap_index: 8, yardage_black: 529, yardage_gold: 501, yardage_blue: 466, yardage_white: 421, yardage_red: 376},
      {hole_number: 17, par: 3, handicap_index: 18, yardage_black: 182, yardage_gold: 171, yardage_blue: 158, yardage_white: 133, yardage_red: 114},
      {hole_number: 18, par: 5, handicap_index: 10, yardage_black: 497, yardage_gold: 470, yardage_blue: 445, yardage_white: 414, yardage_red: 387}
    ]
  },
  {
    name: "Grand Country Club",
    location: "Yeoju, Kyunggi-Do, South Korea",
    par: 72,
    architect: "Kato Siskei",
    year_opened: 1989,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 7, yardage_black: 414, yardage_gold: 410, yardage_blue: 394, yardage_white: 371, yardage_red: 364},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 350, yardage_gold: 347, yardage_blue: 326, yardage_white: 315, yardage_red: 267},
      {hole_number: 3, par: 5, handicap_index: 17, yardage_black: 521, yardage_gold: 509, yardage_blue: 483, yardage_white: 442, yardage_red: 432},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 145, yardage_gold: 136, yardage_blue: 133, yardage_white: 130, yardage_red: 120},
      {hole_number: 5, par: 4, handicap_index: 1, yardage_black: 422, yardage_gold: 421, yardage_blue: 416, yardage_white: 410, yardage_red: 387},
      {hole_number: 6, par: 4, handicap_index: 3, yardage_black: 434, yardage_gold: 430, yardage_blue: 425, yardage_white: 417, yardage_red: 391},
      {hole_number: 7, par: 3, handicap_index: 9, yardage_black: 171, yardage_gold: 168, yardage_blue: 166, yardage_white: 159, yardage_red: 116},
      {hole_number: 8, par: 5, handicap_index: 5, yardage_black: 550, yardage_gold: 523, yardage_blue: 506, yardage_white: 489, yardage_red: 476},
      {hole_number: 9, par: 4, handicap_index: 11, yardage_black: 380, yardage_gold: 376, yardage_blue: 372, yardage_white: 369, yardage_red: 331},
      {hole_number: 10, par: 5, handicap_index: 16, yardage_black: 555, yardage_gold: 554, yardage_blue: 536, yardage_white: 520, yardage_red: 453},
      {hole_number: 11, par: 4, handicap_index: 4, yardage_black: 391, yardage_gold: 386, yardage_blue: 374, yardage_white: 367, yardage_red: 324},
      {hole_number: 12, par: 4, handicap_index: 18, yardage_black: 356, yardage_gold: 350, yardage_blue: 335, yardage_white: 329, yardage_red: 297},
      {hole_number: 13, par: 3, handicap_index: 10, yardage_black: 178, yardage_gold: 172, yardage_blue: 168, yardage_white: 156, yardage_red: 142},
      {hole_number: 14, par: 4, handicap_index: 8, yardage_black: 380, yardage_gold: 376, yardage_blue: 365, yardage_white: 361, yardage_red: 344},
      {hole_number: 15, par: 3, handicap_index: 14, yardage_black: 170, yardage_gold: 166, yardage_blue: 160, yardage_white: 142, yardage_red: 137},
      {hole_number: 16, par: 5, handicap_index: 12, yardage_black: 509, yardage_gold: 508, yardage_blue: 488, yardage_white: 483, yardage_red: 433},
      {hole_number: 17, par: 4, handicap_index: 6, yardage_black: 396, yardage_gold: 379, yardage_blue: 371, yardage_white: 361, yardage_red: 353},
      {hole_number: 18, par: 4, handicap_index: 2, yardage_black: 414, yardage_gold: 405, yardage_blue: 401, yardage_white: 381, yardage_red: 288}
    ]
  },
  // Continue with remaining Part 2 courses...
];

async function addPart2Courses() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`Current courses in JSON: ${existingCourses.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part2Courses.filter(c => !existingNames.has(c.name));

  console.log(`New Part 2 courses to add: ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses`);

    console.log('\nNew Part 2 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name}`);
    });
  } else {
    console.log('No new courses to add');
  }
}

addPart2Courses();
