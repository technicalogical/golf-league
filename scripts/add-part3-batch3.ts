import * as fs from 'fs';
import * as path from 'path';

// Part 3 Courses - Batch 3 (Final Part 3 batch)
const part3Batch3 = [
  {
    name: "Nine Dragons A",
    location: "Zhejiang, China",
    par: 37,
    architect: "Ron Garl",
    year_opened: 2003,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 7, yardage_black: 404, yardage_gold: 379, yardage_blue: 344, yardage_white: 314, yardage_red: 285},
      {hole_number: 2, par: 5, handicap_index: 1, yardage_black: 561, yardage_gold: 516, yardage_blue: 474, yardage_white: 449, yardage_red: 413},
      {hole_number: 3, par: 3, handicap_index: 9, yardage_black: 173, yardage_gold: 167, yardage_blue: 150, yardage_white: 128, yardage_red: 120},
      {hole_number: 4, par: 5, handicap_index: 3, yardage_black: 504, yardage_gold: 475, yardage_blue: 444, yardage_white: 413, yardage_red: 385},
      {hole_number: 5, par: 4, handicap_index: 5, yardage_black: 457, yardage_gold: 447, yardage_blue: 383, yardage_white: 354, yardage_red: 316},
      {hole_number: 6, par: 3, handicap_index: 8, yardage_black: 203, yardage_gold: 178, yardage_blue: 161, yardage_white: 138, yardage_red: 119},
      {hole_number: 7, par: 4, handicap_index: 6, yardage_black: 411, yardage_gold: 387, yardage_blue: 353, yardage_white: 315, yardage_red: 290},
      {hole_number: 8, par: 4, handicap_index: 4, yardage_black: 449, yardage_gold: 423, yardage_blue: 390, yardage_white: 355, yardage_red: 330},
      {hole_number: 9, par: 5, handicap_index: 2, yardage_black: 509, yardage_gold: 488, yardage_blue: 472, yardage_white: 447, yardage_red: 428}
    ]
  },
  {
    name: "Nine Dragons B&C",
    location: "Zhejiang, China",
    par: 72,
    architect: "Ron Garl",
    year_opened: 2003,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 13, yardage_black: 387, yardage_gold: 359, yardage_blue: 319, yardage_white: 289, yardage_red: 284},
      {hole_number: 2, par: 4, handicap_index: 5, yardage_black: 461, yardage_gold: 431, yardage_blue: 393, yardage_white: 360, yardage_red: 324},
      {hole_number: 3, par: 5, handicap_index: 3, yardage_black: 539, yardage_gold: 514, yardage_blue: 455, yardage_white: 399, yardage_red: 354},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 207, yardage_gold: 195, yardage_blue: 178, yardage_white: 161, yardage_red: 122},
      {hole_number: 5, par: 4, handicap_index: 7, yardage_black: 446, yardage_gold: 421, yardage_blue: 389, yardage_white: 360, yardage_red: 327},
      {hole_number: 6, par: 4, handicap_index: 9, yardage_black: 431, yardage_gold: 422, yardage_blue: 385, yardage_white: 335, yardage_red: 294},
      {hole_number: 7, par: 3, handicap_index: 17, yardage_black: 176, yardage_gold: 164, yardage_blue: 150, yardage_white: 136, yardage_red: 121},
      {hole_number: 8, par: 5, handicap_index: 1, yardage_black: 582, yardage_gold: 547, yardage_blue: 515, yardage_white: 478, yardage_red: 453},
      {hole_number: 9, par: 4, handicap_index: 11, yardage_black: 435, yardage_gold: 418, yardage_blue: 387, yardage_white: 361, yardage_red: 325},
      {hole_number: 10, par: 4, handicap_index: 12, yardage_black: 393, yardage_gold: 359, yardage_blue: 325, yardage_white: 289, yardage_red: 287},
      {hole_number: 11, par: 5, handicap_index: 2, yardage_black: 578, yardage_gold: 556, yardage_blue: 505, yardage_white: 473, yardage_red: 431},
      {hole_number: 12, par: 4, handicap_index: 10, yardage_black: 401, yardage_gold: 377, yardage_blue: 350, yardage_white: 311, yardage_red: 290},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 154, yardage_gold: 145, yardage_blue: 133, yardage_white: 105, yardage_red: 99},
      {hole_number: 14, par: 4, handicap_index: 14, yardage_black: 385, yardage_gold: 357, yardage_blue: 324, yardage_white: 306, yardage_red: 277},
      {hole_number: 15, par: 4, handicap_index: 6, yardage_black: 475, yardage_gold: 446, yardage_blue: 397, yardage_white: 355, yardage_red: 313},
      {hole_number: 16, par: 3, handicap_index: 16, yardage_black: 193, yardage_gold: 168, yardage_blue: 144, yardage_white: 132, yardage_red: 119},
      {hole_number: 17, par: 4, handicap_index: 8, yardage_black: 394, yardage_gold: 368, yardage_blue: 336, yardage_white: 316, yardage_red: 296},
      {hole_number: 18, par: 5, handicap_index: 4, yardage_black: 489, yardage_gold: 467, yardage_blue: 434, yardage_white: 398, yardage_red: 369}
    ]
  },
  {
    name: "Old Palm Golf Club",
    location: "Palm Beach Gardens, Florida USA",
    par: 72,
    architect: "Raymond Floyd",
    year_opened: 2004,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 9, yardage_black: 410, yardage_gold: 383, yardage_blue: 371, yardage_white: 339, yardage_red: 289},
      {hole_number: 2, par: 3, handicap_index: 7, yardage_black: 191, yardage_gold: 174, yardage_blue: 160, yardage_white: 138, yardage_red: 107},
      {hole_number: 3, par: 4, handicap_index: 3, yardage_black: 432, yardage_gold: 399, yardage_blue: 366, yardage_white: 331, yardage_red: 302},
      {hole_number: 4, par: 5, handicap_index: 1, yardage_black: 583, yardage_gold: 534, yardage_blue: 509, yardage_white: 471, yardage_red: 423},
      {hole_number: 5, par: 4, handicap_index: 15, yardage_black: 399, yardage_gold: 356, yardage_blue: 307, yardage_white: 274, yardage_red: 236},
      {hole_number: 6, par: 3, handicap_index: 11, yardage_black: 174, yardage_gold: 162, yardage_blue: 148, yardage_white: 133, yardage_red: 121},
      {hole_number: 7, par: 4, handicap_index: 5, yardage_black: 428, yardage_gold: 392, yardage_blue: 338, yardage_white: 300, yardage_red: 262},
      {hole_number: 8, par: 4, handicap_index: 17, yardage_black: 377, yardage_gold: 363, yardage_blue: 335, yardage_white: 294, yardage_red: 263},
      {hole_number: 9, par: 5, handicap_index: 13, yardage_black: 506, yardage_gold: 442, yardage_blue: 409, yardage_white: 382, yardage_red: 332},
      {hole_number: 10, par: 4, handicap_index: 2, yardage_black: 450, yardage_gold: 439, yardage_blue: 398, yardage_white: 366, yardage_red: 331},
      {hole_number: 11, par: 3, handicap_index: 10, yardage_black: 212, yardage_gold: 196, yardage_blue: 177, yardage_white: 146, yardage_red: 125},
      {hole_number: 12, par: 5, handicap_index: 4, yardage_black: 563, yardage_gold: 551, yardage_blue: 512, yardage_white: 461, yardage_red: 407},
      {hole_number: 13, par: 4, handicap_index: 16, yardage_black: 385, yardage_gold: 359, yardage_blue: 329, yardage_white: 302, yardage_red: 281},
      {hole_number: 14, par: 4, handicap_index: 6, yardage_black: 449, yardage_gold: 420, yardage_blue: 380, yardage_white: 337, yardage_red: 291},
      {hole_number: 15, par: 3, handicap_index: 18, yardage_black: 155, yardage_gold: 135, yardage_blue: 114, yardage_white: 67, yardage_red: 53},
      {hole_number: 16, par: 4, handicap_index: 8, yardage_black: 428, yardage_gold: 398, yardage_blue: 366, yardage_white: 323, yardage_red: 312},
      {hole_number: 17, par: 5, handicap_index: 14, yardage_black: 537, yardage_gold: 511, yardage_blue: 484, yardage_white: 424, yardage_red: 382},
      {hole_number: 18, par: 4, handicap_index: 12, yardage_black: 427, yardage_gold: 358, yardage_blue: 334, yardage_white: 328, yardage_red: 269}
    ]
  },
  {
    name: "Oriental University City Golf Course",
    location: "Langfang, China",
    par: 72,
    architect: "Yu Gang",
    year_opened: 2002,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 13, yardage_black: 407, yardage_gold: 377, yardage_blue: 343, yardage_white: 326, yardage_red: 307},
      {hole_number: 2, par: 3, handicap_index: 9, yardage_black: 162, yardage_gold: 136, yardage_blue: 133, yardage_white: 132, yardage_red: 133},
      {hole_number: 3, par: 5, handicap_index: 17, yardage_black: 515, yardage_gold: 471, yardage_blue: 434, yardage_white: 418, yardage_red: 381},
      {hole_number: 4, par: 3, handicap_index: 11, yardage_black: 152, yardage_gold: 128, yardage_blue: 119, yardage_white: 107, yardage_red: 88},
      {hole_number: 5, par: 4, handicap_index: 5, yardage_black: 396, yardage_gold: 376, yardage_blue: 363, yardage_white: 324, yardage_red: 289},
      {hole_number: 6, par: 5, handicap_index: 1, yardage_black: 536, yardage_gold: 516, yardage_blue: 484, yardage_white: 452, yardage_red: 421},
      {hole_number: 7, par: 4, handicap_index: 3, yardage_black: 446, yardage_gold: 427, yardage_blue: 407, yardage_white: 372, yardage_red: 334},
      {hole_number: 8, par: 4, handicap_index: 7, yardage_black: 392, yardage_gold: 367, yardage_blue: 341, yardage_white: 323, yardage_red: 299},
      {hole_number: 9, par: 4, handicap_index: 15, yardage_black: 379, yardage_gold: 358, yardage_blue: 338, yardage_white: 313, yardage_red: 285},
      {hole_number: 10, par: 4, handicap_index: 18, yardage_black: 395, yardage_gold: 383, yardage_blue: 366, yardage_white: 332, yardage_red: 301},
      {hole_number: 11, par: 5, handicap_index: 4, yardage_black: 560, yardage_gold: 534, yardage_blue: 503, yardage_white: 477, yardage_red: 444},
      {hole_number: 12, par: 4, handicap_index: 14, yardage_black: 425, yardage_gold: 414, yardage_blue: 386, yardage_white: 361, yardage_red: 325},
      {hole_number: 13, par: 3, handicap_index: 12, yardage_black: 206, yardage_gold: 197, yardage_blue: 186, yardage_white: 169, yardage_red: 141},
      {hole_number: 14, par: 4, handicap_index: 6, yardage_black: 443, yardage_gold: 424, yardage_blue: 400, yardage_white: 371, yardage_red: 336},
      {hole_number: 15, par: 4, handicap_index: 10, yardage_black: 403, yardage_gold: 382, yardage_blue: 361, yardage_white: 328, yardage_red: 293},
      {hole_number: 16, par: 4, handicap_index: 16, yardage_black: 382, yardage_gold: 361, yardage_blue: 342, yardage_white: 313, yardage_red: 285},
      {hole_number: 17, par: 3, handicap_index: 8, yardage_black: 160, yardage_gold: 153, yardage_blue: 132, yardage_white: 121, yardage_red: 100},
      {hole_number: 18, par: 5, handicap_index: 2, yardage_black: 529, yardage_gold: 515, yardage_blue: 494, yardage_white: 467, yardage_red: 446}
    ]
  }
];

async function addPart3Batch3() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 3 Batch 3 courses to add: ${part3Batch3.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part3Batch3.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 3 Batch 3 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add - all already exist');
  }
}

addPart3Batch3();
