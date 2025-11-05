import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Part 1 Courses Data
const part1Courses = [
  {
    name: "Aleria Gardens",
    location: "Aleria, France",
    architect: "Martin DeWitt, aboutGolf",
    year_opened: 2015,
    par_total: 72,
    par_out: 36,
    par_in: 36,
    holes: [
      { hole_number: 1, par: 5, handicap_men: 5, handicap_women: 5, black: 536, gold: 506, blue: 500, white: 486, red: 460 },
      { hole_number: 2, par: 3, handicap_men: 17, handicap_women: 15, black: 171, gold: 163, blue: 167, white: 150, red: 131 },
      { hole_number: 3, par: 4, handicap_men: 13, handicap_women: 11, black: 363, gold: 335, blue: 329, white: 322, red: 292 },
      { hole_number: 4, par: 4, handicap_men: 7, handicap_women: 7, black: 410, gold: 392, blue: 378, white: 367, red: 348 },
      { hole_number: 5, par: 3, handicap_men: 15, handicap_women: 17, black: 185, gold: 167, blue: 151, white: 148, red: 134 },
      { hole_number: 6, par: 4, handicap_men: 11, handicap_women: 13, black: 361, gold: 333, blue: 313, white: 305, red: 292 },
      { hole_number: 7, par: 4, handicap_men: 9, handicap_women: 9, black: 404, gold: 385, blue: 359, white: 339, red: 274 },
      { hole_number: 8, par: 5, handicap_men: 3, handicap_women: 3, black: 557, gold: 541, blue: 517, white: 503, red: 425 },
      { hole_number: 9, par: 4, handicap_men: 1, handicap_women: 1, black: 508, gold: 487, blue: 456, white: 417, red: 364 },
      { hole_number: 10, par: 5, handicap_men: 4, handicap_women: 6, black: 545, gold: 527, blue: 512, white: 481, red: 451 },
      { hole_number: 11, par: 3, handicap_men: 16, handicap_women: 18, black: 180, gold: 167, blue: 152, white: 126, red: 108 },
      { hole_number: 12, par: 4, handicap_men: 6, handicap_women: 4, black: 398, gold: 386, blue: 368, white: 350, red: 273 },
      { hole_number: 13, par: 4, handicap_men: 8, handicap_women: 10, black: 369, gold: 341, blue: 334, white: 306, red: 274 },
      { hole_number: 14, par: 4, handicap_men: 10, handicap_women: 14, black: 368, gold: 343, blue: 335, white: 310, red: 264 },
      { hole_number: 15, par: 4, handicap_men: 12, handicap_women: 8, black: 375, gold: 350, blue: 342, white: 334, red: 281 },
      { hole_number: 16, par: 4, handicap_men: 14, handicap_women: 12, black: 377, gold: 350, blue: 334, white: 329, red: 300 },
      { hole_number: 17, par: 3, handicap_men: 18, handicap_women: 16, black: 162, gold: 141, blue: 128, white: 125, red: 109 },
      { hole_number: 18, par: 5, handicap_men: 2, handicap_women: 2, black: 536, gold: 519, blue: 502, white: 495, red: 474 },
    ],
    ratings: [
      { tee_color: 'Black', rating_men: 75.0, slope_men: 135, rating_women: 80.0, slope_women: 145, drive_distance: '> 275' },
      { tee_color: 'Gold', rating_men: 73.5, slope_men: 130, rating_women: 78.0, slope_women: 135, drive_distance: '250-275' },
      { tee_color: 'Blue', rating_men: 72.0, slope_men: 120, rating_women: 76.0, slope_women: 125, drive_distance: '225-249' },
      { tee_color: 'White', rating_men: 70.0, slope_men: 113, rating_women: 74.0, slope_women: 116, drive_distance: '200-224' },
      { tee_color: 'Red', rating_men: 68.0, slope_men: 110, rating_women: 72.0, slope_women: 113, drive_distance: '< 200' },
    ]
  },
  {
    name: "Ashley Farms",
    location: "Sun City Center, Florida USA",
    architect: "aboutGolf",
    year_opened: 2006,
    par_total: 72,
    par_out: 36,
    par_in: 36,
    holes: [
      { hole_number: 1, par: 4, handicap_men: 11, handicap_women: 11, black: 399, gold: 374, blue: 345, white: 319, red: 290 },
      { hole_number: 2, par: 4, handicap_men: 7, handicap_women: 7, black: 424, gold: 400, blue: 364, white: 340, red: 310 },
      { hole_number: 3, par: 4, handicap_men: 13, handicap_women: 13, black: 350, gold: 330, blue: 305, white: 279, red: 255 },
      { hole_number: 4, par: 3, handicap_men: 17, handicap_women: 17, black: 175, gold: 165, blue: 150, white: 140, red: 120 },
      { hole_number: 5, par: 5, handicap_men: 3, handicap_women: 3, black: 534, gold: 505, blue: 484, white: 430, red: 405 },
      { hole_number: 6, par: 3, handicap_men: 15, handicap_women: 15, black: 199, gold: 190, blue: 169, white: 149, red: 135 },
      { hole_number: 7, par: 4, handicap_men: 5, handicap_women: 5, black: 472, gold: 440, blue: 404, white: 368, red: 335 },
      { hole_number: 8, par: 4, handicap_men: 9, handicap_women: 9, black: 419, gold: 394, blue: 359, white: 329, red: 299 },
      { hole_number: 9, par: 5, handicap_men: 1, handicap_women: 1, black: 605, gold: 565, blue: 515, white: 460, red: 425 },
      { hole_number: 10, par: 3, handicap_men: 18, handicap_women: 18, black: 170, gold: 159, blue: 145, white: 130, red: 120 },
      { hole_number: 11, par: 5, handicap_men: 2, handicap_women: 2, black: 573, gold: 539, blue: 494, white: 450, red: 426 },
      { hole_number: 12, par: 4, handicap_men: 14, handicap_women: 14, black: 359, gold: 339, blue: 310, white: 289, red: 260 },
      { hole_number: 13, par: 4, handicap_men: 8, handicap_women: 8, black: 440, gold: 415, blue: 380, white: 349, red: 319 },
      { hole_number: 14, par: 5, handicap_men: 4, handicap_women: 4, black: 524, gold: 500, blue: 479, white: 420, red: 400 },
      { hole_number: 15, par: 4, handicap_men: 12, handicap_women: 12, black: 384, gold: 362, blue: 326, white: 301, red: 271 },
      { hole_number: 16, par: 4, handicap_men: 10, handicap_women: 10, black: 435, gold: 409, blue: 375, white: 340, red: 305 },
      { hole_number: 17, par: 3, handicap_men: 16, handicap_women: 16, black: 220, gold: 205, blue: 185, white: 165, red: 150 },
      { hole_number: 18, par: 4, handicap_men: 6, handicap_women: 6, black: 450, gold: 425, blue: 384, white: 359, red: 325 },
    ],
    ratings: [
      { tee_color: 'Black', rating_men: 75.0, slope_men: 135, rating_women: 80.0, slope_women: 145, drive_distance: '> 275' },
      { tee_color: 'Gold', rating_men: 73.5, slope_men: 130, rating_women: 78.0, slope_women: 135, drive_distance: '250-275' },
      { tee_color: 'Blue', rating_men: 72.0, slope_men: 120, rating_women: 76.0, slope_women: 125, drive_distance: '225-249' },
      { tee_color: 'White', rating_men: 70.0, slope_men: 113, rating_women: 74.0, slope_women: 116, drive_distance: '200-224' },
      { tee_color: 'Red', rating_men: 68.0, slope_men: 110, rating_women: 72.0, slope_women: 113, drive_distance: '< 200' },
    ]
  },
  {
    name: "Atlantis",
    location: "Somewhere in the South Pacific",
    architect: "aboutGolf",
    year_opened: 2004,
    par_total: 71,
    par_out: 35,
    par_in: 36,
    holes: [
      { hole_number: 1, par: 4, handicap_men: 17, handicap_women: 11, black: 329, gold: 305, blue: 283, white: 228, red: 210 },
      { hole_number: 2, par: 5, handicap_men: 1, handicap_women: 1, black: 561, gold: 528, blue: 505, white: 475, red: 356 },
      { hole_number: 3, par: 4, handicap_men: 7, handicap_women: 3, black: 342, gold: 332, blue: 303, white: 288, red: 269 },
      { hole_number: 4, par: 3, handicap_men: 15, handicap_women: 15, black: 176, gold: 161, blue: 144, white: 122, red: 91 },
      { hole_number: 5, par: 4, handicap_men: 13, handicap_women: 17, black: 379, gold: 341, blue: 330, white: 308, red: 282 },
      { hole_number: 6, par: 4, handicap_men: 3, handicap_women: 9, black: 383, gold: 363, blue: 345, white: 325, red: 271 },
      { hole_number: 7, par: 3, handicap_men: 9, handicap_women: 7, black: 201, gold: 179, blue: 153, white: 91, red: 73 },
      { hole_number: 8, par: 4, handicap_men: 11, handicap_women: 13, black: 345, gold: 331, blue: 315, white: 261, red: 252 },
      { hole_number: 9, par: 4, handicap_men: 5, handicap_women: 5, black: 395, gold: 369, blue: 358, white: 323, red: 282 },
      { hole_number: 10, par: 4, handicap_men: 8, handicap_women: 8, black: 400, gold: 370, blue: 363, white: 344, red: 319 },
      { hole_number: 11, par: 3, handicap_men: 10, handicap_women: 2, black: 185, gold: 171, blue: 160, white: 146, red: 135 },
      { hole_number: 12, par: 4, handicap_men: 6, handicap_women: 16, black: 402, gold: 393, blue: 371, white: 340, red: 317 },
      { hole_number: 13, par: 5, handicap_men: 4, handicap_women: 10, black: 530, gold: 521, blue: 510, white: 498, red: 424 },
      { hole_number: 14, par: 4, handicap_men: 16, handicap_women: 6, black: 328, gold: 309, blue: 289, white: 276, red: 255 },
      { hole_number: 15, par: 4, handicap_men: 2, handicap_women: 4, black: 453, gold: 433, blue: 416, white: 401, red: 361 },
      { hole_number: 16, par: 3, handicap_men: 18, handicap_women: 18, black: 128, gold: 111, blue: 107, white: 102, red: 83 },
      { hole_number: 17, par: 5, handicap_men: 12, handicap_women: 12, black: 506, gold: 494, blue: 464, white: 404, red: 352 },
      { hole_number: 18, par: 4, handicap_men: 14, handicap_women: 14, black: 333, gold: 325, blue: 304, white: 294, red: 277 },
    ],
    ratings: [
      { tee_color: 'Black', rating_men: 72.5, slope_men: 114, rating_women: 78.3, slope_women: 133, drive_distance: '> 275' },
      { tee_color: 'Gold', rating_men: 70.9, slope_men: 110, rating_women: 76.3, slope_women: 128, drive_distance: '250-275' },
      { tee_color: 'Blue', rating_men: 68.2, slope_men: 113, rating_women: 74.5, slope_women: 118, drive_distance: '225-249' },
      { tee_color: 'White', rating_men: 65.7, slope_men: 108, rating_women: 70.5, slope_women: 117, drive_distance: '200-224' },
      { tee_color: 'Red', rating_men: 62.8, slope_men: 96, rating_women: 66.8, slope_women: 109, drive_distance: '< 200' },
    ]
  },
  // Continue with remaining Part 1 courses...
];

async function seedCourses() {
  try {
    console.log('Starting course data seeding...');

    for (const courseData of part1Courses) {
      console.log(`\nProcessing: ${courseData.name}`);

      // Insert course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          name: courseData.name,
          location: courseData.location,
          architect: courseData.architect,
          year_opened: courseData.year_opened,
          par_total: courseData.par_total,
          par_out: courseData.par_out,
          par_in: courseData.par_in,
        })
        .select()
        .single();

      if (courseError) {
        console.error(`Error inserting course ${courseData.name}:`, courseError);
        continue;
      }

      console.log(`  ✓ Course created: ${course.name}`);

      // Insert tee boxes with ratings
      for (const rating of courseData.ratings) {
        const { data: teeBox, error: teeError } = await supabase
          .from('tee_boxes')
          .insert({
            course_id: course.id,
            tee_color: rating.tee_color,
            rating_men: rating.rating_men,
            slope_men: rating.slope_men,
            rating_women: rating.rating_women,
            slope_women: rating.slope_women,
            drive_distance: rating.drive_distance,
          })
          .select()
          .single();

        if (teeError) {
          console.error(`  Error inserting tee box ${rating.tee_color}:`, teeError);
        }
      }

      console.log(`  ✓ Tee boxes created: ${courseData.ratings.length}`);

      // Insert holes
      for (const holeData of courseData.holes) {
        const { data: hole, error: holeError } = await supabase
          .from('holes')
          .insert({
            course_id: course.id,
            hole_number: holeData.hole_number,
            par: holeData.par,
            handicap_men: holeData.handicap_men,
            handicap_women: holeData.handicap_women,
          })
          .select()
          .single();

        if (holeError) {
          console.error(`  Error inserting hole ${holeData.hole_number}:`, holeError);
          continue;
        }

        // Insert yardages for each tee
        const yardages = [
          { tee_color: 'Black', yardage: holeData.black },
          { tee_color: 'Gold', yardage: holeData.gold },
          { tee_color: 'Blue', yardage: holeData.blue },
          { tee_color: 'White', yardage: holeData.white },
          { tee_color: 'Red', yardage: holeData.red },
        ];

        for (const yardage of yardages) {
          const { error: yardageError } = await supabase
            .from('hole_yardages')
            .insert({
              hole_id: hole.id,
              tee_color: yardage.tee_color,
              yardage: yardage.yardage,
            });

          if (yardageError) {
            console.error(`    Error inserting yardage for hole ${holeData.hole_number}, tee ${yardage.tee_color}:`, yardageError);
          }
        }
      }

      console.log(`  ✓ Holes created: ${courseData.holes.length}`);
      console.log(`✓ Completed: ${courseData.name}`);
    }

    console.log('\n✓ Course seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
