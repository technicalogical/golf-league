# Golf League Management Platform

A comprehensive multi-tenant golf league management system built with Next.js, Supabase, and Auth0. Manage multiple leagues, teams, matches, and players with advanced scoring and handicap calculations.

## Features

### League Management
- **Multi-League Support**: Run multiple independent leagues/seasons
- **Public League Profiles**: Shareable landing pages with league information
- **League Announcements**: Pin important updates for league members
- **Role-Based Access**: League admins, team captains, players, and viewers
- **Join Request System**: Teams can request to join leagues with admin approval
- **Week-Based Scheduling**: Automated match scheduling with week numbers

### Team Management
- **Team Creation**: Users create and captain their own teams
- **Invite Codes**: Unique 8-character codes for team joining
- **Team Browsing**: Public directory of teams open to new members
- **Member Management**: Captains control team roster and permissions
- **Multi-League Participation**: Teams can join multiple leagues

### Match & Scoring
- **2v2 Match Play**: Head-to-head team competition format
- **Advanced Scoring Engine**: Handicap-based stroke allocation
- **Flexible Match Formats**: 9 or 18 holes (front/back nine selection)
- **Multiple Tee Boxes**: Black, Gold, Blue, White, Red with yardages
- **Match Configuration**: Stimp meter settings and pin placement difficulty
- **Scorecard Entry**: Hole-by-hole score tracking with automatic calculations
- **Live Results**: Real-time point calculations and match results

### User Features
- **SSO Authentication**: Secure login via Auth0
- **User Profiles**: Customizable display names and preferences
- **Onboarding Flow**: Guided setup for new users
- **Dashboard**: Quick access to leagues, teams, and matches
- **Player Statistics**: Track performance across seasons

## Scoring System

### Rules
- 2 players per team compete in head-to-head matchups
- Lowest handicap plays opponent's lowest handicap
- Highest handicap plays opponent's highest handicap

### Stroke Allocation
- **Par 3s**: No strokes given
- **Par 4s & 5s**: Strokes based on handicap difference and hole handicap index
- Higher handicap player receives strokes on indexed holes

### Point System
- Win a hole = 1 point
- Team with lowest net total = 1 additional point
- Maximum points per match: 19 (18 holes + 1 team point)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Auth0 SSO
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Self-hosted on Ubuntu with systemd + nginx

## Project Structure

```
golf-league/
├── app/
│   ├── api/              # REST API endpoints
│   │   ├── auth/         # Auth0 authentication
│   │   ├── leagues/      # League management
│   │   ├── teams/        # Team operations
│   │   ├── matches/      # Match and scoring
│   │   ├── players/      # Player management
│   │   └── standings/    # Rankings calculation
│   ├── dashboard/        # User dashboard
│   ├── leagues/          # League pages
│   ├── teams/            # Team pages
│   ├── matches/          # Match and scorecard pages
│   ├── profile/          # User profile pages
│   └── welcome/          # Onboarding flow
├── lib/
│   ├── auth.ts           # Auth0 helpers
│   ├── scoring.ts        # Match scoring logic
│   ├── supabase.ts       # Database client
│   └── database.types.ts # TypeScript types
└── supabase/
    └── migrations/       # 17 database migrations
```

## Database Schema

### Core Tables
- **profiles** - User accounts linked to Auth0
- **leagues** - League/season management
- **league_members** - User roles within leagues
- **league_teams** - Team participation in leagues
- **league_announcements** - League communications
- **league_join_requests** - Team join request workflow
- **teams** - Team entities
- **team_members** - Team membership with captain roles
- **players** - Player handicap tracking
- **courses** - Golf course data
- **holes** - Hole-by-hole details (par, handicap index, yardages)
- **matches** - Match scheduling and results
- **scorecards** - Player scorecards
- **hole_scores** - Individual hole scoring

### Security
- Row Level Security (RLS) enabled on all tables
- Policy-based access control
- Site admin and league admin roles
- Team captain permissions

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Auth0 account

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/technicalogical/golf-league.git
   cd golf-league
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run all migrations in `supabase/migrations/` (in order)
   - Copy your Project URL and API keys
   - See `SUPABASE_SETUP.md` for detailed instructions

4. **Configure Auth0**
   - Create an application at [auth0.com](https://auth0.com)
   - Add callback URL: `http://localhost:4000/api/auth/callback`
   - Add logout URL: `http://localhost:4000`
   - Copy your Domain, Client ID, and Client Secret
   - See `AUTH0_SETUP.md` for detailed instructions

5. **Create environment file**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   ```env
   # Auth0
   AUTH0_SECRET='<generate with: openssl rand -hex 32>'
   AUTH0_BASE_URL='http://localhost:4000'
   AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
   AUTH0_CLIENT_ID='your_client_id'
   AUTH0_CLIENT_SECRET='your_client_secret'

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL='https://YOUR_PROJECT.supabase.co'
   NEXT_PUBLIC_SUPABASE_ANON_KEY='your_anon_key'
   SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:4000](http://localhost:4000)

## Production Deployment

This application is configured for self-hosted deployment.

### Quick Deploy

See `DEPLOYMENT_CHECKLIST.md` for step-by-step instructions.

**Automated deployment:**
```bash
./deploy.sh
```

**Manual deployment:**
1. Configure Auth0 for production (see `AUTH0_SETUP.md`)
2. Configure Supabase (see `SUPABASE_SETUP.md`)
3. Set up production environment variables
4. Install systemd service
5. Configure nginx reverse proxy
6. Start the service

See `PRODUCTION_SETUP.md` for complete instructions.

## Documentation

- **DEPLOYMENT_CHECKLIST.md** - Quick deployment checklist
- **PRODUCTION_SETUP.md** - Complete production deployment guide
- **AUTH0_SETUP.md** - Auth0 configuration instructions
- **SUPABASE_SETUP.md** - Database setup and migrations
- **ARCHITECTURE.md** - System architecture overview
- **LEAGUE_MANAGEMENT.md** - League administration guide

## API Documentation

### Main Endpoints

- `POST /api/leagues` - Create a league
- `GET /api/leagues/[id]` - Get league details
- `POST /api/teams` - Create a team
- `POST /api/teams/join` - Join team with invite code
- `POST /api/matches` - Create a match
- `POST /api/matches/[id]/scores` - Submit scorecard
- `GET /api/standings` - Get league standings

See individual route files in `app/api/` for detailed documentation.

## Development

### Adding Features

1. **Database changes**: Create new migration in `supabase/migrations/`
2. **API routes**: Add in `app/api/`
3. **Pages**: Add in `app/`
4. **Business logic**: Add in `lib/`
5. **Types**: Update `lib/database.types.ts`

### Running Migrations

Migrations are run manually in Supabase SQL Editor. See `SUPABASE_SETUP.md`.

### Code Style

- TypeScript strict mode enabled
- ESLint configuration included
- Tailwind CSS for styling

## Security

- Auth0 SSO for authentication
- Row Level Security (RLS) on all database tables
- Environment variables for secrets (never committed)
- HTTPS required in production
- CORS configured for production domain

## License

Private use. © 2025

## Support

For issues or questions:
- Create an issue in this repository
- See documentation in the `*.md` files
- Contact: lehman.brandon@gmail.com

---

**Production URL**: https://golf.spaceclouds.xyz
**Repository**: https://github.com/technicalogical/golf-league
