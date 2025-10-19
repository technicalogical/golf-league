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
