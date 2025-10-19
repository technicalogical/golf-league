-- Make created_by nullable in leagues table
-- This allows league creation even if profile sync hasn't happened yet

ALTER TABLE leagues ALTER COLUMN created_by DROP NOT NULL;
