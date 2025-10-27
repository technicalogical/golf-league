'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export default function InviteCodeDisplay({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Invite Code</h3>
      <p className="text-sm text-gray-700 mb-4">
        Share this code with teammates so they can join your team
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-3 text-center">
          <span className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
            {inviteCode}
          </span>
        </div>
        <Button
          onClick={handleCopy}
          variant={copied ? "secondary" : "default"}
          size="lg"
          className="whitespace-nowrap"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-600 mt-3">
        Teammates can use this code at <strong>/teams/join</strong>
      </p>
    </div>
  );
}
