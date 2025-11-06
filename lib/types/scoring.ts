// Scoring System Types and Interfaces

export type HandicapMethod = 'none' | 'full' | 'percentage' | 'cap_difference';
export type StrokeHoles = 'all' | 'par_4_5_only' | 'handicap_order' | 'custom';
export type PointMethod = 'match_play' | 'stroke_play' | 'stableford' | 'custom';
export type TeamFormat = 'heads_up' | 'best_ball' | 'alternate_shot' | 'scramble';
export type PairingMethod = 'lowest_vs_lowest' | 'random' | 'captain_choice';

export interface ScoringRule {
  id: string;
  name: string;
  description?: string;
  is_system_default: boolean;
  is_active: boolean;

  // Handicap Configuration
  handicap_method: HandicapMethod;
  handicap_percentage?: number; // for 'percentage' method
  max_handicap_difference?: number; // for 'cap_difference' method

  // Stroke Allocation
  stroke_holes: StrokeHoles;
  max_strokes_per_hole: number;
  custom_stroke_holes?: number[]; // for 'custom' stroke holes

  // Point System
  point_method: PointMethod;
  hole_points: number; // points awarded per hole won
  match_bonus_points: number; // bonus points for lowest total
  tie_points: number; // points for tied holes

  // Team Configuration
  team_format: TeamFormat;
  pairing_method: PairingMethod;

  // Metadata
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LeagueScoringRule {
  id: string;
  league_id: string;
  scoring_rule_id: string;
  is_active: boolean;

  // League-specific overrides
  override_hole_points?: number;
  override_match_bonus_points?: number;
  override_max_handicap_difference?: number;

  created_at: string;
  updated_at: string;

  // Relations
  scoring_rule?: ScoringRule;
}

export interface MatchScoringConfig {
  id: string;
  match_id: string;
  scoring_rule_id?: string;

  // Match-specific overrides
  override_handicap_method?: HandicapMethod;
  override_handicap_percentage?: number;
  override_max_handicap_difference?: number;
  override_stroke_holes?: StrokeHoles;
  override_hole_points?: number;
  override_match_bonus_points?: number;

  // Special event configurations
  is_tournament_match: boolean;
  tournament_multiplier: number;
  notes?: string;

  created_at: string;
  updated_at: string;

  // Relations
  scoring_rule?: ScoringRule;
}

// Calculation Types
export interface HandicapCalculation {
  player1_strokes: number;
  player2_strokes: number;
  stroke_allocation: number[]; // which holes get strokes (1-indexed)
}

export interface HoleResult {
  hole_number: number;
  player1_score: number;
  player2_score: number;
  player1_net: number;
  player2_net: number;
  winner: 'player1' | 'player2' | 'tie';
  points_awarded: {
    player1: number;
    player2: number;
  };
}

export interface MatchResult {
  player1_total_points: number;
  player2_total_points: number;
  match_winner: 'player1' | 'player2' | 'tie';
  hole_results: HoleResult[];
  bonus_points?: {
    player1: number;
    player2: number;
  };
}

// Form Types for Creating/Editing Scoring Rules
export interface CreateScoringRuleRequest {
  name: string;
  description?: string;
  handicap_method: HandicapMethod;
  handicap_percentage?: number;
  max_handicap_difference?: number;
  stroke_holes: StrokeHoles;
  max_strokes_per_hole: number;
  custom_stroke_holes?: number[];
  point_method: PointMethod;
  hole_points: number;
  match_bonus_points: number;
  tie_points: number;
  team_format: TeamFormat;
  pairing_method: PairingMethod;
}

export interface UpdateScoringRuleRequest extends Partial<CreateScoringRuleRequest> {
  id: string;
}

// Validation Schemas
export const HANDICAP_METHODS: { value: HandicapMethod; label: string; description: string }[] = [
  {
    value: 'none',
    label: 'No Handicap',
    description: 'Pure skill vs skill - no handicap adjustments'
  },
  {
    value: 'full',
    label: 'Full Handicap',
    description: 'Use full handicap difference on appropriate holes'
  },
  {
    value: 'percentage',
    label: 'Percentage Handicap',
    description: 'Use a percentage of handicap difference (e.g., 80%)'
  },
  {
    value: 'cap_difference',
    label: 'Capped Difference',
    description: 'Limit maximum handicap difference (e.g., max 5 strokes)'
  }
];

export const STROKE_HOLES: { value: StrokeHoles; label: string; description: string }[] = [
  {
    value: 'all',
    label: 'All Holes',
    description: 'Strokes can be applied to any hole'
  },
  {
    value: 'par_4_5_only',
    label: 'Par 4s and 5s Only',
    description: 'Strokes only applied to par 4 and par 5 holes'
  },
  {
    value: 'handicap_order',
    label: 'Handicap Order',
    description: 'Follow course handicap ranking (hardest holes first)'
  },
  {
    value: 'custom',
    label: 'Custom Holes',
    description: 'Manually select which holes can receive strokes'
  }
];

export const POINT_METHODS: { value: PointMethod; label: string; description: string }[] = [
  {
    value: 'match_play',
    label: 'Match Play',
    description: 'Points awarded for winning individual holes'
  },
  {
    value: 'stroke_play',
    label: 'Stroke Play',
    description: 'Points based on total score differential'
  },
  {
    value: 'stableford',
    label: 'Stableford',
    description: 'Points based on performance relative to par'
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Custom point allocation system'
  }
];

export const TEAM_FORMATS: { value: TeamFormat; label: string; description: string }[] = [
  {
    value: 'heads_up',
    label: 'Heads Up',
    description: 'Individual players compete against each other'
  },
  {
    value: 'best_ball',
    label: 'Best Ball',
    description: 'Use best score from each team on every hole'
  },
  {
    value: 'alternate_shot',
    label: 'Alternate Shot',
    description: 'Team members alternate shots'
  },
  {
    value: 'scramble',
    label: 'Scramble',
    description: 'All players hit, play from best position'
  }
];

// Utility Functions
export const getScoringRuleDisplayName = (rule: ScoringRule): string => {
  return rule.name;
};

export const getScoringRuleDescription = (rule: ScoringRule): string => {
  const parts: string[] = [];

  // Handicap method
  const handicapMethod = HANDICAP_METHODS.find(h => h.value === rule.handicap_method);
  if (handicapMethod) {
    parts.push(handicapMethod.label);
  }

  // Stroke allocation
  const strokeHoles = STROKE_HOLES.find(s => s.value === rule.stroke_holes);
  if (strokeHoles) {
    parts.push(strokeHoles.label);
  }

  // Points
  parts.push(`${rule.hole_points} pts/hole`);
  if (rule.match_bonus_points > 0) {
    parts.push(`+${rule.match_bonus_points} bonus`);
  }

  return parts.join(' • ');
};