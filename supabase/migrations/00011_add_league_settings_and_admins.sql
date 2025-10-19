-- Add league visibility and landing page settings

ALTER TABLE leagues
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS landing_page_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS league_info TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_info TEXT,
  ADD COLUMN IF NOT EXISTS custom_rules TEXT,
  ADD COLUMN IF NOT EXISTS league_logo_url TEXT;

-- Add site admin role to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_site_admin BOOLEAN DEFAULT false;

-- Add comments
COMMENT ON COLUMN leagues.is_public IS 'Whether league is visible to non-members';
COMMENT ON COLUMN leagues.landing_page_enabled IS 'Whether to show public landing page';
COMMENT ON COLUMN leagues.league_info IS 'General information about the league';
COMMENT ON COLUMN leagues.contact_name IS 'League contact person name';
COMMENT ON COLUMN leagues.contact_email IS 'League contact email';
COMMENT ON COLUMN leagues.contact_phone IS 'League contact phone';
COMMENT ON COLUMN leagues.registration_open IS 'Whether new registrations are accepted';
COMMENT ON COLUMN leagues.registration_info IS 'Registration instructions and info';
COMMENT ON COLUMN leagues.custom_rules IS 'League-specific rules and guidelines';
COMMENT ON COLUMN leagues.league_logo_url IS 'URL to league logo image';
COMMENT ON COLUMN profiles.is_site_admin IS 'Whether user has site-wide admin privileges';
