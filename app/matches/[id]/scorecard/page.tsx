'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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

interface Course {
  id: string;
  name: string;
  par: number;
  location: string;
}

interface Match {
  holes_to_play?: number;
  nine_selection?: string;
  tee_selection?: string;
  pin_position?: string;
  stimp_setting?: number;
  status?: string;
  team1_points?: number | null;
  team2_points?: number | null;
  course?: Course;
}

interface Player {
  id: string;
  name: string;
  handicap: number;
  team_name: string;
  team_id: string;
}

interface TeamRecord {
  wins: number;
  losses: number;
  ties: number;
  rank: number;
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
  const [teamRecords, setTeamRecords] = useState<Record<string, TeamRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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

      // Load team records if league_id is available
      if (data.match?.league_id && data.teams) {
        const recordsMap: Record<string, TeamRecord> = {};
        for (const team of data.teams) {
          try {
            const standingsRes = await fetch(`/api/standings?league_id=${data.match.league_id}`);
            const standingsData = await standingsRes.json();
            const teamStanding = standingsData.find((s: any) => s.team_id === team.id);
            if (teamStanding) {
              recordsMap[team.id] = {
                wins: teamStanding.wins || 0,
                losses: teamStanding.losses || 0,
                ties: teamStanding.ties || 0,
                rank: teamStanding.rank || 0,
              };
            }
          } catch (err) {
            console.error('Failed to load team record:', err);
          }
        }
        setTeamRecords(recordsMap);
      }

      // Initialize scores - IMPORTANT: Use filteredHoles, not data.holes!
      const initialScores: Score[] = [];
      data.players?.forEach((player: Player) => {
        filteredHoles.forEach((hole: Hole) => {
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
    setSubmitMessage('');

    try {
      // Filter out empty scores - allow partial submission
      const validScores = scores.filter(s => s.strokes !== '');

      const response = await fetch(`/api/matches/${matchId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: validScores,
          partial: true  // Flag to indicate partial submission is allowed
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage(result.message || 'Scores submitted successfully!');
        // Reload data to get updated scores
        setTimeout(() => {
          loadMatchData();
          setSubmitMessage('');
        }, 2000);
      } else {
        const error = await response.json();
        setSubmitMessage(error.error || 'Failed to save scores');
      }
    } catch (error) {
      console.error('Failed to save scores:', error);
      setSubmitMessage('Failed to save scores');
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalize() {
    if (!confirm('Are you sure you want to finalize this scorecard? This will calculate final results and update standings.')) {
      return;
    }

    setSaving(true);
    setSubmitMessage('');

    try {
      // First, recalculate scores with partial=false to ensure points are calculated
      const scoresResponse = await fetch(`/api/matches/${matchId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: [],
          partial: false,
          recalculate: true,
        }),
      });

      if (!scoresResponse.ok) {
        const error = await scoresResponse.json();
        setSubmitMessage(error.error || 'Failed to calculate scores');
        return;
      }

      // Then finalize the match
      const response = await fetch(`/api/matches/${matchId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        router.push(`/matches/${matchId}/results`);
      } else {
        const error = await response.json();
        setSubmitMessage(error.error || 'Failed to finalize scorecard');
      }
    } catch (error) {
      console.error('Failed to finalize scorecard:', error);
      setSubmitMessage('Failed to finalize scorecard');
    } finally {
      setSaving(false);
    }
  }

  // Check if all scores are entered
  function isComplete(): boolean {
    const requiredScores = players.length * holes.length;
    const enteredScores = scores.filter(s => s.strokes !== '').length;
    return enteredScores === requiredScores;
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

  const team1Id = team1Players[0]?.team_id;
  const team2Id = team2Players[0]?.team_id;
  const team1Record = team1Id ? teamRecords[team1Id] : null;
  const team2Record = team2Id ? teamRecords[team2Id] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scorecard</h1>
        </div>

        {/* Match Details Card */}
        {match && match.course && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">{match.course.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>📍 {match.course.location}</p>
                    <p>⛳ Par {match.course.par}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">Match Format</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">
                      {match.holes_to_play === 9
                        ? `9 Holes (${match.nine_selection === 'front' ? 'Front' : 'Back'})`
                        : '18 Holes'}
                    </p>
                    <p>{match.tee_selection || 'Blue'} Tees</p>
                    <p>{match.pin_position || 'Intermediate'} Pins</p>
                    {match.stimp_setting && <p>Stimp: {match.stimp_setting}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Headers - Compact with Records */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-300 mb-1">Team 1</div>
                  <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                    {team1Players[0]?.team_name || 'Team 1'}
                  </h2>
                </div>
                {team1Record && (
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">#{team1Record.rank}</Badge>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {team1Record.wins}-{team1Record.losses}
                      {team1Record.ties > 0 && `-${team1Record.ties}`}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-green-200 dark:border-green-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-green-600 dark:text-green-300 mb-1">Team 2</div>
                  <h2 className="text-lg font-bold text-green-900 dark:text-green-200">
                    {team2Players[0]?.team_name || 'Team 2'}
                  </h2>
                </div>
                {team2Record && (
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">#{team2Record.rank}</Badge>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {team2Record.wins}-{team2Record.losses}
                      {team2Record.ties > 0 && `-${team2Record.ties}`}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success/Error Message */}
        {submitMessage && (
          <div className={`mb-4 p-4 rounded-lg ${submitMessage.includes('success') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {submitMessage}
          </div>
        )}

        {/* Scorecard Table - Horizontal Scroll */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full text-sm table-fixed" style={{ minWidth: '640px' }}>
            <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 shadow-sm">
              <tr>
                <th className="p-2 md:p-3 text-left font-semibold sticky left-0 bg-gray-100 dark:bg-gray-700 w-10 md:w-12">
                  <span className="hidden md:inline">Hole</span>
                  <span className="md:hidden">#</span>
                </th>
                <th className="p-2 md:p-3 text-center font-semibold w-12 md:w-16">
                  <span className="hidden md:inline">Yards</span>
                  <span className="md:hidden">Yrd</span>
                </th>
                <th className="p-2 md:p-3 text-center font-semibold w-10 md:w-12">Par</th>
                <th className="p-2 md:p-3 text-center font-semibold w-10 md:w-12">HCP</th>
                {players.map((player, index) => {
                  const isTeam1 = index < 2;
                  return (
                    <th
                      key={player.id}
                      className={`p-2 md:p-3 text-center font-semibold w-20 md:w-24 ${
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
                        className={`p-1 md:p-2 w-20 md:w-24 ${
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
                          className="w-full px-2 py-2.5 text-xl border-2 border-gray-300 dark:border-gray-600 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 font-bold text-gray-900 dark:text-white"
                          style={{ minHeight: '48px' }}
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
                      className={`p-3 md:p-4 text-center text-base md:text-lg w-20 md:w-24 ${
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
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <div className="flex-1 flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1"
              variant="default"
            >
              {saving ? 'Saving...' : 'Submit Scores'}
            </Button>
            {isComplete() && match?.status !== 'completed' && (
              <Button
                onClick={handleFinalize}
                disabled={saving}
                className="flex-1"
                variant="destructive"
              >
                {saving ? 'Finalizing...' : 'Finalize Scorecard'}
              </Button>
            )}
            {isComplete() && match?.status === 'completed' && (match.team1_points === null || match.team2_points === null) && (
              <Button
                onClick={handleFinalize}
                disabled={saving}
                className="flex-1"
                variant="outline"
              >
                {saving ? 'Recalculating...' : 'Recalculate Results'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
