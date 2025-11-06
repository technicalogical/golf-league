import * as fs from 'fs';
import * as path from 'path';

// Part 2 courses - Batch 2
const part2Batch2 = [
  {
    name: "Hazeltine National Golf Club",
    location: "Chaska, Minnesota USA",
    par: 72,
    architect: "Robert Trent Jones",
    year_opened: 1962,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 7, yardage_black: 442, yardage_gold: 412, yardage_blue: 390, yardage_white: 379, yardage_red: 321},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 426, yardage_gold: 384, yardage_blue: 369, yardage_white: 360, yardage_red: 308},
      {hole_number: 3, par: 5, handicap_index: 1, yardage_black: 569, yardage_gold: 560, yardage_blue: 522, yardage_white: 469, yardage_red: 397},
      {hole_number: 4, par: 3, handicap_index: 17, yardage_black: 205, yardage_gold: 186, yardage_blue: 160, yardage_white: 142, yardage_red: 142},
      {hole_number: 5, par: 4, handicap_index: 3, yardage_black: 394, yardage_gold: 375, yardage_blue: 368, yardage_white: 344, yardage_red: 283},
      {hole_number: 6, par: 4, handicap_index: 5, yardage_black: 380, yardage_gold: 369, yardage_blue: 345, yardage_white: 338, yardage_red: 256},
      {hole_number: 7, par: 5, handicap_index: 9, yardage_black: 561, yardage_gold: 512, yardage_blue: 499, yardage_white: 431, yardage_red: 431},
      {hole_number: 8, par: 3, handicap_index: 15, yardage_black: 166, yardage_gold: 144, yardage_blue: 124, yardage_white: 116, yardage_red: 116},
      {hole_number: 9, par: 4, handicap_index: 11, yardage_black: 426, yardage_gold: 389, yardage_blue: 376, yardage_white: 320, yardage_red: 320},
      {hole_number: 10, par: 4, handicap_index: 10, yardage_black: 424, yardage_gold: 404, yardage_blue: 378, yardage_white: 370, yardage_red: 321},
      {hole_number: 11, par: 5, handicap_index: 4, yardage_black: 559, yardage_gold: 539, yardage_blue: 504, yardage_white: 442, yardage_red: 400},
      {hole_number: 12, par: 4, handicap_index: 2, yardage_black: 447, yardage_gold: 423, yardage_blue: 374, yardage_white: 369, yardage_red: 313},
      {hole_number: 13, par: 3, handicap_index: 16, yardage_black: 198, yardage_gold: 174, yardage_blue: 166, yardage_white: 144, yardage_red: 144},
      {hole_number: 14, par: 4, handicap_index: 14, yardage_black: 350, yardage_gold: 329, yardage_blue: 310, yardage_white: 303, yardage_red: 303},
      {hole_number: 15, par: 5, handicap_index: 6, yardage_black: 575, yardage_gold: 539, yardage_blue: 526, yardage_white: 467, yardage_red: 427},
      {hole_number: 16, par: 4, handicap_index: 12, yardage_black: 380, yardage_gold: 347, yardage_blue: 315, yardage_white: 239, yardage_red: 239},
      {hole_number: 17, par: 3, handicap_index: 18, yardage_black: 182, yardage_gold: 156, yardage_blue: 135, yardage_white: 108, yardage_red: 108},
      {hole_number: 18, par: 4, handicap_index: 8, yardage_black: 439, yardage_gold: 407, yardage_blue: 363, yardage_white: 346, yardage_red: 307}
    ]
  },
  {
    name: "Hazeltine National Golf Club - Ryder Cup Edition",
    location: "Chaska, Minnesota USA",
    par: 72,
    architect: "Robert Trent Jones",
    year_opened: 1962,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 7, yardage_black: 491, yardage_gold: 412, yardage_blue: 390, yardage_white: 379, yardage_red: 321},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 431, yardage_gold: 384, yardage_blue: 369, yardage_white: 360, yardage_red: 308},
      {hole_number: 3, par: 5, handicap_index: 1, yardage_black: 634, yardage_gold: 560, yardage_blue: 522, yardage_white: 469, yardage_red: 397},
      {hole_number: 4, par: 3, handicap_index: 17, yardage_black: 208, yardage_gold: 186, yardage_blue: 160, yardage_white: 142, yardage_red: 142},
      {hole_number: 5, par: 4, handicap_index: 14, yardage_black: 350, yardage_gold: 329, yardage_blue: 310, yardage_white: 303, yardage_red: 303},
      {hole_number: 6, par: 5, handicap_index: 6, yardage_black: 640, yardage_gold: 539, yardage_blue: 526, yardage_white: 467, yardage_red: 427},
      {hole_number: 7, par: 4, handicap_index: 12, yardage_black: 396, yardage_gold: 347, yardage_blue: 315, yardage_white: 239, yardage_red: 239},
      {hole_number: 8, par: 3, handicap_index: 18, yardage_black: 182, yardage_gold: 156, yardage_blue: 135, yardage_white: 108, yardage_red: 108},
      {hole_number: 9, par: 4, handicap_index: 8, yardage_black: 475, yardage_gold: 407, yardage_blue: 363, yardage_white: 346, yardage_red: 307},
      {hole_number: 10, par: 4, handicap_index: 10, yardage_black: 450, yardage_gold: 404, yardage_blue: 378, yardage_white: 370, yardage_red: 321},
      {hole_number: 11, par: 5, handicap_index: 4, yardage_black: 589, yardage_gold: 539, yardage_blue: 504, yardage_white: 442, yardage_red: 400},
      {hole_number: 12, par: 4, handicap_index: 2, yardage_black: 519, yardage_gold: 423, yardage_blue: 374, yardage_white: 369, yardage_red: 313},
      {hole_number: 13, par: 3, handicap_index: 16, yardage_black: 248, yardage_gold: 174, yardage_blue: 166, yardage_white: 144, yardage_red: 144},
      {hole_number: 14, par: 4, handicap_index: 3, yardage_black: 441, yardage_gold: 375, yardage_blue: 368, yardage_white: 344, yardage_red: 283},
      {hole_number: 15, par: 4, handicap_index: 5, yardage_black: 403, yardage_gold: 369, yardage_blue: 345, yardage_white: 338, yardage_red: 256},
      {hole_number: 16, par: 5, handicap_index: 9, yardage_black: 569, yardage_gold: 512, yardage_blue: 499, yardage_white: 431, yardage_red: 431},
      {hole_number: 17, par: 3, handicap_index: 15, yardage_black: 176, yardage_gold: 144, yardage_blue: 124, yardage_white: 116, yardage_red: 116},
      {hole_number: 18, par: 4, handicap_index: 11, yardage_black: 432, yardage_gold: 389, yardage_blue: 376, yardage_white: 320, yardage_red: 320}
    ]
  },
  {
    name: "The Heather",
    location: "Harbor Springs, Michigan USA",
    par: 72,
    architect: "Robert Trent Jones",
    year_opened: 1966,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 13, yardage_black: 344, yardage_gold: 310, yardage_blue: 301, yardage_white: 289, yardage_red: 276},
      {hole_number: 2, par: 4, handicap_index: 9, yardage_black: 369, yardage_gold: 356, yardage_blue: 340, yardage_white: 307, yardage_red: 286},
      {hole_number: 3, par: 4, handicap_index: 7, yardage_black: 428, yardage_gold: 388, yardage_blue: 352, yardage_white: 331, yardage_red: 296},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 207, yardage_gold: 192, yardage_blue: 172, yardage_white: 150, yardage_red: 137},
      {hole_number: 5, par: 5, handicap_index: 1, yardage_black: 464, yardage_gold: 434, yardage_blue: 428, yardage_white: 399, yardage_red: 351},
      {hole_number: 6, par: 3, handicap_index: 17, yardage_black: 152, yardage_gold: 138, yardage_blue: 127, yardage_white: 116, yardage_red: 90},
      {hole_number: 7, par: 4, handicap_index: 11, yardage_black: 379, yardage_gold: 341, yardage_blue: 330, yardage_white: 308, yardage_red: 282},
      {hole_number: 8, par: 4, handicap_index: 5, yardage_black: 434, yardage_gold: 381, yardage_blue: 348, yardage_white: 324, yardage_red: 280},
      {hole_number: 9, par: 5, handicap_index: 3, yardage_black: 551, yardage_gold: 525, yardage_blue: 508, yardage_white: 470, yardage_red: 398},
      {hole_number: 10, par: 4, handicap_index: 14, yardage_black: 412, yardage_gold: 375, yardage_blue: 345, yardage_white: 330, yardage_red: 319},
      {hole_number: 11, par: 5, handicap_index: 2, yardage_black: 525, yardage_gold: 512, yardage_blue: 497, yardage_white: 459, yardage_red: 394},
      {hole_number: 12, par: 3, handicap_index: 16, yardage_black: 166, yardage_gold: 147, yardage_blue: 126, yardage_white: 116, yardage_red: 72},
      {hole_number: 13, par: 4, handicap_index: 8, yardage_black: 415, yardage_gold: 385, yardage_blue: 371, yardage_white: 358, yardage_red: 249},
      {hole_number: 14, par: 4, handicap_index: 6, yardage_black: 453, yardage_gold: 432, yardage_blue: 416, yardage_white: 400, yardage_red: 361},
      {hole_number: 15, par: 5, handicap_index: 10, yardage_black: 488, yardage_gold: 468, yardage_blue: 454, yardage_white: 436, yardage_red: 295},
      {hole_number: 16, par: 3, handicap_index: 18, yardage_black: 185, yardage_gold: 171, yardage_blue: 160, yardage_white: 146, yardage_red: 136},
      {hole_number: 17, par: 4, handicap_index: 12, yardage_black: 396, yardage_gold: 371, yardage_blue: 362, yardage_white: 317, yardage_red: 270},
      {hole_number: 18, par: 4, handicap_index: 4, yardage_black: 447, yardage_gold: 436, yardage_blue: 413, yardage_white: 395, yardage_red: 357}
    ]
  },
  {
    name: "Hollow Grounds",
    location: "Edinburgh, Scotland",
    par: 72,
    architect: "aboutGolf",
    year_opened: 2003,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 17, yardage_black: 329, yardage_gold: 308, yardage_blue: 303, yardage_white: 247, yardage_red: 210},
      {hole_number: 2, par: 5, handicap_index: 1, yardage_black: 606, yardage_gold: 580, yardage_blue: 554, yardage_white: 467, yardage_red: 356},
      {hole_number: 3, par: 4, handicap_index: 7, yardage_black: 342, yardage_gold: 332, yardage_blue: 303, yardage_white: 288, yardage_red: 269},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 176, yardage_gold: 161, yardage_blue: 144, yardage_white: 122, yardage_red: 91},
      {hole_number: 5, par: 4, handicap_index: 13, yardage_black: 379, yardage_gold: 341, yardage_blue: 330, yardage_white: 308, yardage_red: 282},
      {hole_number: 6, par: 4, handicap_index: 3, yardage_black: 433, yardage_gold: 381, yardage_blue: 351, yardage_white: 327, yardage_red: 270},
      {hole_number: 7, par: 3, handicap_index: 9, yardage_black: 201, yardage_gold: 179, yardage_blue: 153, yardage_white: 91, yardage_red: 73},
      {hole_number: 8, par: 4, handicap_index: 11, yardage_black: 343, yardage_gold: 334, yardage_blue: 323, yardage_white: 315, yardage_red: 261},
      {hole_number: 9, par: 5, handicap_index: 5, yardage_black: 395, yardage_gold: 369, yardage_blue: 358, yardage_white: 322, yardage_red: 282},
      {hole_number: 10, par: 4, handicap_index: 8, yardage_black: 401, yardage_gold: 369, yardage_blue: 361, yardage_white: 344, yardage_red: 318},
      {hole_number: 11, par: 3, handicap_index: 10, yardage_black: 185, yardage_gold: 171, yardage_blue: 160, yardage_white: 146, yardage_red: 134},
      {hole_number: 12, par: 4, handicap_index: 6, yardage_black: 395, yardage_gold: 386, yardage_blue: 371, yardage_white: 340, yardage_red: 317},
      {hole_number: 13, par: 5, handicap_index: 4, yardage_black: 530, yardage_gold: 521, yardage_blue: 510, yardage_white: 498, yardage_red: 470},
      {hole_number: 14, par: 4, handicap_index: 16, yardage_black: 325, yardage_gold: 306, yardage_blue: 287, yardage_white: 274, yardage_red: 251},
      {hole_number: 15, par: 4, handicap_index: 2, yardage_black: 453, yardage_gold: 433, yardage_blue: 416, yardage_white: 401, yardage_red: 361},
      {hole_number: 16, par: 3, handicap_index: 18, yardage_black: 179, yardage_gold: 162, yardage_blue: 157, yardage_white: 153, yardage_red: 134},
      {hole_number: 17, par: 5, handicap_index: 12, yardage_black: 506, yardage_gold: 494, yardage_blue: 474, yardage_white: 380, yardage_red: 352},
      {hole_number: 18, par: 4, handicap_index: 14, yardage_black: 333, yardage_gold: 325, yardage_blue: 304, yardage_white: 294, yardage_red: 277}
    ]
  }
];

async function addBatch2() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 2 Batch 2 courses to add: ${part2Batch2.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part2Batch2.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 2 Batch 2 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add');
  }
}

addBatch2();
