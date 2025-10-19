# Supabase Setup Instructions

## Step 1: Login to Supabase
Visit: https://supabase.com/dashboard

## Step 2: Create/Select Project

### Option A: Create New Project
1. Click "New Project"
2. **Name**: Golf League Production
3. **Database Password**: Create a strong password (save this!)
4. **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait ~2 minutes for provisioning

### Option B: Use Existing Project
1. Select your existing project from the dashboard

## Step 3: Get Your API Credentials

1. Click on your project
2. Go to "Settings" (gear icon) → "API"
3. Copy these values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long JWT token (safe to expose publicly)
   - **service_role key**: Secret JWT token (keep private!)

## Step 4: Run Database Migrations

### Option 1: Using SQL Editor (Recommended)

1. Go to "SQL Editor" in the left sidebar
2. Click "New Query"
3. Run each migration file in order:

**Copy and paste each file's contents, then click "Run":**

```
1. 00001_initial_schema_v2.sql
2. 00002_seed_courses.sql
3. 00003_add_active_columns.sql
4. 00004_fix_schema.sql
5. 00005_add_match_format_and_tees.sql
6. 00006_update_course_yardages.sql
7. 00007_add_leagues_and_roles.sql
8. 00008_fix_leagues_created_by.sql
9. 00009_add_match_settings.sql
10. 00010_add_profile_preferences.sql
11. 00011_add_league_settings_and_admins.sql
12. 00012_rollback_announcements.sql
13. 00013_add_league_announcements.sql
14. 00014_add_team_membership_system.sql
15. 00015_add_league_day_and_time.sql
16. 00015_add_team_open_to_join.sql
17. 00016_add_league_join_requests.sql
18. 00017_add_league_schedule_fields.sql
```

**IMPORTANT**: Run them in this exact order!

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

## Step 5: Verify Database Schema

After running migrations, verify in Supabase:

1. Go to "Table Editor" in sidebar
2. You should see these tables:
   - profiles
   - courses
   - holes
   - teams
   - team_members
   - players
   - matches
   - scorecards
   - hole_scores
   - leagues
   - league_members
   - league_teams
   - league_announcements
   - league_join_requests

3. Click on any table to verify it has data/structure

## Step 6: Enable Row Level Security (RLS)

RLS should be enabled by the migrations, but verify:

1. Go to "Authentication" → "Policies"
2. Check that each table has policies listed
3. All tables should show "RLS enabled"

## Step 7: Update Production .env.local

Add Supabase credentials to `/var/www/golf-league/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL='https://YOUR_PROJECT_ID.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGc...(your anon key)'
SUPABASE_SERVICE_ROLE_KEY='eyJhbGc...(your service role key)'
```

## Step 8: Test Database Connection

After deployment, you can test by:

1. Visit your app: https://golf.spaceclouds.xyz
2. Sign in
3. Try creating a team or league
4. Check Supabase "Table Editor" to see if data appears

## Monitoring and Maintenance

### View Database Logs
1. Go to "Logs" → "Postgres Logs"
2. Monitor for errors or slow queries

### View API Usage
1. Go to "Settings" → "Usage"
2. Monitor requests, bandwidth, database size

### Backup Database
1. Go to "Database" → "Backups"
2. Daily backups are automatic
3. Can restore to any point in time (last 7 days)

## Troubleshooting

### Migration Errors

**"relation already exists"**
- Some tables may already exist
- Skip that migration and continue with next

**"permission denied"**
- Make sure you're using the SQL Editor (has admin access)
- Check that RLS policies aren't blocking

**"syntax error"**
- Copy the entire migration file contents
- Don't modify the SQL

### Connection Errors

**"Failed to fetch"**
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify URL includes https://
- Check if Supabase project is paused (free tier)

**"JWT expired"**
- Regenerate API keys in Settings → API
- Update .env.local with new keys

**"Invalid API key"**
- Verify you're using anon key (not service role) for NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check for extra spaces or line breaks in .env.local

### RLS Policy Issues

**"Row level security policy violation"**
- Check that user is authenticated
- Verify RLS policies in Supabase dashboard
- Check auth.uid() is returning correct user ID

## Sample Data (Optional)

Want to add test data? Go to SQL Editor and run:

```sql
-- Create a test course (AboutGolf simulator)
INSERT INTO courses (name, location, par, total_holes)
VALUES ('AboutGolf Simulator', 'Indoor', 72, 18);

-- Get the course ID
SELECT id FROM courses WHERE name = 'AboutGolf Simulator';
```

## Security Best Practices

1. **Never expose service_role key** in client-side code
2. **Keep anon key public** (it's safe, protected by RLS)
3. **Enable RLS on all tables** (done by migrations)
4. **Regularly review** Auth policies in dashboard
5. **Monitor** API usage for anomalies
6. **Backup** database before major changes

## Useful Supabase SQL Queries

### Check RLS Status
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Count Records
```sql
SELECT
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM teams) as teams,
  (SELECT COUNT(*) FROM leagues) as leagues,
  (SELECT COUNT(*) FROM matches) as matches;
```

### View All Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Supabase Dashboard Quick Links

- SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
- Table Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
- API Settings: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
- Database Backups: https://supabase.com/dashboard/project/YOUR_PROJECT/database/backups
