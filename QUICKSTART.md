# Quick Start Guide

This guide will help you get your league up and running quickly.

## Step-by-Step Setup

### 1. Initial Setup (Do Once)

Follow the main [README.md](README.md) to:
- Set up Supabase database
- Configure Auth0 authentication
- Set environment variables
- Run `npm install` and `npm run dev`

### 2. Add Initial Data

Once your app is running, you'll need to add some initial data. You can do this directly in Supabase's Table Editor or via SQL.

#### Add a Course

```sql
-- Insert a course
INSERT INTO courses (name, location, total_holes)
VALUES ('Pebble Beach', 'AboutGolf Simulator', 18);

-- Get the course ID (you'll need this for holes)
SELECT id FROM courses WHERE name = 'Pebble Beach';
```

#### Add Holes for the Course

Replace `YOUR_COURSE_ID` with the ID from above:

```sql
-- Example: Add first 9 holes
INSERT INTO holes (course_id, hole_number, par, handicap_index) VALUES
('YOUR_COURSE_ID', 1, 4, 5),
('YOUR_COURSE_ID', 2, 5, 15),
('YOUR_COURSE_ID', 3, 4, 9),
('YOUR_COURSE_ID', 4, 4, 7),
('YOUR_COURSE_ID', 5, 3, 17),
('YOUR_COURSE_ID', 6, 5, 3),
('YOUR_COURSE_ID', 7, 3, 11),
('YOUR_COURSE_ID', 8, 4, 1),
('YOUR_COURSE_ID', 9, 4, 13);

-- Add back 9 holes
INSERT INTO holes (course_id, hole_number, par, handicap_index) VALUES
('YOUR_COURSE_ID', 10, 4, 8),
('YOUR_COURSE_ID', 11, 4, 12),
('YOUR_COURSE_ID', 12, 3, 16),
('YOUR_COURSE_ID', 13, 4, 2),
('YOUR_COURSE_ID', 14, 5, 6),
('YOUR_COURSE_ID', 15, 4, 14),
('YOUR_COURSE_ID', 16, 4, 10),
('YOUR_COURSE_ID', 17, 3, 18),
('YOUR_COURSE_ID', 18, 5, 4);
```

#### Create Teams

```sql
INSERT INTO teams (name) VALUES
('Team Birdie'),
('Team Eagle'),
('Team Bogey'),
('Team Par');
```

#### Add Players (After Users Sign In)

After users sign in with Auth0, their profiles will be created. You then need to:

1. Get their profile ID from the `profiles` table
2. Create a player record and assign them to a team

```sql
-- First, view all profiles
SELECT id, name, email FROM profiles;

-- Create players and assign to teams
-- Replace PROFILE_ID and TEAM_ID with actual IDs
INSERT INTO players (profile_id, team_id, handicap) VALUES
('PROFILE_ID_1', 'TEAM_ID_1', 8.5),
('PROFILE_ID_2', 'TEAM_ID_1', 12.3),
('PROFILE_ID_3', 'TEAM_ID_2', 5.2),
('PROFILE_ID_4', 'TEAM_ID_2', 15.7);
```

### 3. Create a Match

```sql
-- Create a match between two teams
INSERT INTO matches (course_id, team1_id, team2_id, match_date, status)
VALUES (
  'YOUR_COURSE_ID',
  'TEAM_1_ID',
  'TEAM_2_ID',
  '2025-10-20',
  'scheduled'
);

-- Get the match ID
SELECT id FROM matches WHERE match_date = '2025-10-20';
```

#### Create Scorecards for the Match

```sql
-- Create a scorecard for each of the 4 players
-- Replace MATCH_ID and PLAYER_IDs with actual values
INSERT INTO scorecards (match_id, player_id, handicap_at_time)
VALUES
('MATCH_ID', 'PLAYER_1_ID', 8.5),
('MATCH_ID', 'PLAYER_2_ID', 12.3),
('MATCH_ID', 'PLAYER_3_ID', 5.2),
('MATCH_ID', 'PLAYER_4_ID', 15.7);
```

### 4. Enter Scores

Now you can navigate to:
```
http://localhost:3000/matches/MATCH_ID/scorecard
```

And enter scores for all players. The system will automatically:
- Calculate net scores with handicap adjustments
- Determine hole winners
- Calculate team totals
- Award points

### 5. View Standings

Navigate to:
```
http://localhost:3000/standings
```

To see updated team and player rankings.

## Typical Workflow

1. **Before Season**:
   - Add courses and holes
   - Create teams
   - Add players with initial handicaps

2. **Weekly Match**:
   - Create match record
   - Create scorecards for 4 players
   - Enter scores via scorecard page
   - System auto-calculates results

3. **After Match**:
   - View standings
   - Update handicaps if needed

4. **During Season**:
   - Update player handicaps as skill changes
   - View match history
   - Track statistics

## Updating Handicaps

```sql
UPDATE players
SET handicap = 9.2
WHERE id = 'PLAYER_ID';
```

**Note**: This only affects future matches. Past scorecards preserve the handicap at the time of play.

## Example: Complete Match Setup

Here's a complete example from start to finish:

```sql
-- 1. Assume course already exists, get ID
SELECT id FROM courses WHERE name = 'Pebble Beach';
-- Result: 'abc123-course-id'

-- 2. Assume teams already exist, get IDs
SELECT id, name FROM teams;
-- Result:
-- Team Birdie: 'team1-id'
-- Team Eagle: 'team2-id'

-- 3. Assume players already exist, get IDs
SELECT p.id, prof.name, t.name as team_name, p.handicap
FROM players p
JOIN profiles prof ON p.profile_id = prof.id
JOIN teams t ON p.team_id = t.id;
-- Result:
-- John (Team Birdie, 8.5): 'player1-id'
-- Mike (Team Birdie, 12.3): 'player2-id'
-- Sarah (Team Eagle, 5.2): 'player3-id'
-- Lisa (Team Eagle, 15.7): 'player4-id'

-- 4. Create match
INSERT INTO matches (course_id, team1_id, team2_id, match_date, status)
VALUES ('abc123-course-id', 'team1-id', 'team2-id', '2025-10-20', 'scheduled')
RETURNING id;
-- Result: 'match-id-xyz'

-- 5. Create scorecards
INSERT INTO scorecards (match_id, player_id, handicap_at_time) VALUES
('match-id-xyz', 'player1-id', 8.5),
('match-id-xyz', 'player2-id', 12.3),
('match-id-xyz', 'player3-id', 5.2),
('match-id-xyz', 'player4-id', 15.7);

-- 6. Now visit: http://localhost:3000/matches/match-id-xyz/scorecard
-- Enter all scores and submit
```

## Tips

- **Handicap Index**: The hole handicap index (1-18) determines which holes get strokes. Index 1 = hardest hole, 18 = easiest.
- **Testing**: Create test matches with sample data to verify scoring logic
- **Backups**: Regularly backup your Supabase database
- **Admin UI**: Consider building an admin dashboard to manage this data via UI instead of SQL

## Common Issues

### "Match not found" error
- Verify the match ID is correct
- Check that scorecards were created for the match

### Scores not calculating correctly
- Verify hole par values are correct (3, 4, or 5)
- Check handicap values are set correctly
- Ensure all 18 holes exist for the course

### Players not showing up
- Make sure user has signed in (creates profile)
- Verify player record exists linking profile to team
- Check team assignments are correct

## Next Steps

Once you have basic data loaded:
1. Test entering a full match scorecard
2. Verify scoring calculations are correct
3. Check standings update properly
4. Build admin UI for easier data management
5. Add more teams and players
6. Set up recurring matches

Need help? Check the main [README.md](README.md) or create an issue.
