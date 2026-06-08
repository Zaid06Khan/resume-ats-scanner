export { PLATFORMS } from '../data/platform-weights';
export type { PlatformConfig, DimensionWeights } from '../data/platform-weights';

export function getColorForScore(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#00d4d4';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
}

export function getRatingLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Poor';
}

export function getScoreClass(score: number): string {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-accent';
  if (score >= 55) return 'text-amber-400';
  return 'text-red-400';
}
