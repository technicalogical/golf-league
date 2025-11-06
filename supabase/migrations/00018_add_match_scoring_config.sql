-- Add match_scoring_config table to link matches to scoring rules
-- This allows matches to inherit league scoring rules with optional overrides

CREATE TABLE IF NOT EXISTS match_scoring_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  scoring_rule_id UUID REFERENCES scoring_rules(id) ON DELETE SET NULL,

  -- Match-specific overrides (optional)
  override_handicap_method TEXT CHECK (override_handicap_method IN ('none', 'full', 'percentage', 'cap_difference')),
  override_handicap_percentage INTEGER CHECK (override_handicap_percentage >= 0 AND override_handicap_percentage <= 100),
  override_max_handicap_difference INTEGER CHECK (override_max_handicap_difference >= 0),
  override_stroke_holes TEXT CHECK (override_stroke_holes IN ('all', 'par_4_5_only', 'handicap_order', 'custom')),
  override_hole_points INTEGER CHECK (override_hole_points >= 0),
  override_match_bonus_points INTEGER CHECK (override_match_bonus_points >= 0),

  -- Special event configurations
  is_tournament_match BOOLEAN DEFAULT FALSE,
  tournament_multiplier NUMERIC(3,2) DEFAULT 1.00 CHECK (tournament_multiplier >= 0),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one config per match
  UNIQUE(match_id)
);

-- Add indexes for performance
CREATE INDEX idx_match_scoring_config_match_id ON match_scoring_config(match_id);
CREATE INDEX idx_match_scoring_config_scoring_rule_id ON match_scoring_config(scoring_rule_id);

-- Add RLS policies
ALTER TABLE match_scoring_config ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view match scoring configs
CREATE POLICY "Match scoring configs are viewable by everyone"
  ON match_scoring_config FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create match scoring configs
CREATE POLICY "Match scoring configs are insertable by authenticated users"
  ON match_scoring_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update match scoring configs for their matches
CREATE POLICY "Match scoring configs are updatable by authenticated users"
  ON match_scoring_config FOR UPDATE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_match_scoring_config_updated_at
  BEFORE UPDATE ON match_scoring_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE match_scoring_config IS 'Stores scoring configuration for each match, allowing inheritance from league rules with optional overrides';
