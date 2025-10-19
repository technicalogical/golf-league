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
