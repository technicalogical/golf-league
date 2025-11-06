'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ScoringRuleForm from '@/components/scoring-rule-form';
import { CreateScoringRuleRequest } from '@/lib/types/scoring';

export default function NewScoringRulePage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateScoringRuleRequest) => {
    const response = await fetch('/api/scoring-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create scoring rule');
    }

    const newRule = await response.json();

    // Redirect to the list page
    router.push('/admin/scoring-rules');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Scoring Rule
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure a new scoring rule for your golf league
            </p>
          </div>
          <Link href="/admin/scoring-rules">
            <Button variant="outline">← Back to Rules</Button>
          </Link>
        </div>

        <ScoringRuleForm onSubmit={handleSubmit} submitLabel="Create Scoring Rule" />
      </div>
    </div>
  );
}
