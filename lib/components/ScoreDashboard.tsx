'use client';

import { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { useScanStore } from '../store/scanStore';
import ScoreCard from './ScoreCard';
import ResumeOverview from './ResumeOverview';
import OptimizationSuggestions from './OptimizationSuggestions';
import ScoreRing from './ScoreRing';
import { getColorForScore } from '../engine/platforms';

function PassCounter({ passCount, total }: { passCount: number; total: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctrl = animate(0, passCount, {
      duration: 1, ease: 'easeOut',
      onUpdate: (v) => { el.textContent = Math.round(v).toString(); },
    });
    return () => ctrl.stop();
  }, [passCount]);

  const color = passCount >= 5 ? '#22c55e' : passCount >= 3 ? '#00d4d4' : '#ef4444';
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
      style={{ color, borderColor: `${color}30`, background: `${color}10` }}
    >
      <span ref={ref} className="font-bold tabular-nums">0</span>
      <span className="opacity-80">/{total} Systems Passed</span>
    </div>
  );
}

export default function ScoreDashboard() {
  const { scanResult, aiSuggestions, aiLoading, aiError, reset, fileName } = useScanStore();
  if (!scanResult) return null;

  const { platforms, averageScore, passCount, priorityAreas, overview, detectedSkills } = scanResult;
  const accentColor = getColorForScore(averageScore);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 flex flex-col gap-8">

      {/* Back */}
      <button
        onClick={reset}
        className="self-start flex items-center gap-1.5 text-white/35 hover:text-white text-sm transition-colors"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        Scan another resume
      </button>

      {/* Hero score */}
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-white/[0.08] p-8"
        style={{ background: 'linear-gradient(135deg, rgba(0,112,243,0.08) 0%, rgba(0,212,212,0.04) 100%)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${accentColor}, transparent)` }} />

        <div className="relative flex flex-col sm:flex-row items-center gap-8">
          <ScoreRing score={averageScore} size={140} strokeWidth={10} />
          <div className="flex flex-col gap-3 text-center sm:text-left">
            {fileName && (
              <p className="text-white/30 text-xs truncate max-w-xs">{fileName}</p>
            )}
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Average ATS Score</p>
              <h1 className="text-5xl font-bold" style={{ color: accentColor }}>
                {averageScore}
                <span className="text-white/25 text-2xl font-normal"> / 100</span>
              </h1>
            </div>
            <PassCounter passCount={passCount} total={platforms.length} />
            <p className="text-white/40 text-sm max-w-md">
              {passCount === 6  ? 'Excellent — your resume passes all major ATS platforms.'
              : passCount >= 4  ? 'Great performance. A few tweaks will push you to 100%.'
              : passCount >= 2  ? 'Moderate score. Review the priority areas below to improve.'
              : 'Needs work. The suggestions below will significantly boost your score.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Platform bars */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
          Platform Scores
          <span className="text-white/30 text-xs font-normal">passing threshold: 70</span>
        </h3>
        <div className="flex flex-col gap-3">
          {platforms.map((p, i) => {
            const color = getColorForScore(p.totalScore);
            return (
              <div key={p.platformId} className="flex items-center gap-3">
                <span className="text-white/50 text-sm w-28 flex-shrink-0">{p.platformName}</span>
                <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.totalScore}%` }}
                    transition={{ duration: 0.9, delay: i * 0.07 + 0.2, ease: 'easeOut' }}
                  />
                </div>
                {/* 70 threshold marker */}
                <div className="relative w-full max-w-[1px] hidden" />
                <span className="text-sm font-semibold tabular-nums w-8 text-right" style={{ color }}>{p.totalScore}</span>
                <span className={`text-xs w-16 text-right ${p.passed ? 'text-green-400' : 'text-red-400/70'}`}>
                  {p.passed ? '✓ Pass' : '✗ Fail'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority areas */}
      {priorityAreas.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-5">Priority Focus Areas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {priorityAreas.map((area, i) => (
              <motion.div
                key={area.dimension}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
              >
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(0,212,212,0.1)', color: '#00d4d4', border: '1px solid rgba(0,212,212,0.2)' }}
                >
                  {area.rank}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white text-sm font-medium">{area.label}</span>
                    <span className="text-white/30 text-xs">{area.currentAvgScore}/100</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{area.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Platform breakdown */}
      <div>
        <h3 className="text-white font-semibold mb-4">Platform Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((result, i) => <ScoreCard key={result.platformId} result={result} index={i} />)}
        </div>
      </div>

      {/* Overview + suggestions */}
      <div className="glass-card p-6">
        <ResumeOverview overview={overview} detectedSkills={detectedSkills} />
      </div>

      <div className="glass-card p-6">
        <OptimizationSuggestions aiSuggestions={aiSuggestions} aiLoading={aiLoading} aiError={aiError} />
      </div>

    </div>
  );
}
