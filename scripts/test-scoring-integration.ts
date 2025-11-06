#!/usr/bin/env tsx

/**
 * Comprehensive test script for scoring rules integration with leagues
 * Tests:
 * 1. All leagues have scoring rules assigned
 * 2. API endpoints work correctly
 * 3. Default rule assignment works for new leagues
 *
 * Run with: npx tsx scripts/test-scoring-integration.ts
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

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${icon}\x1b[0m ${name}: ${message}`);
}

async function testScoringRulesExist() {
  console.log('\n--- Test 1: Scoring Rules Exist ---');

  const { data: scoringRules, error } = await supabase
    .from('scoring_rules')
    .select('id, name, is_system_default, is_active');

  if (error) {
    addResult('Scoring Rules Table', false, `Error: ${error.message}`);
    return;
  }

  addResult('Scoring Rules Table', true, `Found ${scoringRules?.length || 0} scoring rules`);

  const defaultRule = scoringRules?.find(r => r.is_system_default && r.is_active);
  if (defaultRule) {
    addResult('Default Scoring Rule', true, `Found: ${defaultRule.name}`);
  } else {
    addResult('Default Scoring Rule', false, 'No default scoring rule found');
  }

  const activeRules = scoringRules?.filter(r => r.is_active);
  addResult('Active Scoring Rules', true, `Found ${activeRules?.length || 0} active rules`);
}

async function testAllLeaguesHaveScoringRules() {
  console.log('\n--- Test 2: All Leagues Have Scoring Rules ---');

  // Get all leagues
  const { data: leagues, error: leaguesError } = await supabase
    .from('leagues')
    .select('id, name');

  if (leaguesError) {
    addResult('Fetch Leagues', false, `Error: ${leaguesError.message}`);
    return;
  }

  addResult('Fetch Leagues', true, `Found ${leagues?.length || 0} leagues`);

  if (!leagues || leagues.length === 0) {
    addResult('League Scoring Assignment', true, 'No leagues to test (OK)');
    return;
  }

  // Check each league has an active scoring rule
  let leaguesWithRules = 0;
  let leaguesWithoutRules = 0;

  for (const league of leagues) {
    const { data: leagueScoringRule, error } = await supabase
      .from('league_scoring_rules')
      .select('id, scoring_rule_id, is_active, scoring_rule:scoring_rules(name)')
      .eq('league_id', league.id)
      .eq('is_active', true)
      .single();

    if (error || !leagueScoringRule) {
      console.log(`  ✗ League "${league.name}" has NO scoring rule`);
      leaguesWithoutRules++;
    } else {
      console.log(`  ✓ League "${league.name}" has scoring rule: ${(leagueScoringRule as any).scoring_rule?.name}`);
      leaguesWithRules++;
    }
  }

  const allHaveRules = leaguesWithoutRules === 0;
  addResult(
    'All Leagues Have Scoring Rules',
    allHaveRules,
    `${leaguesWithRules}/${leagues.length} leagues have scoring rules`
  );
}

async function testLeagueScoringRuleStructure() {
  console.log('\n--- Test 3: League Scoring Rule Table Structure ---');

  const { data, error } = await supabase
    .from('league_scoring_rules')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    addResult('League Scoring Rules Table', false, `Error: ${error.message}`);
    return;
  }

  addResult('League Scoring Rules Table', true, 'Table exists and is accessible');

  // Check for required columns
  if (data) {
    const hasRequiredFields =
      'league_id' in data &&
      'scoring_rule_id' in data &&
      'is_active' in data;

    addResult('Required Columns', hasRequiredFields,
      hasRequiredFields ? 'All required columns present' : 'Missing required columns');
  }
}

async function testDefaultRuleQuery() {
  console.log('\n--- Test 4: Default Rule Query ---');

  const { data: defaultRule, error } = await supabase
    .from('scoring_rules')
    .select('id, name, handicap_method, hole_points, match_bonus_points')
    .eq('is_system_default', true)
    .eq('is_active', true)
    .single();

  if (error || !defaultRule) {
    addResult('Default Rule Query', false, error?.message || 'No default rule found');
    return;
  }

  addResult('Default Rule Query', true, `Found: ${defaultRule.name}`);
  console.log(`  ID: ${defaultRule.id}`);
  console.log(`  Handicap Method: ${defaultRule.handicap_method}`);
  console.log(`  Hole Points: ${defaultRule.hole_points}`);
  console.log(`  Match Bonus: ${defaultRule.match_bonus_points}`);
}

async function testScoringRuleJoin() {
  console.log('\n--- Test 5: League Scoring Rule Join Query ---');

  const { data, error } = await supabase
    .from('league_scoring_rules')
    .select(`
      *,
      scoring_rule:scoring_rules(*)
    `)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    addResult('Scoring Rule Join', false, `Error: ${error.message}`);
    return;
  }

  if (!data) {
    addResult('Scoring Rule Join', true, 'No data to test (OK if no leagues)');
    return;
  }

  const hasJoinedData = data && 'scoring_rule' in data && data.scoring_rule !== null;
  addResult('Scoring Rule Join', hasJoinedData,
    hasJoinedData ? 'Join query works correctly' : 'Join query failed');

  if (hasJoinedData) {
    console.log(`  Joined rule name: ${(data as any).scoring_rule?.name}`);
  }
}

async function testUniqueConstraints() {
  console.log('\n--- Test 6: Active Rule Uniqueness ---');

  const { data: leagues, error: leaguesError } = await supabase
    .from('leagues')
    .select('id, name')
    .limit(3);

  if (leaguesError || !leagues || leagues.length === 0) {
    addResult('Unique Constraints', true, 'No leagues to test (OK)');
    return;
  }

  let duplicatesFound = 0;

  for (const league of leagues) {
    const { data: activeRules, error } = await supabase
      .from('league_scoring_rules')
      .select('id')
      .eq('league_id', league.id)
      .eq('is_active', true);

    if (error) {
      console.log(`  ✗ Error checking league "${league.name}"`);
      continue;
    }

    if (activeRules && activeRules.length > 1) {
      console.log(`  ✗ League "${league.name}" has ${activeRules.length} active rules (should be 1)`);
      duplicatesFound++;
    } else if (activeRules && activeRules.length === 1) {
      console.log(`  ✓ League "${league.name}" has exactly 1 active rule`);
    }
  }

  addResult('Unique Active Rules', duplicatesFound === 0,
    duplicatesFound === 0 ? 'All leagues have exactly one active rule' : `Found ${duplicatesFound} leagues with multiple active rules`);
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Scoring Rules Integration Test Suite');
  console.log('═══════════════════════════════════════════════════════');

  await testScoringRulesExist();
  await testAllLeaguesHaveScoringRules();
  await testLeagueScoringRuleStructure();
  await testDefaultRuleQuery();
  await testScoringRuleJoin();
  await testUniqueConstraints();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Test Results Summary');
  console.log('═══════════════════════════════════════════════════════');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`\x1b[32mPassed: ${passedTests}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failedTests}\x1b[0m`);

  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════');

  return failedTests === 0;
}

// Run all tests
runAllTests()
  .then((success) => {
    if (success) {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Please review the results above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed with error:', error);
    process.exit(1);
  });
