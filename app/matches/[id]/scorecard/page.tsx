'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Hole {
  id: string;
  hole_number: number;
  par: number;
  handicap_index: number;
  yardage?: number;
  yardage_black?: number;
  yardage_gold?: number;
  yardage_blue?: number;
  yardage_white?: number;
  yardage_red?: number;
}

interface Match {
  holes_to_play?: number;
  nine_selection?: string;
  tee_selection?: string;
}

interface Player {
  id: string;
  name: string;
  handicap: number;
  team_name: string;
}

interface Score {
  player_id: string;
  hole_id: string;
  strokes: number | '';
}

export default function ScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [holes, setHoles] = useState<Hole[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  async function loadMatchData() {
    try {
      const response = await fetch(`/api/matches/${matchId}`);
      const data = await response.json();

      setMatch(data.match);

      // Filter holes based on match format
      let filteredHoles = data.holes || [];
      if (data.match?.holes_to_play === 9) {
        if (data.match.nine_selection === 'front') {
          filteredHoles = filteredHoles.filter((h: Hole) => h.hole_number >= 1 && h.hole_number <= 9);
        } else {
          filteredHoles = filteredHoles.filter((h: Hole) => h.hole_number >= 10 && h.hole_number <= 18);
        }
      }

      setHoles(filteredHoles);
      setPlayers(data.players || []);

      // Initialize scores
      const initialScores: Score[] = [];
      data.players?.forEach((player: Player) => {
        data.holes?.forEach((hole: Hole) => {
          initialScores.push({
            player_id: player.id,
            hole_id: hole.id,
            strokes: data.existing_scores?.[player.id]?.[hole.id] || '',
          });
        });
      });
      setScores(initialScores);
    } catch (error) {
      console.error('Failed to load match data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateScore(playerId: string, holeId: string, strokes: number | '') {
    setScores((prev) =>
      prev.map((score) =>
        score.player_id === playerId && score.hole_id === holeId
          ? { ...score, strokes }
          : score
      )
    );
  }

  function getScore(playerId: string, holeId: string): number | '' {
    const score = scores.find(
      (s) => s.player_id === playerId && s.hole_id === holeId
    );
    return score?.strokes || '';
  }

  function getPlayerTotal(playerId: string): number {
    return scores
      .filter((s) => s.player_id === playerId && typeof s.strokes === 'number')
      .reduce((sum, s) => sum + (s.strokes as number), 0);
  }

  function getYardage(hole: Hole): number | string {
    const tee = match?.tee_selection || 'Blue';
    switch (tee) {
      case 'Black':
        return hole.yardage_black || hole.yardage || '-';
      case 'Gold':
        return hole.yardage_gold || hole.yardage || '-';
      case 'Blue':
        return hole.yardage_blue || hole.yardage || '-';
      case 'White':
        return hole.yardage_white || hole.yardage || '-';
      case 'Red':
        return hole.yardage_red || hole.yardage || '-';
      default:
        return hole.yardage || '-';
    }
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const response = await fetch(`/api/matches/${matchId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores }),
      });

      if (response.ok) {
        router.push(`/matches/${matchId}/results`);
      } else {
        alert('Failed to save scores');
      }
    } catch (error) {
      console.error('Failed to save scores:', error);
      alert('Failed to save scores');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading match data...</div>
      </div>
    );
  }

  const team1Players = players.filter((p, i) => i < 2);
  const team2Players = players.filter((p, i) => i >= 2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">⛳ Scorecard</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Enter scores for all players
              </p>
            </div>
            {match && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Match Format</div>
                <div className="flex gap-6 text-sm font-semibold text-gray-900 dark:text-white">
                  <span>
                    {match.holes_to_play === 9
                      ? `9 Holes (${match.nine_selection === 'front' ? 'Front' : 'Back'})`
                      : '18 Holes'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{match.tee_selection || 'Blue'} Tees</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Headers */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20 p-6 rounded-xl shadow-sm border border-blue-200 dark:border-blue-900">
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-300 mb-1">Team 1</div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              {team1Players[0]?.team_name || 'Team 1'}
            </h2>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20 p-6 rounded-xl shadow-sm border border-green-200 dark:border-green-900">
            <div className="text-sm font-semibold text-green-600 dark:text-green-300 mb-1">Team 2</div>
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-200">
              {team2Players[0]?.team_name || 'Team 2'}
            </h2>
          </div>
        </div>

        {/* Scorecard Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm table-fixed md:table-auto">
            <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 shadow-sm">
              <tr>
                <th className="p-3 text-left font-semibold sticky left-0 bg-gray-100 dark:bg-gray-700 w-12">Hole</th>
                <th className="p-3 text-center font-semibold w-16">Yards</th>
                <th className="p-3 text-center font-semibold w-12">Par</th>
                <th className="p-3 text-center font-semibold w-12">HCP</th>
                {players.map((player, index) => {
                  const isTeam1 = index < 2;
                  return (
                    <th
                      key={player.id}
                      className={`p-2 md:p-3 text-center font-semibold ${
                        isTeam1
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'bg-green-50 dark:bg-green-900/20'
                      }`}
                    >
                      <div className="font-bold text-xs md:text-sm truncate" title={player.name}>
                        {player.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal whitespace-nowrap">
                        HCP: {player.handicap}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {holes.map((hole) => (
                <tr key={hole.id} className="border-b dark:border-gray-700">
                  <td className="p-2 md:p-3 font-bold text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">{hole.hole_number}</td>
                  <td className="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">{getYardage(hole)}</td>
                  <td className="p-2 md:p-3 text-center font-semibold text-gray-900 dark:text-white">{hole.par}</td>
                  <td className="p-2 md:p-3 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                    {hole.handicap_index}
                  </td>
                  {players.map((player, index) => {
                    const maxScore = hole.par * 2; // Double par
                    const isTeam1 = index < 2;
                    return (
                      <td
                        key={player.id}
                        className={`p-2 md:p-3 ${
                          isTeam1
                            ? 'bg-blue-50/50 dark:bg-blue-900/10'
                            : 'bg-green-50/50 dark:bg-green-900/10'
                        }`}
                      >
                        <select
                          value={getScore(player.id, hole.id)}
                          onChange={(e) =>
                            updateScore(
                              player.id,
                              hole.id,
                              e.target.value ? parseInt(e.target.value) : ''
                            )
                          }
                          className="w-full px-2 py-1.5 md:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                        >
                          <option value="">-</option>
                          {Array.from({ length: maxScore }, (_, i) => i + 1).map((score) => (
                            <option key={score} value={score}>
                              {score}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-t-2 border-gray-300 dark:border-gray-600">
                <td className="p-3 md:p-4 sticky left-0 bg-gray-100 dark:bg-gray-700" colSpan={4}>
                  TOTAL
                </td>
                {players.map((player, index) => {
                  const isTeam1 = index < 2;
                  return (
                    <td
                      key={player.id}
                      className={`p-3 md:p-4 text-center text-base md:text-lg ${
                        isTeam1
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}
                    >
                      {getPlayerTotal(player.id) || '-'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-end">
          <button
            onClick={() => router.back()}
            className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all"
          >
            {saving ? 'Saving...' : '✓ Calculate Results'}
          </button>
        </div>
      </div>
    </div>
  );
}
