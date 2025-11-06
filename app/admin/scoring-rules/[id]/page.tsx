'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ScoringRuleForm from '@/components/scoring-rule-form';
import { CreateScoringRuleRequest, ScoringRule } from '@/lib/types/scoring';

export default function EditScoringRulePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [scoringRule, setScoringRule] = useState<ScoringRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScoringRule();
  }, [id]);

  async function loadScoringRule() {
    try {
      const response = await fetch(`/api/scoring-rules/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Scoring rule not found');
        } else {
          setError('Failed to load scoring rule');
        }
        return;
      }

      const data = await response.json();
      setScoringRule(data);
    } catch (err: any) {
      console.error('Error loading scoring rule:', err);
      setError('Error loading scoring rule');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: CreateScoringRuleRequest) => {
    const response = await fetch(`/api/scoring-rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update scoring rule');
    }

    const updatedRule = await response.json();

    // Redirect to the list page
    router.push('/admin/scoring-rules');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading scoring rule...</div>
      </div>
    );
  }

  if (error || !scoringRule) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error || 'Scoring rule not found'}
                </p>
                <Link href="/admin/scoring-rules">
                  <Button>← Back to Scoring Rules</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Scoring Rule
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update the configuration for: {scoringRule.name}
            </p>
          </div>
          <Link href="/admin/scoring-rules">
            <Button variant="outline">← Back to Rules</Button>
          </Link>
        </div>

        <ScoringRuleForm
          initialData={scoringRule}
          onSubmit={handleSubmit}
          submitLabel="Update Scoring Rule"
          isEdit={true}
        />
      </div>
    </div>
  );
}
