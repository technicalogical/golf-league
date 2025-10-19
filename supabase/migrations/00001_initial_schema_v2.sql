-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Auth0 users)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Auth0 user ID (sub)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  par INTEGER DEFAULT 72,
  architect TEXT,
  year_opened INTEGER,
  total_holes INTEGER DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holes table (par and handicap index for each hole)
CREATE TABLE IF NOT EXISTS holes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  par INTEGER NOT NULL CHECK (par IN (3, 4, 5)),
  handicap_index INTEGER NOT NULL CHECK (handicap_index BETWEEN 1 AND 18),
  yardage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, hole_number)
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  handicap DECIMAL(4,1) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table (represents a match between two teams)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  team1_points DECIMAL(5,1),
  team2_points DECIMAL(5,1),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scorecards table (one per player per match)
CREATE TABLE IF NOT EXISTS scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  handicap_at_time DECIMAL(4,1) NOT NULL, -- snapshot of handicap when match played
  total_score INTEGER,
  points_earned DECIMAL(5,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

-- Hole scores table (individual hole scores)
CREATE TABLE IF NOT EXISTS hole_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scorecard_id UUID REFERENCES scorecards(id) ON DELETE CASCADE,
  hole_id UUID REFERENCES holes(id) ON DELETE CASCADE,
  strokes INTEGER NOT NULL CHECK (strokes > 0),
  points_earned DECIMAL(3,1) DEFAULT 0, -- points earned on this hole (0, 0.5, or 1)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scorecard_id, hole_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_active ON players(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_scorecards_match ON scorecards(match_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_player ON scorecards(player_id);
CREATE INDEX IF NOT EXISTS idx_hole_scores_scorecard ON hole_scores(scorecard_id);
CREATE INDEX IF NOT EXISTS idx_holes_course ON holes(course_id);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(team1_id, team2_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scorecards_updated_at ON scorecards;
CREATE TRIGGER update_scorecards_updated_at BEFORE UPDATE ON scorecards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
