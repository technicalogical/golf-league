-- Add user profile preferences and settings

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN profiles.display_name IS 'User preferred display name (defaults to name from auth)';
COMMENT ON COLUMN profiles.bio IS 'User bio/description';
COMMENT ON COLUMN profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN profiles.show_email IS 'Whether to show email to other users';
COMMENT ON COLUMN profiles.show_phone IS 'Whether to show phone to other users';
COMMENT ON COLUMN profiles.profile_completed IS 'Whether user has completed initial profile setup';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when user completed onboarding';
