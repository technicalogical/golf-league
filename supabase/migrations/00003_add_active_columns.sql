-- Add is_active column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Add is_active column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON players(is_active);
