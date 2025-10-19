# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐         │
│  │ Home Page  │  │  Scorecard  │  │  Standings   │         │
│  │            │  │   Entry     │  │  Leaderboard │         │
│  └────────────┘  └─────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  App Router Pages                       │ │
│  │  • app/page.tsx (Home)                                 │ │
│  │  • app/matches/[id]/scorecard/page.tsx                 │ │
│  │  • app/standings/page.tsx                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   API Routes                            │ │
│  │  • /api/auth/[auth0]         (Auth0 SDK)              │ │
│  │  • /api/matches/[id]/scores  (Score submission)        │ │
│  │  • /api/standings            (Leaderboard calc)        │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Business Logic                         │ │
│  │  • lib/scoring.ts     (Handicap calculations)          │ │
│  │  • lib/auth.ts        (Session management)             │ │
│  │  • lib/supabase.ts    (Database client)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                │                          │
                │                          │
                ▼                          ▼
    ┌──────────────────────┐   ┌──────────────────────┐
    │      Auth0           │   │     Supabase         │
    │   (Authentication)   │   │    (PostgreSQL)      │
    │                      │   │                      │
    │  • User Login        │   │  • profiles          │
    │  • SSO Providers     │   │  • teams             │
    │  • Session Mgmt      │   │  • players           │
    │                      │   │  • courses           │
    │                      │   │  • holes             │
    │                      │   │  • matches           │
    │                      │   │  • scorecards        │
    │                      │   │  • hole_scores       │
    └──────────────────────┘   └──────────────────────┘
```

## Data Flow

### 1. User Authentication Flow

```
User → Home Page → Click "Sign In"
                     │
                     ▼
              /api/auth/login (Auth0)
                     │
                     ▼
              Auth0 Login Page
                     │
                     ▼
              /api/auth/callback
                     │
                     ▼
         Create/Update Profile in Supabase
                     │
                     ▼
              Redirect to Dashboard
```

### 2. Scorecard Entry Flow

```
User → Navigate to /matches/[id]/scorecard
         │
         ▼
    Load Match Data
    • Fetch match details
    • Fetch course & holes
    • Fetch players (4 total)
    • Fetch existing scores (if any)
         │
         ▼
    Display Scorecard Grid
    • 18 rows (one per hole)
    • 4 columns (one per player)
    • Input field for each cell
         │
         ▼
    User Enters Scores
         │
         ▼
    Click "Calculate Results"
         │
         ▼
    POST /api/matches/[id]/scores
         │
         ▼
    Server-Side Processing:
    1. Validate all scores present
    2. Organize by team (2 players each)
    3. Sort by handicap (low to high)
    4. Calculate matchup 1 (low vs low)
       ├─ For each hole:
       │  ├─ Check if stroke applicable
       │  ├─ Calculate net scores
       │  └─ Award point to winner
    5. Calculate matchup 2 (high vs high)
       └─ Same process
    6. Calculate team totals
       ├─ Sum gross scores
       ├─ Apply handicap difference
       └─ Award team point to winner
    7. Save to database:
       ├─ hole_scores (individual holes)
       ├─ scorecards (totals & points)
       └─ matches (update status)
         │
         ▼
    Return results & redirect to results page
```

### 3. Standings Calculation Flow

```
User → Navigate to /standings
         │
         ▼
    GET /api/standings
         │
         ▼
    Server-Side Processing:

    FOR EACH TEAM:
    1. Find all completed matches
    2. Calculate total points earned
    3. Determine wins/losses/ties
    4. Sort by total points

    FOR EACH PLAYER:
    1. Find all scorecards
    2. Sum total points
    3. Calculate average score
    4. Find best round
    5. Sort by total points
         │
         ▼
    Return JSON:
    {
      teams: [...],
      players: [...]
    }
         │
         ▼
    Display Leaderboard
    • Team view (default)
    • Player view (toggle)
```

## Scoring Algorithm Details

### Head-to-Head Matchup Calculation

```javascript
calculateMatchup(player1, player2, holes) {

  // 1. Calculate handicap difference
  handicapDiff = player1.handicap - player2.handicap

  // 2. For each hole:
  FOR hole IN holes:

    // 2a. Get gross scores
    p1Gross = player1.score[hole]
    p2Gross = player2.score[hole]

    // 2b. Determine stroke allocation
    IF hole.par == 3:
      giveStroke = false
    ELSE:
      giveStroke = (hole.handicapIndex <= abs(handicapDiff))

    // 2c. Calculate net scores
    IF giveStroke:
      IF handicapDiff > 0:
        p1Net = p1Gross - 1  // Player 1 gets stroke
        p2Net = p2Gross
      ELSE:
        p1Net = p1Gross
        p2Net = p2Gross - 1  // Player 2 gets stroke
    ELSE:
      p1Net = p1Gross
      p2Net = p2Gross

    // 2d. Award points
    IF p1Net < p2Net:
      player1Points += 1
    ELSE IF p2Net < p1Net:
      player2Points += 1
    // Tie = no points

  // 3. Return results
  RETURN {
    player1Points,
    player2Points,
    holeResults: [...]
  }
}
```

### Team Match Calculation

```javascript
calculateTeamMatch(team1Players, team2Players, holes) {

  // 1. Sort players by handicap
  team1Sorted = sort(team1Players, by: handicap, asc)
  team2Sorted = sort(team2Players, by: handicap, asc)

  // 2. Run two head-to-head matchups
  matchup1 = calculateMatchup(
    team1Sorted[0],  // Lowest handicap team 1
    team2Sorted[0],  // Lowest handicap team 2
    holes
  )

  matchup2 = calculateMatchup(
    team1Sorted[1],  // Highest handicap team 1
    team2Sorted[1],  // Highest handicap team 2
    holes
  )

  // 3. Calculate team totals
  team1GrossTotal = sum(all strokes for team 1)
  team2GrossTotal = sum(all strokes for team 2)

  // 4. Apply team handicap difference
  team1AvgHcp = average(team1Players.handicap)
  team2AvgHcp = average(team2Players.handicap)
  hcpDiff = abs(team1AvgHcp - team2AvgHcp)

  IF team1AvgHcp > team2AvgHcp:
    team1NetTotal = team1GrossTotal - hcpDiff
    team2NetTotal = team2GrossTotal
  ELSE:
    team1NetTotal = team1GrossTotal
    team2NetTotal = team2GrossTotal - hcpDiff

  // 5. Award team point
  IF team1NetTotal < team2NetTotal:
    team1TotalPoints = matchup1.p1Points + matchup2.p1Points + 1
    team2TotalPoints = matchup1.p2Points + matchup2.p2Points
  ELSE IF team2NetTotal < team1NetTotal:
    team1TotalPoints = matchup1.p1Points + matchup2.p1Points
    team2TotalPoints = matchup1.p2Points + matchup2.p2Points + 1
  ELSE: // Tie
    team1TotalPoints = matchup1.p1Points + matchup2.p1Points
    team2TotalPoints = matchup1.p2Points + matchup2.p2Points

  // 6. Return full results
  RETURN {
    team1TotalPoints,
    team2TotalPoints,
    matchups: [matchup1, matchup2],
    grossTotals,
    netTotals
  }
}
```

## Database Schema Relationships

```
┌──────────────┐         ┌──────────────┐
│   profiles   │         │    teams     │
│              │         │              │
│ id (PK)      │         │ id (PK)      │
│ auth0_id     │         │ name         │
│ email        │         └──────────────┘
│ name         │                │
└──────────────┘                │
       │                        │
       │ 1:1                    │ 1:N
       │                        │
       ▼                        ▼
┌──────────────────────────────────────┐
│             players                  │
│                                      │
│ id (PK)                              │
│ profile_id (FK → profiles)           │
│ team_id (FK → teams)                 │
│ handicap                             │
└──────────────────────────────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────────────────────────────┐      ┌──────────────┐
│           scorecards                 │      │   matches    │
│                                      │      │              │
│ id (PK)                              │◄─────│ id (PK)      │
│ match_id (FK → matches)              │  1:N │ team1_id     │
│ player_id (FK → players)             │      │ team2_id     │
│ handicap_at_time                     │      │ course_id    │
│ total_score                          │      │ match_date   │
│ points_earned                        │      │ status       │
└──────────────────────────────────────┘      └──────────────┘
       │                                              │
       │ 1:N                                          │ N:1
       │                                              │
       ▼                                              ▼
┌──────────────────────────────────────┐      ┌──────────────┐
│          hole_scores                 │      │   courses    │
│                                      │      │              │
│ id (PK)                              │      │ id (PK)      │
│ scorecard_id (FK → scorecards)       │      │ name         │
│ hole_id (FK → holes)                 │      │ location     │
│ strokes                              │      │ total_holes  │
│ points_earned                        │      └──────────────┘
└──────────────────────────────────────┘              │
       │                                              │ 1:N
       │                                              │
       │                                              ▼
       │                                       ┌──────────────┐
       └──────────────────────────────────────►│    holes     │
                                               │              │
                                               │ id (PK)      │
                                               │ course_id    │
                                               │ hole_number  │
                                               │ par          │
                                               │ hcp_index    │
                                               └──────────────┘
```

## Technology Stack Details

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State**: React hooks (useState, useEffect)
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Supabase Client (direct queries)

### Authentication
- **Provider**: Auth0
- **Method**: OAuth 2.0 / OpenID Connect
- **Session**: Cookie-based (handled by @auth0/nextjs-auth0)

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: Supabase Cloud
- **Auth**: Auth0 Cloud
- **CDN**: Vercel Edge Network

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Transport Layer (HTTPS)                                  │
│     • All traffic encrypted                                  │
│     • TLS 1.3                                                │
│                                                               │
│  2. Authentication (Auth0)                                   │
│     • OAuth 2.0 / OIDC                                       │
│     • Secure session cookies                                 │
│     • HttpOnly, Secure, SameSite flags                       │
│                                                               │
│  3. Authorization (To Be Implemented)                        │
│     • Session checks on API routes                           │
│     • Role-based access control (planned)                    │
│     • Team-based permissions (planned)                       │
│                                                               │
│  4. Database Security                                        │
│     • Supabase connection pooling                            │
│     • Parameterized queries (SQL injection prevention)       │
│     • Row-level security (RLS) ready                         │
│                                                               │
│  5. Input Validation                                         │
│     • Zod schemas for form data                              │
│     • Server-side validation                                 │
│     • Type checking (TypeScript)                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Database Queries
- Indexed foreign keys
- Selective column fetching
- Join optimizations
- Connection pooling via Supabase

### API Routes
- Server-side rendering where beneficial
- Static generation for public pages
- API route caching (future)

### Frontend
- Code splitting (automatic in Next.js)
- Dynamic imports for large components
- Image optimization (Next.js Image component)
- Lazy loading

## Monitoring & Observability

### Current
- Next.js build errors
- Browser console
- Supabase logs

### Recommended Additions
- Vercel Analytics
- Sentry for error tracking
- Supabase monitoring dashboard
- Custom logging (Winston/Pino)

## Deployment Pipeline

```
Developer → Git Push → GitHub → Vercel
                                   │
                                   ├─ Build
                                   ├─ Run Tests (future)
                                   ├─ Type Check
                                   ├─ Lint
                                   └─ Deploy
                                        │
                                        ├─ Preview (branches)
                                        └─ Production (main)
```

## Environment Variables

```
Development (.env.local)
├─ AUTH0_SECRET
├─ AUTH0_BASE_URL=http://localhost:3000
├─ AUTH0_ISSUER_BASE_URL
├─ AUTH0_CLIENT_ID
├─ AUTH0_CLIENT_SECRET
├─ NEXT_PUBLIC_SUPABASE_URL
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
└─ SUPABASE_SERVICE_ROLE_KEY

Production (Vercel Environment Variables)
├─ AUTH0_SECRET (different from dev!)
├─ AUTH0_BASE_URL=https://yourdomain.com
├─ AUTH0_ISSUER_BASE_URL
├─ AUTH0_CLIENT_ID
├─ AUTH0_CLIENT_SECRET
├─ NEXT_PUBLIC_SUPABASE_URL
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
└─ SUPABASE_SERVICE_ROLE_KEY
```

---

**Last Updated**: 2025-10-17
**Version**: 1.0 MVP
