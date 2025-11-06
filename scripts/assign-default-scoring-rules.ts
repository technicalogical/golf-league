#!/usr/bin/env tsx

/**
 * Script to assign default scoring rules to existing leagues
 * Run with: npx tsx scripts/assign-default-scoring-rules.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function assignDefaultScoringRules() {
  console.log('Starting assignment of default scoring rules to existing leagues...\n');

  // Get the default scoring rule
  const { data: defaultRule, error: ruleError } = await supabase
    .from('scoring_rules')
    .select('id, name')
    .eq('is_system_default', true)
    .eq('is_active', true)
    .single();

  if (ruleError || !defaultRule) {
    console.error('Error: Could not find default scoring rule');
    console.error(ruleError);
    process.exit(1);
  }

  console.log(`Found default scoring rule: ${defaultRule.name} (${defaultRule.id})\n`);

  // Get all leagues
  const { data: allLeagues, error: leaguesError } = await supabase
    .from('leagues')
    .select('id, name');

  if (leaguesError) {
    console.error('Error fetching leagues:', leaguesError);
    process.exit(1);
  }

  console.log(`Found ${allLeagues?.length || 0} total leagues\n`);

  if (!allLeagues || allLeagues.length === 0) {
    console.log('No leagues found. Nothing to do.');
    return;
  }

  // Get all league scoring rules
  const { data: existingRules, error: existingError } = await supabase
    .from('league_scoring_rules')
    .select('league_id');

  if (existingError) {
    console.error('Error fetching existing league scoring rules:', existingError);
    process.exit(1);
  }

  const leaguesWithRules = new Set(existingRules?.map(r => r.league_id) || []);
  const leaguesWithoutRules = allLeagues.filter(league => !leaguesWithRules.has(league.id));

  console.log(`Leagues with scoring rules: ${leaguesWithRules.size}`);
  console.log(`Leagues without scoring rules: ${leaguesWithoutRules.length}\n`);

  if (leaguesWithoutRules.length === 0) {
    console.log('All leagues already have scoring rules assigned.');
    return;
  }

  console.log('Assigning default scoring rule to leagues without one...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const league of leaguesWithoutRules) {
    const { error: insertError } = await supabase
      .from('league_scoring_rules')
      .insert({
        league_id: league.id,
        scoring_rule_id: defaultRule.id,
        is_active: true,
      });

    if (insertError) {
      console.error(`✗ Failed to assign rule to league "${league.name}":`, insertError.message);
      errorCount++;
    } else {
      console.log(`✓ Assigned default scoring rule to league: ${league.name}`);
      successCount++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Successfully assigned: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total leagues: ${allLeagues.length}`);
  console.log(`Leagues with scoring rules: ${leaguesWithRules.size + successCount}`);
}

// Run the script
assignDefaultScoringRules()
  .then(() => {
    console.log('\nScript completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  });
