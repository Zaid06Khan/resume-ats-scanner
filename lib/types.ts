export type { PlatformConfig, DimensionWeights } from './data/platform-weights';
export type { ParsedResume, DetectedSections } from './engine/nlp';
export type { ScanResult, PlatformResult, DimensionScores, PriorityArea, ResumeOverview } from './engine/scorer';

export interface AISuggestion {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  example?: string;
}
