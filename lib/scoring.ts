/**
 * Golf League Scoring System
 *
 * Rules:
 * - 2 players per team
 * - Lowest handicap plays against opponent's lowest handicap
 * - Handicap difference determines stroke allocation:
 *   - Par 3s: NO strokes given
 *   - Par 4s: 1 stroke if applicable
 *   - Par 5s: 1 stroke if applicable
 * - Winner of each hole gets 1 point
 * - Team total (gross score - handicap diff) earns 1 point for lower team total
 */

export interface HoleData {
  id: string;
  hole_number: number;
  par: 3 | 4 | 5;
  handicap_index: number; // 1-18, used for stroke allocation
}

export interface PlayerScore {
  player_id: string;
  handicap: number;
  hole_scores: {
    hole_id: string;
    strokes: number;
  }[];
}

export interface MatchupResult {
  player1_id: string;
  player2_id: string;
  player1_points: number;
  player2_points: number;
  hole_results: {
    hole_id: string;
    hole_number: number;
    player1_net_score: number;
    player2_net_score: number;
    winner: string | null; // player_id or null for tie
    strokes_given_to: string | null; // which player gets a stroke
  }[];
}

export interface TeamMatchResult {
  team1_total_points: number;
  team2_total_points: number;
  team1_gross_total: number;
  team2_gross_total: number;
  team1_net_total: number;
  team2_net_total: number;
  team_point_winner: number | null; // 1, 2, or null for tie
  matchups: [MatchupResult, MatchupResult]; // two head-to-head matchups
}

/**
 * Calculates stroke allocation for a hole based on handicap difference
 */
function getStrokesForHole(
  par: number,
  handicap_index: number,
  handicap_diff: number
): boolean {
  // Par 3s never get strokes
  if (par === 3) return false;

  // For par 4s and 5s, give a stroke if the hole's handicap index
  // is within the handicap difference
  // e.g., if diff is 5, holes with handicap index 1-5 get strokes
  return handicap_index <= Math.abs(handicap_diff);
}

/**
 * Calculates head-to-head matchup between two players
 */
export function calculateMatchup(
  player1: PlayerScore,
  player2: PlayerScore,
  holes: HoleData[]
): MatchupResult {
  const handicap_diff = player1.handicap - player2.handicap;
  const lower_handicap_player = handicap_diff > 0 ? player2.player_id : player1.player_id;

  let player1_points = 0;
  let player2_points = 0;

  const hole_results = holes.map((hole) => {
    const p1_score = player1.hole_scores.find(s => s.hole_id === hole.id);
    const p2_score = player2.hole_scores.find(s => s.hole_id === hole.id);

    if (!p1_score || !p2_score) {
      throw new Error(`Missing score for hole ${hole.hole_number}`);
    }

    // Determine who gets a stroke on this hole
    const stroke_applicable = getStrokesForHole(hole.par, hole.handicap_index, handicap_diff);

    let strokes_given_to: string | null = null;
    let p1_net = p1_score.strokes;
    let p2_net = p2_score.strokes;

    if (stroke_applicable) {
      // Higher handicap player gets the stroke
      if (handicap_diff > 0) {
        // Player 1 has higher handicap
        p1_net = p1_score.strokes - 1;
        strokes_given_to = player1.player_id;
      } else {
        // Player 2 has higher handicap
        p2_net = p2_score.strokes - 1;
        strokes_given_to = player2.player_id;
      }
    }

    // Determine winner
    let winner: string | null = null;
    if (p1_net < p2_net) {
      winner = player1.player_id;
      player1_points += 1;
    } else if (p2_net < p1_net) {
      winner = player2.player_id;
      player2_points += 1;
    }
    // If tied, no points awarded (winner remains null)

    return {
      hole_id: hole.id,
      hole_number: hole.hole_number,
      player1_net_score: p1_net,
      player2_net_score: p2_net,
      winner,
      strokes_given_to,
    };
  });

  return {
    player1_id: player1.player_id,
    player2_id: player2.player_id,
    player1_points,
    player2_points,
    hole_results,
  };
}

/**
 * Calculates full team match (2v2)
 */
export function calculateTeamMatch(
  team1_players: [PlayerScore, PlayerScore],
  team2_players: [PlayerScore, PlayerScore],
  holes: HoleData[]
): TeamMatchResult {
  // Sort players by handicap (lowest first)
  const team1_sorted = [...team1_players].sort((a, b) => a.handicap - b.handicap);
  const team2_sorted = [...team2_players].sort((a, b) => a.handicap - b.handicap);

  // Matchup 1: Lowest handicaps
  const matchup1 = calculateMatchup(team1_sorted[0], team2_sorted[0], holes);

  // Matchup 2: Highest handicaps
  const matchup2 = calculateMatchup(team1_sorted[1], team2_sorted[1], holes);

  // Calculate gross totals
  const team1_gross_total = team1_players.reduce((sum, p) =>
    sum + p.hole_scores.reduce((s, h) => s + h.strokes, 0), 0
  );
  const team2_gross_total = team2_players.reduce((sum, p) =>
    sum + p.hole_scores.reduce((s, h) => s + h.strokes, 0), 0
  );

  // Calculate average handicaps
  const team1_avg_handicap = (team1_players[0].handicap + team1_players[1].handicap) / 2;
  const team2_avg_handicap = (team2_players[0].handicap + team2_players[1].handicap) / 2;

  // Calculate net totals (gross - avg handicap difference)
  const handicap_diff = Math.abs(team1_avg_handicap - team2_avg_handicap);

  let team1_net_total = team1_gross_total;
  let team2_net_total = team2_gross_total;

  if (team1_avg_handicap > team2_avg_handicap) {
    team1_net_total = team1_gross_total - handicap_diff;
  } else {
    team2_net_total = team2_gross_total - handicap_diff;
  }

  // Determine team point winner
  let team_point_winner: number | null = null;
  if (team1_net_total < team2_net_total) {
    team_point_winner = 1;
  } else if (team2_net_total < team1_net_total) {
    team_point_winner = 2;
  }

  // Total points = head-to-head points + team point
  const team1_total_points = matchup1.player1_points + matchup2.player1_points +
    (team_point_winner === 1 ? 1 : 0);
  const team2_total_points = matchup1.player2_points + matchup2.player2_points +
    (team_point_winner === 2 ? 1 : 0);

  return {
    team1_total_points,
    team2_total_points,
    team1_gross_total,
    team2_gross_total,
    team1_net_total,
    team2_net_total,
    team_point_winner,
    matchups: [matchup1, matchup2],
  };
}

/**
 * Helper to calculate total gross score for a player
 */
export function calculateGrossScore(hole_scores: { strokes: number }[]): number {
  return hole_scores.reduce((sum, score) => sum + score.strokes, 0);
}
