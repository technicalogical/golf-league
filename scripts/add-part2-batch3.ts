import * as fs from 'fs';
import * as path from 'path';

// Part 2 courses - Batch 3 (remaining Part 2 courses)
const part2Batch3 = [
  {
    name: "Huzhou Hot Spring Golf Club",
    location: "Huzhou, China",
    par: 72,
    architect: "Neil Haworth",
    year_opened: 2007,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 352, yardage_gold: 336, yardage_blue: 330, yardage_white: 295, yardage_red: 285},
      {hole_number: 2, par: 3, handicap_index: 17, yardage_black: 124, yardage_gold: 115, yardage_blue: 111, yardage_white: 96, yardage_red: 92},
      {hole_number: 3, par: 4, handicap_index: 5, yardage_black: 402, yardage_gold: 378, yardage_blue: 342, yardage_white: 306, yardage_red: 258},
      {hole_number: 4, par: 4, handicap_index: 7, yardage_black: 449, yardage_gold: 423, yardage_blue: 414, yardage_white: 390, yardage_red: 354},
      {hole_number: 5, par: 5, handicap_index: 3, yardage_black: 492, yardage_gold: 470, yardage_blue: 469, yardage_white: 443, yardage_red: 420},
      {hole_number: 6, par: 4, handicap_index: 13, yardage_black: 353, yardage_gold: 337, yardage_blue: 322, yardage_white: 309, yardage_red: 264},
      {hole_number: 7, par: 3, handicap_index: 15, yardage_black: 222, yardage_gold: 205, yardage_blue: 187, yardage_white: 181, yardage_red: 154},
      {hole_number: 8, par: 4, handicap_index: 9, yardage_black: 429, yardage_gold: 404, yardage_blue: 368, yardage_white: 354, yardage_red: 303},
      {hole_number: 9, par: 5, handicap_index: 1, yardage_black: 522, yardage_gold: 489, yardage_blue: 463, yardage_white: 439, yardage_red: 379},
      {hole_number: 10, par: 4, handicap_index: 6, yardage_black: 422, yardage_gold: 409, yardage_blue: 386, yardage_white: 372, yardage_red: 292},
      {hole_number: 11, par: 4, handicap_index: 16, yardage_black: 411, yardage_gold: 382, yardage_blue: 372, yardage_white: 349, yardage_red: 323},
      {hole_number: 12, par: 3, handicap_index: 2, yardage_black: 174, yardage_gold: 156, yardage_blue: 152, yardage_white: 149, yardage_red: 134},
      {hole_number: 13, par: 5, handicap_index: 10, yardage_black: 543, yardage_gold: 516, yardage_blue: 503, yardage_white: 467, yardage_red: 429},
      {hole_number: 14, par: 4, handicap_index: 18, yardage_black: 424, yardage_gold: 402, yardage_blue: 381, yardage_white: 355, yardage_red: 268},
      {hole_number: 15, par: 3, handicap_index: 14, yardage_black: 172, yardage_gold: 164, yardage_blue: 155, yardage_white: 147, yardage_red: 116},
      {hole_number: 16, par: 4, handicap_index: 12, yardage_black: 366, yardage_gold: 318, yardage_blue: 307, yardage_white: 294, yardage_red: 239},
      {hole_number: 17, par: 4, handicap_index: 4, yardage_black: 424, yardage_gold: 398, yardage_blue: 389, yardage_white: 364, yardage_red: 334},
      {hole_number: 18, par: 5, handicap_index: 8, yardage_black: 520, yardage_gold: 495, yardage_blue: 466, yardage_white: 460, yardage_red: 415}
    ]
  },
  {
    name: "The Infamous 18",
    location: "Multiple Locations, Worldwide",
    par: 69,
    architect: "Loyal H 'Bud' Chapman",
    year_opened: 2004,
    holes: [
      {hole_number: 1, par: 3, handicap_index: 7, yardage_black: 167, yardage_gold: 167, yardage_blue: 167, yardage_white: 167, yardage_red: 167},
      {hole_number: 2, par: 5, handicap_index: 12, yardage_black: 474, yardage_gold: 474, yardage_blue: 474, yardage_white: 474, yardage_red: 474},
      {hole_number: 3, par: 5, handicap_index: 16, yardage_black: 535, yardage_gold: 535, yardage_blue: 535, yardage_white: 535, yardage_red: 525},
      {hole_number: 4, par: 4, handicap_index: 9, yardage_black: 287, yardage_gold: 287, yardage_blue: 287, yardage_white: 287, yardage_red: 228},
      {hole_number: 5, par: 4, handicap_index: 8, yardage_black: 310, yardage_gold: 310, yardage_blue: 310, yardage_white: 310, yardage_red: 310},
      {hole_number: 6, par: 4, handicap_index: 17, yardage_black: 293, yardage_gold: 200, yardage_blue: 237, yardage_white: 232, yardage_red: 229},
      {hole_number: 7, par: 3, handicap_index: 5, yardage_black: 39, yardage_gold: 39, yardage_blue: 40, yardage_white: 40, yardage_red: 36},
      {hole_number: 8, par: 4, handicap_index: 11, yardage_black: 430, yardage_gold: 421, yardage_blue: 370, yardage_white: 359, yardage_red: 347},
      {hole_number: 9, par: 5, handicap_index: 3, yardage_black: 687, yardage_gold: 687, yardage_blue: 687, yardage_white: 687, yardage_red: 687},
      {hole_number: 10, par: 3, handicap_index: 14, yardage_black: 142, yardage_gold: 142, yardage_blue: 142, yardage_white: 142, yardage_red: 142},
      {hole_number: 11, par: 4, handicap_index: 10, yardage_black: 462, yardage_gold: 461, yardage_blue: 404, yardage_white: 403, yardage_red: 320},
      {hole_number: 12, par: 3, handicap_index: 15, yardage_black: 188, yardage_gold: 188, yardage_blue: 188, yardage_white: 149, yardage_red: 149},
      {hole_number: 13, par: 3, handicap_index: 2, yardage_black: 205, yardage_gold: 205, yardage_blue: 205, yardage_white: 98, yardage_red: 98},
      {hole_number: 14, par: 4, handicap_index: 13, yardage_black: 371, yardage_gold: 371, yardage_blue: 371, yardage_white: 264, yardage_red: 264},
      {hole_number: 15, par: 3, handicap_index: 6, yardage_black: 135, yardage_gold: 135, yardage_blue: 135, yardage_white: 135, yardage_red: 135},
      {hole_number: 16, par: 4, handicap_index: 4, yardage_black: 291, yardage_gold: 291, yardage_blue: 200, yardage_white: 174, yardage_red: 154},
      {hole_number: 17, par: 2, handicap_index: 18, yardage_black: 84, yardage_gold: 84, yardage_blue: 84, yardage_white: 67, yardage_red: 29},
      {hole_number: 18, par: 6, handicap_index: 1, yardage_black: 947, yardage_gold: 765, yardage_blue: 763, yardage_white: 763, yardage_red: 598}
    ]
  },
  {
    name: "The Ocean Course at Kiawah Island",
    location: "Kiawah Island, South Carolina USA",
    par: 72,
    architect: "Pete and Alice Dye",
    year_opened: 1991,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 15, yardage_black: 395, yardage_gold: 375, yardage_blue: 357, yardage_white: 339, yardage_red: 306},
      {hole_number: 2, par: 5, handicap_index: 3, yardage_black: 527, yardage_gold: 520, yardage_blue: 498, yardage_white: 493, yardage_red: 419},
      {hole_number: 3, par: 4, handicap_index: 9, yardage_black: 390, yardage_gold: 366, yardage_blue: 312, yardage_white: 289, yardage_red: 253},
      {hole_number: 4, par: 4, handicap_index: 1, yardage_black: 432, yardage_gold: 410, yardage_blue: 393, yardage_white: 367, yardage_red: 301},
      {hole_number: 5, par: 3, handicap_index: 11, yardage_black: 207, yardage_gold: 200, yardage_blue: 165, yardage_white: 149, yardage_red: 117},
      {hole_number: 6, par: 4, handicap_index: 13, yardage_black: 454, yardage_gold: 427, yardage_blue: 376, yardage_white: 321, yardage_red: 288},
      {hole_number: 7, par: 5, handicap_index: 7, yardage_black: 526, yardage_gold: 516, yardage_blue: 505, yardage_white: 454, yardage_red: 437},
      {hole_number: 8, par: 3, handicap_index: 17, yardage_black: 197, yardage_gold: 186, yardage_blue: 170, yardage_white: 141, yardage_red: 105},
      {hole_number: 9, par: 4, handicap_index: 5, yardage_black: 464, yardage_gold: 415, yardage_blue: 395, yardage_white: 381, yardage_red: 344},
      {hole_number: 10, par: 4, handicap_index: 18, yardage_black: 439, yardage_gold: 401, yardage_blue: 382, yardage_white: 334, yardage_red: 311},
      {hole_number: 11, par: 5, handicap_index: 10, yardage_black: 561, yardage_gold: 510, yardage_blue: 475, yardage_white: 439, yardage_red: 387},
      {hole_number: 12, par: 4, handicap_index: 4, yardage_black: 465, yardage_gold: 440, yardage_blue: 388, yardage_white: 372, yardage_red: 323},
      {hole_number: 13, par: 4, handicap_index: 8, yardage_black: 404, yardage_gold: 359, yardage_blue: 328, yardage_white: 320, yardage_red: 294},
      {hole_number: 14, par: 3, handicap_index: 12, yardage_black: 194, yardage_gold: 160, yardage_blue: 150, yardage_white: 136, yardage_red: 125},
      {hole_number: 15, par: 4, handicap_index: 14, yardage_black: 420, yardage_gold: 389, yardage_blue: 370, yardage_white: 352, yardage_red: 297},
      {hole_number: 16, par: 5, handicap_index: 16, yardage_black: 579, yardage_gold: 554, yardage_blue: 529, yardage_white: 475, yardage_red: 436},
      {hole_number: 17, par: 3, handicap_index: 6, yardage_black: 197, yardage_gold: 184, yardage_blue: 159, yardage_white: 151, yardage_red: 122},
      {hole_number: 18, par: 4, handicap_index: 2, yardage_black: 439, yardage_gold: 400, yardage_blue: 376, yardage_white: 345, yardage_red: 293}
    ]
  },
  {
    name: "Konopiste D'Este",
    location: "Bystřice, Czech Republic",
    par: 72,
    architect: "John Burns",
    year_opened: 2002,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 364, yardage_gold: 364, yardage_blue: 350, yardage_white: 326, yardage_red: 308},
      {hole_number: 2, par: 4, handicap_index: 7, yardage_black: 403, yardage_gold: 403, yardage_blue: 388, yardage_white: 363, yardage_red: 333},
      {hole_number: 3, par: 5, handicap_index: 1, yardage_black: 528, yardage_gold: 528, yardage_blue: 495, yardage_white: 462, yardage_red: 427},
      {hole_number: 4, par: 3, handicap_index: 17, yardage_black: 147, yardage_gold: 147, yardage_blue: 139, yardage_white: 131, yardage_red: 123},
      {hole_number: 5, par: 4, handicap_index: 15, yardage_black: 366, yardage_gold: 366, yardage_blue: 348, yardage_white: 324, yardage_red: 298},
      {hole_number: 6, par: 4, handicap_index: 5, yardage_black: 391, yardage_gold: 391, yardage_blue: 377, yardage_white: 362, yardage_red: 349},
      {hole_number: 7, par: 5, handicap_index: 13, yardage_black: 494, yardage_gold: 494, yardage_blue: 468, yardage_white: 446, yardage_red: 424},
      {hole_number: 8, par: 3, handicap_index: 3, yardage_black: 238, yardage_gold: 238, yardage_blue: 210, yardage_white: 188, yardage_red: 162},
      {hole_number: 9, par: 4, handicap_index: 9, yardage_black: 358, yardage_gold: 358, yardage_blue: 333, yardage_white: 311, yardage_red: 286},
      {hole_number: 10, par: 4, handicap_index: 12, yardage_black: 329, yardage_gold: 329, yardage_blue: 314, yardage_white: 288, yardage_red: 270},
      {hole_number: 11, par: 3, handicap_index: 6, yardage_black: 193, yardage_gold: 193, yardage_blue: 168, yardage_white: 153, yardage_red: 131},
      {hole_number: 12, par: 5, handicap_index: 16, yardage_black: 522, yardage_gold: 522, yardage_blue: 496, yardage_white: 468, yardage_red: 432},
      {hole_number: 13, par: 4, handicap_index: 2, yardage_black: 445, yardage_gold: 445, yardage_blue: 419, yardage_white: 399, yardage_red: 369},
      {hole_number: 14, par: 4, handicap_index: 18, yardage_black: 397, yardage_gold: 363, yardage_blue: 363, yardage_white: 342, yardage_red: 317},
      {hole_number: 15, par: 4, handicap_index: 4, yardage_black: 383, yardage_gold: 383, yardage_blue: 371, yardage_white: 352, yardage_red: 340},
      {hole_number: 16, par: 5, handicap_index: 8, yardage_black: 500, yardage_gold: 500, yardage_blue: 468, yardage_white: 447, yardage_red: 426},
      {hole_number: 17, par: 3, handicap_index: 14, yardage_black: 163, yardage_gold: 163, yardage_blue: 153, yardage_white: 143, yardage_red: 132},
      {hole_number: 18, par: 4, handicap_index: 10, yardage_black: 411, yardage_gold: 411, yardage_blue: 384, yardage_white: 356, yardage_red: 336}
    ]
  },
  {
    name: "Konopiste Radecky",
    location: "Bystřice, Czech Republic",
    par: 72,
    architect: "John Burns",
    year_opened: 2002,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 10, yardage_black: 517, yardage_gold: 498, yardage_blue: 463, yardage_white: 453, yardage_red: 430},
      {hole_number: 2, par: 4, handicap_index: 18, yardage_black: 393, yardage_gold: 361, yardage_blue: 337, yardage_white: 303, yardage_red: 281},
      {hole_number: 3, par: 4, handicap_index: 4, yardage_black: 391, yardage_gold: 367, yardage_blue: 348, yardage_white: 328, yardage_red: 314},
      {hole_number: 4, par: 5, handicap_index: 14, yardage_black: 476, yardage_gold: 458, yardage_blue: 440, yardage_white: 418, yardage_red: 396},
      {hole_number: 5, par: 4, handicap_index: 6, yardage_black: 384, yardage_gold: 362, yardage_blue: 342, yardage_white: 323, yardage_red: 323},
      {hole_number: 6, par: 3, handicap_index: 16, yardage_black: 186, yardage_gold: 174, yardage_blue: 164, yardage_white: 140, yardage_red: 120},
      {hole_number: 7, par: 4, handicap_index: 2, yardage_black: 410, yardage_gold: 390, yardage_blue: 368, yardage_white: 333, yardage_red: 303},
      {hole_number: 8, par: 3, handicap_index: 8, yardage_black: 206, yardage_gold: 194, yardage_blue: 178, yardage_white: 167, yardage_red: 151},
      {hole_number: 9, par: 4, handicap_index: 12, yardage_black: 413, yardage_gold: 385, yardage_blue: 365, yardage_white: 353, yardage_red: 330},
      {hole_number: 10, par: 3, handicap_index: 11, yardage_black: 140, yardage_gold: 140, yardage_blue: 140, yardage_white: 122, yardage_red: 122},
      {hole_number: 11, par: 4, handicap_index: 7, yardage_black: 404, yardage_gold: 387, yardage_blue: 369, yardage_white: 352, yardage_red: 334},
      {hole_number: 12, par: 5, handicap_index: 5, yardage_black: 532, yardage_gold: 525, yardage_blue: 511, yardage_white: 507, yardage_red: 473},
      {hole_number: 13, par: 4, handicap_index: 17, yardage_black: 419, yardage_gold: 402, yardage_blue: 375, yardage_white: 367, yardage_red: 336},
      {hole_number: 14, par: 5, handicap_index: 1, yardage_black: 592, yardage_gold: 567, yardage_blue: 544, yardage_white: 522, yardage_red: 496},
      {hole_number: 15, par: 4, handicap_index: 13, yardage_black: 460, yardage_gold: 445, yardage_blue: 418, yardage_white: 410, yardage_red: 388},
      {hole_number: 16, par: 3, handicap_index: 3, yardage_black: 209, yardage_gold: 198, yardage_blue: 183, yardage_white: 161, yardage_red: 151},
      {hole_number: 17, par: 4, handicap_index: 15, yardage_black: 460, yardage_gold: 434, yardage_blue: 423, yardage_white: 404, yardage_red: 404},
      {hole_number: 18, par: 4, handicap_index: 9, yardage_black: 429, yardage_gold: 412, yardage_blue: 395, yardage_white: 353, yardage_red: 327}
    ]
  }
];

async function addBatch3() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 2 Batch 3 courses to add: ${part2Batch3.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part2Batch3.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 2 Batch 3 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add');
  }
}

addBatch3();
