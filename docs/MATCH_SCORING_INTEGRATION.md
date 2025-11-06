# Match Scoring Integration

## Overview

This document describes how matches are integrated with scoring rules through the `match_scoring_config` table. This integration allows matches to inherit scoring rules from their leagues while supporting optional per-match overrides for special events.

## Database Schema

### match_scoring_config Table

The `match_scoring_config` table stores the scoring configuration for each match:

```sql
CREATE TABLE match_scoring_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  scoring_rule_id UUID REFERENCES scoring_rules(id) ON DELETE SET NULL,

  -- Match-specific overrides (optional)
  override_handicap_method TEXT,
  override_handicap_percentage INTEGER,
  override_max_handicap_difference INTEGER,
  override_stroke_holes TEXT,
  override_hole_points INTEGER,
  override_match_bonus_points INTEGER,

  -- Special event configurations
  is_tournament_match BOOLEAN DEFAULT FALSE,
  tournament_multiplier NUMERIC(3,2) DEFAULT 1.00,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(match_id)
);
```

**Key Features:**
- One scoring config per match (enforced by UNIQUE constraint)
- Inherits from league's scoring rule by default
- Supports optional per-match overrides
- Special tournament match configuration
- Cascade delete when match is deleted

## Automatic Match Scoring Configuration

### When Creating a Match

When a new match is created via `POST /api/matches`:

1. **If match is part of a league:**
   - Fetches the league's active scoring rule from `league_scoring_rules`
   - Creates a `match_scoring_config` entry with:
     - `scoring_rule_id` from the league
     - Any league-level overrides (hole_points, bonus_points, etc.)
     - `is_tournament_match = false`
     - `tournament_multiplier = 1.0`

2. **If match is not part of a league:**
   - No scoring config is created automatically
   - Can be added manually later if needed

### Inheritance Chain

```
scoring_rules (base template)
      ↓
league_scoring_rules (league-level overrides)
      ↓
match_scoring_config (match-level overrides)
```

## User Interface

### Match Creation Form (`/matches/new`)

**Features:**
- Displays league scoring method when a league is selected
- Shows scoring rule name, description, and configuration badges
- Visual indicator that the match will inherit the league's scoring
- Info box with indigo styling explaining the scoring method

**What's Displayed:**
- Scoring rule name
- Brief description
- Points per hole
- Bonus points (if any)
- Handicap method
- Note about automatic inheritance

### Match Detail Page (`/matches/[id]`)

**Scoring Method Card:**
- Appears in the sidebar alongside Match Details
- Shows the active scoring rule name and description
- Displays configuration badges:
  - Points per hole (respects overrides)
  - Bonus points (if applicable)
  - Handicap method (respects overrides)
  - Tournament multiplier (if tournament match)
- Links to league page if match is part of a league

**Dynamic Override Display:**
- If a match has override values, those are shown instead of base rule values
- Uses coalescence: `override_hole_points ?? scoring_rule.hole_points`

## API Endpoints

### POST /api/matches

**Enhanced Behavior:**
- Creates match record in `matches` table
- If `league_id` is provided:
  - Fetches active league scoring rule
  - Creates `match_scoring_config` with inherited values
  - Logs warnings if league has no scoring rule
- Errors in scoring config creation don't fail match creation

**Example:**
```javascript
// Request
POST /api/matches
{
  "team1_id": "...",
  "team2_id": "...",
  "course_id": "...",
  "match_date": "2024-06-15",
  "league_id": "...",  // Optional
  "holes_to_play": 18,
  "tee_selection": "Blue"
}

// Response
{
  "id": "match-uuid",
  "league_id": "league-uuid",
  "status": "scheduled",
  ...
}

// Side effect: match_scoring_config created automatically
```

## Backfilling Existing Matches

For matches created before this integration, a backfill script is provided:

```bash
npx tsx scripts/backfill-match-scoring-configs.ts
```

**Script Behavior:**
1. Finds all matches without a scoring config
2. For each match:
   - If part of a league: inherits league's scoring rule
   - If not part of a league: uses system default scoring rule
3. Creates `match_scoring_config` entries
4. Reports success/failure for each match
5. Verifies all matches have configs

**Output:**
- Total matches processed
- Successfully created configs
- Any errors encountered
- Verification summary

## Testing

A comprehensive test suite verifies the integration:

```bash
npx tsx scripts/test-match-scoring-integration.ts
```

**Tests Include:**
1. ✓ Table Accessibility - match_scoring_config table exists
2. ✓ Match Coverage - All/most matches have scoring configs
3. ✓ League Inheritance - League matches inherit league rules correctly
4. ✓ Scoring Rule Joins - Joins with scoring_rules table work
5. ✓ No Duplicates - No match has multiple configs
6. ✓ Override Fields - Override fields have correct types

**Pass Criteria:**
- All 6 tests must pass
- At least 80% of matches should have scoring configs
- League matches should correctly inherit league scoring rules

## Scorecard Integration

### Accessing Match Scoring Configuration

When implementing the scorecard system, retrieve scoring configuration:

```typescript
// Fetch match with scoring config
const { data: match } = await supabase
  .from('matches')
  .select(`
    *,
    match_scoring_config!inner(
      *,
      scoring_rule:scoring_rules(*)
    )
  `)
  .eq('id', matchId)
  .single();

// Use effective values (with overrides)
const effectiveConfig = {
  holePoints: match.match_scoring_config.override_hole_points
    ?? match.match_scoring_config.scoring_rule.hole_points,

  matchBonusPoints: match.match_scoring_config.override_match_bonus_points
    ?? match.match_scoring_config.scoring_rule.match_bonus_points,

  handicapMethod: match.match_scoring_config.override_handicap_method
    ?? match.match_scoring_config.scoring_rule.handicap_method,

  // ... other fields
};
```

### Calculating Match Results

Use the effective configuration to calculate:
- Handicap strokes per player
- Stroke allocation across holes
- Points awarded per hole
- Total match points
- Bonus points for lowest total

## Future Enhancements

Potential improvements to consider:

1. **Match-Level Override UI**
   - Add section in match edit form to override scoring settings
   - Allow marking matches as tournament matches with multipliers

2. **Scoring Preview**
   - Show how scoring would work before starting match
   - Display stroke allocation based on handicaps

3. **Historical Tracking**
   - Track when scoring configs change during a match
   - Maintain audit log of scoring rule changes

4. **Bulk Operations**
   - Apply scoring configs to multiple matches at once
   - Update scoring for all matches in a league

5. **Validation Rules**
   - Prevent changing scoring after match starts
   - Warn if scoring differs from league standard

6. **Analytics**
   - Show which scoring methods are most used
   - Compare results across different scoring methods

## Troubleshooting

### Match has no scoring config

**Symptoms:**
- Match detail page doesn't show scoring method
- Scorecard can't calculate points

**Solutions:**
1. Run backfill script: `npx tsx scripts/backfill-match-scoring-configs.ts`
2. Manually create config via Supabase dashboard
3. Check if league has an active scoring rule

### Scoring config doesn't match league

**Symptoms:**
- Match uses different scoring than expected
- Test "League Inheritance" fails

**Causes:**
- Match was created before league scoring rule was assigned
- League scoring rule was changed after match creation
- Manual override was applied

**Solutions:**
- Check `match_scoring_config.scoring_rule_id` vs `league_scoring_rules.scoring_rule_id`
- Decide if match should keep its original scoring (completed matches)
- Update match scoring config if match hasn't started

### Duplicate scoring configs

**Symptoms:**
- Test "No Duplicates" fails
- Multiple configs for same match_id

**Solutions:**
- Run query to find duplicates:
  ```sql
  SELECT match_id, COUNT(*)
  FROM match_scoring_config
  GROUP BY match_id
  HAVING COUNT(*) > 1;
  ```
- Delete older duplicates, keeping the most recent
- Investigate how duplicates were created

## Related Files

### Database
- `/supabase/migrations/00018_add_match_scoring_config.sql` - Table creation

### API
- `/app/api/matches/route.ts` - Match creation with scoring config

### UI
- `/app/matches/new/page.tsx` - Match creation form
- `/app/matches/[id]/page.tsx` - Match detail page

### Scripts
- `/scripts/backfill-match-scoring-configs.ts` - Backfill existing matches
- `/scripts/test-match-scoring-integration.ts` - Integration test suite
- `/scripts/apply-migration-18.ts` - Migration helper

### Types
- `/lib/types/scoring.ts` - TypeScript interfaces including MatchScoringConfig

### Documentation
- `/docs/SCORING_INTEGRATION.md` - League scoring integration
- `/docs/MATCH_SCORING_INTEGRATION.md` - This document
