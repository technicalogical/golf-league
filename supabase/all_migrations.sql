-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Auth0 users)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Auth0 user ID (sub)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  par INTEGER DEFAULT 72,
  architect TEXT,
  year_opened INTEGER,
  total_holes INTEGER DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holes table (par and handicap index for each hole)
CREATE TABLE IF NOT EXISTS holes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  par INTEGER NOT NULL CHECK (par IN (3, 4, 5)),
  handicap_index INTEGER NOT NULL CHECK (handicap_index BETWEEN 1 AND 18),
  yardage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, hole_number)
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  handicap DECIMAL(4,1) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table (represents a match between two teams)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  team1_points DECIMAL(5,1),
  team2_points DECIMAL(5,1),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scorecards table (one per player per match)
CREATE TABLE IF NOT EXISTS scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  handicap_at_time DECIMAL(4,1) NOT NULL, -- snapshot of handicap when match played
  total_score INTEGER,
  points_earned DECIMAL(5,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

-- Hole scores table (individual hole scores)
CREATE TABLE IF NOT EXISTS hole_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scorecard_id UUID REFERENCES scorecards(id) ON DELETE CASCADE,
  hole_id UUID REFERENCES holes(id) ON DELETE CASCADE,
  strokes INTEGER NOT NULL CHECK (strokes > 0),
  points_earned DECIMAL(3,1) DEFAULT 0, -- points earned on this hole (0, 0.5, or 1)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scorecard_id, hole_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_active ON players(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_scorecards_match ON scorecards(match_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_player ON scorecards(player_id);
CREATE INDEX IF NOT EXISTS idx_hole_scores_scorecard ON hole_scores(scorecard_id);
CREATE INDEX IF NOT EXISTS idx_holes_course ON holes(course_id);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(team1_id, team2_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scorecards_updated_at ON scorecards;
CREATE TRIGGER update_scorecards_updated_at BEFORE UPDATE ON scorecards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Seed file for AboutGolf courses from part1.pdf
-- This migration adds popular courses with complete hole data

-- Aleria Gardens (Martin DeWitt, 2015)
INSERT INTO courses (id, name, location, par, architect, year_opened)
VALUES ('11111111-1111-1111-1111-111111111111', 'Aleria Gardens', 'AboutGolf Simulator', 72, 'Martin DeWitt', 2015);

INSERT INTO holes (course_id, hole_number, par, handicap_index, yardage) VALUES
('11111111-1111-1111-1111-111111111111', 1, 5, 7, 520),
('11111111-1111-1111-1111-111111111111', 2, 3, 17, 165),
('11111111-1111-1111-1111-111111111111', 3, 4, 3, 400),
('11111111-1111-1111-1111-111111111111', 4, 4, 11, 385),
('11111111-1111-1111-1111-111111111111', 5, 3, 15, 180),
('11111111-1111-1111-1111-111111111111', 6, 4, 5, 410),
('11111111-1111-1111-1111-111111111111', 7, 4, 9, 395),
('11111111-1111-1111-1111-111111111111', 8, 5, 1, 545),
('11111111-1111-1111-1111-111111111111', 9, 4, 13, 390),
('11111111-1111-1111-1111-111111111111', 10, 5, 2, 535),
('11111111-1111-1111-1111-111111111111', 11, 3, 18, 170),
('11111111-1111-1111-1111-111111111111', 12, 4, 8, 405),
('11111111-1111-1111-1111-111111111111', 13, 4, 12, 380),
('11111111-1111-1111-1111-111111111111', 14, 4, 4, 415),
('11111111-1111-1111-1111-111111111111', 15, 4, 10, 390),
('11111111-1111-1111-1111-111111111111', 16, 4, 6, 420),
('11111111-1111-1111-1111-111111111111', 17, 3, 16, 175),
('11111111-1111-1111-1111-111111111111', 18, 5, 14, 540);

-- Bethpage Black (A.W. Tillinghast, 1936)
INSERT INTO courses (id, name, location, par, architect, year_opened)
VALUES ('22222222-2222-2222-2222-222222222222', 'Bethpage Black', 'Farmingdale, NY', 71, 'A.W. Tillinghast', 1936);

INSERT INTO holes (course_id, hole_number, par, handicap_index, yardage) VALUES
('22222222-2222-2222-2222-222222222222', 1, 4, 7, 430),
('22222222-2222-2222-2222-222222222222', 2, 4, 15, 389),
('22222222-2222-2222-2222-222222222222', 3, 4, 3, 409),
('22222222-2222-2222-2222-222222222222', 4, 5, 1, 517),
('22222222-2222-2222-2222-222222222222', 5, 4, 17, 451),
('22222222-2222-2222-2222-222222222222', 6, 4, 13, 408),
('22222222-2222-2222-2222-222222222222', 7, 3, 5, 215),
('22222222-2222-2222-2222-222222222222', 8, 4, 9, 492),
('22222222-2222-2222-2222-222222222222', 9, 4, 11, 422),
('22222222-2222-2222-2222-222222222222', 10, 4, 2, 502),
('22222222-2222-2222-2222-222222222222', 11, 4, 12, 435),
('22222222-2222-2222-2222-222222222222', 12, 5, 6, 535),
('22222222-2222-2222-2222-222222222222', 13, 3, 18, 160),
('22222222-2222-2222-2222-222222222222', 14, 4, 10, 509),
('22222222-2222-2222-2222-222222222222', 15, 4, 4, 459),
('22222222-2222-2222-2222-222222222222', 16, 4, 8, 490),
('22222222-2222-2222-2222-222222222222', 17, 3, 16, 207),
('22222222-2222-2222-2222-222222222222', 18, 4, 14, 411);

-- Blackwolf Run - River (Pete Dye, 1988)
INSERT INTO courses (id, name, location, par, architect, year_opened)
VALUES ('33333333-3333-3333-3333-333333333333', 'Blackwolf Run - River', 'Kohler, WI', 72, 'Pete Dye', 1988);

INSERT INTO holes (course_id, hole_number, par, handicap_index, yardage) VALUES
('33333333-3333-3333-3333-333333333333', 1, 4, 9, 435),
('33333333-3333-3333-3333-333333333333', 2, 4, 1, 465),
('33333333-3333-3333-3333-333333333333', 3, 4, 11, 395),
('33333333-3333-3333-3333-333333333333', 4, 5, 13, 560),
('33333333-3333-3333-3333-333333333333', 5, 3, 17, 200),
('33333333-3333-3333-3333-333333333333', 6, 4, 3, 465),
('33333333-3333-3333-3333-333333333333', 7, 4, 7, 450),
('33333333-3333-3333-3333-333333333333', 8, 3, 15, 195),
('33333333-3333-3333-3333-333333333333', 9, 5, 5, 625),
('33333333-3333-3333-3333-333333333333', 10, 4, 4, 450),
('33333333-3333-3333-3333-333333333333', 11, 5, 14, 575),
('33333333-3333-3333-3333-333333333333', 12, 4, 10, 425),
('33333333-3333-3333-3333-333333333333', 13, 3, 18, 180),
('33333333-3333-3333-3333-333333333333', 14, 4, 6, 450),
('33333333-3333-3333-3333-333333333333', 15, 5, 16, 555),
('33333333-3333-3333-3333-333333333333', 16, 3, 12, 215),
('33333333-3333-3333-3333-333333333333', 17, 4, 8, 425),
('33333333-3333-3333-3333-333333333333', 18, 4, 2, 490);

-- Bay Harbor - The Links (Arthur Hills, 1998)
INSERT INTO courses (id, name, location, par, architect, year_opened)
VALUES ('44444444-4444-4444-4444-444444444444', 'Bay Harbor - The Links', 'Bay Harbor, MI', 72, 'Arthur Hills', 1998);

INSERT INTO holes (course_id, hole_number, par, handicap_index, yardage) VALUES
('44444444-4444-4444-4444-444444444444', 1, 4, 9, 393),
('44444444-4444-4444-4444-444444444444', 2, 4, 3, 445),
('44444444-4444-4444-4444-444444444444', 3, 3, 17, 175),
('44444444-4444-4444-4444-444444444444', 4, 5, 7, 535),
('44444444-4444-4444-4444-444444444444', 5, 4, 5, 435),
('44444444-4444-4444-4444-444444444444', 6, 3, 15, 185),
('44444444-4444-4444-4444-444444444444', 7, 5, 13, 560),
('44444444-4444-4444-4444-444444444444', 8, 4, 1, 460),
('44444444-4444-4444-4444-444444444444', 9, 4, 11, 405),
('44444444-4444-4444-4444-444444444444', 10, 4, 10, 420),
('44444444-4444-4444-4444-444444444444', 11, 4, 8, 425),
('44444444-4444-4444-4444-444444444444', 12, 3, 18, 165),
('44444444-4444-4444-4444-444444444444', 13, 5, 12, 540),
('44444444-4444-4444-4444-444444444444', 14, 4, 2, 450),
('44444444-4444-4444-4444-444444444444', 15, 4, 6, 430),
('44444444-4444-4444-4444-444444444444', 16, 3, 16, 180),
('44444444-4444-4444-4444-444444444444', 17, 4, 4, 445),
('44444444-4444-4444-4444-444444444444', 18, 5, 14, 545);

-- Colorado Golf Club (Bill Coore & Ben Crenshaw, 2007)
INSERT INTO courses (id, name, location, par, architect, year_opened)
VALUES ('55555555-5555-5555-5555-555555555555', 'Colorado Golf Club', 'Parker, CO', 71, 'Bill Coore & Ben Crenshaw', 2007);

INSERT INTO holes (course_id, hole_number, par, handicap_index, yardage) VALUES
('55555555-5555-5555-5555-555555555555', 1, 4, 9, 433),
('55555555-5555-5555-5555-555555555555', 2, 3, 17, 211),
('55555555-5555-5555-5555-555555555555', 3, 5, 3, 562),
('55555555-5555-5555-5555-555555555555', 4, 4, 7, 420),
('55555555-5555-5555-5555-555555555555', 5, 4, 11, 377),
('55555555-5555-5555-5555-555555555555', 6, 4, 5, 453),
('55555555-5555-5555-5555-555555555555', 7, 4, 15, 351),
('55555555-5555-5555-5555-555555555555', 8, 4, 1, 475),
('55555555-5555-5555-5555-555555555555', 9, 3, 13, 240),
('55555555-5555-5555-5555-555555555555', 10, 5, 4, 545),
('55555555-5555-5555-5555-555555555555', 11, 3, 18, 175),
('55555555-5555-5555-5555-555555555555', 12, 4, 12, 380),
('55555555-5555-5555-5555-555555555555', 13, 4, 8, 415),
('55555555-5555-5555-5555-555555555555', 14, 4, 14, 360),
('55555555-5555-5555-5555-555555555555', 15, 4, 2, 470),
('55555555-5555-5555-5555-555555555555', 16, 4, 6, 445),
('55555555-5555-5555-5555-555555555555', 17, 3, 16, 195),
('55555555-5555-5555-5555-555555555555', 18, 4, 10, 405);

-- Druids Glen (Pat Ruddy & Tom Craddock, 1995)
INSERT INTO courses (id, name, location, par, architect, year_opened)
VALUES ('66666666-6666-6666-6666-666666666666', 'Druids Glen', 'Newtownmountkennedy, Ireland', 71, 'Pat Ruddy & Tom Craddock', 1995);

INSERT INTO holes (course_id, hole_number, par, handicap_index, yardage) VALUES
('66666666-6666-6666-6666-666666666666', 1, 4, 11, 414),
('66666666-6666-6666-6666-666666666666', 2, 4, 5, 405),
('66666666-6666-6666-6666-666666666666', 3, 3, 17, 163),
('66666666-6666-6666-6666-666666666666', 4, 5, 9, 525),
('66666666-6666-6666-6666-666666666666', 5, 4, 13, 400),
('66666666-6666-6666-6666-666666666666', 6, 4, 3, 410),
('66666666-6666-6666-6666-666666666666', 7, 4, 7, 428),
('66666666-6666-6666-6666-666666666666', 8, 3, 15, 164),
('66666666-6666-6666-6666-666666666666', 9, 4, 1, 461),
('66666666-6666-6666-6666-666666666666', 10, 4, 10, 392),
('66666666-6666-6666-6666-666666666666', 11, 4, 8, 437),
('66666666-6666-6666-6666-666666666666', 12, 3, 16, 164),
('66666666-6666-6666-6666-666666666666', 13, 5, 2, 575),
('66666666-6666-6666-6666-666666666666', 14, 4, 14, 363),
('66666666-6666-6666-6666-666666666666', 15, 4, 12, 385),
('66666666-6666-6666-6666-666666666666', 16, 4, 4, 435),
('66666666-6666-6666-6666-666666666666', 17, 3, 18, 182),
('66666666-6666-6666-6666-666666666666', 18, 4, 6, 442);
-- Add is_active column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Add is_active column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON players(is_active);
-- Fix profiles table - use id as primary key matching Auth0 sub
ALTER TABLE profiles DROP COLUMN IF EXISTS auth0_id;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Fix players table - add name column and make profile_id optional
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_profile_id_fkey;
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_profile_id_key;
ALTER TABLE players ALTER COLUMN profile_id DROP NOT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS name TEXT;
UPDATE players SET name = 'Unknown Player' WHERE name IS NULL;
ALTER TABLE players ALTER COLUMN name SET NOT NULL;

-- Add missing columns to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS par INTEGER DEFAULT 72;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS architect TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS year_opened INTEGER;

-- Add missing columns to holes
ALTER TABLE holes ADD COLUMN IF NOT EXISTS yardage INTEGER;

-- Add missing columns to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team1_points DECIMAL(5,1);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team2_points DECIMAL(5,1);

-- Fix scorecards points_earned to allow decimals (for ties = 0.5)
ALTER TABLE scorecards ALTER COLUMN points_earned TYPE DECIMAL(5,1);

-- Fix hole_scores points_earned to allow decimals (for ties = 0.5)
ALTER TABLE hole_scores ALTER COLUMN points_earned TYPE DECIMAL(3,1);

-- Add unique constraint on scorecard_id and hole_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hole_scores_scorecard_id_hole_id_key'
  ) THEN
    ALTER TABLE hole_scores ADD CONSTRAINT hole_scores_scorecard_id_hole_id_key UNIQUE (scorecard_id, hole_id);
  END IF;
END $$;
-- Add match format fields to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS holes_to_play INTEGER DEFAULT 18 CHECK (holes_to_play IN (9, 18));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS nine_selection TEXT CHECK (nine_selection IN ('front', 'back', NULL));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS tee_selection TEXT DEFAULT 'Blue' CHECK (tee_selection IN ('Black', 'Gold', 'Blue', 'White', 'Red'));

-- Add tee-specific yardages to holes table
ALTER TABLE holes ADD COLUMN IF NOT EXISTS yardage_black INTEGER;
ALTER TABLE holes ADD COLUMN IF NOT EXISTS yardage_gold INTEGER;
ALTER TABLE holes ADD COLUMN IF NOT EXISTS yardage_blue INTEGER;
ALTER TABLE holes ADD COLUMN IF NOT EXISTS yardage_white INTEGER;
ALTER TABLE holes ADD COLUMN IF NOT EXISTS yardage_red INTEGER;

-- Migrate existing yardage data to Blue tees (default)
UPDATE holes SET yardage_blue = yardage WHERE yardage_blue IS NULL AND yardage IS NOT NULL;

-- Drop the old single yardage column (we'll keep it for backwards compatibility)
-- ALTER TABLE holes DROP COLUMN IF EXISTS yardage;
-- Update existing courses with complete yardage data for all 5 tees
-- Based on AboutGolf course data from part1.pdf

-- Aleria Gardens - Update with all tee yardages
UPDATE holes SET
  yardage_black = 536, yardage_gold = 506, yardage_blue = 500, yardage_white = 486, yardage_red = 460
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 1;

UPDATE holes SET
  yardage_black = 171, yardage_gold = 163, yardage_blue = 167, yardage_white = 150, yardage_red = 131
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 2;

UPDATE holes SET
  yardage_black = 363, yardage_gold = 335, yardage_blue = 329, yardage_white = 322, yardage_red = 292
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 3;

UPDATE holes SET
  yardage_black = 410, yardage_gold = 392, yardage_blue = 378, yardage_white = 367, yardage_red = 348
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 4;

UPDATE holes SET
  yardage_black = 185, yardage_gold = 167, yardage_blue = 151, yardage_white = 148, yardage_red = 134
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 5;

UPDATE holes SET
  yardage_black = 361, yardage_gold = 333, yardage_blue = 313, yardage_white = 305, yardage_red = 292
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 6;

UPDATE holes SET
  yardage_black = 404, yardage_gold = 385, yardage_blue = 359, yardage_white = 339, yardage_red = 274
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 7;

UPDATE holes SET
  yardage_black = 557, yardage_gold = 541, yardage_blue = 517, yardage_white = 503, yardage_red = 425
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 8;

UPDATE holes SET
  yardage_black = 508, yardage_gold = 487, yardage_blue = 456, yardage_white = 417, yardage_red = 364
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 9;

UPDATE holes SET
  yardage_black = 545, yardage_gold = 527, yardage_blue = 512, yardage_white = 481, yardage_red = 451
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 10;

UPDATE holes SET
  yardage_black = 180, yardage_gold = 167, yardage_blue = 152, yardage_white = 126, yardage_red = 108
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 11;

UPDATE holes SET
  yardage_black = 398, yardage_gold = 386, yardage_blue = 368, yardage_white = 350, yardage_red = 273
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 12;

UPDATE holes SET
  yardage_black = 369, yardage_gold = 341, yardage_blue = 334, yardage_white = 306, yardage_red = 274
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 13;

UPDATE holes SET
  yardage_black = 368, yardage_gold = 343, yardage_blue = 335, yardage_white = 310, yardage_red = 264
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 14;

UPDATE holes SET
  yardage_black = 375, yardage_gold = 350, yardage_blue = 342, yardage_white = 334, yardage_red = 281
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 15;

UPDATE holes SET
  yardage_black = 377, yardage_gold = 350, yardage_blue = 334, yardage_white = 329, yardage_red = 300
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 16;

UPDATE holes SET
  yardage_black = 162, yardage_gold = 141, yardage_blue = 128, yardage_white = 125, yardage_red = 109
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 17;

UPDATE holes SET
  yardage_black = 536, yardage_gold = 519, yardage_blue = 502, yardage_white = 495, yardage_red = 474
WHERE course_id = '11111111-1111-1111-1111-111111111111' AND hole_number = 18;

-- Bethpage Black - Update with all tee yardages (from page 13)
UPDATE holes SET
  yardage_black = 423, yardage_gold = 419, yardage_blue = 419, yardage_white = 414, yardage_red = 414
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 1;

UPDATE holes SET
  yardage_black = 381, yardage_gold = 381, yardage_blue = 357, yardage_white = 357, yardage_red = 346
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 2;

UPDATE holes SET
  yardage_black = 227, yardage_gold = 169, yardage_blue = 150, yardage_white = 125, yardage_red = 125
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 3;

UPDATE holes SET
  yardage_black = 517, yardage_gold = 517, yardage_blue = 460, yardage_white = 460, yardage_red = 438
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 4;

UPDATE holes SET
  yardage_black = 485, yardage_gold = 460, yardage_blue = 430, yardage_white = 408, yardage_red = 408
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 5;

UPDATE holes SET
  yardage_black = 399, yardage_gold = 399, yardage_blue = 379, yardage_white = 379, yardage_red = 367
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 6;

UPDATE holes SET
  yardage_black = 535, yardage_gold = 523, yardage_blue = 523, yardage_white = 479, yardage_red = 479
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 7;

UPDATE holes SET
  yardage_black = 210, yardage_gold = 210, yardage_blue = 193, yardage_white = 193, yardage_red = 155
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 8;

UPDATE holes SET
  yardage_black = 465, yardage_gold = 427, yardage_blue = 396, yardage_white = 288, yardage_red = 288
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 9;

UPDATE holes SET
  yardage_black = 498, yardage_gold = 498, yardage_blue = 438, yardage_white = 438, yardage_red = 354
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 10;

UPDATE holes SET
  yardage_black = 434, yardage_gold = 415, yardage_blue = 415, yardage_white = 403, yardage_red = 403
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 11;

UPDATE holes SET
  yardage_black = 485, yardage_gold = 458, yardage_blue = 430, yardage_white = 430, yardage_red = 385
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 12;

UPDATE holes SET
  yardage_black = 600, yardage_gold = 582, yardage_blue = 547, yardage_white = 469, yardage_red = 469
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 13;

UPDATE holes SET
  yardage_black = 163, yardage_gold = 163, yardage_blue = 153, yardage_white = 153, yardage_red = 143
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 14;

UPDATE holes SET
  yardage_black = 478, yardage_gold = 457, yardage_blue = 423, yardage_white = 404, yardage_red = 404
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 15;

UPDATE holes SET
  yardage_black = 482, yardage_gold = 482, yardage_blue = 448, yardage_white = 448, yardage_red = 424
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 16;

UPDATE holes SET
  yardage_black = 208, yardage_gold = 196, yardage_blue = 196, yardage_white = 179, yardage_red = 179
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 17;

UPDATE holes SET
  yardage_black = 411, yardage_gold = 411, yardage_blue = 366, yardage_white = 366, yardage_red = 339
WHERE course_id = '22222222-2222-2222-2222-222222222222' AND hole_number = 18;

-- Note: Additional courses (Blackwolf Run, Bay Harbor, Colorado Golf Club, Druids Glen)
-- would follow the same pattern. This migration shows the approach for the first two courses.
-- The complete data is available in the PDF for all remaining courses.
-- Add user roles and league management
-- This migration adds support for:
-- 1. Multiple leagues/seasons
-- 2. User roles and permissions
-- 3. League membership management

-- User roles enum
CREATE TYPE user_role AS ENUM ('league_admin', 'team_captain', 'player', 'viewer');

-- Leagues table (represents a league/season)
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed', 'archived')),
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- League members (users who belong to a league with specific roles)
CREATE TABLE IF NOT EXISTS league_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);

-- League teams (teams that participate in a league)
CREATE TABLE IF NOT EXISTS league_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, team_id)
);

-- Add league_id to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES leagues(id) ON DELETE SET NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS week_number INTEGER;

-- Add captain to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_id TEXT REFERENCES profiles(id) ON DELETE SET NULL;

-- Link players to users (optional - for when players are also users)
ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_league_members_league ON league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_user ON league_members(user_id);
CREATE INDEX IF NOT EXISTS idx_league_teams_league ON league_teams(league_id);
CREATE INDEX IF NOT EXISTS idx_league_teams_team ON league_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_week ON matches(week_number);
CREATE INDEX IF NOT EXISTS idx_teams_captain ON teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_players_user ON players(user_id);

-- Updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_leagues_updated_at ON leagues;
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_league_members_updated_at ON league_members;
CREATE TRIGGER update_league_members_updated_at BEFORE UPDATE ON league_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to check if user has role in league
CREATE OR REPLACE FUNCTION user_has_league_role(
  p_user_id TEXT,
  p_league_id UUID,
  p_required_role user_role
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_role user_role;
BEGIN
  SELECT role INTO v_user_role
  FROM league_members
  WHERE user_id = p_user_id AND league_id = p_league_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- league_admin can do everything
  IF v_user_role = 'league_admin' THEN
    RETURN TRUE;
  END IF;

  -- team_captain has elevated permissions
  IF v_user_role = 'team_captain' AND p_required_role IN ('team_captain', 'player', 'viewer') THEN
    RETURN TRUE;
  END IF;

  -- player has basic permissions
  IF v_user_role = 'player' AND p_required_role IN ('player', 'viewer') THEN
    RETURN TRUE;
  END IF;

  -- viewer can only view
  IF v_user_role = 'viewer' AND p_required_role = 'viewer' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's role in league
CREATE OR REPLACE FUNCTION get_user_league_role(
  p_user_id TEXT,
  p_league_id UUID
)
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM league_members
  WHERE user_id = p_user_id AND league_id = p_league_id;

  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Make created_by nullable in leagues table
-- This allows league creation even if profile sync hasn't happened yet

ALTER TABLE leagues ALTER COLUMN created_by DROP NOT NULL;
-- Add stimp and pin settings to matches table

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS stimp_setting NUMERIC(3,1) CHECK (stimp_setting >= 1 AND stimp_setting <= 12),
  ADD COLUMN IF NOT EXISTS pin_placement TEXT CHECK (pin_placement IN ('Novice', 'Intermediate', 'Advanced'));

-- Set default values
UPDATE matches
SET stimp_setting = 9.0
WHERE stimp_setting IS NULL;

UPDATE matches
SET pin_placement = 'Intermediate'
WHERE pin_placement IS NULL;

-- Add comment
COMMENT ON COLUMN matches.stimp_setting IS 'Stimp meter reading from 1.0 to 12.0 in 0.5 increments';
COMMENT ON COLUMN matches.pin_placement IS 'Pin placement difficulty: Novice, Intermediate, or Advanced';
-- Add user profile preferences and settings

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN profiles.display_name IS 'User preferred display name (defaults to name from auth)';
COMMENT ON COLUMN profiles.bio IS 'User bio/description';
COMMENT ON COLUMN profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN profiles.show_email IS 'Whether to show email to other users';
COMMENT ON COLUMN profiles.show_phone IS 'Whether to show phone to other users';
COMMENT ON COLUMN profiles.profile_completed IS 'Whether user has completed initial profile setup';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when user completed onboarding';
-- Add league visibility and landing page settings

ALTER TABLE leagues
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS landing_page_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS league_info TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_info TEXT,
  ADD COLUMN IF NOT EXISTS custom_rules TEXT,
  ADD COLUMN IF NOT EXISTS league_logo_url TEXT;

-- Add site admin role to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_site_admin BOOLEAN DEFAULT false;

-- Add comments
COMMENT ON COLUMN leagues.is_public IS 'Whether league is visible to non-members';
COMMENT ON COLUMN leagues.landing_page_enabled IS 'Whether to show public landing page';
COMMENT ON COLUMN leagues.league_info IS 'General information about the league';
COMMENT ON COLUMN leagues.contact_name IS 'League contact person name';
COMMENT ON COLUMN leagues.contact_email IS 'League contact email';
COMMENT ON COLUMN leagues.contact_phone IS 'League contact phone';
COMMENT ON COLUMN leagues.registration_open IS 'Whether new registrations are accepted';
COMMENT ON COLUMN leagues.registration_info IS 'Registration instructions and info';
COMMENT ON COLUMN leagues.custom_rules IS 'League-specific rules and guidelines';
COMMENT ON COLUMN leagues.league_logo_url IS 'URL to league logo image';
COMMENT ON COLUMN profiles.is_site_admin IS 'Whether user has site-wide admin privileges';
-- Rollback: Drop league_announcements table and related objects
DROP TRIGGER IF EXISTS update_league_announcements_updated_at ON league_announcements;
DROP POLICY IF EXISTS "Anyone can view announcements for public leagues" ON league_announcements;
DROP POLICY IF EXISTS "League members can view announcements" ON league_announcements;
DROP POLICY IF EXISTS "League admins can insert announcements" ON league_announcements;
DROP POLICY IF EXISTS "League admins can update announcements" ON league_announcements;
DROP POLICY IF EXISTS "League admins can delete announcements" ON league_announcements;
DROP TABLE IF EXISTS league_announcements CASCADE;
-- Create league_announcements table
CREATE TABLE IF NOT EXISTS league_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  pinned BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS league_announcements_league_id_idx ON league_announcements(league_id);
CREATE INDEX IF NOT EXISTS league_announcements_created_at_idx ON league_announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS league_announcements_pinned_idx ON league_announcements(pinned);

-- Enable RLS
ALTER TABLE league_announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view announcements for public leagues
CREATE POLICY "Anyone can view announcements for public leagues"
  ON league_announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = league_announcements.league_id
      AND leagues.is_public = true
    )
  );

-- Policy: League members can view announcements for their leagues
CREATE POLICY "League members can view announcements"
  ON league_announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = league_announcements.league_id
      AND league_members.user_id = auth.uid()::text
    )
  );

-- Policy: League admins can insert announcements
CREATE POLICY "League admins can insert announcements"
  ON league_announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = league_announcements.league_id
      AND league_members.user_id = auth.uid()::text
      AND league_members.role = 'league_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.is_site_admin = true
    )
  );

-- Policy: League admins can update their own announcements
CREATE POLICY "League admins can update announcements"
  ON league_announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = league_announcements.league_id
      AND league_members.user_id = auth.uid()::text
      AND league_members.role = 'league_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.is_site_admin = true
    )
  );

-- Policy: League admins can delete announcements
CREATE POLICY "League admins can delete announcements"
  ON league_announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = league_announcements.league_id
      AND league_members.user_id = auth.uid()::text
      AND league_members.role = 'league_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.is_site_admin = true
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_league_announcements_updated_at
  BEFORE UPDATE ON league_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Add captain_id and team_size to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_id TEXT REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 2;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL;

-- Create team_members junction table (links profiles to teams)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_captain BOOLEAN DEFAULT false,
  UNIQUE(team_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS teams_invite_code_idx ON teams(invite_code);
CREATE INDEX IF NOT EXISTS teams_captain_id_idx ON teams(captain_id);

-- Enable RLS on team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view team members for public leagues
CREATE POLICY "Anyone can view team members for public leagues"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_teams
      JOIN leagues ON leagues.id = league_teams.league_id
      WHERE league_teams.team_id = team_members.team_id
      AND leagues.is_public = true
    )
  );

-- Policy: League members can view team members in their leagues
CREATE POLICY "League members can view team members"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_teams
      JOIN league_members ON league_members.league_id = league_teams.league_id
      WHERE league_teams.team_id = team_members.team_id
      AND league_members.user_id = auth.uid()::text
    )
  );

-- Policy: Users can view their own team memberships
CREATE POLICY "Users can view their own team memberships"
  ON team_members
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Policy: Team captains can add members to their team
CREATE POLICY "Team captains can add members"
  ON team_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()::text
      AND tm.is_captain = true
    )
    OR
    -- User is adding themselves (joining via invite)
    user_id = auth.uid()::text
  );

-- Policy: Team captains can remove members
CREATE POLICY "Team captains can remove members"
  ON team_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()::text
      AND tm.is_captain = true
    )
    OR
    -- Users can remove themselves
    user_id = auth.uid()::text
  );

-- Function to generate a unique invite code
CREATE OR REPLACE FUNCTION generate_team_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM teams WHERE invite_code = code) INTO code_exists;

    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate invite code when team is created
CREATE OR REPLACE FUNCTION set_team_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_team_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invite_code_on_insert
  BEFORE INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION set_team_invite_code();

-- Update existing teams to have invite codes
UPDATE teams SET invite_code = generate_team_invite_code() WHERE invite_code IS NULL;
-- Add day of week and time fields to leagues table

ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS day_of_week TEXT,
ADD COLUMN IF NOT EXISTS time_of_day TIME;

-- Add a comment explaining the fields
COMMENT ON COLUMN leagues.day_of_week IS 'Day of the week when league matches typically occur (e.g., Monday, Tuesday, etc.)';
COMMENT ON COLUMN leagues.time_of_day IS 'Time of day when league matches typically start (e.g., 18:00:00)';
-- Add open_to_join field to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS open_to_join BOOLEAN DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN teams.open_to_join IS 'If true, anyone can join this team without an invite code (subject to capacity)';

-- Create index for finding open teams
CREATE INDEX IF NOT EXISTS teams_open_to_join_idx ON teams(open_to_join) WHERE open_to_join = true;
-- Create league_join_requests table
CREATE TABLE IF NOT EXISTS league_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(league_id, team_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS league_join_requests_league_id_idx ON league_join_requests(league_id);
CREATE INDEX IF NOT EXISTS league_join_requests_team_id_idx ON league_join_requests(team_id);
CREATE INDEX IF NOT EXISTS league_join_requests_status_idx ON league_join_requests(status);

-- Enable RLS
ALTER TABLE league_join_requests ENABLE ROW LEVEL SECURITY;

-- Policy: League admins can view all requests for their leagues
CREATE POLICY "League admins can view requests for their leagues"
  ON league_join_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = league_join_requests.league_id
      AND league_members.user_id = auth.uid()::text
      AND league_members.role = 'league_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.is_site_admin = true
    )
  );

-- Policy: Team captains can view requests for their teams
CREATE POLICY "Team captains can view their team requests"
  ON league_join_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = league_join_requests.team_id
      AND teams.captain_id = auth.uid()::text
    )
  );

-- Policy: Team captains can create join requests
CREATE POLICY "Team captains can create join requests"
  ON league_join_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = league_join_requests.team_id
      AND teams.captain_id = auth.uid()::text
    )
    AND
    requested_by = auth.uid()::text
  );

-- Policy: League admins can update requests (approve/reject)
CREATE POLICY "League admins can update requests"
  ON league_join_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = league_join_requests.league_id
      AND league_members.user_id = auth.uid()::text
      AND league_members.role = 'league_admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.is_site_admin = true
    )
  );

-- Policy: Requesters can delete their own pending requests
CREATE POLICY "Requesters can delete pending requests"
  ON league_join_requests
  FOR DELETE
  USING (
    requested_by = auth.uid()::text
    AND status = 'pending'
  );
-- Add day and time fields to leagues table
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS league_day TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS league_time TIME;

COMMENT ON COLUMN leagues.league_day IS 'Day of the week when league plays (e.g., Monday, Tuesday, etc.)';
COMMENT ON COLUMN leagues.league_time IS 'Time when league plays';
