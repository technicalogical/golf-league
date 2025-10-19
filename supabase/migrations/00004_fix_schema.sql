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
