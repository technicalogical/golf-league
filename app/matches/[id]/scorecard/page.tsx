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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading match data...</div>
      </div>
    );
  }

  const team1Players = players.filter((p, i) => i < 2);
  const team2Players = players.filter((p, i) => i >= 2);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Scorecard Entry</h1>
          <p className="text-gray-600 mt-2">
            Enter scores for all players. Net scores calculated automatically.
          </p>
          {match && (
            <div className="mt-3 flex gap-4 text-sm text-gray-700">
              <span className="font-semibold">
                {match.holes_to_play === 9
                  ? `9 Holes (${match.nine_selection === 'front' ? 'Front' : 'Back'})`
                  : '18 Holes'}
              </span>
              <span className="font-semibold">
                Tees: {match.tee_selection || 'Blue'}
              </span>
            </div>
          )}
        </div>

        {/* Team Headers */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-blue-900">
              {team1Players[0]?.team_name || 'Team 1'}
            </h2>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-green-900">
              {team2Players[0]?.team_name || 'Team 2'}
            </h2>
          </div>
        </div>

        {/* Scorecard Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="p-3 text-left font-semibold">Hole</th>
                <th className="p-3 text-center font-semibold">Yards</th>
                <th className="p-3 text-center font-semibold">Par</th>
                <th className="p-3 text-center font-semibold">HCP</th>
                {players.map((player) => (
                  <th key={player.id} className="p-3 text-center font-semibold">
                    <div>{player.name}</div>
                    <div className="text-xs text-gray-500 font-normal">
                      HCP: {player.handicap}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holes.map((hole) => (
                <tr key={hole.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{hole.hole_number}</td>
                  <td className="p-3 text-center text-sm text-gray-600">{getYardage(hole)}</td>
                  <td className="p-3 text-center">{hole.par}</td>
                  <td className="p-3 text-center text-sm text-gray-600">
                    {hole.handicap_index}
                  </td>
                  {players.map((player) => {
                    const maxScore = hole.par * 2; // Double par
                    return (
                      <td key={player.id} className="p-3">
                        <select
                          value={getScore(player.id, hole.id)}
                          onChange={(e) =>
                            updateScore(
                              player.id,
                              hole.id,
                              e.target.value ? parseInt(e.target.value) : ''
                            )
                          }
                          className="w-16 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
              <tr className="bg-gray-100 font-bold">
                <td className="p-3" colSpan={4}>
                  TOTAL
                </td>
                {players.map((player) => (
                  <td key={player.id} className="p-3 text-center">
                    {getPlayerTotal(player.id) || '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Calculate Results'}
          </button>
        </div>
      </div>
    </div>
  );
}
