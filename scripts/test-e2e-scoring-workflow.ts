#!/usr/bin/env tsx

/**
 * Comprehensive End-to-End Scoring Workflow Test
 *
 * Tests the complete workflow:
 * 1. Admin creates/manages scoring rules
 * 2. League selects scoring rule
 * 3. Match inherits league scoring rule
 * 4. Scorecard uses scoring engine to calculate results
 * 5. Different scoring rules produce different results
 *
 * This test verifies all integrations work correctly.
 */

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
let testLeagueId: string | null = null;
let testMatchId: string | null = null;

function logResult(test: string, passed: boolean, message: string, details?: any) {
  results.push({ test, passed, message, details });
  const icon = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${icon}\x1b[0m ${test}: ${message}`);
  if (details) {
    console.log('  Details:', JSON.stringify(details, null, 2));
  }
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70) + '\n');
}

async function testScoringRulesExist() {
  logSection('STEP 1: Verify Scoring Rules System');

  // Test 1.1: Check that scoring rules exist
  const { data: rules, error } = await supabase
    .from('scoring_rules')
    .select('*')
    .eq('is_active', true);

  if (error) {
    logResult('Scoring Rules Exist', false, 'Failed to fetch scoring rules', error);
    return null;
  }

  if (!rules || rules.length === 0) {
    logResult('Scoring Rules Exist', false, 'No active scoring rules found', null);
    return null;
  }

  logResult('Scoring Rules Exist', true, `Found ${rules.length} active scoring rules`);

  console.log('\n  Available Scoring Rules:');
  rules.forEach((rule, index) => {
    console.log(`  ${index + 1}. ${rule.name}`);
    console.log(`     - Handicap: ${rule.handicap_method}`);
    console.log(`     - Stroke Holes: ${rule.stroke_holes}`);
    console.log(`     - Points per Hole: ${rule.hole_points}`);
    console.log(`     - Match Bonus: ${rule.match_bonus_points}`);
    console.log(`     - Point Method: ${rule.point_method}`);
  });

  // Test 1.2: Verify default rule exists
  const defaultRule = rules.find(r => r.is_system_default);
  logResult(
    'Default Rule Exists',
    !!defaultRule,
    defaultRule ? `Default rule: ${defaultRule.name}` : 'No default rule found',
    defaultRule
  );

  // Test 1.3: Verify we have diverse scoring rules
  const uniqueHandicapMethods = new Set(rules.map(r => r.handicap_method));
  const uniquePointMethods = new Set(rules.map(r => r.point_method));

  logResult(
    'Diverse Scoring Rules',
    uniqueHandicapMethods.size >= 2 && uniquePointMethods.size >= 1,
    `${uniqueHandicapMethods.size} handicap methods, ${uniquePointMethods.size} point methods`,
    { handicapMethods: Array.from(uniqueHandicapMethods), pointMethods: Array.from(uniquePointMethods) }
  );

  return rules;
}

async function testLeagueScoringAssignment() {
  logSection('STEP 2: Test League Scoring Rule Assignment');

  // Get a test league - prefer one with matches
  let leagues = null;
  let leagueError = null;

  // First, try to find a league with matches
  const { data: allLeagues } = await supabase
    .from('leagues')
    .select('id, name');

  if (allLeagues && allLeagues.length > 0) {
    for (const league of allLeagues) {
      const { data: matches } = await supabase
        .from('matches')
        .select('id')
        .eq('league_id', league.id)
        .limit(1);

      if (matches && matches.length > 0) {
        leagues = league;
        break;
      }
    }

    // If no league has matches, just use the first one
    if (!leagues) {
      leagues = allLeagues[0];
    }
  } else {
    leagueError = { message: 'No leagues found' };
  }

  if (leagueError || !leagues) {
    logResult('Get Test League', false, 'No leagues found for testing', leagueError);
    return null;
  }

  testLeagueId = leagues.id;
  logResult('Get Test League', true, `Testing with league: ${leagues.name}`, { leagueId: leagues.id });

  // Test 2.1: Check league has a scoring rule assigned
  const { data: leagueRule, error: ruleError } = await supabase
    .from('league_scoring_rules')
    .select(`
      *,
      scoring_rule:scoring_rules(*)
    `)
    .eq('league_id', leagues.id)
    .eq('is_active', true)
    .single();

  if (ruleError || !leagueRule) {
    logResult('League Has Scoring Rule', false, 'League does not have an active scoring rule', ruleError);
    return null;
  }

  logResult(
    'League Has Scoring Rule',
    true,
    `League uses: ${(leagueRule as any).scoring_rule?.name}`,
    { ruleId: leagueRule.scoring_rule_id }
  );

  // Test 2.2: Verify only one active rule per league
  const { data: allLeagueRules, error: allRulesError } = await supabase
    .from('league_scoring_rules')
    .select('id')
    .eq('league_id', leagues.id)
    .eq('is_active', true);

  logResult(
    'Unique Active Rule',
    allLeagueRules?.length === 1,
    allLeagueRules?.length === 1
      ? 'League has exactly one active scoring rule'
      : `League has ${allLeagueRules?.length} active rules (should be 1)`,
    { activeRules: allLeagueRules?.length }
  );

  return leagueRule;
}

async function testMatchInheritsLeagueRule(leagueId: string) {
  logSection('STEP 3: Test Match Inherits League Scoring Rule');

  // Get a match from this league
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('id, league_id')
    .eq('league_id', leagueId)
    .limit(1)
    .single();

  if (matchError || !matches) {
    logResult('Get Test Match', false, 'No matches found for this league', matchError);
    return null;
  }

  testMatchId = matches.id;
  logResult('Get Test Match', true, `Testing with match ID: ${matches.id}`);

  // Test 3.1: Check match has scoring config
  const { data: matchConfig, error: configError } = await supabase
    .from('match_scoring_config')
    .select(`
      *,
      scoring_rule:scoring_rules(*)
    `)
    .eq('match_id', matches.id)
    .single();

  if (configError || !matchConfig) {
    logResult('Match Has Scoring Config', false, 'Match does not have a scoring config', configError);
    return null;
  }

  logResult(
    'Match Has Scoring Config',
    true,
    `Match uses: ${(matchConfig as any).scoring_rule?.name}`,
    { ruleId: matchConfig.scoring_rule_id }
  );

  // Test 3.2: Verify match rule matches league rule
  const { data: leagueRule, error: leagueRuleError } = await supabase
    .from('league_scoring_rules')
    .select('scoring_rule_id')
    .eq('league_id', leagueId)
    .eq('is_active', true)
    .single();

  if (leagueRule) {
    const rulesMatch = matchConfig.scoring_rule_id === leagueRule.scoring_rule_id;
    logResult(
      'Match Inherits League Rule',
      rulesMatch,
      rulesMatch
        ? 'Match correctly inherits league scoring rule'
        : 'Match scoring rule does not match league rule',
      { matchRuleId: matchConfig.scoring_rule_id, leagueRuleId: leagueRule.scoring_rule_id }
    );
  }

  return matchConfig;
}

async function testScoringEngineCalculations() {
  logSection('STEP 4: Test Scoring Engine Calculations');

  // Get all active scoring rules
  const { data: rules, error } = await supabase
    .from('scoring_rules')
    .select('*')
    .eq('is_active', true);

  if (error || !rules || rules.length === 0) {
    logResult('Get Rules for Testing', false, 'No rules available for calculation tests', error);
    return;
  }

  logResult('Get Rules for Testing', true, `Testing calculations with ${rules.length} rules`);

  const engine = new ScoringEngine();

  // Create test players
  const player1 = { id: 'p1', name: 'Player 1', handicap: 10 };
  const player2 = { id: 'p2', name: 'Player 2', handicap: 5 };

  console.log('\n  Test Players:');
  console.log(`    Player 1: Handicap ${player1.handicap}`);
  console.log(`    Player 2: Handicap ${player2.handicap}`);
  console.log(`    Handicap Difference: ${Math.abs(player1.handicap - player2.handicap)}`);

  const calculations: any[] = [];

  // Test each scoring rule
  for (const rule of rules) {
    console.log(`\n  Testing Rule: ${rule.name}`);

    try {
      const handicapCalc = engine.calculateHandicapStrokes(
        player1,
        player2,
        rule as ScoringRule
      );

      console.log(`    Handicap Method: ${rule.handicap_method}`);
      console.log(`    Player 1 gets: ${handicapCalc.player1_strokes} strokes`);
      console.log(`    Player 2 gets: ${handicapCalc.player2_strokes} strokes`);

      calculations.push({
        ruleName: rule.name,
        handicapMethod: rule.handicap_method,
        player1Strokes: handicapCalc.player1_strokes,
        player2Strokes: handicapCalc.player2_strokes
      });

      logResult(
        `Calculate: ${rule.name}`,
        true,
        'Successfully calculated handicap strokes',
        { strokes: handicapCalc }
      );
    } catch (err: any) {
      logResult(
        `Calculate: ${rule.name}`,
        false,
        'Failed to calculate handicap strokes',
        { error: err.message }
      );
    }
  }

  // Test 4.1: Verify different rules produce different results
  const uniqueCalculations = new Set(
    calculations.map(c => `${c.player1Strokes},${c.player2Strokes}`)
  );

  logResult(
    'Different Rules Produce Different Results',
    uniqueCalculations.size > 1,
    uniqueCalculations.size > 1
      ? `${uniqueCalculations.size} unique calculation results from ${calculations.length} rules`
      : 'All rules produce the same results (may indicate a problem)',
    { calculations }
  );

  return calculations;
}

async function testFullMatchCalculation() {
  logSection('STEP 5: Test Full Match Calculation');

  // Get a scoring rule
  const { data: rule, error } = await supabase
    .from('scoring_rules')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error || !rule) {
    logResult('Get Rule for Match Test', false, 'No scoring rule available', error);
    return;
  }

  logResult('Get Rule for Match Test', true, `Testing with: ${rule.name}`);

  // Create sample match data
  const player1 = { id: 'p1', name: 'Player 1', handicap: 12 };
  const player2 = { id: 'p2', name: 'Player 2', handicap: 8 };

  const course = {
    id: 'c1',
    holes: Array.from({ length: 18 }, (_, i) => ({
      hole_number: i + 1,
      par: i % 5 === 0 ? 5 : i % 3 === 0 ? 3 : 4,
      handicap_ranking: ((i * 7) % 18) + 1 // Mix up the handicap rankings
    }))
  };

  // Generate sample scores (player 1 scores slightly worse)
  const player1Scores = {
    player: player1,
    scores: course.holes.map(h => ({
      hole_number: h.hole_number,
      gross_score: h.par + (Math.random() > 0.5 ? 1 : 0)
    }))
  };

  const player2Scores = {
    player: player2,
    scores: course.holes.map(h => ({
      hole_number: h.hole_number,
      gross_score: h.par
    }))
  };

  console.log('\n  Match Setup:');
  console.log(`    Player 1: HCP ${player1.handicap}`);
  console.log(`    Player 2: HCP ${player2.handicap}`);
  console.log(`    Course: 18 holes`);

  const engine = new ScoringEngine();

  try {
    const matchResult = engine.calculateMatchResult(
      player1Scores,
      player2Scores,
      course,
      rule as ScoringRule
    );

    console.log('\n  Match Result:');
    console.log(`    Player 1 Points: ${matchResult.player1_total_points}`);
    console.log(`    Player 2 Points: ${matchResult.player2_total_points}`);
    console.log(`    Winner: ${matchResult.match_winner}`);
    console.log(`    Bonus Points: P1=${matchResult.bonus_points?.player1 || 0}, P2=${matchResult.bonus_points?.player2 || 0}`);
    console.log(`    Holes Won: P1=${matchResult.hole_results.filter(h => h.winner === 'player1').length}, P2=${matchResult.hole_results.filter(h => h.winner === 'player2').length}`);

    logResult(
      'Full Match Calculation',
      true,
      'Successfully calculated complete match result',
      {
        winner: matchResult.match_winner,
        points: {
          player1: matchResult.player1_total_points,
          player2: matchResult.player2_total_points
        }
      }
    );

    return matchResult;
  } catch (err: any) {
    logResult(
      'Full Match Calculation',
      false,
      'Failed to calculate match result',
      { error: err.message }
    );
    return null;
  }
}

async function testDifferentScoringMethodsProduceDifferentResults() {
  logSection('STEP 6: Compare Different Scoring Methods');

  // Get rules with different handicap methods
  const { data: rules, error } = await supabase
    .from('scoring_rules')
    .select('*')
    .eq('is_active', true);

  if (error || !rules || rules.length < 2) {
    logResult(
      'Compare Scoring Methods',
      false,
      'Need at least 2 rules to compare',
      { rulesCount: rules?.length || 0 }
    );
    return;
  }

  // Use same players and course for all tests
  const player1 = { id: 'p1', name: 'Player 1', handicap: 15 };
  const player2 = { id: 'p2', name: 'Player 2', handicap: 5 };

  const course = {
    id: 'c1',
    holes: Array.from({ length: 9 }, (_, i) => ({
      hole_number: i + 1,
      par: 4,
      handicap_ranking: i + 1
    }))
  };

  const player1Scores = {
    player: player1,
    scores: course.holes.map(h => ({
      hole_number: h.hole_number,
      gross_score: 5 // Player 1 consistently scores 1 over par
    }))
  };

  const player2Scores = {
    player: player2,
    scores: course.holes.map(h => ({
      hole_number: h.hole_number,
      gross_score: 4 // Player 2 consistently pars
    }))
  };

  const engine = new ScoringEngine();
  const comparisonResults: any[] = [];

  console.log('\n  Comparing Rules with Same Match Data:');
  console.log(`    Player 1: HCP ${player1.handicap}, scoring 5 on each hole`);
  console.log(`    Player 2: HCP ${player2.handicap}, scoring 4 on each hole`);

  for (const rule of rules) {
    try {
      const result = engine.calculateMatchResult(
        player1Scores,
        player2Scores,
        course,
        rule as ScoringRule
      );

      console.log(`\n    Rule: ${rule.name}`);
      console.log(`      Handicap Method: ${rule.handicap_method}`);
      console.log(`      P1 Points: ${result.player1_total_points}, P2 Points: ${result.player2_total_points}`);
      console.log(`      Winner: ${result.match_winner}`);

      comparisonResults.push({
        ruleName: rule.name,
        handicapMethod: rule.handicap_method,
        holePoints: rule.hole_points,
        player1Points: result.player1_total_points,
        player2Points: result.player2_total_points,
        winner: result.match_winner
      });
    } catch (err) {
      console.log(`\n    Rule: ${rule.name} - FAILED`);
    }
  }

  // Verify we got different results
  const uniqueResults = new Set(
    comparisonResults.map(r => `${r.player1Points},${r.player2Points},${r.winner}`)
  );

  logResult(
    'Different Scoring Methods Produce Different Results',
    uniqueResults.size > 1,
    uniqueResults.size > 1
      ? `${uniqueResults.size} unique outcomes from ${comparisonResults.length} scoring methods`
      : 'All scoring methods produced identical results',
    { comparisonResults }
  );

  // Verify handicap methods affect stroke allocation
  const strokeAllocations = comparisonResults.map(r => ({
    rule: r.ruleName,
    method: r.handicapMethod,
    result: r.winner
  }));

  console.log('\n  Handicap Method Impact:');
  strokeAllocations.forEach(s => {
    console.log(`    ${s.rule} (${s.method}): ${s.result} wins`);
  });

  return comparisonResults;
}

async function testDataIntegrity() {
  logSection('STEP 7: Test Data Integrity');

  // Test 7.1: Check for orphaned league scoring rules
  const { data: orphanedLeagueRules } = await supabase
    .from('league_scoring_rules')
    .select('id, league_id, scoring_rule_id')
    .is('scoring_rule_id', null);

  logResult(
    'No Orphaned League Rules',
    !orphanedLeagueRules || orphanedLeagueRules.length === 0,
    orphanedLeagueRules && orphanedLeagueRules.length > 0
      ? `Found ${orphanedLeagueRules.length} league rules with null scoring_rule_id`
      : 'All league rules have valid scoring rule references',
    { orphanedCount: orphanedLeagueRules?.length || 0 }
  );

  // Test 7.2: Check for orphaned match configs
  const { data: orphanedMatchConfigs } = await supabase
    .from('match_scoring_config')
    .select('id, match_id, scoring_rule_id')
    .is('scoring_rule_id', null);

  logResult(
    'No Orphaned Match Configs',
    !orphanedMatchConfigs || orphanedMatchConfigs.length === 0,
    orphanedMatchConfigs && orphanedMatchConfigs.length > 0
      ? `Found ${orphanedMatchConfigs.length} match configs with null scoring_rule_id`
      : 'All match configs have valid scoring rule references',
    { orphanedCount: orphanedMatchConfigs?.length || 0 }
  );

  // Test 7.3: Check for duplicate active rules per league
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, name')
    .limit(10);

  if (leagues) {
    let duplicatesFound = 0;
    for (const league of leagues) {
      const { data: activeRules } = await supabase
        .from('league_scoring_rules')
        .select('id')
        .eq('league_id', league.id)
        .eq('is_active', true);

      if (activeRules && activeRules.length > 1) {
        duplicatesFound++;
      }
    }

    logResult(
      'No Duplicate Active Rules',
      duplicatesFound === 0,
      duplicatesFound > 0
        ? `${duplicatesFound} leagues have multiple active scoring rules`
        : 'All leagues have at most one active scoring rule',
      { duplicatesFound }
    );
  }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(70));
  console.log('END-TO-END SCORING WORKFLOW TEST SUITE');
  console.log('═'.repeat(70));
  console.log('\nThis test validates the complete scoring workflow:');
  console.log('  1. Scoring rules exist and are diverse');
  console.log('  2. Leagues have scoring rules assigned');
  console.log('  3. Matches inherit league scoring rules');
  console.log('  4. Scoring engine calculates correctly');
  console.log('  5. Different rules produce different results');
  console.log('  6. Data integrity is maintained');
  console.log('\n');

  // Run all test suites
  await testScoringRulesExist();

  const leagueRule = await testLeagueScoringAssignment();

  if (testLeagueId) {
    await testMatchInheritsLeagueRule(testLeagueId);
  }

  await testScoringEngineCalculations();
  await testFullMatchCalculation();
  await testDifferentScoringMethodsProduceDifferentResults();
  await testDataIntegrity();

  // Summary
  logSection('TEST SUMMARY');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`Total Tests: ${totalTests}`);
  console.log(`\x1b[32mPassed: ${passedTests}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failedTests}\x1b[0m`);
  console.log(`Pass Rate: ${passRate}%`);

  if (failedTests > 0) {
    console.log('\n\x1b[31mFailed Tests:\x1b[0m');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ ${r.test}: ${r.message}`);
    });
    console.log('\n\x1b[33mAction Required: Review and fix the failed tests above.\x1b[0m');
  } else {
    console.log('\n\x1b[32m✓ All tests passed! The end-to-end scoring workflow is fully functional.\x1b[0m');
  }

  console.log('\n' + '═'.repeat(70) + '\n');

  return failedTests === 0;
}

// Run all tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n\x1b[31m✗ Fatal error:\x1b[0m', error);
    process.exit(1);
  });
