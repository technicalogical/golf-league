import * as fs from 'fs';
import * as path from 'path';

// Part 3 Courses - Batch 1
const part3Batch1 = [
  {
    name: "Links at Casa de Campo (Archive 2011)",
    location: "La Romana, Dominican Republic",
    par: 72,
    architect: "Pete Dye",
    year_opened: 1976,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 404, yardage_gold: 388, yardage_blue: 361, yardage_white: 338, yardage_red: 308},
      {hole_number: 2, par: 4, handicap_index: 5, yardage_black: 410, yardage_gold: 389, yardage_blue: 376, yardage_white: 351, yardage_red: 324},
      {hole_number: 3, par: 4, handicap_index: 15, yardage_black: 356, yardage_gold: 335, yardage_blue: 315, yardage_white: 298, yardage_red: 275},
      {hole_number: 4, par: 3, handicap_index: 17, yardage_black: 168, yardage_gold: 160, yardage_blue: 148, yardage_white: 138, yardage_red: 125},
      {hole_number: 5, par: 5, handicap_index: 7, yardage_black: 540, yardage_gold: 523, yardage_blue: 502, yardage_white: 479, yardage_red: 444},
      {hole_number: 6, par: 3, handicap_index: 13, yardage_black: 185, yardage_gold: 171, yardage_blue: 161, yardage_white: 145, yardage_red: 126},
      {hole_number: 7, par: 5, handicap_index: 1, yardage_black: 573, yardage_gold: 549, yardage_blue: 529, yardage_white: 499, yardage_red: 458},
      {hole_number: 8, par: 3, handicap_index: 9, yardage_black: 175, yardage_gold: 164, yardage_blue: 154, yardage_white: 142, yardage_red: 127},
      {hole_number: 9, par: 4, handicap_index: 3, yardage_black: 434, yardage_gold: 418, yardage_blue: 402, yardage_white: 382, yardage_red: 353},
      {hole_number: 10, par: 4, handicap_index: 8, yardage_black: 380, yardage_gold: 367, yardage_blue: 348, yardage_white: 330, yardage_red: 305},
      {hole_number: 11, par: 4, handicap_index: 10, yardage_black: 380, yardage_gold: 371, yardage_blue: 355, yardage_white: 337, yardage_red: 310},
      {hole_number: 12, par: 4, handicap_index: 16, yardage_black: 367, yardage_gold: 351, yardage_blue: 332, yardage_white: 313, yardage_red: 286},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 183, yardage_gold: 170, yardage_blue: 158, yardage_white: 144, yardage_red: 126},
      {hole_number: 14, par: 4, handicap_index: 4, yardage_black: 454, yardage_gold: 437, yardage_blue: 420, yardage_white: 398, yardage_red: 364},
      {hole_number: 15, par: 4, handicap_index: 14, yardage_black: 388, yardage_gold: 372, yardage_blue: 353, yardage_white: 334, yardage_red: 306},
      {hole_number: 16, par: 4, handicap_index: 2, yardage_black: 458, yardage_gold: 442, yardage_blue: 422, yardage_white: 398, yardage_red: 362},
      {hole_number: 17, par: 3, handicap_index: 12, yardage_black: 225, yardage_gold: 211, yardage_blue: 195, yardage_white: 177, yardage_red: 153},
      {hole_number: 18, par: 5, handicap_index: 6, yardage_black: 540, yardage_gold: 522, yardage_blue: 499, yardage_white: 471, yardage_red: 429}
    ]
  },
  {
    name: "Links at Casa de Campo (Current 2016)",
    location: "La Romana, Dominican Republic",
    par: 72,
    architect: "Pete Dye",
    year_opened: 1976,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 404, yardage_gold: 388, yardage_blue: 361, yardage_white: 338, yardage_red: 308},
      {hole_number: 2, par: 4, handicap_index: 5, yardage_black: 410, yardage_gold: 389, yardage_blue: 376, yardage_white: 351, yardage_red: 324},
      {hole_number: 3, par: 4, handicap_index: 15, yardage_black: 356, yardage_gold: 335, yardage_blue: 315, yardage_white: 298, yardage_red: 275},
      {hole_number: 4, par: 3, handicap_index: 17, yardage_black: 168, yardage_gold: 160, yardage_blue: 148, yardage_white: 138, yardage_red: 125},
      {hole_number: 5, par: 5, handicap_index: 7, yardage_black: 540, yardage_gold: 523, yardage_blue: 502, yardage_white: 479, yardage_red: 444},
      {hole_number: 6, par: 3, handicap_index: 13, yardage_black: 185, yardage_gold: 171, yardage_blue: 161, yardage_white: 145, yardage_red: 126},
      {hole_number: 7, par: 5, handicap_index: 1, yardage_black: 573, yardage_gold: 549, yardage_blue: 529, yardage_white: 499, yardage_red: 458},
      {hole_number: 8, par: 3, handicap_index: 9, yardage_black: 175, yardage_gold: 164, yardage_blue: 154, yardage_white: 142, yardage_red: 127},
      {hole_number: 9, par: 4, handicap_index: 3, yardage_black: 434, yardage_gold: 418, yardage_blue: 402, yardage_white: 382, yardage_red: 353},
      {hole_number: 10, par: 4, handicap_index: 8, yardage_black: 380, yardage_gold: 367, yardage_blue: 348, yardage_white: 330, yardage_red: 305},
      {hole_number: 11, par: 4, handicap_index: 10, yardage_black: 380, yardage_gold: 371, yardage_blue: 355, yardage_white: 337, yardage_red: 310},
      {hole_number: 12, par: 4, handicap_index: 16, yardage_black: 367, yardage_gold: 351, yardage_blue: 332, yardage_white: 313, yardage_red: 286},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 183, yardage_gold: 170, yardage_blue: 158, yardage_white: 144, yardage_red: 126},
      {hole_number: 14, par: 4, handicap_index: 4, yardage_black: 454, yardage_gold: 437, yardage_blue: 420, yardage_white: 398, yardage_red: 364},
      {hole_number: 15, par: 4, handicap_index: 14, yardage_black: 388, yardage_gold: 372, yardage_blue: 353, yardage_white: 334, yardage_red: 306},
      {hole_number: 16, par: 4, handicap_index: 2, yardage_black: 458, yardage_gold: 442, yardage_blue: 422, yardage_white: 398, yardage_red: 362},
      {hole_number: 17, par: 3, handicap_index: 12, yardage_black: 225, yardage_gold: 211, yardage_blue: 195, yardage_white: 177, yardage_red: 153},
      {hole_number: 18, par: 5, handicap_index: 6, yardage_black: 540, yardage_gold: 522, yardage_blue: 499, yardage_white: 471, yardage_red: 429}
    ]
  },
  {
    name: "TPC Louisiana",
    location: "Avondale, Louisiana USA",
    par: 72,
    architect: "Pete Dye",
    year_opened: 2004,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 15, yardage_black: 530, yardage_gold: 509, yardage_blue: 490, yardage_white: 465, yardage_red: 442},
      {hole_number: 2, par: 4, handicap_index: 5, yardage_black: 425, yardage_gold: 407, yardage_blue: 391, yardage_white: 371, yardage_red: 352},
      {hole_number: 3, par: 3, handicap_index: 13, yardage_black: 187, yardage_gold: 172, yardage_blue: 160, yardage_white: 143, yardage_red: 127},
      {hole_number: 4, par: 4, handicap_index: 11, yardage_black: 431, yardage_gold: 409, yardage_blue: 390, yardage_white: 366, yardage_red: 343},
      {hole_number: 5, par: 4, handicap_index: 9, yardage_black: 392, yardage_gold: 372, yardage_blue: 355, yardage_white: 334, yardage_red: 315},
      {hole_number: 6, par: 4, handicap_index: 1, yardage_black: 460, yardage_gold: 441, yardage_blue: 424, yardage_white: 401, yardage_red: 379},
      {hole_number: 7, par: 3, handicap_index: 17, yardage_black: 215, yardage_gold: 197, yardage_blue: 182, yardage_white: 162, yardage_red: 143},
      {hole_number: 8, par: 4, handicap_index: 3, yardage_black: 459, yardage_gold: 437, yardage_blue: 418, yardage_white: 393, yardage_red: 369},
      {hole_number: 9, par: 5, handicap_index: 7, yardage_black: 551, yardage_gold: 530, yardage_blue: 512, yardage_white: 487, yardage_red: 463},
      {hole_number: 10, par: 4, handicap_index: 12, yardage_black: 416, yardage_gold: 398, yardage_blue: 383, yardage_white: 363, yardage_red: 344},
      {hole_number: 11, par: 4, handicap_index: 10, yardage_black: 396, yardage_gold: 378, yardage_blue: 363, yardage_white: 344, yardage_red: 326},
      {hole_number: 12, par: 4, handicap_index: 14, yardage_black: 413, yardage_gold: 395, yardage_blue: 379, yardage_white: 359, yardage_red: 340},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 153, yardage_gold: 141, yardage_blue: 131, yardage_white: 117, yardage_red: 103},
      {hole_number: 14, par: 4, handicap_index: 4, yardage_black: 456, yardage_gold: 435, yardage_blue: 417, yardage_white: 393, yardage_red: 370},
      {hole_number: 15, par: 4, handicap_index: 8, yardage_black: 436, yardage_gold: 417, yardage_blue: 401, yardage_white: 380, yardage_red: 360},
      {hole_number: 16, par: 3, handicap_index: 16, yardage_black: 212, yardage_gold: 195, yardage_blue: 180, yardage_white: 161, yardage_red: 142},
      {hole_number: 17, par: 5, handicap_index: 2, yardage_black: 565, yardage_gold: 544, yardage_blue: 525, yardage_white: 499, yardage_red: 474},
      {hole_number: 18, par: 4, handicap_index: 6, yardage_black: 443, yardage_gold: 424, yardage_blue: 407, yardage_white: 385, yardage_red: 364}
    ]
  },
  {
    name: "Mauna Ocean Golf Resort",
    location: "Gyeongju, South Korea",
    par: 72,
    architect: "Jack Nicklaus",
    year_opened: 2010,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 7, yardage_black: 399, yardage_gold: 382, yardage_blue: 366, yardage_white: 344, yardage_red: 311},
      {hole_number: 2, par: 4, handicap_index: 11, yardage_black: 430, yardage_gold: 413, yardage_blue: 394, yardage_white: 369, yardage_red: 332},
      {hole_number: 3, par: 3, handicap_index: 17, yardage_black: 178, yardage_gold: 166, yardage_blue: 154, yardage_white: 139, yardage_red: 116},
      {hole_number: 4, par: 5, handicap_index: 3, yardage_black: 566, yardage_gold: 542, yardage_blue: 519, yardage_white: 485, yardage_red: 436},
      {hole_number: 5, par: 4, handicap_index: 1, yardage_black: 456, yardage_gold: 437, yardage_blue: 418, yardage_white: 392, yardage_red: 353},
      {hole_number: 6, par: 4, handicap_index: 15, yardage_black: 371, yardage_gold: 356, yardage_blue: 340, yardage_white: 319, yardage_red: 288},
      {hole_number: 7, par: 3, handicap_index: 13, yardage_black: 196, yardage_gold: 182, yardage_blue: 168, yardage_white: 151, yardage_red: 126},
      {hole_number: 8, par: 5, handicap_index: 9, yardage_black: 548, yardage_gold: 525, yardage_blue: 503, yardage_white: 471, yardage_red: 424},
      {hole_number: 9, par: 4, handicap_index: 5, yardage_black: 428, yardage_gold: 411, yardage_blue: 393, yardage_white: 369, yardage_red: 333},
      {hole_number: 10, par: 4, handicap_index: 8, yardage_black: 417, yardage_gold: 400, yardage_blue: 382, yardage_white: 358, yardage_red: 323},
      {hole_number: 11, par: 4, handicap_index: 12, yardage_black: 371, yardage_gold: 356, yardage_blue: 340, yardage_white: 319, yardage_red: 288},
      {hole_number: 12, par: 3, handicap_index: 18, yardage_black: 161, yardage_gold: 150, yardage_blue: 139, yardage_white: 125, yardage_red: 105},
      {hole_number: 13, par: 4, handicap_index: 4, yardage_black: 448, yardage_gold: 429, yardage_blue: 411, yardage_white: 386, yardage_red: 348},
      {hole_number: 14, par: 5, handicap_index: 14, yardage_black: 520, yardage_gold: 498, yardage_blue: 477, yardage_white: 447, yardage_red: 403},
      {hole_number: 15, par: 4, handicap_index: 2, yardage_black: 459, yardage_gold: 440, yardage_blue: 421, yardage_white: 395, yardage_red: 356},
      {hole_number: 16, par: 3, handicap_index: 16, yardage_black: 203, yardage_gold: 189, yardage_blue: 175, yardage_white: 157, yardage_red: 131},
      {hole_number: 17, par: 4, handicap_index: 10, yardage_black: 396, yardage_gold: 379, yardage_blue: 363, yardage_white: 341, yardage_red: 307},
      {hole_number: 18, par: 5, handicap_index: 6, yardage_black: 570, yardage_gold: 546, yardage_blue: 523, yardage_white: 489, yardage_red: 440}
    ]
  }
];

async function addPart3Batch1() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 3 Batch 1 courses to add: ${part3Batch1.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part3Batch1.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 3 Batch 1 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add - all already exist');
  }
}

addPart3Batch1();
