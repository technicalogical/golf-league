# Database Setup Guide

## Quick Start (Recommended)

If you're setting up a **fresh database**, follow these steps:

### 1. Open Supabase SQL Editor
- Go to your Supabase project dashboard
- Click "SQL Editor" in the left sidebar

### 2. Run migrations in this EXACT order:

#### Step 1: Create Tables
Copy/paste **`supabase/migrations/00001_initial_schema_v2.sql`** → Click "Run"

This creates all tables with the correct columns:
- ✅ profiles (with avatar_url)
- ✅ teams (with is_active)
- ✅ players (with name and is_active)
- ✅ courses (with par, architect, year_opened)
- ✅ holes (with yardage)
- ✅ matches (with team1_points, team2_points)
- ✅ scorecards (points_earned as DECIMAL)
- ✅ hole_scores (points_earned as DECIMAL)

#### Step 2: Seed Course Data
Copy/paste **`supabase/migrations/00002_seed_courses.sql`** → Click "Run"

This adds 6 AboutGolf courses with all 18 holes each.

### 3. Verify Setup

Run this query to verify:
```sql
SELECT
  (SELECT COUNT(*) FROM teams) as teams_count,
  (SELECT COUNT(*) FROM players) as players_count,
  (SELECT COUNT(*) FROM courses) as courses_count,
  (SELECT COUNT(*) FROM holes) as holes_count;
```

Expected result:
- teams_count: 0 (you'll create these)
- players_count: 0 (you'll create these)
- courses_count: 6
- holes_count: 108 (6 courses × 18 holes)

---

## If You Already Ran Old Migrations

If you already have tables from the old `00001_initial_schema.sql`, you have two options:

### Option A: Fresh Start (Easiest)
1. In Supabase dashboard, go to Database → Tables
2. Delete all tables (matches, scorecards, hole_scores, players, teams, courses, holes, profiles)
3. Run **`00001_initial_schema_v2.sql`**
4. Run **`00002_seed_courses.sql`**

### Option B: Update Existing Tables
Run these in order:
1. **`00003_add_active_columns.sql`** - Adds is_active to teams/players
2. **`00004_fix_schema.sql`** - Adds missing columns
3. **`00002_seed_courses.sql`** - Seeds course data

---

## Environment Variables

Make sure your `.env.local` has:

```env
# Auth0
AUTH0_SECRET=your-secret-here
AUTH0_BASE_URL=http://localhost:4000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find Supabase keys in: Project Settings → API

---

## Common Errors & Solutions

### ❌ "column 'par' does not exist"
**Solution:** You ran the old schema. Use Option A (Fresh Start) above.

### ❌ "column 'is_active' does not exist"
**Solution:** Run `00003_add_active_columns.sql`

### ❌ "Could not find the 'is_active' column in schema cache"
**Solution:** Refresh your schema cache or restart the dev server after running migrations.

### ❌ "relation 'teams' does not exist"
**Solution:** Run `00001_initial_schema_v2.sql` first.

---

## Start the Application

After database setup:

```bash
npm run dev
```

Visit http://localhost:4000 and:
1. Click "Sign In" to create your account
2. Go to "Manage Teams" to create teams
3. Add 2 players to each team
4. Schedule a match
5. Enter scores and view results!
