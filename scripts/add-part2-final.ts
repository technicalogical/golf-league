import * as fs from 'fs';
import * as path from 'path';

// Final Part 2 courses
const part2Final = [
  {
    name: "Kukulchon Sanctuary",
    location: "Yucatan Peninsula, Mexico",
    par: 72,
    architect: "Kevin Turchik, aboutGolf",
    year_opened: 2015,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 7, yardage_black: 414, yardage_gold: 399, yardage_blue: 380, yardage_white: 355, yardage_red: 336},
      {hole_number: 2, par: 5, handicap_index: 1, yardage_black: 542, yardage_gold: 515, yardage_blue: 494, yardage_white: 478, yardage_red: 463},
      {hole_number: 3, par: 4, handicap_index: 5, yardage_black: 414, yardage_gold: 392, yardage_blue: 369, yardage_white: 351, yardage_red: 339},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 215, yardage_gold: 198, yardage_blue: 171, yardage_white: 158, yardage_red: 141},
      {hole_number: 5, par: 4, handicap_index: 11, yardage_black: 400, yardage_gold: 375, yardage_blue: 359, yardage_white: 337, yardage_red: 288},
      {hole_number: 6, par: 5, handicap_index: 3, yardage_black: 539, yardage_gold: 521, yardage_blue: 510, yardage_white: 482, yardage_red: 443},
      {hole_number: 7, par: 3, handicap_index: 17, yardage_black: 208, yardage_gold: 192, yardage_blue: 174, yardage_white: 157, yardage_red: 146},
      {hole_number: 8, par: 4, handicap_index: 13, yardage_black: 361, yardage_gold: 344, yardage_blue: 336, yardage_white: 313, yardage_red: 299},
      {hole_number: 9, par: 4, handicap_index: 9, yardage_black: 375, yardage_gold: 345, yardage_blue: 309, yardage_white: 288, yardage_red: 265},
      {hole_number: 10, par: 4, handicap_index: 8, yardage_black: 406, yardage_gold: 390, yardage_blue: 374, yardage_white: 351, yardage_red: 327},
      {hole_number: 11, par: 4, handicap_index: 14, yardage_black: 322, yardage_gold: 312, yardage_blue: 295, yardage_white: 288, yardage_red: 273},
      {hole_number: 12, par: 3, handicap_index: 16, yardage_black: 167, yardage_gold: 159, yardage_blue: 145, yardage_white: 134, yardage_red: 122},
      {hole_number: 13, par: 5, handicap_index: 2, yardage_black: 557, yardage_gold: 535, yardage_blue: 512, yardage_white: 492, yardage_red: 464},
      {hole_number: 14, par: 4, handicap_index: 12, yardage_black: 372, yardage_gold: 362, yardage_blue: 348, yardage_white: 330, yardage_red: 309},
      {hole_number: 15, par: 4, handicap_index: 10, yardage_black: 379, yardage_gold: 364, yardage_blue: 351, yardage_white: 332, yardage_red: 309},
      {hole_number: 16, par: 4, handicap_index: 6, yardage_black: 440, yardage_gold: 421, yardage_blue: 392, yardage_white: 353, yardage_red: 288},
      {hole_number: 17, par: 3, handicap_index: 18, yardage_black: 152, yardage_gold: 135, yardage_blue: 121, yardage_white: 108, yardage_red: 91},
      {hole_number: 18, par: 5, handicap_index: 4, yardage_black: 510, yardage_gold: 484, yardage_blue: 450, yardage_white: 420, yardage_red: 378}
    ]
  },
  {
    name: "Kynžvart Golf Club",
    location: "Lázně Kynžvart, Czech Republic",
    par: 72,
    architect: "Christoph Stadler",
    year_opened: 2010,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 16, yardage_black: 315, yardage_gold: 315, yardage_blue: 284, yardage_white: 284, yardage_red: 249},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 329, yardage_gold: 329, yardage_blue: 304, yardage_white: 285, yardage_red: 270},
      {hole_number: 3, par: 5, handicap_index: 9, yardage_black: 515, yardage_gold: 500, yardage_blue: 469, yardage_white: 445, yardage_red: 425},
      {hole_number: 4, par: 4, handicap_index: 12, yardage_black: 344, yardage_gold: 329, yardage_blue: 314, yardage_white: 284, yardage_red: 264},
      {hole_number: 5, par: 4, handicap_index: 10, yardage_black: 404, yardage_gold: 395, yardage_blue: 375, yardage_white: 335, yardage_red: 315},
      {hole_number: 6, par: 3, handicap_index: 14, yardage_black: 209, yardage_gold: 194, yardage_blue: 185, yardage_white: 169, yardage_red: 149},
      {hole_number: 7, par: 5, handicap_index: 6, yardage_black: 502, yardage_gold: 480, yardage_blue: 460, yardage_white: 420, yardage_red: 399},
      {hole_number: 8, par: 3, handicap_index: 15, yardage_black: 129, yardage_gold: 129, yardage_blue: 119, yardage_white: 109, yardage_red: 99},
      {hole_number: 9, par: 4, handicap_index: 2, yardage_black: 359, yardage_gold: 359, yardage_blue: 344, yardage_white: 299, yardage_red: 283},
      {hole_number: 10, par: 3, handicap_index: 5, yardage_black: 200, yardage_gold: 185, yardage_blue: 169, yardage_white: 154, yardage_red: 139},
      {hole_number: 11, par: 4, handicap_index: 8, yardage_black: 394, yardage_gold: 394, yardage_blue: 379, yardage_white: 334, yardage_red: 319},
      {hole_number: 12, par: 5, handicap_index: 7, yardage_black: 553, yardage_gold: 538, yardage_blue: 509, yardage_white: 475, yardage_red: 452},
      {hole_number: 13, par: 4, handicap_index: 11, yardage_black: 424, yardage_gold: 405, yardage_blue: 387, yardage_white: 339, yardage_red: 321},
      {hole_number: 14, par: 4, handicap_index: 18, yardage_black: 294, yardage_gold: 284, yardage_blue: 270, yardage_white: 245, yardage_red: 230},
      {hole_number: 15, par: 5, handicap_index: 3, yardage_black: 524, yardage_gold: 472, yardage_blue: 441, yardage_white: 396, yardage_red: 376},
      {hole_number: 16, par: 4, handicap_index: 4, yardage_black: 429, yardage_gold: 414, yardage_blue: 394, yardage_white: 351, yardage_red: 334},
      {hole_number: 17, par: 3, handicap_index: 17, yardage_black: 125, yardage_gold: 125, yardage_blue: 115, yardage_white: 110, yardage_red: 100},
      {hole_number: 18, par: 4, handicap_index: 1, yardage_black: 449, yardage_gold: 435, yardage_blue: 355, yardage_white: 339, yardage_red: 309}
    ]
  },
  {
    name: "Lake Hills Country Club",
    location: "Yongin-City, South Korea",
    par: 72,
    architect: "Frank O'Dowd",
    year_opened: 1998,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 425, yardage_gold: 401, yardage_blue: 374, yardage_white: 347, yardage_red: 321},
      {hole_number: 2, par: 5, handicap_index: 1, yardage_black: 559, yardage_gold: 538, yardage_blue: 508, yardage_white: 472, yardage_red: 444},
      {hole_number: 3, par: 4, handicap_index: 13, yardage_black: 440, yardage_gold: 418, yardage_blue: 417, yardage_white: 387, yardage_red: 347},
      {hole_number: 4, par: 3, handicap_index: 17, yardage_black: 175, yardage_gold: 159, yardage_blue: 155, yardage_white: 131, yardage_red: 100},
      {hole_number: 5, par: 5, handicap_index: 3, yardage_black: 580, yardage_gold: 546, yardage_blue: 530, yardage_white: 512, yardage_red: 490},
      {hole_number: 6, par: 4, handicap_index: 5, yardage_black: 341, yardage_gold: 320, yardage_blue: 289, yardage_white: 260, yardage_red: 232},
      {hole_number: 7, par: 4, handicap_index: 7, yardage_black: 395, yardage_gold: 353, yardage_blue: 318, yardage_white: 302, yardage_red: 276},
      {hole_number: 8, par: 3, handicap_index: 15, yardage_black: 172, yardage_gold: 159, yardage_blue: 155, yardage_white: 121, yardage_red: 118},
      {hole_number: 9, par: 4, handicap_index: 9, yardage_black: 394, yardage_gold: 367, yardage_blue: 328, yardage_white: 325, yardage_red: 288},
      {hole_number: 10, par: 4, handicap_index: 10, yardage_black: 401, yardage_gold: 369, yardage_blue: 340, yardage_white: 312, yardage_red: 292},
      {hole_number: 11, par: 4, handicap_index: 8, yardage_black: 396, yardage_gold: 376, yardage_blue: 355, yardage_white: 336, yardage_red: 320},
      {hole_number: 12, par: 5, handicap_index: 2, yardage_black: 600, yardage_gold: 576, yardage_blue: 544, yardage_white: 506, yardage_red: 486},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 188, yardage_gold: 171, yardage_blue: 156, yardage_white: 154, yardage_red: 125},
      {hole_number: 14, par: 4, handicap_index: 14, yardage_black: 445, yardage_gold: 414, yardage_blue: 388, yardage_white: 363, yardage_red: 345},
      {hole_number: 15, par: 4, handicap_index: 6, yardage_black: 393, yardage_gold: 369, yardage_blue: 345, yardage_white: 325, yardage_red: 303},
      {hole_number: 16, par: 3, handicap_index: 16, yardage_black: 161, yardage_gold: 146, yardage_blue: 135, yardage_white: 119, yardage_red: 95},
      {hole_number: 17, par: 5, handicap_index: 4, yardage_black: 621, yardage_gold: 594, yardage_blue: 572, yardage_white: 529, yardage_red: 475},
      {hole_number: 18, par: 4, handicap_index: 12, yardage_black: 424, yardage_gold: 405, yardage_blue: 373, yardage_white: 347, yardage_red: 331}
    ]
  },
  {
    name: "Le Golf National - L'Albatros",
    location: "Guyancourt, France",
    par: 72,
    architect: "Hubert Chesneau, Robert Von Hagge, Pierre Thevenin",
    year_opened: 1990,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 4, yardage_black: 414, yardage_gold: 384, yardage_blue: 372, yardage_white: 358, yardage_red: 295},
      {hole_number: 2, par: 3, handicap_index: 6, yardage_black: 209, yardage_gold: 194, yardage_blue: 175, yardage_white: 167, yardage_red: 140},
      {hole_number: 3, par: 5, handicap_index: 12, yardage_black: 541, yardage_gold: 528, yardage_blue: 514, yardage_white: 478, yardage_red: 437},
      {hole_number: 4, par: 4, handicap_index: 8, yardage_black: 447, yardage_gold: 427, yardage_blue: 404, yardage_white: 374, yardage_red: 331},
      {hole_number: 5, par: 4, handicap_index: 16, yardage_black: 384, yardage_gold: 377, yardage_blue: 372, yardage_white: 355, yardage_red: 313},
      {hole_number: 6, par: 4, handicap_index: 18, yardage_black: 393, yardage_gold: 374, yardage_blue: 367, yardage_white: 340, yardage_red: 299},
      {hole_number: 7, par: 4, handicap_index: 2, yardage_black: 444, yardage_gold: 429, yardage_blue: 414, yardage_white: 396, yardage_red: 351},
      {hole_number: 8, par: 3, handicap_index: 14, yardage_black: 222, yardage_gold: 205, yardage_blue: 190, yardage_white: 180, yardage_red: 153},
      {hole_number: 9, par: 5, handicap_index: 10, yardage_black: 577, yardage_gold: 564, yardage_blue: 548, yardage_white: 537, yardage_red: 464},
      {hole_number: 10, par: 4, handicap_index: 9, yardage_black: 392, yardage_gold: 382, yardage_blue: 375, yardage_white: 364, yardage_red: 313},
      {hole_number: 11, par: 3, handicap_index: 17, yardage_black: 210, yardage_gold: 197, yardage_blue: 188, yardage_white: 174, yardage_red: 142},
      {hole_number: 12, par: 4, handicap_index: 7, yardage_black: 460, yardage_gold: 440, yardage_blue: 420, yardage_white: 394, yardage_red: 340},
      {hole_number: 13, par: 4, handicap_index: 3, yardage_black: 454, yardage_gold: 440, yardage_blue: 428, yardage_white: 403, yardage_red: 352},
      {hole_number: 14, par: 5, handicap_index: 11, yardage_black: 564, yardage_gold: 551, yardage_blue: 529, yardage_white: 508, yardage_red: 440},
      {hole_number: 15, par: 4, handicap_index: 1, yardage_black: 455, yardage_gold: 434, yardage_blue: 408, yardage_white: 377, yardage_red: 328},
      {hole_number: 16, par: 3, handicap_index: 13, yardage_black: 199, yardage_gold: 186, yardage_blue: 177, yardage_white: 169, yardage_red: 127},
      {hole_number: 17, par: 4, handicap_index: 5, yardage_black: 468, yardage_gold: 453, yardage_blue: 434, yardage_white: 399, yardage_red: 346},
      {hole_number: 18, par: 5, handicap_index: 15, yardage_black: 511, yardage_gold: 488, yardage_blue: 476, yardage_white: 451, yardage_red: 392}
    ]
  }
];

async function addFinalPart2() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Final Part 2 courses to add: ${part2Final.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part2Final.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('Final Part 2 courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add');
  }
}

addFinalPart2();
