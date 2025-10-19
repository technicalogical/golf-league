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
