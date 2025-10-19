# Indoor Golf League Standings Website

A full-stack web application for managing indoor golf league scorecards, standings, and team statistics. Built with Next.js, Supabase, and Auth0.

## Features

- **Scorecard Entry**: Easy hole-by-hole score entry with automatic handicap-based calculations
- **Live Standings**: Real-time team and player rankings
- **Handicap Management**: Track and update player handicaps throughout the season
- **Match Scoring System**:
  - 2 players per team
  - Lowest handicaps face each other
  - Strokes given on par 4s and 5s based on handicap difference
  - Winner of each hole gets 1 point
  - Team with lowest net total gets 1 point
- **Auth0 SSO**: Secure authentication with multiple provider support
- **AboutGolf Integration**: Ready for future API integration when available

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Auth0
- **Form Management**: React Hook Form with Zod validation

## Project Structure

```
golf-league/
├── app/
│   ├── api/
│   │   ├── auth/[auth0]/      # Auth0 authentication routes
│   │   ├── matches/[id]/      # Match and scorecard APIs
│   │   └── standings/         # Standings calculation API
│   ├── matches/[id]/
│   │   └── scorecard/         # Scorecard entry page
│   ├── standings/             # Standings leaderboard page
│   └── page.tsx               # Home page
├── lib/
│   ├── supabase.ts           # Supabase client setup
│   ├── database.types.ts     # TypeScript database types
│   ├── auth.ts               # Auth helper functions
│   └── scoring.ts            # Handicap scoring logic
└── supabase/
    └── migrations/
        └── 00001_initial_schema.sql  # Database schema
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account
- Auth0 account

### 2. Clone and Install

```bash
cd golf-league
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   ```sql
   -- Copy contents from supabase/migrations/00001_initial_schema.sql
   -- Paste and execute in Supabase SQL Editor
   ```
3. Get your API credentials:
   - Project URL: https://scwkwwehjnlfjyfjpzoa.supabase.co
   - Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDc1NDgsImV4cCI6MjA3NjI4MzU0OH0.egp28lF00ryO_nWQxMH-ivLFuUiMSYpi6WCCZKXLCXA
   - Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw

### 4. Set Up Auth0

1. Create account at [auth0.com](https://auth0.com)
2. Create a new application (Regular Web Application)
3. Configure settings:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
4. Note down:
   - Domain: dev-e8b8q2nwta34obya.us.auth0.com
   - Client ID: d6riKLGRcfGGLxkHjlBEXQOjMGZjuizK
   - Client Secret: 0kknxDuC5gPEjf13VbXWKgU4mXvRGpGFxyNLQbSOhPMoS4eoFo6XaHMY8mQbWeef

### 5. Environment Variables

Create `.env.local` in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your credentials:

```env
# Auth0
AUTH0_SECRET='<run: openssl rand -hex 32>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your_client_id'
AUTH0_CLIENT_SECRET='your_client_secret'

# Supabase
NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your_anon_key'
SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Core Tables

- **profiles**: User profiles linked to Auth0
- **teams**: Team information
- **players**: Player data with handicaps
- **courses**: Golf courses
- **holes**: Individual hole data (par, handicap index)
- **matches**: Match scheduling and status
- **scorecards**: Player scorecards for each match
- **hole_scores**: Individual hole scores

## Scoring Logic

The scoring system is implemented in `lib/scoring.ts`:

### Stroke Allocation
- **Par 3s**: No strokes given
- **Par 4s & 5s**: Strokes given based on handicap difference and hole handicap index
- Example: If handicap diff is 5, strokes given on holes with handicap index 1-5

### Point System
1. **Head-to-Head Points**: Each hole winner gets 1 point (tie = 0 points to both)
2. **Team Point**: Team with lowest net total gets 1 point

### Matchups
- Lowest handicap player faces opponent's lowest handicap
- Highest handicap player faces opponent's highest handicap

## Key Functions

### `calculateMatchup()`
Calculates head-to-head scoring between two players with handicap adjustments.

### `calculateTeamMatch()`
Calculates full 2v2 team match including:
- Both head-to-head matchups
- Team totals (gross and net)
- Final point totals

## API Endpoints

### `POST /api/matches/[id]/scores`
Submit scorecard and calculate results
- Input: Array of hole scores for all players
- Output: Match results with points breakdown

### `GET /api/standings`
Get current league standings
- Output: Team and player rankings with statistics

## Next Steps

### Immediate Enhancements
1. **Admin Dashboard**: Manage courses, teams, players, and handicaps
2. **Match History**: View past match details and results
3. **Player Profiles**: Individual statistics and performance tracking
4. **Schedule Management**: Create and manage match schedules

### Future Features
- AboutGolf API integration (when available)
- Mobile app
- Statistics dashboard with charts
- Email notifications for matches
- Photo uploads for scorecards
- Course handicap calculator

## AboutGolf Integration

Currently, AboutGolf does not provide a public API. Course data must be entered manually through an admin interface (to be built).

**If you have AboutGolf API access:**
1. Contact AboutGolf support for API documentation
2. Implement course data sync in `/lib/aboutgolf.ts`
3. Add automated course import feature

## Contributing

This is a custom application for your league. To add features:

1. Database changes: Add migration files in `supabase/migrations/`
2. API routes: Add in `app/api/`
3. Pages: Add in `app/`
4. Shared logic: Add in `lib/`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Update Auth0 allowed URLs to include your production domain
5. Deploy

### Other Platforms

Compatible with any platform supporting Next.js 15:
- Netlify
- Railway
- Self-hosted with Node.js

## License

Private use for your indoor golf league.

## Support

For issues or questions, create an issue in this repository or contact your league administrator.
