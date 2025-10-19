-- Add day of week and time fields to leagues table

ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS day_of_week TEXT,
ADD COLUMN IF NOT EXISTS time_of_day TIME;

-- Add a comment explaining the fields
COMMENT ON COLUMN leagues.day_of_week IS 'Day of the week when league matches typically occur (e.g., Monday, Tuesday, etc.)';
COMMENT ON COLUMN leagues.time_of_day IS 'Time of day when league matches typically start (e.g., 18:00:00)';
