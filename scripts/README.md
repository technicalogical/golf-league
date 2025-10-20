# Database Seeding Scripts

These scripts populate your database with realistic test data for development and testing.

## Prerequisites

Make sure you have the following environment variables set in your `.env` file:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Available Scripts

### 1. Seed Users
Creates test user profiles with realistic names and golf handicaps.

```bash
npm run seed:users
# Or specify number of users (default: 12)
npm run seed:users 20
```

### 2. Seed League
Creates a complete league with teams and players:
- 1 league with a description
- 4 teams with unique names
- 2 players per team (8 total)
- 1 golf course with 18 holes

**Note:** Run `seed:users` first to have users available.

```bash
npm run seed:league
```

### 3. Seed Matches
Creates completed matches with realistic scorecards:
- Match pairings between teams
- Hole-by-hole scores for all players
- Handicap calculations
- Point totals and winners

**Note:** Run `seed:league` first to have teams available.

```bash
npm run seed:matches
# Or specify number of matches (default: 3)
npm run seed:matches 5
```

### 4. Seed Everything
Runs all three scripts in sequence:

```bash
npm run seed:all
```

## Step-by-Step First Time Setup

For first-time setup, run these commands in order:

```bash
# 1. Create 12 test users
npm run seed:users

# 2. Create a league with 4 teams
npm run seed:league

# 3. Create 3 completed matches
npm run seed:matches

# You can create more matches later:
npm run seed:matches 5
```

## What Gets Created

After running all scripts, you'll have:
- 12 user profiles with realistic data
- 1 active golf league
- 4 teams with 2 players each
- 1 golf course with 18 holes
- 3+ completed matches with full scorecards
- Head-to-head statistics
- Standings data

## Example Output

```
🌱 Seeding 12 test users...

✅ Successfully created 12 users:

   📧 John Smith (john.smith@example.com) - Handicap: 12
   📧 Sarah Johnson (sarah.johnson@example.com) - Handicap: 8
   ...

✨ User seeding complete!
```

## Troubleshooting

**Error: "Missing Supabase credentials"**
- Make sure your `.env` file has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**Error: "Need at least 8 users"**
- Run `npm run seed:users` before running `seed:league`

**Error: "No league found"**
- Run `npm run seed:league` before running `seed:matches`
