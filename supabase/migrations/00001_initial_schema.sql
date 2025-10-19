-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Auth0 users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  total_holes INTEGER DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holes table (par and handicap index for each hole)
CREATE TABLE holes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  par INTEGER NOT NULL CHECK (par IN (3, 4, 5)),
  handicap_index INTEGER NOT NULL CHECK (handicap_index BETWEEN 1 AND 18),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, hole_number)
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  handicap DECIMAL(4,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Matches table (represents a match between two teams)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scorecards table (one per player per match)
CREATE TABLE scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  handicap_at_time DECIMAL(4,1) NOT NULL, -- snapshot of handicap when match played
  total_score INTEGER,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

-- Hole scores table (individual hole scores)
CREATE TABLE hole_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scorecard_id UUID REFERENCES scorecards(id) ON DELETE CASCADE,
  hole_id UUID REFERENCES holes(id) ON DELETE CASCADE,
  strokes INTEGER NOT NULL CHECK (strokes > 0),
  points_earned INTEGER DEFAULT 0, -- points earned on this hole (0 or 1)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scorecard_id, hole_id)
);

-- Indexes for performance
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_profile ON players(profile_id);
CREATE INDEX idx_scorecards_match ON scorecards(match_id);
CREATE INDEX idx_scorecards_player ON scorecards(player_id);
CREATE INDEX idx_hole_scores_scorecard ON hole_scores(scorecard_id);
CREATE INDEX idx_holes_course ON holes(course_id);
CREATE INDEX idx_matches_teams ON matches(team1_id, team2_id);
CREATE INDEX idx_matches_date ON matches(match_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scorecards_updated_at BEFORE UPDATE ON scorecards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
