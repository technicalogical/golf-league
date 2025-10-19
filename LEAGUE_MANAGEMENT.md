# League Management System

## Overview
This document describes the league management, user roles, and scheduling features added to the golf league application.

## Database Schema

### New Tables

#### 1. `leagues`
Represents a league or season.
- `id` - UUID primary key
- `name` - League name (e.g., "Spring 2025 League")
- `description` - Optional description
- `start_date` - League start date
- `end_date` - Optional end date
- `status` - 'upcoming', 'active', 'completed', or 'archived'
- `created_by` - User who created the league
- `created_at`, `updated_at` - Timestamps

#### 2. `league_members`
Links users to leagues with specific roles.
- `id` - UUID primary key
- `league_id` - Reference to leagues table
- `user_id` - Reference to profiles table
- `role` - User role enum: 'league_admin', 'team_captain', 'player', 'viewer'
- Unique constraint on (league_id, user_id)

#### 3. `league_teams`
Links teams to leagues.
- `id` - UUID primary key
- `league_id` - Reference to leagues table
- `team_id` - Reference to teams table
- `joined_at` - When team joined the league
- Unique constraint on (league_id, team_id)

### Modified Tables

#### `matches`
- Added `league_id` - Links match to a specific league
- Added `week_number` - For organizing matches into weeks

#### `teams`
- Added `captain_id` - Links to user who is team captain

#### `players`
- Added `user_id` - Optional link to user account

## User Roles

### Role Hierarchy (highest to lowest):

1. **league_admin**
   - Full control over league
   - Can manage teams, players, schedule
   - Can assign roles to other users
   - Can modify league settings

2. **team_captain**
   - Can manage their own team
   - Can add/remove players from their team
   - Can enter scores for their team's matches
   - Can view all league information

3. **player**
   - Can view league information
   - Can view their own stats
   - Limited write access

4. **viewer**
   - Read-only access
   - Can view league standings, schedules, results

## Permission Functions

### `user_has_league_role(user_id, league_id, required_role)`
Returns TRUE if user has the required role or higher in the league.

### `get_user_league_role(user_id, league_id)`
Returns the user's role in the league.

## Features Implemented

### 1. League List Page (`/leagues`)
- Shows leagues the user is a member of
- Displays other available leagues
- Create new league button
- Shows league status and user's role

### 2. Create League Page (`/leagues/new`)
- Form to create a new league
- Sets creator as league admin automatically
- Fields:
  - Name (required)
  - Description
  - Start date (required)
  - End date (optional)
  - Status

### 3. API Endpoints

#### `POST /api/leagues`
Creates a new league and assigns creator as admin.

#### `GET /api/leagues`
Lists all leagues.

## Next Steps

### To Complete League Management:

1. **League Detail Page** (`/leagues/[id]`)
   - View league information
   - Manage teams (add/remove)
   - Manage members and roles
   - View standings for this league
   - Generate schedule

2. **Schedule Generator**
   - Auto-generate round-robin schedule
   - Assign matches to weeks
   - Handle odd number of teams (byes)
   - Select courses for matches

3. **League-Specific Standings**
   - Filter standings by league
   - Show only matches from current league
   - Season champion determination

4. **Team Management with Captains**
   - Allow captains to manage their teams
   - Roster changes
   - Score entry permissions

5. **Member Management**
   - Invite users to league
   - Assign/change roles
   - Remove members

## Usage Flow

### Creating a League:
1. User clicks "Create League"
2. Fills out league form
3. League is created with user as admin
4. Admin can now:
   - Add teams to league
   - Invite other users
   - Generate schedule
   - Manage league settings

### Joining a League:
1. League admin invites user OR
2. User requests to join public league
3. Admin assigns appropriate role
4. User can now participate based on role

### Running a Season:
1. Admin creates league
2. Admin adds teams
3. Admin generates schedule (round-robin)
4. Matches are played week by week
5. Team captains enter scores
6. Standings update automatically
7. Season ends, champion crowned

## Database Migration

Run the migration:
```bash
# In Supabase SQL Editor, run:
supabase/migrations/00007_add_leagues_and_roles.sql
```

This creates:
- leagues table
- league_members table
- league_teams table
- Adds league_id to matches
- Adds captain_id to teams
- Adds user_id to players
- Creates permission helper functions
