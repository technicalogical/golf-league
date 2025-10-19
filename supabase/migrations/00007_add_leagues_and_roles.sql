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
