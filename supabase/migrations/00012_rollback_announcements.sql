-- Rollback: Drop league_announcements table and related objects
DROP TRIGGER IF EXISTS update_league_announcements_updated_at ON league_announcements;
DROP POLICY IF EXISTS "Anyone can view announcements for public leagues" ON league_announcements;
DROP POLICY IF EXISTS "League members can view announcements" ON league_announcements;
DROP POLICY IF EXISTS "League admins can insert announcements" ON league_announcements;
DROP POLICY IF EXISTS "League admins can update announcements" ON league_announcements;
DROP POLICY IF EXISTS "League admins can delete announcements" ON league_announcements;
DROP TABLE IF EXISTS league_announcements CASCADE;
