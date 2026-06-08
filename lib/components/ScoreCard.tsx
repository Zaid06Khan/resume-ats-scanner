'use client';

import { motion } from 'framer-motion';
import ScoreRing from './ScoreRing';
import { getColorForScore } from '../engine/platforms';
import type { PlatformResult } from '../engine/scorer';

const DIMENSION_LABELS: Record<string, string> = {
  formatting: 'Formatting',
  keywords: 'Keywords',
  sections: 'Sections',
  experienceQuality: 'Experience',
  education: 'Education',
};

interface ScoreCardProps {
  result: PlatformResult;
  index?: number;
}

export default function ScoreCard({ result, index = 0 }: ScoreCardProps) {
  const { platformName, totalScore, passed, rating, dimensionScores } = result;
  const accentColor = getColorForScore(totalScore);

  const ratingColors: Record<string, string> = {
    Excellent: 'text-green-400 bg-green-400/10 border-green-400/30',
    Good: 'text-accent bg-accent/10 border-accent/30',
    Fair: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    Poor: 'text-red-400 bg-red-400/10 border-red-400/30',
  };

  return (
    <motion.div
      className="glass-card p-5 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white text-sm">{platformName}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
          passed
            ? 'text-green-400 bg-green-400/10 border-green-400/30'
            : 'text-red-400 bg-red-400/10 border-red-400/30'
        }`}>
          {passed ? 'Likely to Pass' : 'Needs Work'}
        </span>
      </div>

      {/* Score ring */}
      <div className="flex flex-col items-center gap-2">
        <ScoreRing score={totalScore} size={84} />
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${ratingColors[rating]}`}>
          {rating}
        </span>
      </div>

      {/* Dimension bars */}
      <div className="flex flex-col gap-2">
        {(Object.keys(DIMENSION_LABELS) as Array<keyof typeof dimensionScores>).map((dim, i) => {
          const score = dimensionScores[dim];
          const barColor = getColorForScore(score);
          return (
            <div key={dim} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">{DIMENSION_LABELS[dim]}</span>
                <span className="text-white/70 text-xs tabular-nums">{score}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: index * 0.07 + i * 0.06 + 0.3 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
