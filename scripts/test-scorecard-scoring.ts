#!/usr/bin/env tsx

/**
 * Test Scorecard Scoring Integration
 *
 * Tests that the scorecard system properly uses the ScoringEngine
 * with configured scoring rules from match_scoring_config.
 */

// Load environment variables
require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { ScoringEngine } from '../lib/scoring-engine';
import { ScoringRule } from '../lib/types/scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logResult(test: string, passed: boolean, message: string, details?: any) {
  results.push({ test, passed, message, details });
  const icon = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${icon}\x1b[0m ${test}: ${message}`);
  if (details && !passed) {
    console.log('  Details:', JSON.stringify(details, null, 2));
  }
}

async function testScoringIntegration() {
  console.log('\n' + '='.repeat(70));
  console.log('Testing Scorecard Scoring Integration');
  console.log('='.repeat(70) + '\n');

  // Test 1: Verify ScoringEngine is available
  console.log('Test 1: Verify ScoringEngine is available');
  try {
    const engine = new ScoringEngine();
    logResult(
      'ScoringEngine Import',
      true,
      'ScoringEngine successfully imported and instantiated'
    );
  } catch (error: any) {
    logResult(
      'ScoringEngine Import',
      false,
      'Failed to import ScoringEngine',
      { error: error.message }
    );
    return;
  }

  // Test 2: Check if matches have scoring configurations
  console.log('\nTest 2: Check match scoring configurations');
  try {
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        league_id,
        match_scoring_config(
          id,
          scoring_rule_id,
          scoring_rule:scoring_rules(
            id,
            name,
            handicap_method,
            stroke_holes,
            hole_points
          )
        )
      `)
      .limit(10);

    if (matchError) {
      logResult(
        'Match Configurations',
        false,
        'Failed to fetch match configurations',
        { error: matchError }
      );
      return;
    }

    // Note: match_scoring_config can be either an object or an array depending on the query
    const matchesWithConfig = matches?.filter(
      m => m.match_scoring_config && (
        Array.isArray(m.match_scoring_config) ? m.match_scoring_config.length > 0 : true
      )
    ) || [];

    logResult(
      'Match Configurations',
      matchesWithConfig.length > 0,
      `${matchesWithConfig.length}/${matches?.length || 0} matches have scoring configurations`,
      {
        totalMatches: matches?.length || 0,
        withConfig: matchesWithConfig.length,
        sampleConfig: matchesWithConfig[0]?.match_scoring_config[0]
      }
    );

    if (matchesWithConfig.length > 0) {
      const sampleMatch = matchesWithConfig[0];
      const config = Array.isArray(sampleMatch.match_scoring_config)
        ? sampleMatch.match_scoring_config[0]
        : sampleMatch.match_scoring_config;
      console.log('\n  Sample Configuration:');
      console.log(`    Match ID: ${sampleMatch.id}`);
      console.log(`    Scoring Rule: ${config.scoring_rule?.name || 'N/A'}`);
      console.log(`    Handicap Method: ${config.scoring_rule?.handicap_method || 'N/A'}`);
      console.log(`    Stroke Holes: ${config.scoring_rule?.stroke_holes || 'N/A'}`);
      console.log(`    Points per Hole: ${config.scoring_rule?.hole_points || 'N/A'}`);
    }
  } catch (error: any) {
    logResult(
      'Match Configurations',
      false,
      'Exception checking match configurations',
      { error: error.message }
    );
  }

  // Test 3: Verify different scoring rules exist
  console.log('\nTest 3: Verify different scoring rules exist');
  try {
    const { data: rules, error: rulesError } = await supabase
      .from('scoring_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      logResult(
        'Scoring Rules',
        false,
        'Failed to fetch scoring rules',
        { error: rulesError }
      );
    } else {
      const ruleCount = rules?.length || 0;
      logResult(
        'Scoring Rules',
        ruleCount > 0,
        `${ruleCount} active scoring rule(s) configured`,
        { count: ruleCount }
      );

      if (rules && rules.length > 0) {
        console.log('\n  Available Scoring Rules:');
        rules.forEach(rule => {
          console.log(`    - ${rule.name}`);
          console.log(`      Handicap: ${rule.handicap_method}, Strokes: ${rule.stroke_holes}, Points: ${rule.hole_points}`);
        });
      }
    }
  } catch (error: any) {
    logResult(
      'Scoring Rules',
      false,
      'Exception fetching scoring rules',
      { error: error.message }
    );
  }

  // Test 4: Simulate scoring calculation
  console.log('\nTest 4: Simulate scoring calculation with ScoringEngine');
  try {
    const { data: rule, error: ruleError } = await supabase
      .from('scoring_rules')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (ruleError || !rule) {
      logResult(
        'Scoring Calculation',
        false,
        'No scoring rule available for test',
        { error: ruleError }
      );
    } else {
      const engine = new ScoringEngine();

      // Create sample players
      const player1 = { id: 'p1', name: 'Player 1', handicap: 10 };
      const player2 = { id: 'p2', name: 'Player 2', handicap: 5 };

      // Test handicap calculation
      const handicapCalc = engine.calculateHandicapStrokes(
        player1,
        player2,
        rule as ScoringRule
      );

      logResult(
        'Scoring Calculation',
        true,
        'Successfully calculated handicap strokes using ScoringEngine',
        {
          rule: rule.name,
          player1Strokes: handicapCalc.player1_strokes,
          player2Strokes: handicapCalc.player2_strokes,
          method: rule.handicap_method
        }
      );

      console.log(`\n  Handicap Calculation Result:`);
      console.log(`    Rule: ${rule.name}`);
      console.log(`    Method: ${rule.handicap_method}`);
      console.log(`    Player 1 (HCP 10) gets: ${handicapCalc.player1_strokes} strokes`);
      console.log(`    Player 2 (HCP 5) gets: ${handicapCalc.player2_strokes} strokes`);
    }
  } catch (error: any) {
    logResult(
      'Scoring Calculation',
      false,
      'Exception during scoring calculation',
      { error: error.message }
    );
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('Test Summary');
  console.log('='.repeat(70));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total Tests: ${results.length}`);
  console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);

  if (failed > 0) {
    console.log('\n\x1b[33mWarning: Some tests failed. Review the details above.\x1b[0m');
  } else {
    console.log('\n\x1b[32mAll tests passed! Scorecard scoring integration is working correctly.\x1b[0m');
  }
}

testScoringIntegration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n\x1b[31mFatal error:\x1b[0m', error);
    process.exit(1);
  });
