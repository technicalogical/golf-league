import * as fs from 'fs';
import * as path from 'path';

// Part 3 Courses - Final batch
const part3Final = [
  {
    name: "Parkland Golf & Country Club",
    location: "Parkland, Florida USA",
    par: 71,
    architect: "Greg Norman",
    year_opened: 2004,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 9, yardage_black: 559, yardage_gold: 528, yardage_blue: 515, yardage_white: 486, yardage_red: 463},
      {hole_number: 2, par: 3, handicap_index: 7, yardage_black: 214, yardage_gold: 180, yardage_blue: 148, yardage_white: 127, yardage_red: 93},
      {hole_number: 3, par: 4, handicap_index: 11, yardage_black: 417, yardage_gold: 389, yardage_blue: 371, yardage_white: 340, yardage_red: 322},
      {hole_number: 4, par: 5, handicap_index: 1, yardage_black: 501, yardage_gold: 468, yardage_blue: 431, yardage_white: 412, yardage_red: 369},
      {hole_number: 5, par: 4, handicap_index: 13, yardage_black: 352, yardage_gold: 329, yardage_blue: 317, yardage_white: 303, yardage_red: 250},
      {hole_number: 6, par: 4, handicap_index: 17, yardage_black: 398, yardage_gold: 367, yardage_blue: 350, yardage_white: 321, yardage_red: 249},
      {hole_number: 7, par: 3, handicap_index: 3, yardage_black: 205, yardage_gold: 197, yardage_blue: 175, yardage_white: 150, yardage_red: 80},
      {hole_number: 8, par: 4, handicap_index: 15, yardage_black: 381, yardage_gold: 338, yardage_blue: 310, yardage_white: 283, yardage_red: 269},
      {hole_number: 9, par: 4, handicap_index: 5, yardage_black: 462, yardage_gold: 423, yardage_blue: 403, yardage_white: 384, yardage_red: 355},
      {hole_number: 10, par: 4, handicap_index: 10, yardage_black: 382, yardage_gold: 353, yardage_blue: 329, yardage_white: 304, yardage_red: 279},
      {hole_number: 11, par: 3, handicap_index: 12, yardage_black: 173, yardage_gold: 166, yardage_blue: 131, yardage_white: 115, yardage_red: 104},
      {hole_number: 12, par: 4, handicap_index: 6, yardage_black: 376, yardage_gold: 352, yardage_blue: 328, yardage_white: 305, yardage_red: 288},
      {hole_number: 13, par: 5, handicap_index: 2, yardage_black: 508, yardage_gold: 481, yardage_blue: 463, yardage_white: 436, yardage_red: 411},
      {hole_number: 14, par: 4, handicap_index: 8, yardage_black: 393, yardage_gold: 367, yardage_blue: 321, yardage_white: 291, yardage_red: 283},
      {hole_number: 15, par: 4, handicap_index: 16, yardage_black: 419, yardage_gold: 392, yardage_blue: 369, yardage_white: 342, yardage_red: 295},
      {hole_number: 16, par: 3, handicap_index: 18, yardage_black: 136, yardage_gold: 129, yardage_blue: 122, yardage_white: 114, yardage_red: 107},
      {hole_number: 17, par: 4, handicap_index: 4, yardage_black: 463, yardage_gold: 433, yardage_blue: 404, yardage_white: 385, yardage_red: 353},
      {hole_number: 18, par: 5, handicap_index: 14, yardage_black: 537, yardage_gold: 512, yardage_blue: 487, yardage_white: 461, yardage_red: 438}
    ]
  },
  {
    name: "Pebble Beach Golf Links (Archive 2011)",
    location: "Pebble Beach, California USA",
    par: 72,
    architect: "Jack Neville and Douglas Grant",
    year_opened: 1919,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 8, yardage_black: 362, yardage_gold: 353, yardage_blue: 327, yardage_white: 315, yardage_red: 291},
      {hole_number: 2, par: 5, handicap_index: 10, yardage_black: 485, yardage_gold: 461, yardage_blue: 437, yardage_white: 408, yardage_red: 342},
      {hole_number: 3, par: 4, handicap_index: 12, yardage_black: 390, yardage_gold: 379, yardage_blue: 372, yardage_white: 324, yardage_red: 273},
      {hole_number: 4, par: 4, handicap_index: 16, yardage_black: 342, yardage_gold: 323, yardage_blue: 302, yardage_white: 255, yardage_red: 203},
      {hole_number: 5, par: 3, handicap_index: 14, yardage_black: 186, yardage_gold: 137, yardage_blue: 136, yardage_white: 129, yardage_red: 112},
      {hole_number: 6, par: 5, handicap_index: 2, yardage_black: 516, yardage_gold: 500, yardage_blue: 480, yardage_white: 464, yardage_red: 383},
      {hole_number: 7, par: 3, handicap_index: 18, yardage_black: 104, yardage_gold: 103, yardage_blue: 98, yardage_white: 95, yardage_red: 91},
      {hole_number: 8, par: 4, handicap_index: 6, yardage_black: 426, yardage_gold: 403, yardage_blue: 393, yardage_white: 375, yardage_red: 360},
      {hole_number: 9, par: 4, handicap_index: 4, yardage_black: 483, yardage_gold: 460, yardage_blue: 435, yardage_white: 386, yardage_red: 335},
      {hole_number: 10, par: 4, handicap_index: 7, yardage_black: 447, yardage_gold: 425, yardage_blue: 405, yardage_white: 343, yardage_red: 293},
      {hole_number: 11, par: 4, handicap_index: 5, yardage_black: 372, yardage_gold: 362, yardage_blue: 345, yardage_white: 335, yardage_red: 299},
      {hole_number: 12, par: 3, handicap_index: 17, yardage_black: 202, yardage_gold: 197, yardage_blue: 185, yardage_white: 178, yardage_red: 163},
      {hole_number: 13, par: 4, handicap_index: 9, yardage_black: 407, yardage_gold: 393, yardage_blue: 378, yardage_white: 370, yardage_red: 294},
      {hole_number: 14, par: 5, handicap_index: 1, yardage_black: 572, yardage_gold: 560, yardage_blue: 548, yardage_white: 513, yardage_red: 430},
      {hole_number: 15, par: 4, handicap_index: 13, yardage_black: 396, yardage_gold: 373, yardage_blue: 365, yardage_white: 349, yardage_red: 312},
      {hole_number: 16, par: 4, handicap_index: 11, yardage_black: 403, yardage_gold: 378, yardage_blue: 370, yardage_white: 362, yardage_red: 304},
      {hole_number: 17, par: 3, handicap_index: 15, yardage_black: 208, yardage_gold: 206, yardage_blue: 200, yardage_white: 170, yardage_red: 146},
      {hole_number: 18, par: 5, handicap_index: 3, yardage_black: 536, yardage_gold: 529, yardage_blue: 516, yardage_white: 503, yardage_red: 455}
    ]
  },
  {
    name: "Pebble Beach Golf Links (Current 2016)",
    location: "Pebble Beach, California USA",
    par: 72,
    architect: "Jack Neville and Douglas Grant",
    year_opened: 1919,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 8, yardage_black: 380, yardage_gold: 366, yardage_blue: 341, yardage_white: 324, yardage_red: 307},
      {hole_number: 2, par: 5, handicap_index: 10, yardage_black: 515, yardage_gold: 486, yardage_blue: 460, yardage_white: 427, yardage_red: 360},
      {hole_number: 3, par: 4, handicap_index: 12, yardage_black: 418, yardage_gold: 389, yardage_blue: 368, yardage_white: 323, yardage_red: 279},
      {hole_number: 4, par: 4, handicap_index: 16, yardage_black: 340, yardage_gold: 321, yardage_blue: 311, yardage_white: 291, yardage_red: 254},
      {hole_number: 5, par: 3, handicap_index: 14, yardage_black: 194, yardage_gold: 186, yardage_blue: 142, yardage_white: 132, yardage_red: 112},
      {hole_number: 6, par: 5, handicap_index: 2, yardage_black: 516, yardage_gold: 499, yardage_blue: 480, yardage_white: 459, yardage_red: 380},
      {hole_number: 7, par: 3, handicap_index: 18, yardage_black: 112, yardage_gold: 107, yardage_blue: 101, yardage_white: 98, yardage_red: 95},
      {hole_number: 8, par: 4, handicap_index: 6, yardage_black: 431, yardage_gold: 421, yardage_blue: 399, yardage_white: 374, yardage_red: 373},
      {hole_number: 9, par: 4, handicap_index: 4, yardage_black: 505, yardage_gold: 480, yardage_blue: 460, yardage_white: 434, yardage_red: 333},
      {hole_number: 10, par: 4, handicap_index: 7, yardage_black: 490, yardage_gold: 442, yardage_blue: 424, yardage_white: 404, yardage_red: 338},
      {hole_number: 11, par: 4, handicap_index: 5, yardage_black: 383, yardage_gold: 366, yardage_blue: 343, yardage_white: 335, yardage_red: 303},
      {hole_number: 12, par: 3, handicap_index: 17, yardage_black: 207, yardage_gold: 196, yardage_blue: 178, yardage_white: 174, yardage_red: 163},
      {hole_number: 13, par: 4, handicap_index: 9, yardage_black: 447, yardage_gold: 405, yardage_blue: 392, yardage_white: 376, yardage_red: 292},
      {hole_number: 14, par: 5, handicap_index: 1, yardage_black: 578, yardage_gold: 567, yardage_blue: 557, yardage_white: 543, yardage_red: 429},
      {hole_number: 15, par: 4, handicap_index: 13, yardage_black: 394, yardage_gold: 379, yardage_blue: 367, yardage_white: 342, yardage_red: 312},
      {hole_number: 16, par: 4, handicap_index: 11, yardage_black: 409, yardage_gold: 400, yardage_blue: 376, yardage_white: 362, yardage_red: 303},
      {hole_number: 17, par: 3, handicap_index: 15, yardage_black: 201, yardage_gold: 172, yardage_blue: 166, yardage_white: 162, yardage_red: 144},
      {hole_number: 18, par: 5, handicap_index: 3, yardage_black: 519, yardage_gold: 515, yardage_blue: 494, yardage_white: 484, yardage_red: 445}
    ]
  },
  {
    name: "Par 3 Showcase",
    location: "Multiple Cities in the USA",
    par: 27,
    architect: "Multiple Architects",
    year_opened: 0,
    holes: [
      {hole_number: 1, par: 3, handicap_index: 3, yardage_black: 220, yardage_gold: 207, yardage_blue: 185, yardage_white: 167, yardage_red: 135},
      {hole_number: 2, par: 3, handicap_index: 2, yardage_black: 207, yardage_gold: 206, yardage_blue: 199, yardage_white: 170, yardage_red: 145},
      {hole_number: 3, par: 3, handicap_index: 1, yardage_black: 244, yardage_gold: 236, yardage_blue: 215, yardage_white: 208, yardage_red: 172},
      {hole_number: 4, par: 3, handicap_index: 5, yardage_black: 166, yardage_gold: 157, yardage_blue: 135, yardage_white: 111, yardage_red: 78},
      {hole_number: 5, par: 3, handicap_index: 4, yardage_black: 159, yardage_gold: 148, yardage_blue: 129, yardage_white: 110, yardage_red: 58},
      {hole_number: 6, par: 3, handicap_index: 6, yardage_black: 193, yardage_gold: 188, yardage_blue: 182, yardage_white: 143, yardage_red: 111},
      {hole_number: 7, par: 3, handicap_index: 8, yardage_black: 172, yardage_gold: 168, yardage_blue: 156, yardage_white: 133, yardage_red: 110},
      {hole_number: 8, par: 3, handicap_index: 7, yardage_black: 177, yardage_gold: 162, yardage_blue: 144, yardage_white: 123, yardage_red: 91},
      {hole_number: 9, par: 3, handicap_index: 9, yardage_black: 102, yardage_gold: 104, yardage_blue: 98, yardage_white: 95, yardage_red: 90}
    ]
  }
];

async function addPart3Final() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 3 Final courses to add: ${part3Final.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part3Final.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 3 Final courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add - all already exist');
  }
}

addPart3Final();
