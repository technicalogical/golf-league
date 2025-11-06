#!/usr/bin/env tsx

/**
 * Test Match Scoring Integration
 *
 * Comprehensive test suite to verify that matches are properly
 * integrated with scoring rules via the match_scoring_config table.
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

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  const icon = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${icon}\x1b[0m ${name}`);
  if (!passed) {
    console.log(`  ${message}`);
    if (details) {
      console.log(`  Details:`, details);
    }
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('Match Scoring Integration Tests');
  console.log('='.repeat(60) + '\n');

  // Test 1: match_scoring_config table exists and is accessible
  console.log('Test 1: Checking match_scoring_config table...');
  try {
    const { data, error } = await supabaseAdmin
      .from('match_scoring_config')
      .select('*')
      .limit(1);

    if (error) {
      addResult(
        'Table Accessibility',
        false,
        'match_scoring_config table not accessible',
        error
      );
    } else {
      addResult(
        'Table Accessibility',
        true,
        'match_scoring_config table exists and is accessible'
      );
    }
  } catch (error: any) {
    addResult(
      'Table Accessibility',
      false,
      'Exception accessing table',
      error.message
    );
  }

  // Test 2: Check if matches have scoring configs
  console.log('\nTest 2: Checking match coverage...');
  try {
    const { data: matches, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('id, league_id')
      .limit(100);

    if (matchError) {
      addResult(
        'Match Coverage',
        false,
        'Failed to fetch matches',
        matchError
      );
    } else if (!matches || matches.length === 0) {
      addResult(
        'Match Coverage',
        true,
        'No matches in database yet (nothing to test)',
        { matchCount: 0 }
      );
    } else {
      const { data: configs, error: configError } = await supabaseAdmin
        .from('match_scoring_config')
        .select('match_id');

      if (configError) {
        addResult(
          'Match Coverage',
          false,
          'Failed to fetch scoring configs',
          configError
        );
      } else {
        const configMatchIds = new Set(configs?.map(c => c.match_id) || []);
        const matchesWithConfig = matches.filter(m => configMatchIds.has(m.id));
        const coverage = (matchesWithConfig.length / matches.length) * 100;

        addResult(
          'Match Coverage',
          coverage >= 80, // At least 80% of matches should have configs
          coverage >= 80
            ? `${matchesWithConfig.length}/${matches.length} matches have scoring configs (${coverage.toFixed(1)}%)`
            : `Only ${matchesWithConfig.length}/${matches.length} matches have scoring configs (${coverage.toFixed(1)}%). Expected at least 80%.`,
          { total: matches.length, withConfig: matchesWithConfig.length, coverage: `${coverage.toFixed(1)}%` }
        );
      }
    }
  } catch (error: any) {
    addResult(
      'Match Coverage',
      false,
      'Exception checking match coverage',
      error.message
    );
  }

  // Test 3: Verify league matches inherit league scoring rules
  console.log('\nTest 3: Testing league match inheritance...');
  try {
    const { data: leagueMatches, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('id, league_id')
      .not('league_id', 'is', null)
      .limit(50);

    if (matchError) {
      addResult(
        'League Inheritance',
        false,
        'Failed to fetch league matches',
        matchError
      );
    } else if (!leagueMatches || leagueMatches.length === 0) {
      addResult(
        'League Inheritance',
        true,
        'No league matches to test',
        { leagueMatchCount: 0 }
      );
    } else {
      let correctCount = 0;
      let totalCount = 0;

      for (const match of leagueMatches) {
        // Get league's active scoring rule
        const { data: leagueRule } = await supabaseAdmin
          .from('league_scoring_rules')
          .select('scoring_rule_id')
          .eq('league_id', match.league_id)
          .eq('is_active', true)
          .single();

        // Get match's scoring config
        const { data: matchConfig } = await supabaseAdmin
          .from('match_scoring_config')
          .select('scoring_rule_id')
          .eq('match_id', match.id)
          .single();

        if (leagueRule && matchConfig) {
          totalCount++;
          if (leagueRule.scoring_rule_id === matchConfig.scoring_rule_id) {
            correctCount++;
          }
        }
      }

      const percentage = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
      addResult(
        'League Inheritance',
        correctCount === totalCount && totalCount > 0,
        totalCount === 0
          ? 'No league matches with both league rules and match configs'
          : correctCount === totalCount
          ? `All ${totalCount} league matches correctly inherit league scoring rules`
          : `Only ${correctCount}/${totalCount} league matches correctly inherit scoring rules (${percentage.toFixed(1)}%)`,
        { total: totalCount, correct: correctCount }
      );
    }
  } catch (error: any) {
    addResult(
      'League Inheritance',
      false,
      'Exception testing league inheritance',
      error.message
    );
  }

  // Test 4: Verify match configs can be joined with scoring rules
  console.log('\nTest 4: Testing scoring rule joins...');
  try {
    const { data: configsWithRules, error } = await supabaseAdmin
      .from('match_scoring_config')
      .select(`
        *,
        scoring_rule:scoring_rules(
          id,
          name,
          handicap_method,
          hole_points,
          match_bonus_points
        )
      `)
      .limit(10);

    if (error) {
      addResult(
        'Scoring Rule Joins',
        false,
        'Failed to join with scoring_rules table',
        error
      );
    } else if (!configsWithRules || configsWithRules.length === 0) {
      addResult(
        'Scoring Rule Joins',
        true,
        'No match configs to test joins (neutral)',
        { configCount: 0 }
      );
    } else {
      const validJoins = configsWithRules.filter(c => c.scoring_rule !== null);
      const allValid = validJoins.length === configsWithRules.length;

      addResult(
        'Scoring Rule Joins',
        allValid,
        allValid
          ? `All ${configsWithRules.length} match configs successfully join with scoring rules`
          : `Only ${validJoins.length}/${configsWithRules.length} configs have valid scoring rule joins`,
        { total: configsWithRules.length, valid: validJoins.length }
      );
    }
  } catch (error: any) {
    addResult(
      'Scoring Rule Joins',
      false,
      'Exception testing joins',
      error.message
    );
  }

  // Test 5: Check for duplicate configs per match
  console.log('\nTest 5: Checking for duplicate configs...');
  try {
    const { data: configs, error } = await supabaseAdmin
      .from('match_scoring_config')
      .select('match_id');

    if (error) {
      addResult(
        'No Duplicates',
        false,
        'Failed to check for duplicates',
        error
      );
    } else if (!configs || configs.length === 0) {
      addResult(
        'No Duplicates',
        true,
        'No configs to check for duplicates',
        { configCount: 0 }
      );
    } else {
      const matchIdCounts = new Map<string, number>();
      configs.forEach(c => {
        matchIdCounts.set(c.match_id, (matchIdCounts.get(c.match_id) || 0) + 1);
      });

      const duplicates = Array.from(matchIdCounts.entries())
        .filter(([_, count]) => count > 1);

      addResult(
        'No Duplicates',
        duplicates.length === 0,
        duplicates.length === 0
          ? 'No duplicate configs found'
          : `Found ${duplicates.length} matches with duplicate configs`,
        duplicates.length > 0 ? { duplicates: duplicates.slice(0, 5) } : undefined
      );
    }
  } catch (error: any) {
    addResult(
      'No Duplicates',
      false,
      'Exception checking for duplicates',
      error.message
    );
  }

  // Test 6: Verify override fields are properly typed
  console.log('\nTest 6: Testing override field types...');
  try {
    const { data: configs, error } = await supabaseAdmin
      .from('match_scoring_config')
      .select('override_hole_points, override_match_bonus_points, override_max_handicap_difference')
      .limit(20);

    if (error) {
      addResult(
        'Override Fields',
        false,
        'Failed to fetch override fields',
        error
      );
    } else if (!configs || configs.length === 0) {
      addResult(
        'Override Fields',
        true,
        'No configs to test override fields',
        { configCount: 0 }
      );
    } else {
      const invalidFields = configs.filter(c => {
        return (
          (c.override_hole_points !== null && typeof c.override_hole_points !== 'number') ||
          (c.override_match_bonus_points !== null && typeof c.override_match_bonus_points !== 'number') ||
          (c.override_max_handicap_difference !== null && typeof c.override_max_handicap_difference !== 'number')
        );
      });

      addResult(
        'Override Fields',
        invalidFields.length === 0,
        invalidFields.length === 0
          ? 'All override fields have correct types'
          : `Found ${invalidFields.length} configs with invalid override field types`,
        { tested: configs.length, invalid: invalidFields.length }
      );
    }
  } catch (error: any) {
    addResult(
      'Override Fields',
      false,
      'Exception testing override fields',
      error.message
    );
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);

  const passRate = (passed / total) * 100;
  console.log(`\nPass Rate: ${passRate.toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n\x1b[32m✓ All tests passed!\x1b[0m');
  } else {
    console.log('\n\x1b[31m✗ Some tests failed. Please review the issues above.\x1b[0m');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Run tests
runTests();
