# Scoring Rules Integration with Leagues

## Overview

This document describes how scoring rules are integrated with leagues in the Golf League Management system. The integration allows each league to have its own scoring configuration, with support for changing scoring rules over time.

## Database Schema

### Tables Involved

1. **scoring_rules** - Contains all available scoring rule templates
2. **league_scoring_rules** - Junction table linking leagues to scoring rules
3. **leagues** - Main league table

### Key Fields

#### league_scoring_rules
- `id` (UUID) - Primary key
- `league_id` (UUID) - Foreign key to leagues table
- `scoring_rule_id` (UUID) - Foreign key to scoring_rules table
- `is_active` (BOOLEAN) - Whether this scoring rule is currently active for the league
- `override_hole_points` (INTEGER, nullable) - League-specific override for hole points
- `override_match_bonus_points` (INTEGER, nullable) - League-specific override for match bonus
- `override_max_handicap_difference` (INTEGER, nullable) - League-specific override for max handicap diff
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## API Endpoints

### GET /api/leagues/[id]/scoring-rules
Retrieves the current active scoring rule for a league.

**Response:**
```json
{
  "id": "uuid",
  "league_id": "uuid",
  "scoring_rule_id": "uuid",
  "is_active": true,
  "scoring_rule": {
    "id": "uuid",
    "name": "Heads Up (No Handicap)",
    "description": "...",
    "handicap_method": "none",
    "hole_points": 1,
    "match_bonus_points": 0,
    ...
  }
}
```

### POST /api/leagues/[id]/scoring-rules
Assigns or changes the scoring rule for a league. Requires league_admin role.

**Request Body:**
```json
{
  "scoring_rule_id": "uuid",
  "override_hole_points": 2,  // optional
  "override_match_bonus_points": 3,  // optional
  "override_max_handicap_difference": 5  // optional
}
```

**Behavior:**
- Deactivates any existing active scoring rules for the league
- Creates a new active league_scoring_rule entry
- Returns the new league scoring rule with joined scoring_rule data

### PUT /api/leagues/[id]/scoring-rules
Updates the override values for the current active scoring rule. Requires league_admin role.

**Request Body:**
```json
{
  "override_hole_points": 2,
  "override_match_bonus_points": 3,
  "override_max_handicap_difference": 5
}
```

## User Interface

### League Creation Form (`/leagues/new`)

The league creation form includes:
- **Scoring Method dropdown** - Lists all active scoring rules
- Auto-selects the system default scoring rule
- Shows a description of the selected scoring method
- The selected rule is assigned to the league on creation

**Features:**
- Loads scoring rules via `/api/scoring-rules?active=true`
- Displays rule name with "(Default)" badge for system default
- Shows descriptive text about the selected rule
- Handles the case where no scoring rule is selected (uses system default)

### League Settings Page (`/leagues/[id]/settings`)

The settings page includes a dedicated "Scoring Method" card with:
- **Current Scoring Rule display** - Shows the active rule with full details
- **Change Scoring Rule dropdown** - Allows selecting a new rule
- **Update button** - Applies the new scoring rule
- Warning message about the impact of changing scoring rules

**Features:**
- Displays current rule name, description, and configuration
- Loads all active scoring rules for selection
- Shows if no scoring rule is assigned (with warning)
- Updates via POST to `/api/leagues/[id]/scoring-rules`
- Only accessible to league administrators

### League Detail Page (`/leagues/[id]`)

Displays the current scoring method in the league header with:
- Badge showing the scoring rule name
- Positioned alongside start date, end date, and league status
- Styled with indigo color scheme to distinguish from other metadata

## Default Scoring Rule Assignment

### For New Leagues

When a league is created via POST `/api/leagues`:
1. If `scoring_rule_id` is provided in the request, that rule is used
2. If not provided, the system looks for the default scoring rule (`is_system_default = true`)
3. Creates an entry in `league_scoring_rules` with `is_active = true`
4. If no scoring rule is found, the league is created without one (not recommended)

### For Existing Leagues

A utility script is provided to assign the default scoring rule to leagues that don't have one:

```bash
npx tsx scripts/assign-default-scoring-rules.ts
```

**Script behavior:**
- Finds the system default scoring rule
- Identifies leagues without any active scoring rules
- Assigns the default rule to those leagues
- Reports success/failure for each assignment

## Testing

A comprehensive test suite is available:

```bash
npx tsx scripts/test-scoring-integration.ts
```

**Tests include:**
1. Scoring rules table exists and has data
2. Default scoring rule is properly configured
3. All leagues have an active scoring rule
4. League scoring rule table structure is correct
5. Join queries work correctly
6. No duplicate active rules per league

## Data Consistency Rules

1. **One Active Rule Per League** - Each league should have exactly one active scoring rule at any time
2. **Default Rule Exists** - The system must have at least one scoring rule marked as `is_system_default = true` and `is_active = true`
3. **Historical Tracking** - When changing scoring rules, old rules are deactivated (not deleted) to maintain history
4. **New Leagues** - All new leagues must be assigned a scoring rule (preferably during creation)

## Implementation Notes

### Scoring Rule Changes

When a league changes its scoring rule:
- Previous scoring rule is deactivated (`is_active = false`)
- New scoring rule is created with `is_active = true`
- This maintains a history of which scoring rules were used when
- Future matches will use the new scoring rule
- Completed matches retain their original scoring configuration

### Override Values

League-specific overrides allow customization without creating new scoring rule templates:
- `override_hole_points` - Custom points per hole
- `override_match_bonus_points` - Custom bonus points for lowest total
- `override_max_handicap_difference` - Custom handicap cap

If an override is null, the base scoring rule value is used.

### Authorization

Scoring rule management requires league administrator privileges:
- GET endpoints are public (anyone can view)
- POST/PUT endpoints check for `league_admin` role
- Unauthorized users receive 403 Forbidden response

## Future Enhancements

Potential improvements to consider:
1. **Match-specific overrides** - Allow individual matches to use different scoring
2. **Scoring rule analytics** - Show which rules are most popular
3. **Rule preview** - Show how scoring would work before applying
4. **Bulk assignment** - Assign scoring rules to multiple leagues at once
5. **Validation** - Prevent changing scoring rules mid-season (configurable)
6. **Migration tool** - Recalculate match scores when scoring rule changes

## Related Files

- `/app/leagues/new/page.tsx` - League creation form
- `/app/leagues/[id]/settings/page.tsx` - League settings with scoring management
- `/app/leagues/[id]/page.tsx` - League detail page with scoring display
- `/app/api/leagues/route.ts` - League creation with scoring assignment
- `/app/api/leagues/[id]/scoring-rules/route.ts` - Scoring rule management endpoints
- `/lib/types/scoring.ts` - TypeScript types and utility functions
- `/scripts/assign-default-scoring-rules.ts` - Default rule assignment utility
- `/scripts/test-scoring-integration.ts` - Integration test suite
