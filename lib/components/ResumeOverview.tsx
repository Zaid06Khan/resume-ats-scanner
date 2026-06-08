'use client';

import { motion } from 'framer-motion';
import type { ResumeOverview } from '../engine/scorer';

interface ResumeOverviewProps {
  overview: ResumeOverview;
  detectedSkills: string[];
}

const STAT_ITEMS = [
  { key: 'wordCount' as const, label: 'Words', icon: '📝' },
  { key: 'estimatedPages' as const, label: 'Pages', icon: '📄' },
  { key: 'sectionsFound' as const, label: 'Sections', icon: '📋' },
  { key: 'skillsFound' as const, label: 'Skills Found', icon: '⚡' },
  { key: 'positionsFound' as const, label: 'Positions', icon: '💼' },
  { key: 'educationEntries' as const, label: 'Education', icon: '🎓' },
];

export default function ResumeOverview({ overview, detectedSkills }: ResumeOverviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-white font-semibold text-lg mb-4">Resume Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STAT_ITEMS.map((item, i) => (
            <motion.div
              key={item.key}
              className="glass-card p-4 flex flex-col gap-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white font-bold text-xl tabular-nums">{overview[item.key]}</span>
              <span className="text-white/50 text-xs">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {detectedSkills.length > 0 && (
        <div>
          <h4 className="text-white/70 text-sm font-medium mb-3">
            Detected Skills <span className="text-accent">({detectedSkills.length})</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map((skill, i) => (
              <motion.span
                key={skill}
                className="pill text-xs capitalize"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
