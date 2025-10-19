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
