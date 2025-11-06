#!/usr/bin/env tsx

/**
 * Backfill Match Scoring Configs
 *
 * This script creates match_scoring_config entries for existing matches
 * that don't have one yet. It attempts to inherit the scoring rule from
 * the match's league if available, or uses the system default.
 */

// Load environment variables FIRST
require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

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

interface Match {
  id: string;
  league_id: string | null;
}

interface LeagueScoringRule {
  scoring_rule_id: string;
  override_hole_points: number | null;
  override_match_bonus_points: number | null;
  override_max_handicap_difference: number | null;
}

async function backfillMatchScoringConfigs() {
  console.log('Starting backfill of match scoring configs...\n');

  try {
    // Step 1: Find all matches without a scoring config
    console.log('Step 1: Finding matches without scoring configs...');

    const { data: allMatches, error: matchesError } = await supabaseAdmin
      .from('matches')
      .select('id, league_id')
      .order('created_at', { ascending: true });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      process.exit(1);
    }

    console.log(`Found ${allMatches?.length || 0} total matches`);

    // Step 2: Check which matches already have scoring configs
    const { data: existingConfigs, error: configsError } = await supabaseAdmin
      .from('match_scoring_config')
      .select('match_id');

    if (configsError) {
      console.error('Error fetching existing configs:', configsError);
      process.exit(1);
    }

    const existingMatchIds = new Set(existingConfigs?.map(c => c.match_id) || []);
    const matchesWithoutConfig = allMatches?.filter(m => !existingMatchIds.has(m.id)) || [];

    console.log(`Found ${matchesWithoutConfig.length} matches without scoring configs`);

    if (matchesWithoutConfig.length === 0) {
      console.log('\nNo matches need backfilling. All done!');
      return;
    }

    // Step 3: Get the system default scoring rule (fallback)
    const { data: defaultRule, error: defaultError } = await supabaseAdmin
      .from('scoring_rules')
      .select('id')
      .eq('is_system_default', true)
      .eq('is_active', true)
      .single();

    if (defaultError || !defaultRule) {
      console.error('Error: No system default scoring rule found!');
      console.error('Please ensure at least one scoring rule is marked as system default.');
      process.exit(1);
    }

    console.log(`System default scoring rule: ${defaultRule.id}\n`);

    // Step 4: Process each match
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ matchId: string; error: string }> = [];

    for (const match of matchesWithoutConfig) {
      try {
        let scoringRuleId = defaultRule.id;
        let overrideHolePoints = null;
        let overrideMatchBonusPoints = null;
        let overrideMaxHandicapDifference = null;

        // If match has a league, try to get the league's scoring rule
        if (match.league_id) {
          const { data: leagueScoringRule } = await supabaseAdmin
            .from('league_scoring_rules')
            .select('scoring_rule_id, override_hole_points, override_match_bonus_points, override_max_handicap_difference')
            .eq('league_id', match.league_id)
            .eq('is_active', true)
            .single();

          if (leagueScoringRule) {
            scoringRuleId = leagueScoringRule.scoring_rule_id;
            overrideHolePoints = leagueScoringRule.override_hole_points;
            overrideMatchBonusPoints = leagueScoringRule.override_match_bonus_points;
            overrideMaxHandicapDifference = leagueScoringRule.override_max_handicap_difference;
          }
        }

        // Create the match scoring config
        const { error: insertError } = await supabaseAdmin
          .from('match_scoring_config')
          .insert({
            match_id: match.id,
            scoring_rule_id: scoringRuleId,
            override_hole_points: overrideHolePoints,
            override_match_bonus_points: overrideMatchBonusPoints,
            override_max_handicap_difference: overrideMaxHandicapDifference,
            is_tournament_match: false,
            tournament_multiplier: 1.0,
          });

        if (insertError) {
          console.error(`Error creating config for match ${match.id}:`, insertError);
          errorCount++;
          errors.push({ matchId: match.id, error: insertError.message });
        } else {
          successCount++;
          const source = match.league_id ? 'league rule' : 'default rule';
          console.log(`Created config for match ${match.id} (using ${source})`);
        }
      } catch (error: any) {
        console.error(`Exception processing match ${match.id}:`, error.message);
        errorCount++;
        errors.push({ matchId: match.id, error: error.message });
      }
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('Backfill Summary');
    console.log('='.repeat(60));
    console.log(`Total matches processed: ${matchesWithoutConfig.length}`);
    console.log(`Successfully created: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(({ matchId, error }) => {
        console.log(`  - Match ${matchId}: ${error}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    // Step 6: Verify the results
    console.log('\nVerifying backfill results...');
    const { data: finalConfigs, error: verifyError } = await supabaseAdmin
      .from('match_scoring_config')
      .select('match_id');

    if (verifyError) {
      console.error('Error verifying results:', verifyError);
    } else {
      const configCount = finalConfigs?.length || 0;
      const totalMatches = allMatches?.length || 0;
      console.log(`Total matches: ${totalMatches}`);
      console.log(`Matches with scoring configs: ${configCount}`);

      if (configCount === totalMatches) {
        console.log('\nSuccess! All matches now have scoring configs.');
      } else {
        console.log(`\nWarning: ${totalMatches - configCount} matches still missing configs.`);
      }
    }

  } catch (error: any) {
    console.error('Fatal error during backfill:', error);
    process.exit(1);
  }
}

// Run the backfill
backfillMatchScoringConfigs();
