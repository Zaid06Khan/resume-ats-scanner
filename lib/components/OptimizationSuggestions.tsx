'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { AISuggestion } from '../types';

interface OptimizationSuggestionsProps {
  aiSuggestions: AISuggestion[];
  aiLoading: boolean;
  aiError: string | null;
}

const PRIORITY_STYLES: Record<AISuggestion['priority'], string> = {
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/30',
  HIGH: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  MEDIUM: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
};

const PRIORITY_DOT: Record<AISuggestion['priority'], string> = {
  CRITICAL: 'bg-red-400',
  HIGH: 'bg-amber-400',
  MEDIUM: 'bg-blue-400',
};

function SkeletonCard() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-16 bg-white/10 rounded-full" />
        <div className="h-4 w-40 bg-white/10 rounded" />
      </div>
      <div className="h-3 bg-white/5 rounded mb-1.5" />
      <div className="h-3 bg-white/5 rounded w-3/4" />
    </div>
  );
}

export default function OptimizationSuggestions({ aiSuggestions, aiLoading, aiError }: OptimizationSuggestionsProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-white font-semibold text-lg">Optimization Suggestions</h3>
        {aiLoading && (
          <span className="text-xs text-accent animate-pulse">Generating AI suggestions…</span>
        )}
        {aiError && (
          <span className="text-xs text-amber-400">Using rule-based analysis</span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {aiLoading && aiSuggestions.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : !aiLoading && aiSuggestions.length === 0
            ? (
              <div className="text-center py-8 text-white/25 text-sm">
                No suggestions available. Your resume looks solid!
              </div>
            )
            : aiSuggestions.map((suggestion, i) => (
                <motion.div
                  key={`${suggestion.title}-${i}`}
                  className="glass-card p-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[suggestion.priority]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[suggestion.priority]}`}>
                          {suggestion.priority}
                        </span>
                        <span className="text-white font-medium text-sm">{suggestion.title}</span>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">{suggestion.description}</p>
                      {suggestion.example && (
                        <p className="text-white/40 text-xs mt-2 italic border-l border-white/10 pl-3">
                          {suggestion.example}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
          }
        </AnimatePresence>
      </div>
    </div>
  );
}
