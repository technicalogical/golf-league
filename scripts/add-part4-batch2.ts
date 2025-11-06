import * as fs from 'fs';
import * as path from 'path';

// Part 4 Courses - Batch 2
const part4Batch2 = [
  {
    name: "Red Rock Valley",
    location: "Moab, Utah USA",
    par: 65,
    architect: "aboutGolf",
    year_opened: 2004,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 13, yardage_black: 359, yardage_gold: 341, yardage_blue: 293, yardage_white: 278, yardage_red: 216},
      {hole_number: 2, par: 3, handicap_index: 5, yardage_black: 183, yardage_gold: 165, yardage_blue: 144, yardage_white: 126, yardage_red: 106},
      {hole_number: 3, par: 4, handicap_index: 11, yardage_black: 354, yardage_gold: 340, yardage_blue: 286, yardage_white: 272, yardage_red: 217},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 173, yardage_gold: 166, yardage_blue: 141, yardage_white: 134, yardage_red: 111},
      {hole_number: 5, par: 4, handicap_index: 7, yardage_black: 352, yardage_gold: 346, yardage_blue: 279, yardage_white: 271, yardage_red: 210},
      {hole_number: 6, par: 4, handicap_index: 1, yardage_black: 360, yardage_gold: 354, yardage_blue: 299, yardage_white: 292, yardage_red: 223},
      {hole_number: 7, par: 4, handicap_index: 3, yardage_black: 363, yardage_gold: 356, yardage_blue: 250, yardage_white: 244, yardage_red: 226},
      {hole_number: 8, par: 3, handicap_index: 17, yardage_black: 181, yardage_gold: 161, yardage_blue: 142, yardage_white: 121, yardage_red: 99},
      {hole_number: 9, par: 3, handicap_index: 9, yardage_black: 179, yardage_gold: 170, yardage_blue: 146, yardage_white: 138, yardage_red: 108},
      {hole_number: 10, par: 4, handicap_index: 6, yardage_black: 353, yardage_gold: 334, yardage_blue: 316, yardage_white: 258, yardage_red: 201},
      {hole_number: 11, par: 4, handicap_index: 2, yardage_black: 352, yardage_gold: 333, yardage_blue: 286, yardage_white: 273, yardage_red: 223},
      {hole_number: 12, par: 4, handicap_index: 12, yardage_black: 354, yardage_gold: 328, yardage_blue: 319, yardage_white: 282, yardage_red: 213},
      {hole_number: 13, par: 3, handicap_index: 14, yardage_black: 193, yardage_gold: 172, yardage_blue: 148, yardage_white: 131, yardage_red: 112},
      {hole_number: 14, par: 4, handicap_index: 10, yardage_black: 379, yardage_gold: 347, yardage_blue: 332, yardage_white: 316, yardage_red: 224},
      {hole_number: 15, par: 4, handicap_index: 6, yardage_black: 348, yardage_gold: 328, yardage_blue: 302, yardage_white: 284, yardage_red: 210},
      {hole_number: 16, par: 3, handicap_index: 18, yardage_black: 198, yardage_gold: 190, yardage_blue: 180, yardage_white: 162, yardage_red: 102},
      {hole_number: 17, par: 3, handicap_index: 8, yardage_black: 197, yardage_gold: 181, yardage_blue: 164, yardage_white: 147, yardage_red: 104},
      {hole_number: 18, par: 4, handicap_index: 4, yardage_black: 347, yardage_gold: 329, yardage_blue: 291, yardage_white: 269, yardage_red: 224}
    ]
  },
  {
    name: "TPC Sawgrass",
    location: "Ponte Vedra Beach, Florida USA",
    par: 72,
    architect: "Pete Dye, Alice Dye",
    year_opened: 1980,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 422, yardage_gold: 394, yardage_blue: 394, yardage_white: 359, yardage_red: 292},
      {hole_number: 2, par: 5, handicap_index: 15, yardage_black: 531, yardage_gold: 506, yardage_blue: 506, yardage_white: 468, yardage_red: 379},
      {hole_number: 3, par: 3, handicap_index: 17, yardage_black: 177, yardage_gold: 160, yardage_blue: 134, yardage_white: 134, yardage_red: 97},
      {hole_number: 4, par: 4, handicap_index: 9, yardage_black: 384, yardage_gold: 359, yardage_blue: 359, yardage_white: 324, yardage_red: 263},
      {hole_number: 5, par: 4, handicap_index: 3, yardage_black: 471, yardage_gold: 446, yardage_blue: 422, yardage_white: 422, yardage_red: 360},
      {hole_number: 6, par: 4, handicap_index: 13, yardage_black: 393, yardage_gold: 360, yardage_blue: 360, yardage_white: 332, yardage_red: 269},
      {hole_number: 7, par: 4, handicap_index: 1, yardage_black: 441, yardage_gold: 406, yardage_blue: 382, yardage_white: 382, yardage_red: 329},
      {hole_number: 8, par: 3, handicap_index: 7, yardage_black: 236, yardage_gold: 195, yardage_blue: 167, yardage_white: 167, yardage_red: 120},
      {hole_number: 9, par: 5, handicap_index: 5, yardage_black: 582, yardage_gold: 546, yardage_blue: 522, yardage_white: 522, yardage_red: 447},
      {hole_number: 10, par: 4, handicap_index: 12, yardage_black: 424, yardage_gold: 388, yardage_blue: 388, yardage_white: 351, yardage_red: 247},
      {hole_number: 11, par: 5, handicap_index: 8, yardage_black: 558, yardage_gold: 519, yardage_blue: 469, yardage_white: 469, yardage_red: 395},
      {hole_number: 12, par: 4, handicap_index: 16, yardage_black: 358, yardage_gold: 331, yardage_blue: 331, yardage_white: 313, yardage_red: 243},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 180, yardage_gold: 155, yardage_blue: 155, yardage_white: 140, yardage_red: 108},
      {hole_number: 14, par: 4, handicap_index: 4, yardage_black: 480, yardage_gold: 435, yardage_blue: 376, yardage_white: 376, yardage_red: 333},
      {hole_number: 15, par: 4, handicap_index: 6, yardage_black: 449, yardage_gold: 416, yardage_blue: 366, yardage_white: 366, yardage_red: 283},
      {hole_number: 16, par: 5, handicap_index: 10, yardage_black: 522, yardage_gold: 485, yardage_blue: 485, yardage_white: 469, yardage_red: 414},
      {hole_number: 17, par: 3, handicap_index: 14, yardage_black: 137, yardage_gold: 128, yardage_blue: 128, yardage_white: 115, yardage_red: 92},
      {hole_number: 18, par: 4, handicap_index: 2, yardage_black: 461, yardage_gold: 426, yardage_blue: 426, yardage_white: 386, yardage_red: 336}
    ]
  },
  {
    name: "Scottish Brae Country Club",
    location: "Kerry, Ireland",
    par: 72,
    architect: "aboutGolf",
    year_opened: 2005,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 409, yardage_gold: 384, yardage_blue: 344, yardage_white: 324, yardage_red: 284},
      {hole_number: 2, par: 4, handicap_index: 7, yardage_black: 379, yardage_gold: 361, yardage_blue: 342, yardage_white: 314, yardage_red: 248},
      {hole_number: 3, par: 5, handicap_index: 5, yardage_black: 537, yardage_gold: 529, yardage_blue: 463, yardage_white: 446, yardage_red: 380},
      {hole_number: 4, par: 4, handicap_index: 17, yardage_black: 336, yardage_gold: 331, yardage_blue: 308, yardage_white: 298, yardage_red: 265},
      {hole_number: 5, par: 3, handicap_index: 15, yardage_black: 160, yardage_gold: 150, yardage_blue: 129, yardage_white: 110, yardage_red: 58},
      {hole_number: 6, par: 4, handicap_index: 1, yardage_black: 486, yardage_gold: 469, yardage_blue: 435, yardage_white: 433, yardage_red: 421},
      {hole_number: 7, par: 3, handicap_index: 13, yardage_black: 222, yardage_gold: 182, yardage_blue: 167, yardage_white: 115, yardage_red: 83},
      {hole_number: 8, par: 4, handicap_index: 3, yardage_black: 426, yardage_gold: 418, yardage_blue: 343, yardage_white: 334, yardage_red: 291},
      {hole_number: 9, par: 5, handicap_index: 9, yardage_black: 506, yardage_gold: 493, yardage_blue: 486, yardage_white: 474, yardage_red: 467},
      {hole_number: 10, par: 4, handicap_index: 18, yardage_black: 382, yardage_gold: 376, yardage_blue: 344, yardage_white: 327, yardage_red: 283},
      {hole_number: 11, par: 5, handicap_index: 6, yardage_black: 537, yardage_gold: 526, yardage_blue: 511, yardage_white: 502, yardage_red: 438},
      {hole_number: 12, par: 4, handicap_index: 12, yardage_black: 450, yardage_gold: 439, yardage_blue: 330, yardage_white: 320, yardage_red: 258},
      {hole_number: 13, par: 3, handicap_index: 16, yardage_black: 172, yardage_gold: 135, yardage_blue: 118, yardage_white: 83, yardage_red: 75},
      {hole_number: 14, par: 5, handicap_index: 10, yardage_black: 486, yardage_gold: 479, yardage_blue: 449, yardage_white: 445, yardage_red: 369},
      {hole_number: 15, par: 4, handicap_index: 4, yardage_black: 407, yardage_gold: 402, yardage_blue: 331, yardage_white: 319, yardage_red: 268},
      {hole_number: 16, par: 3, handicap_index: 14, yardage_black: 179, yardage_gold: 170, yardage_blue: 134, yardage_white: 123, yardage_red: 111},
      {hole_number: 17, par: 4, handicap_index: 2, yardage_black: 428, yardage_gold: 403, yardage_blue: 354, yardage_white: 312, yardage_red: 274},
      {hole_number: 18, par: 4, handicap_index: 8, yardage_black: 431, yardage_gold: 379, yardage_blue: 365, yardage_white: 354, yardage_red: 267}
    ]
  },
  {
    name: "TPC Scottsdale",
    location: "Scottsdale, Arizona USA",
    par: 71,
    architect: "Jay Morrish, Tom Weiskopf",
    year_opened: 1986,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 14, yardage_black: 410, yardage_gold: 366, yardage_blue: 351, yardage_white: 341, yardage_red: 319},
      {hole_number: 2, par: 4, handicap_index: 8, yardage_black: 416, yardage_gold: 393, yardage_blue: 376, yardage_white: 364, yardage_red: 340},
      {hole_number: 3, par: 5, handicap_index: 4, yardage_black: 554, yardage_gold: 536, yardage_blue: 514, yardage_white: 484, yardage_red: 377},
      {hole_number: 4, par: 3, handicap_index: 18, yardage_black: 175, yardage_gold: 156, yardage_blue: 150, yardage_white: 133, yardage_red: 101},
      {hole_number: 5, par: 4, handicap_index: 6, yardage_black: 453, yardage_gold: 445, yardage_blue: 416, yardage_white: 374, yardage_red: 349},
      {hole_number: 6, par: 4, handicap_index: 12, yardage_black: 436, yardage_gold: 407, yardage_blue: 365, yardage_white: 348, yardage_red: 320},
      {hole_number: 7, par: 3, handicap_index: 16, yardage_black: 215, yardage_gold: 196, yardage_blue: 190, yardage_white: 165, yardage_red: 137},
      {hole_number: 8, par: 4, handicap_index: 2, yardage_black: 470, yardage_gold: 446, yardage_blue: 414, yardage_white: 402, yardage_red: 391},
      {hole_number: 9, par: 4, handicap_index: 10, yardage_black: 464, yardage_gold: 420, yardage_blue: 382, yardage_white: 356, yardage_red: 328},
      {hole_number: 10, par: 4, handicap_index: 11, yardage_black: 403, yardage_gold: 394, yardage_blue: 385, yardage_white: 363, yardage_red: 340},
      {hole_number: 11, par: 4, handicap_index: 1, yardage_black: 468, yardage_gold: 443, yardage_blue: 439, yardage_white: 408, yardage_red: 372},
      {hole_number: 12, par: 3, handicap_index: 15, yardage_black: 194, yardage_gold: 170, yardage_blue: 149, yardage_white: 124, yardage_red: 107},
      {hole_number: 13, par: 5, handicap_index: 5, yardage_black: 595, yardage_gold: 578, yardage_blue: 552, yardage_white: 517, yardage_red: 472},
      {hole_number: 14, par: 4, handicap_index: 7, yardage_black: 477, yardage_gold: 448, yardage_blue: 419, yardage_white: 396, yardage_red: 361},
      {hole_number: 15, par: 5, handicap_index: 9, yardage_black: 552, yardage_gold: 496, yardage_blue: 468, yardage_white: 439, yardage_red: 403},
      {hole_number: 16, par: 3, handicap_index: 17, yardage_black: 162, yardage_gold: 157, yardage_blue: 143, yardage_white: 120, yardage_red: 100},
      {hole_number: 17, par: 4, handicap_index: 13, yardage_black: 332, yardage_gold: 292, yardage_blue: 254, yardage_white: 246, yardage_red: 230},
      {hole_number: 18, par: 4, handicap_index: 3, yardage_black: 438, yardage_gold: 427, yardage_blue: 410, yardage_white: 385, yardage_red: 363}
    ]
  }
];

async function addPart4Batch2() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 4 Batch 2 courses to add: ${part4Batch2.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part4Batch2.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 4 Batch 2 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add - all already exist');
  }
}

addPart4Batch2();
