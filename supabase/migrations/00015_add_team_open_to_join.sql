-- Add open_to_join field to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS open_to_join BOOLEAN DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN teams.open_to_join IS 'If true, anyone can join this team without an invite code (subject to capacity)';

-- Create index for finding open teams
CREATE INDEX IF NOT EXISTS teams_open_to_join_idx ON teams(open_to_join) WHERE open_to_join = true;
