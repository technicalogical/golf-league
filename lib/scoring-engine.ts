import {
  ScoringRule,
  HandicapCalculation,
  HoleResult,
  MatchResult,
  MatchScoringConfig,
  LeagueScoringRule
} from './types/scoring';

export interface Player {
  id: string;
  name: string;
  handicap: number;
}

export interface Course {
  id: string;
  holes: CourseHole[];
}

export interface CourseHole {
  hole_number: number;
  par: number;
  handicap_ranking: number; // 1-18, 1 being hardest hole
}

export interface HoleScore {
  hole_number: number;
  gross_score: number;
}

export interface PlayerScores {
  player: Player;
  scores: HoleScore[];
}

/**
 * Main scoring calculation engine
 * Applies scoring rules to match data and calculates results
 */
export class ScoringEngine {

  /**
   * Calculate handicap strokes between two players based on scoring rules
   */
  calculateHandicapStrokes(
    player1: Player,
    player2: Player,
    rules: ScoringRule,
    overrides?: Partial<MatchScoringConfig>
  ): HandicapCalculation {
    const effectiveRules = this.applyOverrides(rules, overrides);

    // Determine raw handicap difference
    const rawDifference = Math.abs(player1.handicap - player2.handicap);
    let strokeDifference = 0;

    switch (effectiveRules.handicap_method) {
      case 'none':
        strokeDifference = 0;
        break;

      case 'full':
        strokeDifference = rawDifference;
        break;

      case 'percentage':
        const percentage = effectiveRules.handicap_percentage || 100;
        strokeDifference = Math.round(rawDifference * (percentage / 100));
        break;

      case 'cap_difference':
        const maxDiff = effectiveRules.max_handicap_difference || 99;
        strokeDifference = Math.min(rawDifference, maxDiff);
        break;
    }

    // Determine who gets the strokes (higher handicap player)
    const player1GetStrokes = player1.handicap > player2.handicap;

    return {
      player1_strokes: player1GetStrokes ? strokeDifference : 0,
      player2_strokes: player1GetStrokes ? 0 : strokeDifference,
      stroke_allocation: []
    };
  }

  /**
   * Allocate strokes to specific holes based on rules and course
   */
  allocateStrokesToHoles(
    strokesNeeded: number,
    course: Course,
    rules: ScoringRule,
    overrides?: Partial<MatchScoringConfig>
  ): number[] {
    const effectiveRules = this.applyOverrides(rules, overrides);
    const strokeHoles: number[] = [];

    if (strokesNeeded === 0) return strokeHoles;

    switch (effectiveRules.stroke_holes) {
      case 'all':
        // Can use any hole, follow handicap ranking
        const allHoles = course.holes
          .sort((a, b) => a.handicap_ranking - b.handicap_ranking)
          .slice(0, strokesNeeded)
          .map(h => h.hole_number);
        strokeHoles.push(...allHoles);
        break;

      case 'par_4_5_only':
        // Only par 4s and 5s, follow handicap ranking within those holes
        const longHoles = course.holes
          .filter(h => h.par >= 4)
          .sort((a, b) => a.handicap_ranking - b.handicap_ranking)
          .slice(0, strokesNeeded)
          .map(h => h.hole_number);
        strokeHoles.push(...longHoles);
        break;

      case 'handicap_order':
        // Follow course handicap ranking strictly
        const handicapOrder = course.holes
          .sort((a, b) => a.handicap_ranking - b.handicap_ranking)
          .slice(0, strokesNeeded)
          .map(h => h.hole_number);
        strokeHoles.push(...handicapOrder);
        break;

      case 'custom':
        // Use custom hole selection
        if (effectiveRules.custom_stroke_holes) {
          const customHoles = effectiveRules.custom_stroke_holes
            .slice(0, strokesNeeded);
          strokeHoles.push(...customHoles);
        }
        break;
    }

    return strokeHoles.sort((a, b) => a - b);
  }

  /**
   * Calculate the result of a single hole
   */
  calculateHoleResult(
    holeNumber: number,
    player1Score: number,
    player2Score: number,
    player1GetStroke: boolean,
    player2GetStroke: boolean,
    rules: ScoringRule,
    overrides?: Partial<MatchScoringConfig>
  ): HoleResult {
    const effectiveRules = this.applyOverrides(rules, overrides);

    // Calculate net scores
    const player1Net = player1Score - (player1GetStroke ? 1 : 0);
    const player2Net = player2Score - (player2GetStroke ? 1 : 0);

    // Determine winner
    let winner: 'player1' | 'player2' | 'tie';
    if (player1Net < player2Net) {
      winner = 'player1';
    } else if (player2Net < player1Net) {
      winner = 'player2';
    } else {
      winner = 'tie';
    }

    // Award points based on point method
    let points = { player1: 0, player2: 0 };

    switch (effectiveRules.point_method) {
      case 'match_play':
        if (winner === 'player1') {
          points.player1 = effectiveRules.hole_points;
        } else if (winner === 'player2') {
          points.player2 = effectiveRules.hole_points;
        } else {
          // Tie
          points.player1 = effectiveRules.tie_points;
          points.player2 = effectiveRules.tie_points;
        }
        break;

      case 'stroke_play':
        // Points based on score differential
        const differential = Math.abs(player1Net - player2Net);
        if (winner === 'player1') {
          points.player1 = Math.max(1, differential);
        } else if (winner === 'player2') {
          points.player2 = Math.max(1, differential);
        }
        break;

      case 'stableford':
        // Simplified stableford (would need par info for full implementation)
        if (winner === 'player1') {
          points.player1 = 2; // Could be more sophisticated with par
        } else if (winner === 'player2') {
          points.player2 = 2;
        } else {
          points.player1 = 1;
          points.player2 = 1;
        }
        break;
    }

    return {
      hole_number: holeNumber,
      player1_score: player1Score,
      player2_score: player2Score,
      player1_net: player1Net,
      player2_net: player2Net,
      winner,
      points_awarded: points
    };
  }

  /**
   * Calculate the complete match result
   */
  calculateMatchResult(
    player1Scores: PlayerScores,
    player2Scores: PlayerScores,
    course: Course,
    rules: ScoringRule,
    overrides?: Partial<MatchScoringConfig>
  ): MatchResult {
    const effectiveRules = this.applyOverrides(rules, overrides);

    // Calculate handicap strokes
    const handicapCalc = this.calculateHandicapStrokes(
      player1Scores.player,
      player2Scores.player,
      rules,
      overrides
    );

    // Allocate strokes to holes
    const player1StrokeHoles = this.allocateStrokesToHoles(
      handicapCalc.player1_strokes,
      course,
      rules,
      overrides
    );

    const player2StrokeHoles = this.allocateStrokesToHoles(
      handicapCalc.player2_strokes,
      course,
      rules,
      overrides
    );

    // Calculate hole-by-hole results
    const holeResults: HoleResult[] = [];
    let player1TotalPoints = 0;
    let player2TotalPoints = 0;
    let player1GrossTotal = 0;
    let player2GrossTotal = 0;

    for (let i = 0; i < player1Scores.scores.length; i++) {
      const holeNumber = player1Scores.scores[i].hole_number;
      const player1Score = player1Scores.scores[i].gross_score;
      const player2Score = player2Scores.scores[i].gross_score;

      player1GrossTotal += player1Score;
      player2GrossTotal += player2Score;

      const player1GetStroke = player1StrokeHoles.includes(holeNumber);
      const player2GetStroke = player2StrokeHoles.includes(holeNumber);

      const holeResult = this.calculateHoleResult(
        holeNumber,
        player1Score,
        player2Score,
        player1GetStroke,
        player2GetStroke,
        rules,
        overrides
      );

      holeResults.push(holeResult);
      player1TotalPoints += holeResult.points_awarded.player1;
      player2TotalPoints += holeResult.points_awarded.player2;
    }

    // Calculate bonus points if applicable
    let bonusPoints = { player1: 0, player2: 0 };
    if (effectiveRules.match_bonus_points > 0) {
      const player1NetTotal = player1GrossTotal - handicapCalc.player1_strokes;
      const player2NetTotal = player2GrossTotal - handicapCalc.player2_strokes;

      if (player1NetTotal < player2NetTotal) {
        bonusPoints.player1 = effectiveRules.match_bonus_points;
      } else if (player2NetTotal < player1NetTotal) {
        bonusPoints.player2 = effectiveRules.match_bonus_points;
      }
      // No bonus for ties unless specified
    }

    // Add bonus points to totals
    player1TotalPoints += bonusPoints.player1;
    player2TotalPoints += bonusPoints.player2;

    // Determine match winner
    let matchWinner: 'player1' | 'player2' | 'tie';
    if (player1TotalPoints > player2TotalPoints) {
      matchWinner = 'player1';
    } else if (player2TotalPoints > player1TotalPoints) {
      matchWinner = 'player2';
    } else {
      matchWinner = 'tie';
    }

    return {
      player1_total_points: player1TotalPoints,
      player2_total_points: player2TotalPoints,
      match_winner: matchWinner,
      hole_results: holeResults,
      bonus_points: bonusPoints
    };
  }

  /**
   * Apply configuration overrides to base scoring rules
   */
  private applyOverrides(
    baseRules: ScoringRule,
    overrides?: Partial<MatchScoringConfig>
  ): ScoringRule {
    if (!overrides) return baseRules;

    return {
      ...baseRules,
      handicap_method: overrides.override_handicap_method || baseRules.handicap_method,
      handicap_percentage: overrides.override_handicap_percentage || baseRules.handicap_percentage,
      max_handicap_difference: overrides.override_max_handicap_difference || baseRules.max_handicap_difference,
      stroke_holes: overrides.override_stroke_holes || baseRules.stroke_holes,
      hole_points: overrides.override_hole_points || baseRules.hole_points,
      match_bonus_points: overrides.override_match_bonus_points || baseRules.match_bonus_points,
    };
  }

  /**
   * Validate scoring rule configuration
   */
  validateScoringRule(rule: ScoringRule): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (rule.hole_points < 0) {
      errors.push('Hole points must be non-negative');
    }

    if (rule.match_bonus_points < 0) {
      errors.push('Match bonus points must be non-negative');
    }

    if (rule.handicap_method === 'percentage') {
      if (!rule.handicap_percentage || rule.handicap_percentage <= 0 || rule.handicap_percentage > 100) {
        errors.push('Handicap percentage must be between 1 and 100');
      }
    }

    if (rule.handicap_method === 'cap_difference') {
      if (!rule.max_handicap_difference || rule.max_handicap_difference <= 0) {
        errors.push('Max handicap difference must be positive');
      }
    }

    if (rule.stroke_holes === 'custom') {
      if (!rule.custom_stroke_holes || rule.custom_stroke_holes.length === 0) {
        errors.push('Custom stroke holes must be specified');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Preview how a scoring rule would work with sample data
   */
  previewScoringRule(
    rule: ScoringRule,
    samplePlayer1: Player,
    samplePlayer2: Player,
    sampleCourse: Course
  ): {
    handicapDifference: number;
    strokesAwarded: HandicapCalculation;
    strokeHoles: number[];
    exampleHoleResult: HoleResult;
  } {
    const handicapCalc = this.calculateHandicapStrokes(samplePlayer1, samplePlayer2, rule);

    const strokeHoles = this.allocateStrokesToHoles(
      Math.max(handicapCalc.player1_strokes, handicapCalc.player2_strokes),
      sampleCourse,
      rule
    );

    // Example hole result (assume both players score 5 on hole 1)
    const exampleHole = this.calculateHoleResult(
      1, 5, 5,
      strokeHoles.includes(1) && handicapCalc.player1_strokes > 0,
      strokeHoles.includes(1) && handicapCalc.player2_strokes > 0,
      rule
    );

    return {
      handicapDifference: Math.abs(samplePlayer1.handicap - samplePlayer2.handicap),
      strokesAwarded: handicapCalc,
      strokeHoles,
      exampleHoleResult: exampleHole
    };
  }
}

// Export singleton instance
export const scoringEngine = new ScoringEngine();