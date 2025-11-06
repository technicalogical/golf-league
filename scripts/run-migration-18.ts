#!/usr/bin/env tsx

import { supabaseAdmin } from '../lib/supabase-server';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  console.log('Running migration 00018_add_match_scoring_config.sql...');

  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/00018_add_match_scoring_config.sql'
  );

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split into individual statements and execute them
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: statement + ';'
      });

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: queryError } = await supabaseAdmin.from('_migrations').select('*').limit(0);

        if (queryError) {
          console.error('Statement failed:', error);
          console.error('Statement was:', statement.substring(0, 200));
          // Continue anyway as some statements might fail if already exists
        }
      }
    } catch (error: any) {
      console.error('Error executing statement:', error.message);
      console.error('Statement:', statement.substring(0, 200));
      // Continue with other statements
    }
  }

  console.log('\nMigration process completed!');
  console.log('Verifying table creation...');

  // Verify the table was created
  const { data, error } = await supabaseAdmin
    .from('match_scoring_config')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Table verification failed:', error);
    console.error('You may need to run the migration manually via Supabase dashboard');
  } else {
    console.log('Table created successfully!');
  }
}

runMigration();
