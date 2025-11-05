import * as fs from 'fs';
import * as path from 'path';

// Part 3 Courses - Batch 2
const part3Batch2 = [
  {
    name: "Montvert Country Club",
    location: "Pocheon, South Korea",
    par: 72,
    architect: "Lim Sang ha",
    year_opened: 2004,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 5, yardage_black: 370, yardage_gold: 329, yardage_blue: 315, yardage_white: 293, yardage_red: 278},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 392, yardage_gold: 364, yardage_blue: 333, yardage_white: 284, yardage_red: 269},
      {hole_number: 3, par: 5, handicap_index: 1, yardage_black: 672, yardage_gold: 653, yardage_blue: 623, yardage_white: 593, yardage_red: 525},
      {hole_number: 4, par: 4, handicap_index: 9, yardage_black: 438, yardage_gold: 427, yardage_blue: 408, yardage_white: 371, yardage_red: 322},
      {hole_number: 5, par: 5, handicap_index: 3, yardage_black: 597, yardage_gold: 545, yardage_blue: 520, yardage_white: 485, yardage_red: 468},
      {hole_number: 6, par: 3, handicap_index: 17, yardage_black: 217, yardage_gold: 193, yardage_blue: 164, yardage_white: 148, yardage_red: 124},
      {hole_number: 7, par: 4, handicap_index: 7, yardage_black: 371, yardage_gold: 350, yardage_blue: 347, yardage_white: 313, yardage_red: 290},
      {hole_number: 8, par: 3, handicap_index: 15, yardage_black: 194, yardage_gold: 182, yardage_blue: 160, yardage_white: 132, yardage_red: 129},
      {hole_number: 9, par: 4, handicap_index: 11, yardage_black: 456, yardage_gold: 445, yardage_blue: 442, yardage_white: 433, yardage_red: 308},
      {hole_number: 10, par: 4, handicap_index: 14, yardage_black: 421, yardage_gold: 401, yardage_blue: 379, yardage_white: 348, yardage_red: 294},
      {hole_number: 11, par: 4, handicap_index: 6, yardage_black: 353, yardage_gold: 330, yardage_blue: 324, yardage_white: 300, yardage_red: 277},
      {hole_number: 12, par: 5, handicap_index: 4, yardage_black: 575, yardage_gold: 567, yardage_blue: 538, yardage_white: 525, yardage_red: 481},
      {hole_number: 13, par: 3, handicap_index: 16, yardage_black: 213, yardage_gold: 200, yardage_blue: 178, yardage_white: 161, yardage_red: 121},
      {hole_number: 14, par: 4, handicap_index: 10, yardage_black: 458, yardage_gold: 430, yardage_blue: 408, yardage_white: 294, yardage_red: 237},
      {hole_number: 15, par: 5, handicap_index: 2, yardage_black: 580, yardage_gold: 558, yardage_blue: 540, yardage_white: 486, yardage_red: 444},
      {hole_number: 16, par: 4, handicap_index: 8, yardage_black: 352, yardage_gold: 333, yardage_blue: 311, yardage_white: 289, yardage_red: 240},
      {hole_number: 17, par: 3, handicap_index: 18, yardage_black: 165, yardage_gold: 140, yardage_blue: 127, yardage_white: 118, yardage_red: 103},
      {hole_number: 18, par: 4, handicap_index: 12, yardage_black: 394, yardage_gold: 368, yardage_blue: 360, yardage_white: 330, yardage_red: 315}
    ]
  },
  {
    name: "Myrtle Beach Tour",
    location: "Myrtle Beach, South Carolina USA",
    par: 72,
    architect: "Multiple Architects",
    year_opened: 0,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 1, yardage_black: 399, yardage_gold: 390, yardage_blue: 370, yardage_white: 362, yardage_red: 336},
      {hole_number: 2, par: 4, handicap_index: 17, yardage_black: 319, yardage_gold: 289, yardage_blue: 287, yardage_white: 269, yardage_red: 231},
      {hole_number: 3, par: 4, handicap_index: 11, yardage_black: 326, yardage_gold: 320, yardage_blue: 314, yardage_white: 297, yardage_red: 288},
      {hole_number: 4, par: 3, handicap_index: 13, yardage_black: 177, yardage_gold: 162, yardage_blue: 144, yardage_white: 123, yardage_red: 91},
      {hole_number: 5, par: 5, handicap_index: 5, yardage_black: 515, yardage_gold: 499, yardage_blue: 478, yardage_white: 451, yardage_red: 400},
      {hole_number: 6, par: 4, handicap_index: 3, yardage_black: 436, yardage_gold: 421, yardage_blue: 409, yardage_white: 349, yardage_red: 338},
      {hole_number: 7, par: 5, handicap_index: 9, yardage_black: 548, yardage_gold: 517, yardage_blue: 474, yardage_white: 451, yardage_red: 418},
      {hole_number: 8, par: 3, handicap_index: 15, yardage_black: 187, yardage_gold: 174, yardage_blue: 136, yardage_white: 115, yardage_red: 96},
      {hole_number: 9, par: 4, handicap_index: 7, yardage_black: 389, yardage_gold: 371, yardage_blue: 310, yardage_white: 296, yardage_red: 291},
      {hole_number: 10, par: 4, handicap_index: 2, yardage_black: 410, yardage_gold: 400, yardage_blue: 372, yardage_white: 335, yardage_red: 299},
      {hole_number: 11, par: 4, handicap_index: 10, yardage_black: 332, yardage_gold: 319, yardage_blue: 312, yardage_white: 295, yardage_red: 251},
      {hole_number: 12, par: 5, handicap_index: 12, yardage_black: 530, yardage_gold: 520, yardage_blue: 511, yardage_white: 498, yardage_red: 466},
      {hole_number: 13, par: 3, handicap_index: 14, yardage_black: 201, yardage_gold: 179, yardage_blue: 153, yardage_white: 91, yardage_red: 73},
      {hole_number: 14, par: 4, handicap_index: 6, yardage_black: 272, yardage_gold: 240, yardage_blue: 222, yardage_white: 205, yardage_red: 184},
      {hole_number: 15, par: 4, handicap_index: 8, yardage_black: 405, yardage_gold: 389, yardage_blue: 366, yardage_white: 360, yardage_red: 333},
      {hole_number: 16, par: 3, handicap_index: 18, yardage_black: 238, yardage_gold: 210, yardage_blue: 181, yardage_white: 161, yardage_red: 140},
      {hole_number: 17, par: 4, handicap_index: 4, yardage_black: 400, yardage_gold: 369, yardage_blue: 360, yardage_white: 344, yardage_red: 317},
      {hole_number: 18, par: 5, handicap_index: 16, yardage_black: 537, yardage_gold: 533, yardage_blue: 507, yardage_white: 486, yardage_red: 462}
    ]
  },
  {
    name: "Namchon Country Club",
    location: "Gwangju, South Korea",
    par: 72,
    architect: "Field Consultant",
    year_opened: 2003,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 11, yardage_black: 556, yardage_gold: 526, yardage_blue: 500, yardage_white: 459, yardage_red: 437},
      {hole_number: 2, par: 4, handicap_index: 1, yardage_black: 442, yardage_gold: 405, yardage_blue: 364, yardage_white: 331, yardage_red: 293},
      {hole_number: 3, par: 4, handicap_index: 3, yardage_black: 445, yardage_gold: 422, yardage_blue: 388, yardage_white: 358, yardage_red: 325},
      {hole_number: 4, par: 3, handicap_index: 17, yardage_black: 212, yardage_gold: 192, yardage_blue: 179, yardage_white: 161, yardage_red: 143},
      {hole_number: 5, par: 5, handicap_index: 7, yardage_black: 552, yardage_gold: 529, yardage_blue: 505, yardage_white: 473, yardage_red: 420},
      {hole_number: 6, par: 4, handicap_index: 5, yardage_black: 407, yardage_gold: 380, yardage_blue: 364, yardage_white: 328, yardage_red: 249},
      {hole_number: 7, par: 4, handicap_index: 9, yardage_black: 418, yardage_gold: 394, yardage_blue: 359, yardage_white: 316, yardage_red: 288},
      {hole_number: 8, par: 3, handicap_index: 13, yardage_black: 218, yardage_gold: 196, yardage_blue: 177, yardage_white: 156, yardage_red: 136},
      {hole_number: 9, par: 4, handicap_index: 15, yardage_black: 385, yardage_gold: 366, yardage_blue: 344, yardage_white: 316, yardage_red: 283},
      {hole_number: 10, par: 4, handicap_index: 16, yardage_black: 403, yardage_gold: 372, yardage_blue: 347, yardage_white: 314, yardage_red: 272},
      {hole_number: 11, par: 4, handicap_index: 8, yardage_black: 385, yardage_gold: 359, yardage_blue: 338, yardage_white: 313, yardage_red: 278},
      {hole_number: 12, par: 3, handicap_index: 10, yardage_black: 224, yardage_gold: 205, yardage_blue: 179, yardage_white: 160, yardage_red: 121},
      {hole_number: 13, par: 4, handicap_index: 12, yardage_black: 417, yardage_gold: 390, yardage_blue: 366, yardage_white: 349, yardage_red: 334},
      {hole_number: 14, par: 3, handicap_index: 18, yardage_black: 184, yardage_gold: 166, yardage_blue: 135, yardage_white: 111, yardage_red: 87},
      {hole_number: 15, par: 5, handicap_index: 6, yardage_black: 577, yardage_gold: 547, yardage_blue: 515, yardage_white: 474, yardage_red: 443},
      {hole_number: 16, par: 4, handicap_index: 4, yardage_black: 405, yardage_gold: 389, yardage_blue: 345, yardage_white: 317, yardage_red: 284},
      {hole_number: 17, par: 5, handicap_index: 14, yardage_black: 510, yardage_gold: 482, yardage_blue: 459, yardage_white: 435, yardage_red: 373},
      {hole_number: 18, par: 4, handicap_index: 2, yardage_black: 414, yardage_gold: 387, yardage_blue: 363, yardage_white: 323, yardage_red: 297}
    ]
  },
  {
    name: "New Springville CC",
    location: "Icheon, South Korea",
    par: 72,
    architect: "Karl Olsen",
    year_opened: 1994,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 18, yardage_black: 325, yardage_gold: 305, yardage_blue: 273, yardage_white: 252, yardage_red: 234},
      {hole_number: 2, par: 3, handicap_index: 16, yardage_black: 155, yardage_gold: 130, yardage_blue: 126, yardage_white: 116, yardage_red: 99},
      {hole_number: 3, par: 4, handicap_index: 2, yardage_black: 423, yardage_gold: 380, yardage_blue: 338, yardage_white: 318, yardage_red: 284},
      {hole_number: 4, par: 4, handicap_index: 10, yardage_black: 358, yardage_gold: 345, yardage_blue: 335, yardage_white: 317, yardage_red: 304},
      {hole_number: 5, par: 4, handicap_index: 4, yardage_black: 431, yardage_gold: 396, yardage_blue: 384, yardage_white: 358, yardage_red: 305},
      {hole_number: 6, par: 3, handicap_index: 14, yardage_black: 203, yardage_gold: 163, yardage_blue: 157, yardage_white: 139, yardage_red: 135},
      {hole_number: 7, par: 5, handicap_index: 8, yardage_black: 515, yardage_gold: 500, yardage_blue: 488, yardage_white: 470, yardage_red: 387},
      {hole_number: 8, par: 4, handicap_index: 6, yardage_black: 402, yardage_gold: 397, yardage_blue: 373, yardage_white: 355, yardage_red: 326},
      {hole_number: 9, par: 5, handicap_index: 12, yardage_black: 546, yardage_gold: 514, yardage_blue: 482, yardage_white: 468, yardage_red: 459},
      {hole_number: 10, par: 4, handicap_index: 15, yardage_black: 358, yardage_gold: 334, yardage_blue: 324, yardage_white: 305, yardage_red: 281},
      {hole_number: 11, par: 3, handicap_index: 7, yardage_black: 193, yardage_gold: 179, yardage_blue: 171, yardage_white: 165, yardage_red: 133},
      {hole_number: 12, par: 4, handicap_index: 11, yardage_black: 390, yardage_gold: 361, yardage_blue: 318, yardage_white: 301, yardage_red: 296},
      {hole_number: 13, par: 5, handicap_index: 13, yardage_black: 502, yardage_gold: 485, yardage_blue: 475, yardage_white: 462, yardage_red: 390},
      {hole_number: 14, par: 4, handicap_index: 1, yardage_black: 393, yardage_gold: 372, yardage_blue: 356, yardage_white: 326, yardage_red: 266},
      {hole_number: 15, par: 3, handicap_index: 9, yardage_black: 154, yardage_gold: 149, yardage_blue: 129, yardage_white: 107, yardage_red: 97},
      {hole_number: 16, par: 4, handicap_index: 17, yardage_black: 359, yardage_gold: 341, yardage_blue: 327, yardage_white: 321, yardage_red: 305},
      {hole_number: 17, par: 4, handicap_index: 5, yardage_black: 368, yardage_gold: 350, yardage_blue: 339, yardage_white: 318, yardage_red: 201},
      {hole_number: 18, par: 5, handicap_index: 3, yardage_black: 600, yardage_gold: 581, yardage_blue: 546, yardage_white: 508, yardage_red: 445}
    ]
  }
];

async function addPart3Batch2() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 3 Batch 2 courses to add: ${part3Batch2.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part3Batch2.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 3 Batch 2 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add - all already exist');
  }
}

addPart3Batch2();
