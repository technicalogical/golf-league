#!/usr/bin/env tsx

// Apply the migration SQL directly
require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function applyMigration() {
  console.log('Applying migration 00018_add_match_scoring_config.sql...\n');

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/00018_add_match_scoring_config.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Migration SQL loaded. This needs to be applied via Supabase SQL Editor.');
  console.log('\nPlease copy and paste the following SQL into your Supabase SQL Editor:\n');
  console.log('=' .repeat(60));
  console.log(sql);
  console.log('=' .repeat(60));
  console.log('\nAfter applying the migration in Supabase, run the backfill script:');
  console.log('  npx tsx scripts/backfill-match-scoring-configs.ts');
}

applyMigration();
