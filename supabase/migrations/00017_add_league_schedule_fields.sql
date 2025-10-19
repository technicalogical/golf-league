-- Add day and time fields to leagues table
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS league_day TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS league_time TIME;

COMMENT ON COLUMN leagues.league_day IS 'Day of the week when league plays (e.g., Monday, Tuesday, etc.)';
COMMENT ON COLUMN leagues.league_time IS 'Time when league plays';
