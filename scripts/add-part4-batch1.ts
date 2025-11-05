import * as fs from 'fs';
import * as path from 'path';

// Part 4 Courses - Batch 1
const part4Batch1 = [
  {
    name: "Peligro Range",
    location: "Las Vegas, Nevada USA",
    par: 72,
    architect: "Martin DeWitt, aboutGolf",
    year_opened: 2015,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 3, yardage_black: 509, yardage_gold: 495, yardage_blue: 472, yardage_white: 446, yardage_red: 425},
      {hole_number: 2, par: 4, handicap_index: 9, yardage_black: 382, yardage_gold: 359, yardage_blue: 340, yardage_white: 329, yardage_red: 286},
      {hole_number: 3, par: 4, handicap_index: 13, yardage_black: 339, yardage_gold: 326, yardage_blue: 313, yardage_white: 289, yardage_red: 280},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 170, yardage_gold: 149, yardage_blue: 145, yardage_white: 135, yardage_red: 128},
      {hole_number: 5, par: 5, handicap_index: 1, yardage_black: 533, yardage_gold: 519, yardage_blue: 487, yardage_white: 462, yardage_red: 442},
      {hole_number: 6, par: 4, handicap_index: 7, yardage_black: 393, yardage_gold: 380, yardage_blue: 360, yardage_white: 340, yardage_red: 316},
      {hole_number: 7, par: 3, handicap_index: 17, yardage_black: 158, yardage_gold: 151, yardage_blue: 147, yardage_white: 132, yardage_red: 122},
      {hole_number: 8, par: 4, handicap_index: 11, yardage_black: 370, yardage_gold: 345, yardage_blue: 326, yardage_white: 316, yardage_red: 305},
      {hole_number: 9, par: 4, handicap_index: 5, yardage_black: 407, yardage_gold: 396, yardage_blue: 388, yardage_white: 346, yardage_red: 351},
      {hole_number: 10, par: 4, handicap_index: 12, yardage_black: 383, yardage_gold: 367, yardage_blue: 361, yardage_white: 349, yardage_red: 334},
      {hole_number: 11, par: 5, handicap_index: 2, yardage_black: 567, yardage_gold: 546, yardage_blue: 534, yardage_white: 518, yardage_red: 498},
      {hole_number: 12, par: 3, handicap_index: 16, yardage_black: 210, yardage_gold: 193, yardage_blue: 174, yardage_white: 162, yardage_red: 142},
      {hole_number: 13, par: 4, handicap_index: 10, yardage_black: 391, yardage_gold: 369, yardage_blue: 356, yardage_white: 350, yardage_red: 331},
      {hole_number: 14, par: 4, handicap_index: 8, yardage_black: 396, yardage_gold: 369, yardage_blue: 351, yardage_white: 333, yardage_red: 293},
      {hole_number: 15, par: 3, handicap_index: 18, yardage_black: 171, yardage_gold: 154, yardage_blue: 130, yardage_white: 111, yardage_red: 107},
      {hole_number: 16, par: 5, handicap_index: 4, yardage_black: 552, yardage_gold: 542, yardage_blue: 528, yardage_white: 515, yardage_red: 502},
      {hole_number: 17, par: 4, handicap_index: 6, yardage_black: 455, yardage_gold: 429, yardage_blue: 403, yardage_white: 396, yardage_red: 324},
      {hole_number: 18, par: 4, handicap_index: 14, yardage_black: 383, yardage_gold: 369, yardage_blue: 356, yardage_white: 341, yardage_red: 310}
    ]
  },
  {
    name: "Pine Needles Golf Club",
    location: "Southern Pines, North Carolina USA",
    par: 71,
    architect: "Donald Ross",
    year_opened: 1927,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 11, yardage_black: 504, yardage_gold: 482, yardage_blue: 462, yardage_white: 462, yardage_red: 421},
      {hole_number: 2, par: 4, handicap_index: 5, yardage_black: 481, yardage_gold: 434, yardage_blue: 418, yardage_white: 382, yardage_red: 382},
      {hole_number: 3, par: 3, handicap_index: 17, yardage_black: 144, yardage_gold: 134, yardage_blue: 133, yardage_white: 126, yardage_red: 109},
      {hole_number: 4, par: 4, handicap_index: 9, yardage_black: 403, yardage_gold: 367, yardage_blue: 356, yardage_white: 333, yardage_red: 274},
      {hole_number: 5, par: 3, handicap_index: 7, yardage_black: 216, yardage_gold: 174, yardage_blue: 170, yardage_white: 128, yardage_red: 121},
      {hole_number: 6, par: 4, handicap_index: 1, yardage_black: 458, yardage_gold: 411, yardage_blue: 378, yardage_white: 328, yardage_red: 328},
      {hole_number: 7, par: 4, handicap_index: 3, yardage_black: 455, yardage_gold: 407, yardage_blue: 372, yardage_white: 372, yardage_red: 341},
      {hole_number: 8, par: 4, handicap_index: 15, yardage_black: 362, yardage_gold: 355, yardage_blue: 326, yardage_white: 326, yardage_red: 278},
      {hole_number: 9, par: 4, handicap_index: 13, yardage_black: 384, yardage_gold: 364, yardage_blue: 359, yardage_white: 359, yardage_red: 285},
      {hole_number: 10, par: 5, handicap_index: 4, yardage_black: 524, yardage_gold: 489, yardage_blue: 476, yardage_white: 476, yardage_red: 387},
      {hole_number: 11, par: 4, handicap_index: 12, yardage_black: 413, yardage_gold: 373, yardage_blue: 342, yardage_white: 317, yardage_red: 317},
      {hole_number: 12, par: 4, handicap_index: 14, yardage_black: 412, yardage_gold: 349, yardage_blue: 325, yardage_white: 325, yardage_red: 270},
      {hole_number: 13, par: 3, handicap_index: 16, yardage_black: 207, yardage_gold: 180, yardage_blue: 161, yardage_white: 131, yardage_red: 131},
      {hole_number: 14, par: 4, handicap_index: 2, yardage_black: 453, yardage_gold: 420, yardage_blue: 406, yardage_white: 335, yardage_red: 335},
      {hole_number: 15, par: 5, handicap_index: 6, yardage_black: 530, yardage_gold: 499, yardage_blue: 453, yardage_white: 453, yardage_red: 448},
      {hole_number: 16, par: 3, handicap_index: 18, yardage_black: 179, yardage_gold: 169, yardage_blue: 161, yardage_white: 129, yardage_red: 129},
      {hole_number: 17, par: 4, handicap_index: 8, yardage_black: 460, yardage_gold: 431, yardage_blue: 414, yardage_white: 334, yardage_red: 334},
      {hole_number: 18, par: 4, handicap_index: 10, yardage_black: 421, yardage_gold: 406, yardage_blue: 397, yardage_white: 344, yardage_red: 344}
    ]
  },
  {
    name: "Pine Rivers Championship Golf Club",
    location: "Fayetteville, North Carolina USA",
    par: 72,
    architect: "aboutGolf",
    year_opened: 2006,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 467, yardage_gold: 439, yardage_blue: 414, yardage_white: 380, yardage_red: 276},
      {hole_number: 2, par: 5, handicap_index: 1, yardage_black: 614, yardage_gold: 591, yardage_blue: 569, yardage_white: 506, yardage_red: 461},
      {hole_number: 3, par: 4, handicap_index: 9, yardage_black: 475, yardage_gold: 451, yardage_blue: 423, yardage_white: 389, yardage_red: 325},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 225, yardage_gold: 202, yardage_blue: 175, yardage_white: 123, yardage_red: 112},
      {hole_number: 5, par: 4, handicap_index: 7, yardage_black: 488, yardage_gold: 475, yardage_blue: 457, yardage_white: 427, yardage_red: 317},
      {hole_number: 6, par: 4, handicap_index: 13, yardage_black: 327, yardage_gold: 320, yardage_blue: 314, yardage_white: 289, yardage_red: 248},
      {hole_number: 7, par: 3, handicap_index: 17, yardage_black: 206, yardage_gold: 185, yardage_blue: 178, yardage_white: 162, yardage_red: 129},
      {hole_number: 8, par: 4, handicap_index: 3, yardage_black: 509, yardage_gold: 480, yardage_blue: 452, yardage_white: 419, yardage_red: 348},
      {hole_number: 9, par: 5, handicap_index: 5, yardage_black: 593, yardage_gold: 585, yardage_blue: 553, yardage_white: 534, yardage_red: 503},
      {hole_number: 10, par: 4, handicap_index: 14, yardage_black: 352, yardage_gold: 333, yardage_blue: 304, yardage_white: 266, yardage_red: 242},
      {hole_number: 11, par: 3, handicap_index: 16, yardage_black: 188, yardage_gold: 181, yardage_blue: 157, yardage_white: 151, yardage_red: 128},
      {hole_number: 12, par: 5, handicap_index: 2, yardage_black: 580, yardage_gold: 528, yardage_blue: 504, yardage_white: 444, yardage_red: 407},
      {hole_number: 13, par: 4, handicap_index: 10, yardage_black: 450, yardage_gold: 434, yardage_blue: 418, yardage_white: 358, yardage_red: 308},
      {hole_number: 14, par: 4, handicap_index: 12, yardage_black: 372, yardage_gold: 350, yardage_blue: 330, yardage_white: 281, yardage_red: 267},
      {hole_number: 15, par: 5, handicap_index: 4, yardage_black: 596, yardage_gold: 564, yardage_blue: 538, yardage_white: 441, yardage_red: 413},
      {hole_number: 16, par: 3, handicap_index: 18, yardage_black: 230, yardage_gold: 215, yardage_blue: 180, yardage_white: 148, yardage_red: 125},
      {hole_number: 17, par: 4, handicap_index: 6, yardage_black: 519, yardage_gold: 495, yardage_blue: 452, yardage_white: 423, yardage_red: 381},
      {hole_number: 18, par: 4, handicap_index: 8, yardage_black: 495, yardage_gold: 460, yardage_blue: 449, yardage_white: 392, yardage_red: 402}
    ]
  },
  {
    name: "Bay Harbor - The Preserve",
    location: "Bay Harbor, Michigan USA",
    par: 35,
    architect: "Arthur Hills",
    year_opened: 1997,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 4, yardage_black: 389, yardage_gold: 344, yardage_blue: 326, yardage_white: 267, yardage_red: 241},
      {hole_number: 2, par: 4, handicap_index: 6, yardage_black: 351, yardage_gold: 331, yardage_blue: 299, yardage_white: 264, yardage_red: 224},
      {hole_number: 3, par: 4, handicap_index: 2, yardage_black: 430, yardage_gold: 413, yardage_blue: 374, yardage_white: 332, yardage_red: 254},
      {hole_number: 4, par: 5, handicap_index: 1, yardage_black: 573, yardage_gold: 538, yardage_blue: 469, yardage_white: 413, yardage_red: 350},
      {hole_number: 5, par: 3, handicap_index: 7, yardage_black: 192, yardage_gold: 173, yardage_blue: 161, yardage_white: 153, yardage_red: 136},
      {hole_number: 6, par: 4, handicap_index: 8, yardage_black: 482, yardage_gold: 455, yardage_blue: 397, yardage_white: 337, yardage_red: 284},
      {hole_number: 7, par: 4, handicap_index: 3, yardage_black: 393, yardage_gold: 371, yardage_blue: 296, yardage_white: 291, yardage_red: 251},
      {hole_number: 8, par: 4, handicap_index: 5, yardage_black: 384, yardage_gold: 366, yardage_blue: 296, yardage_white: 249, yardage_red: 196},
      {hole_number: 9, par: 3, handicap_index: 9, yardage_black: 174, yardage_gold: 154, yardage_blue: 134, yardage_white: 106, yardage_red: 83}
    ]
  }
];

async function addPart4Batch1() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 4 Batch 1 courses to add: ${part4Batch1.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part4Batch1.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 4 Batch 1 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add - all already exist');
  }
}

addPart4Batch1();
