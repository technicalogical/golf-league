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
