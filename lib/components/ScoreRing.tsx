'use client';

import { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { getColorForScore } from '../engine/platforms';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
}

export default function ScoreRing({
  score,
  size = 88,
  strokeWidth = 7,
  color,
  showLabel = true,
}: ScoreRingProps) {
  const ringColor = color ?? getColorForScore(score);
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - score / 100);

  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;
    const controls = animate(0, score, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => { el.textContent = Math.round(v).toString(); },
    });
    return () => controls.stop();
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${ringColor}60)` }}
        />
      </svg>
      {showLabel && (
        <div className="flex flex-col items-center leading-none">
          <span
            ref={numberRef}
            className="font-bold tabular-nums"
            style={{ color: ringColor, fontSize: size * 0.24 }}
          >
            0
          </span>
          <span className="text-white/40 mt-0.5" style={{ fontSize: size * 0.12 }}>/ 100</span>
        </div>
      )}
    </div>
  );
}
