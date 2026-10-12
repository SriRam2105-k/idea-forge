'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { lockProblem } from '@/lib/actions/problems';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Lock, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LockProblemButtonProps {
  problemId: string;
  problemCode: string;
  problemTitle: string;
}

type LockState = 'idle' | 'confirming' | 'locking' | 'success' | 'error';

export function LockProblemButton({ problemId, problemCode, problemTitle }: LockProblemButtonProps) {
  const router = useRouter();
  const [lockState, setLockState] = useState<LockState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{ locked_at: string } | null>(null);

  async function handleConfirmLock() {
    setLockState('locking');
    const result = await lockProblem(problemId);

    if (result.success) {
      setSuccessData({ locked_at: result.data.locked_at || new Date().toISOString() });
      setLockState('success');
      // Refresh the page data after a short delay
      setTimeout(() => router.refresh(), 1500);
    } else {
      setErrorMessage(result.message);
      setLockState('error');
    }
  }

  if (lockState === 'success' && successData) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in-scale">
        <div className="animate-lock-pop mb-3">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
        </div>
        <h3 className="font-bold text-green-900 mb-1">Problem Locked!</h3>
        <p className="text-sm text-green-700 mb-3">
          <span className="font-mono font-bold">{problemCode}</span> has been selected for your team.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-green-600">
          <Clock className="w-3 h-3" />
          Locked {formatDate(successData.locked_at)}
        </div>
      </div>
    );
  }

  if (lockState === 'error') {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setLockState('idle'); setErrorMessage(''); }}
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        onClick={() => setLockState('confirming')}
        className="w-full"
      >
        <Lock className="w-4 h-4" />
        Lock This Problem
      </Button>

      <ConfirmDialog
        open={lockState === 'confirming'}
        onClose={() => setLockState('idle')}
        onConfirm={handleConfirmLock}
        loading={lockState === 'locking'}
        title="Lock this problem?"
        message={`Your team can select only one problem statement. Once locked, your selection cannot be changed unless an organizer releases it.\n\nProblem: ${problemCode} — ${problemTitle}`}
        confirmLabel="Lock Problem"
        confirmVariant="primary"
      />
    </>
  );
}
