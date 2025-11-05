import * as fs from 'fs';
import * as path from 'path';

// Part 4 Courses - Final batch
const part4Final = [
  {
    name: "Shady Dunes",
    location: "Colfax, Louisiana USA",
    par: 72,
    architect: "aboutGolf",
    year_opened: 2003,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 11, yardage_black: 369, yardage_gold: 341, yardage_blue: 315, yardage_white: 285, yardage_red: 250},
      {hole_number: 2, par: 4, handicap_index: 5, yardage_black: 386, yardage_gold: 375, yardage_blue: 365, yardage_white: 323, yardage_red: 312},
      {hole_number: 3, par: 3, handicap_index: 9, yardage_black: 195, yardage_gold: 181, yardage_blue: 150, yardage_white: 119, yardage_red: 97},
      {hole_number: 4, par: 4, handicap_index: 17, yardage_black: 338, yardage_gold: 321, yardage_blue: 313, yardage_white: 259, yardage_red: 222},
      {hole_number: 5, par: 5, handicap_index: 15, yardage_black: 487, yardage_gold: 467, yardage_blue: 439, yardage_white: 410, yardage_red: 371},
      {hole_number: 6, par: 3, handicap_index: 13, yardage_black: 183, yardage_gold: 155, yardage_blue: 137, yardage_white: 102, yardage_red: 82},
      {hole_number: 7, par: 4, handicap_index: 7, yardage_black: 428, yardage_gold: 397, yardage_blue: 363, yardage_white: 348, yardage_red: 314},
      {hole_number: 8, par: 5, handicap_index: 3, yardage_black: 556, yardage_gold: 529, yardage_blue: 502, yardage_white: 473, yardage_red: 442},
      {hole_number: 9, par: 4, handicap_index: 1, yardage_black: 408, yardage_gold: 383, yardage_blue: 372, yardage_white: 350, yardage_red: 315},
      {hole_number: 10, par: 4, handicap_index: 2, yardage_black: 424, yardage_gold: 390, yardage_blue: 377, yardage_white: 357, yardage_red: 327},
      {hole_number: 11, par: 5, handicap_index: 8, yardage_black: 566, yardage_gold: 533, yardage_blue: 499, yardage_white: 482, yardage_red: 444},
      {hole_number: 12, par: 4, handicap_index: 14, yardage_black: 379, yardage_gold: 351, yardage_blue: 313, yardage_white: 300, yardage_red: 261},
      {hole_number: 13, par: 3, handicap_index: 10, yardage_black: 197, yardage_gold: 180, yardage_blue: 169, yardage_white: 143, yardage_red: 113},
      {hole_number: 14, par: 4, handicap_index: 4, yardage_black: 429, yardage_gold: 399, yardage_blue: 365, yardage_white: 348, yardage_red: 313},
      {hole_number: 15, par: 5, handicap_index: 16, yardage_black: 501, yardage_gold: 483, yardage_blue: 443, yardage_white: 412, yardage_red: 382},
      {hole_number: 16, par: 4, handicap_index: 6, yardage_black: 413, yardage_gold: 387, yardage_blue: 349, yardage_white: 322, yardage_red: 291},
      {hole_number: 17, par: 3, handicap_index: 18, yardage_black: 174, yardage_gold: 149, yardage_blue: 149, yardage_white: 127, yardage_red: 103},
      {hole_number: 18, par: 4, handicap_index: 12, yardage_black: 422, yardage_gold: 398, yardage_blue: 390, yardage_white: 365, yardage_red: 332}
    ]
  },
  {
    name: "SheShan International Golf Club",
    location: "Shanghai, China",
    par: 72,
    architect: "Nelson & Haworth",
    year_opened: 2004,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 7, yardage_black: 460, yardage_gold: 443, yardage_blue: 425, yardage_white: 403, yardage_red: 369},
      {hole_number: 2, par: 5, handicap_index: 9, yardage_black: 549, yardage_gold: 520, yardage_blue: 517, yardage_white: 480, yardage_red: 405},
      {hole_number: 3, par: 4, handicap_index: 11, yardage_black: 362, yardage_gold: 343, yardage_blue: 336, yardage_white: 303, yardage_red: 278},
      {hole_number: 4, par: 3, handicap_index: 17, yardage_black: 192, yardage_gold: 183, yardage_blue: 167, yardage_white: 148, yardage_red: 127},
      {hole_number: 5, par: 4, handicap_index: 3, yardage_black: 444, yardage_gold: 440, yardage_blue: 418, yardage_white: 388, yardage_red: 339},
      {hole_number: 6, par: 3, handicap_index: 15, yardage_black: 208, yardage_gold: 197, yardage_blue: 179, yardage_white: 146, yardage_red: 127},
      {hole_number: 7, par: 4, handicap_index: 13, yardage_black: 346, yardage_gold: 334, yardage_blue: 326, yardage_white: 289, yardage_red: 253},
      {hole_number: 8, par: 5, handicap_index: 5, yardage_black: 546, yardage_gold: 527, yardage_blue: 508, yardage_white: 484, yardage_red: 385},
      {hole_number: 9, par: 4, handicap_index: 1, yardage_black: 441, yardage_gold: 420, yardage_blue: 399, yardage_white: 364, yardage_red: 342},
      {hole_number: 10, par: 4, handicap_index: 8, yardage_black: 408, yardage_gold: 390, yardage_blue: 385, yardage_white: 362, yardage_red: 331},
      {hole_number: 11, par: 4, handicap_index: 4, yardage_black: 435, yardage_gold: 412, yardage_blue: 395, yardage_white: 373, yardage_red: 338},
      {hole_number: 12, par: 3, handicap_index: 18, yardage_black: 205, yardage_gold: 201, yardage_blue: 200, yardage_white: 171, yardage_red: 142},
      {hole_number: 13, par: 4, handicap_index: 12, yardage_black: 385, yardage_gold: 381, yardage_blue: 349, yardage_white: 319, yardage_red: 299},
      {hole_number: 14, par: 5, handicap_index: 10, yardage_black: 562, yardage_gold: 538, yardage_blue: 509, yardage_white: 479, yardage_red: 447},
      {hole_number: 15, par: 4, handicap_index: 2, yardage_black: 471, yardage_gold: 447, yardage_blue: 436, yardage_white: 409, yardage_red: 351},
      {hole_number: 16, par: 4, handicap_index: 14, yardage_black: 296, yardage_gold: 280, yardage_blue: 275, yardage_white: 254, yardage_red: 230},
      {hole_number: 17, par: 3, handicap_index: 16, yardage_black: 182, yardage_gold: 170, yardage_blue: 155, yardage_white: 150, yardage_red: 131},
      {hole_number: 18, par: 5, handicap_index: 6, yardage_black: 522, yardage_gold: 509, yardage_blue: 486, yardage_white: 454, yardage_red: 410}
    ]
  },
  {
    name: "The Links at Spanish Bay (Archive 2012)",
    location: "Pebble Beach, California USA",
    par: 72,
    architect: "Robert Trent Jones, Jr.",
    year_opened: 1987,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 9, yardage_black: 501, yardage_gold: 501, yardage_blue: 495, yardage_white: 464, yardage_red: 434},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 307, yardage_gold: 307, yardage_blue: 299, yardage_white: 265, yardage_red: 224},
      {hole_number: 3, par: 4, handicap_index: 5, yardage_black: 406, yardage_gold: 406, yardage_blue: 340, yardage_white: 334, yardage_red: 305},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 190, yardage_gold: 190, yardage_blue: 176, yardage_white: 159, yardage_red: 126},
      {hole_number: 5, par: 4, handicap_index: 1, yardage_black: 461, yardage_gold: 461, yardage_blue: 419, yardage_white: 384, yardage_red: 341},
      {hole_number: 6, par: 4, handicap_index: 11, yardage_black: 415, yardage_gold: 415, yardage_blue: 404, yardage_white: 345, yardage_red: 305},
      {hole_number: 7, par: 4, handicap_index: 3, yardage_black: 418, yardage_gold: 418, yardage_blue: 411, yardage_white: 381, yardage_red: 340},
      {hole_number: 8, par: 3, handicap_index: 17, yardage_black: 158, yardage_gold: 158, yardage_blue: 152, yardage_white: 146, yardage_red: 127},
      {hole_number: 9, par: 4, handicap_index: 7, yardage_black: 394, yardage_gold: 394, yardage_blue: 366, yardage_white: 357, yardage_red: 325},
      {hole_number: 10, par: 5, handicap_index: 8, yardage_black: 519, yardage_gold: 519, yardage_blue: 476, yardage_white: 467, yardage_red: 399},
      {hole_number: 11, par: 4, handicap_index: 14, yardage_black: 364, yardage_gold: 364, yardage_blue: 353, yardage_white: 323, yardage_red: 289},
      {hole_number: 12, par: 4, handicap_index: 6, yardage_black: 431, yardage_gold: 431, yardage_blue: 421, yardage_white: 406, yardage_red: 341},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 126, yardage_gold: 126, yardage_blue: 119, yardage_white: 99, yardage_red: 76},
      {hole_number: 14, par: 5, handicap_index: 2, yardage_black: 576, yardage_gold: 576, yardage_blue: 546, yardage_white: 541, yardage_red: 476},
      {hole_number: 15, par: 4, handicap_index: 12, yardage_black: 389, yardage_gold: 389, yardage_blue: 371, yardage_white: 342, yardage_red: 295},
      {hole_number: 16, par: 3, handicap_index: 16, yardage_black: 199, yardage_gold: 199, yardage_blue: 190, yardage_white: 157, yardage_red: 128},
      {hole_number: 17, par: 4, handicap_index: 4, yardage_black: 413, yardage_gold: 413, yardage_blue: 375, yardage_white: 367, yardage_red: 321},
      {hole_number: 18, par: 5, handicap_index: 10, yardage_black: 574, yardage_gold: 574, yardage_blue: 524, yardage_white: 510, yardage_red: 476}
    ]
  },
  {
    name: "The Links at Spanish Bay (Current 2016)",
    location: "Pebble Beach, California USA",
    par: 72,
    architect: "Robert Trent Jones, Jr.",
    year_opened: 1987,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 9, yardage_black: 502, yardage_gold: 501, yardage_blue: 496, yardage_white: 462, yardage_red: 433},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 321, yardage_gold: 311, yardage_blue: 305, yardage_white: 263, yardage_red: 228},
      {hole_number: 3, par: 4, handicap_index: 5, yardage_black: 337, yardage_gold: 336, yardage_blue: 336, yardage_white: 329, yardage_red: 302},
      {hole_number: 4, par: 3, handicap_index: 15, yardage_black: 187, yardage_gold: 186, yardage_blue: 172, yardage_white: 156, yardage_red: 124},
      {hole_number: 5, par: 4, handicap_index: 1, yardage_black: 463, yardage_gold: 463, yardage_blue: 411, yardage_white: 385, yardage_red: 345},
      {hole_number: 6, par: 4, handicap_index: 11, yardage_black: 401, yardage_gold: 400, yardage_blue: 390, yardage_white: 362, yardage_red: 277},
      {hole_number: 7, par: 4, handicap_index: 3, yardage_black: 428, yardage_gold: 423, yardage_blue: 401, yardage_white: 362, yardage_red: 351},
      {hole_number: 8, par: 3, handicap_index: 17, yardage_black: 162, yardage_gold: 158, yardage_blue: 149, yardage_white: 143, yardage_red: 125},
      {hole_number: 9, par: 4, handicap_index: 7, yardage_black: 400, yardage_gold: 399, yardage_blue: 373, yardage_white: 359, yardage_red: 328},
      {hole_number: 10, par: 5, handicap_index: 8, yardage_black: 519, yardage_gold: 519, yardage_blue: 480, yardage_white: 469, yardage_red: 405},
      {hole_number: 11, par: 4, handicap_index: 14, yardage_black: 378, yardage_gold: 378, yardage_blue: 355, yardage_white: 320, yardage_red: 282},
      {hole_number: 12, par: 4, handicap_index: 6, yardage_black: 440, yardage_gold: 440, yardage_blue: 425, yardage_white: 413, yardage_red: 344},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 131, yardage_gold: 126, yardage_blue: 122, yardage_white: 99, yardage_red: 78},
      {hole_number: 14, par: 5, handicap_index: 2, yardage_black: 570, yardage_gold: 570, yardage_blue: 542, yardage_white: 542, yardage_red: 476},
      {hole_number: 15, par: 4, handicap_index: 12, yardage_black: 377, yardage_gold: 377, yardage_blue: 358, yardage_white: 327, yardage_red: 287},
      {hole_number: 16, par: 3, handicap_index: 16, yardage_black: 206, yardage_gold: 200, yardage_blue: 193, yardage_white: 157, yardage_red: 131},
      {hole_number: 17, par: 4, handicap_index: 4, yardage_black: 421, yardage_gold: 421, yardage_blue: 385, yardage_white: 373, yardage_red: 329},
      {hole_number: 18, par: 5, handicap_index: 10, yardage_black: 561, yardage_gold: 561, yardage_blue: 515, yardage_white: 504, yardage_red: 472}
    ]
  },
  {
    name: "Spyglass Hill Golf Course (Archive 2011)",
    location: "Pebble Beach, California USA",
    par: 72,
    architect: "Robert Trent Jones Sr.",
    year_opened: 1966,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 3, yardage_black: 584, yardage_gold: 559, yardage_blue: 520, yardage_white: 502, yardage_red: 459},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 342, yardage_gold: 307, yardage_blue: 299, yardage_white: 282, yardage_red: 241},
      {hole_number: 3, par: 3, handicap_index: 17, yardage_black: 150, yardage_gold: 138, yardage_blue: 116, yardage_white: 83, yardage_red: 66},
      {hole_number: 4, par: 4, handicap_index: 9, yardage_black: 357, yardage_gold: 347, yardage_blue: 336, yardage_white: 286, yardage_red: 280},
      {hole_number: 5, par: 3, handicap_index: 15, yardage_black: 207, yardage_gold: 188, yardage_blue: 170, yardage_white: 136, yardage_red: 110},
      {hole_number: 6, par: 4, handicap_index: 7, yardage_black: 448, yardage_gold: 400, yardage_blue: 386, yardage_white: 359, yardage_red: 307},
      {hole_number: 7, par: 5, handicap_index: 11, yardage_black: 523, yardage_gold: 510, yardage_blue: 475, yardage_white: 463, yardage_red: 439},
      {hole_number: 8, par: 4, handicap_index: 1, yardage_black: 393, yardage_gold: 371, yardage_blue: 357, yardage_white: 348, yardage_red: 301},
      {hole_number: 9, par: 4, handicap_index: 5, yardage_black: 423, yardage_gold: 409, yardage_blue: 395, yardage_white: 382, yardage_red: 342},
      {hole_number: 10, par: 4, handicap_index: 12, yardage_black: 403, yardage_gold: 392, yardage_blue: 365, yardage_white: 353, yardage_red: 303},
      {hole_number: 11, par: 5, handicap_index: 10, yardage_black: 517, yardage_gold: 480, yardage_blue: 454, yardage_white: 444, yardage_red: 404},
      {hole_number: 12, par: 3, handicap_index: 16, yardage_black: 172, yardage_gold: 155, yardage_blue: 135, yardage_white: 117, yardage_red: 88},
      {hole_number: 13, par: 4, handicap_index: 4, yardage_black: 441, yardage_gold: 417, yardage_blue: 394, yardage_white: 352, yardage_red: 322},
      {hole_number: 14, par: 5, handicap_index: 6, yardage_black: 566, yardage_gold: 557, yardage_blue: 525, yardage_white: 517, yardage_red: 482},
      {hole_number: 15, par: 3, handicap_index: 18, yardage_black: 121, yardage_gold: 113, yardage_blue: 98, yardage_white: 92, yardage_red: 80},
      {hole_number: 16, par: 4, handicap_index: 2, yardage_black: 457, yardage_gold: 445, yardage_blue: 419, yardage_white: 387, yardage_red: 349},
      {hole_number: 17, par: 4, handicap_index: 14, yardage_black: 324, yardage_gold: 315, yardage_blue: 304, yardage_white: 296, yardage_red: 264},
      {hole_number: 18, par: 4, handicap_index: 8, yardage_black: 406, yardage_gold: 390, yardage_blue: 372, yardage_white: 356, yardage_red: 327}
    ]
  },
  {
    name: "Spyglass Hill Golf Course (Current 2016)",
    location: "Pebble Beach, California USA",
    par: 72,
    architect: "Robert Trent Jones Sr.",
    year_opened: 1966,
    holes: [
      {hole_number: 1, par: 5, handicap_index: 3, yardage_black: 583, yardage_gold: 555, yardage_blue: 528, yardage_white: 515, yardage_red: 478},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 344, yardage_gold: 313, yardage_blue: 290, yardage_white: 281, yardage_red: 230},
      {hole_number: 3, par: 3, handicap_index: 17, yardage_black: 165, yardage_gold: 147, yardage_blue: 140, yardage_white: 122, yardage_red: 85},
      {hole_number: 4, par: 4, handicap_index: 9, yardage_black: 357, yardage_gold: 347, yardage_blue: 337, yardage_white: 337, yardage_red: 284},
      {hole_number: 5, par: 3, handicap_index: 15, yardage_black: 209, yardage_gold: 189, yardage_blue: 171, yardage_white: 139, yardage_red: 110},
      {hole_number: 6, par: 4, handicap_index: 7, yardage_black: 433, yardage_gold: 409, yardage_blue: 392, yardage_white: 362, yardage_red: 308},
      {hole_number: 7, par: 5, handicap_index: 11, yardage_black: 522, yardage_gold: 507, yardage_blue: 478, yardage_white: 467, yardage_red: 455},
      {hole_number: 8, par: 4, handicap_index: 1, yardage_black: 394, yardage_gold: 372, yardage_blue: 359, yardage_white: 347, yardage_red: 302},
      {hole_number: 9, par: 4, handicap_index: 5, yardage_black: 427, yardage_gold: 411, yardage_blue: 395, yardage_white: 380, yardage_red: 344},
      {hole_number: 10, par: 4, handicap_index: 12, yardage_black: 406, yardage_gold: 395, yardage_blue: 367, yardage_white: 358, yardage_red: 310},
      {hole_number: 11, par: 5, handicap_index: 10, yardage_black: 521, yardage_gold: 485, yardage_blue: 459, yardage_white: 448, yardage_red: 417},
      {hole_number: 12, par: 3, handicap_index: 16, yardage_black: 172, yardage_gold: 156, yardage_blue: 139, yardage_white: 117, yardage_red: 89},
      {hole_number: 13, par: 4, handicap_index: 4, yardage_black: 455, yardage_gold: 429, yardage_blue: 400, yardage_white: 349, yardage_red: 315},
      {hole_number: 14, par: 5, handicap_index: 6, yardage_black: 559, yardage_gold: 549, yardage_blue: 520, yardage_white: 510, yardage_red: 479},
      {hole_number: 15, par: 3, handicap_index: 18, yardage_black: 127, yardage_gold: 117, yardage_blue: 99, yardage_white: 93, yardage_red: 80},
      {hole_number: 16, par: 4, handicap_index: 2, yardage_black: 473, yardage_gold: 449, yardage_blue: 434, yardage_white: 421, yardage_red: 400},
      {hole_number: 17, par: 4, handicap_index: 14, yardage_black: 325, yardage_gold: 315, yardage_blue: 306, yardage_white: 300, yardage_red: 263},
      {hole_number: 18, par: 4, handicap_index: 8, yardage_black: 407, yardage_gold: 390, yardage_blue: 372, yardage_white: 357, yardage_red: 327}
    ]
  },
  {
    name: "The Jubilee Course at St Andrews (Archive 2011)",
    location: "St Andrews, Scotland",
    par: 72,
    architect: "Tom Morris",
    year_opened: 1897,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 6, yardage_black: 366, yardage_gold: 336, yardage_blue: 327, yardage_white: 327, yardage_red: 318},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 359, yardage_gold: 352, yardage_blue: 347, yardage_white: 270, yardage_red: 270},
      {hole_number: 3, par: 5, handicap_index: 3, yardage_black: 546, yardage_gold: 523, yardage_blue: 517, yardage_white: 512, yardage_red: 506},
      {hole_number: 4, par: 4, handicap_index: 12, yardage_black: 370, yardage_gold: 349, yardage_blue: 343, yardage_white: 337, yardage_red: 331},
      {hole_number: 5, par: 3, handicap_index: 18, yardage_black: 162, yardage_gold: 141, yardage_blue: 138, yardage_white: 135, yardage_red: 132},
      {hole_number: 6, par: 5, handicap_index: 1, yardage_black: 497, yardage_gold: 480, yardage_blue: 473, yardage_white: 465, yardage_red: 422},
      {hole_number: 7, par: 4, handicap_index: 10, yardage_black: 373, yardage_gold: 340, yardage_blue: 337, yardage_white: 333, yardage_red: 329},
      {hole_number: 8, par: 4, handicap_index: 8, yardage_black: 369, yardage_gold: 344, yardage_blue: 338, yardage_white: 332, yardage_red: 326},
      {hole_number: 9, par: 3, handicap_index: 15, yardage_black: 191, yardage_gold: 181, yardage_blue: 174, yardage_white: 162, yardage_red: 143},
      {hole_number: 10, par: 4, handicap_index: 5, yardage_black: 410, yardage_gold: 402, yardage_blue: 396, yardage_white: 391, yardage_red: 387},
      {hole_number: 11, par: 5, handicap_index: 11, yardage_black: 496, yardage_gold: 488, yardage_blue: 482, yardage_white: 479, yardage_red: 469},
      {hole_number: 12, par: 5, handicap_index: 4, yardage_black: 535, yardage_gold: 516, yardage_blue: 504, yardage_white: 486, yardage_red: 478},
      {hole_number: 13, par: 3, handicap_index: 17, yardage_black: 188, yardage_gold: 176, yardage_blue: 168, yardage_white: 148, yardage_red: 124},
      {hole_number: 14, par: 4, handicap_index: 9, yardage_black: 438, yardage_gold: 422, yardage_blue: 420, yardage_white: 417, yardage_red: 415},
      {hole_number: 15, par: 4, handicap_index: 2, yardage_black: 356, yardage_gold: 345, yardage_blue: 343, yardage_white: 342, yardage_red: 341},
      {hole_number: 16, par: 4, handicap_index: 14, yardage_black: 421, yardage_gold: 411, yardage_blue: 408, yardage_white: 406, yardage_red: 404},
      {hole_number: 17, par: 3, handicap_index: 7, yardage_black: 211, yardage_gold: 198, yardage_blue: 189, yardage_white: 180, yardage_red: 180},
      {hole_number: 18, par: 4, handicap_index: 16, yardage_black: 436, yardage_gold: 404, yardage_blue: 391, yardage_white: 384, yardage_red: 372}
    ]
  },
  {
    name: "The Jubilee Course at St Andrews (Current 2016)",
    location: "St Andrews, Scotland",
    par: 72,
    architect: "Tom Morris",
    year_opened: 1897,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 6, yardage_black: 367, yardage_gold: 337, yardage_blue: 328, yardage_white: 328, yardage_red: 318},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 360, yardage_gold: 352, yardage_blue: 347, yardage_white: 267, yardage_red: 260},
      {hole_number: 3, par: 5, handicap_index: 3, yardage_black: 546, yardage_gold: 524, yardage_blue: 517, yardage_white: 512, yardage_red: 506},
      {hole_number: 4, par: 4, handicap_index: 12, yardage_black: 371, yardage_gold: 349, yardage_blue: 343, yardage_white: 338, yardage_red: 332},
      {hole_number: 5, par: 3, handicap_index: 18, yardage_black: 162, yardage_gold: 142, yardage_blue: 138, yardage_white: 135, yardage_red: 132},
      {hole_number: 6, par: 5, handicap_index: 1, yardage_black: 498, yardage_gold: 480, yardage_blue: 473, yardage_white: 466, yardage_red: 422},
      {hole_number: 7, par: 4, handicap_index: 10, yardage_black: 395, yardage_gold: 371, yardage_blue: 343, yardage_white: 331, yardage_red: 287},
      {hole_number: 8, par: 4, handicap_index: 8, yardage_black: 369, yardage_gold: 344, yardage_blue: 338, yardage_white: 333, yardage_red: 326},
      {hole_number: 9, par: 3, handicap_index: 15, yardage_black: 191, yardage_gold: 181, yardage_blue: 174, yardage_white: 156, yardage_red: 138},
      {hole_number: 10, par: 4, handicap_index: 5, yardage_black: 441, yardage_gold: 415, yardage_blue: 406, yardage_white: 392, yardage_red: 379},
      {hole_number: 11, par: 5, handicap_index: 11, yardage_black: 528, yardage_gold: 500, yardage_blue: 491, yardage_white: 474, yardage_red: 425},
      {hole_number: 12, par: 5, handicap_index: 4, yardage_black: 536, yardage_gold: 516, yardage_blue: 505, yardage_white: 487, yardage_red: 479},
      {hole_number: 13, par: 3, handicap_index: 17, yardage_black: 189, yardage_gold: 176, yardage_blue: 168, yardage_white: 148, yardage_red: 148},
      {hole_number: 14, par: 4, handicap_index: 9, yardage_black: 438, yardage_gold: 423, yardage_blue: 420, yardage_white: 418, yardage_red: 415},
      {hole_number: 15, par: 4, handicap_index: 2, yardage_black: 356, yardage_gold: 346, yardage_blue: 344, yardage_white: 342, yardage_red: 341},
      {hole_number: 16, par: 4, handicap_index: 14, yardage_black: 421, yardage_gold: 412, yardage_blue: 409, yardage_white: 407, yardage_red: 405},
      {hole_number: 17, par: 3, handicap_index: 7, yardage_black: 211, yardage_gold: 199, yardage_blue: 189, yardage_white: 180, yardage_red: 180},
      {hole_number: 18, par: 4, handicap_index: 16, yardage_black: 458, yardage_gold: 435, yardage_blue: 410, yardage_white: 390, yardage_red: 372}
    ]
  },
  {
    name: "The New Course at St Andrews (Archive 2011)",
    location: "St Andrews, Scotland",
    par: 71,
    architect: "Tom Morris",
    year_opened: 1895,
    holes: [
      {hole_number: 1, par: 4, handicap_index: 9, yardage_black: 361, yardage_gold: 353, yardage_blue: 345, yardage_white: 323, yardage_red: 312},
      {hole_number: 2, par: 4, handicap_index: 13, yardage_black: 414, yardage_gold: 403, yardage_blue: 378, yardage_white: 349, yardage_red: 312},
      {hole_number: 3, par: 5, handicap_index: 3, yardage_black: 484, yardage_gold: 466, yardage_blue: 452, yardage_white: 429, yardage_red: 374},
      {hole_number: 4, par: 4, handicap_index: 7, yardage_black: 406, yardage_gold: 389, yardage_blue: 372, yardage_white: 347, yardage_red: 306},
      {hole_number: 5, par: 3, handicap_index: 17, yardage_black: 168, yardage_gold: 162, yardage_blue: 149, yardage_white: 129, yardage_red: 108},
      {hole_number: 6, par: 4, handicap_index: 1, yardage_black: 435, yardage_gold: 428, yardage_blue: 406, yardage_white: 387, yardage_red: 357},
      {hole_number: 7, par: 4, handicap_index: 11, yardage_black: 353, yardage_gold: 341, yardage_blue: 321, yardage_white: 312, yardage_red: 293},
      {hole_number: 8, par: 5, handicap_index: 5, yardage_black: 508, yardage_gold: 491, yardage_blue: 465, yardage_white: 449, yardage_red: 399},
      {hole_number: 9, par: 3, handicap_index: 15, yardage_black: 163, yardage_gold: 158, yardage_blue: 143, yardage_white: 122, yardage_red: 110},
      {hole_number: 10, par: 4, handicap_index: 6, yardage_black: 377, yardage_gold: 368, yardage_blue: 351, yardage_white: 337, yardage_red: 300},
      {hole_number: 11, par: 4, handicap_index: 14, yardage_black: 387, yardage_gold: 372, yardage_blue: 363, yardage_white: 345, yardage_red: 298},
      {hole_number: 12, par: 5, handicap_index: 4, yardage_black: 490, yardage_gold: 477, yardage_blue: 457, yardage_white: 437, yardage_red: 382},
      {hole_number: 13, par: 3, handicap_index: 18, yardage_black: 180, yardage_gold: 169, yardage_blue: 163, yardage_white: 145, yardage_red: 123},
      {hole_number: 14, par: 4, handicap_index: 8, yardage_black: 361, yardage_gold: 349, yardage_blue: 332, yardage_white: 313, yardage_red: 286},
      {hole_number: 15, par: 4, handicap_index: 12, yardage_black: 427, yardage_gold: 414, yardage_blue: 396, yardage_white: 374, yardage_red: 346},
      {hole_number: 16, par: 4, handicap_index: 2, yardage_black: 428, yardage_gold: 414, yardage_blue: 404, yardage_white: 373, yardage_red: 333},
      {hole_number: 17, par: 3, handicap_index: 16, yardage_black: 202, yardage_gold: 193, yardage_blue: 167, yardage_white: 162, yardage_red: 144},
      {hole_number: 18, par: 4, handicap_index: 10, yardage_black: 410, yardage_gold: 386, yardage_blue: 374, yardage_white: 370, yardage_red: 317}
    ]
  }
];

async function addPart4Final() {
  const coursesDataPath = path.join(__dirname, 'courses-data.json');
  const existingCourses = JSON.parse(fs.readFileSync(coursesDataPath, 'utf-8'));

  console.log(`\nCurrent courses in JSON: ${existingCourses.length}`);
  console.log(`Part 4 Final courses to add: ${part4Final.length}`);

  const existingNames = new Set(existingCourses.map((c: any) => c.name));
  const newCourses = part4Final.filter(c => !existingNames.has(c.name));

  console.log(`New courses (no duplicates): ${newCourses.length}`);

  if (newCourses.length > 0) {
    const merged = [...existingCourses, ...newCourses];
    fs.writeFileSync(coursesDataPath, JSON.stringify(merged, null, 2));
    console.log(`✓ Updated courses-data.json with ${merged.length} total courses\n`);

    console.log('New Part 4 Final courses added:');
    newCourses.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.holes.length} holes)`);
    });
  } else {
    console.log('No new courses to add - all already exist');
  }
}

addPart4Final();
