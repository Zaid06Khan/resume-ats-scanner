'use client';

import { useScanStore } from '@/lib/store/scanStore';
import ResumeUploader from '@/lib/components/ResumeUploader';
import ScoreDashboard from '@/lib/components/ScoreDashboard';

export default function ScannerPage() {
  const { step } = useScanStore();

  return (
    <main className="min-h-screen bg-transparent">
      {step !== 'results' ? <ResumeUploader /> : <ScoreDashboard />}
    </main>
  );
}
