import { PLATFORMS } from '../data/platform-weights';
import type { DimensionWeights, PlatformConfig } from '../data/platform-weights';
import type { ParsedResume } from './nlp';
import { extractSkills } from './nlp';

export interface DimensionScores {
  formatting: number;
  keywords: number;
  sections: number;
  experienceQuality: number;
  education: number;
}

export interface PlatformResult {
  platformId: string;
  platformName: string;
  dimensionScores: DimensionScores;
  totalScore: number;
  passed: boolean;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface PriorityArea {
  rank: number;
  dimension: keyof DimensionWeights;
  currentAvgScore: number;
  label: string;
  description: string;
}

export interface ResumeOverview {
  wordCount: number;
  estimatedPages: number;
  sectionsFound: number;
  skillsFound: number;
  positionsFound: number;
  educationEntries: number;
}

export interface ScanResult {
  platforms: PlatformResult[];
  averageScore: number;
  passCount: number;
  priorityAreas: PriorityArea[];
  overview: ResumeOverview;
  detectedSkills: string[];
}

const DIMENSION_LABELS: Record<keyof DimensionWeights, string> = {
  formatting: 'Formatting',
  keywords: 'Keywords',
  sections: 'Section Structure',
  experienceQuality: 'Experience Quality',
  education: 'Education',
};

const DIMENSION_DESCRIPTIONS: Record<keyof DimensionWeights, string> = {
  formatting: 'Avoid multi-column layouts, tables, and images. Keep structure clean.',
  keywords: 'Include more relevant technical skills and industry keywords.',
  sections: 'Add missing sections: Contact, Experience, Education, Skills, Projects, Certifications.',
  experienceQuality: 'Start bullets with action verbs and include quantifiable achievements.',
  education: 'List your degree, field of study, and institution clearly.',
};

function scoreFormatting(parsed: ParsedResume): number {
  let score = 100;
  if (parsed.hasMultiColumn) score -= 30;
  if (!parsed.hasContactInfo) score -= 15;
  if (parsed.wordCount < 200) score -= 25;
  else if (parsed.wordCount > 1200) score -= 15;
  return Math.max(0, score);
}

function scoreKeywords(parsed: ParsedResume, jobDescription?: string): number {
  const baseScore = Math.min(100, (parsed.skills.length / 15) * 100);

  if (!jobDescription || jobDescription.trim().length < 20) {
    return Math.round(baseScore);
  }

  const jdSkills = extractSkills(jobDescription);
  if (jdSkills.length === 0) return Math.round(baseScore);

  const matched = jdSkills.filter(s => parsed.skills.includes(s)).length;
  const jdScore = Math.min(100, (matched / jdSkills.length) * 100);

  return Math.round(baseScore * 0.4 + jdScore * 0.6);
}

function scoreSections(sections: ParsedResume['sections']): number {
  const keys: Array<keyof typeof sections> = ['contact', 'experience', 'education', 'skills', 'projects', 'certifications'];
  const found = keys.filter(k => sections[k]).length;
  return Math.round((found / keys.length) * 100);
}

function scoreExperienceQuality(parsed: ParsedResume): number {
  if (parsed.totalBullets === 0) return 20;
  const quantifiedRatio = parsed.quantifiedBullets / parsed.totalBullets;
  const actionVerbRatio = parsed.actionVerbBullets / parsed.totalBullets;
  return Math.round(quantifiedRatio * 50 + actionVerbRatio * 50);
}

function scoreEducation(parsed: ParsedResume): number {
  return parsed.detectedDegree ? 100 : 40;
}

function getRating(score: number): PlatformResult['rating'] {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Poor';
}

function scoreSinglePlatform(
  parsed: ParsedResume,
  platform: PlatformConfig,
  jobDescription?: string
): PlatformResult {
  const dimensionScores: DimensionScores = {
    formatting: scoreFormatting(parsed),
    keywords: scoreKeywords(parsed, jobDescription),
    sections: scoreSections(parsed.sections),
    experienceQuality: scoreExperienceQuality(parsed),
    education: scoreEducation(parsed),
  };

  const { weights } = platform;
  const totalScore = Math.round(
    dimensionScores.formatting * weights.formatting +
    dimensionScores.keywords * weights.keywords +
    dimensionScores.sections * weights.sections +
    dimensionScores.experienceQuality * weights.experienceQuality +
    dimensionScores.education * weights.education
  );

  return {
    platformId: platform.id,
    platformName: platform.name,
    dimensionScores,
    totalScore,
    passed: totalScore >= platform.passingScore,
    rating: getRating(totalScore),
  };
}

function derivePriorityAreas(platforms: PlatformResult[]): PriorityArea[] {
  const dimensions: Array<keyof DimensionWeights> = ['formatting', 'keywords', 'sections', 'experienceQuality', 'education'];

  const avgScores = dimensions.map(dim => ({
    dimension: dim,
    avgScore: Math.round(platforms.reduce((sum, p) => sum + p.dimensionScores[dim], 0) / platforms.length),
  }));

  return avgScores
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5)
    .map((item, index) => ({
      rank: index + 1,
      dimension: item.dimension,
      currentAvgScore: item.avgScore,
      label: DIMENSION_LABELS[item.dimension],
      description: DIMENSION_DESCRIPTIONS[item.dimension],
    }));
}

export function scorePlatforms(parsed: ParsedResume, jobDescription?: string): ScanResult {
  const platforms = PLATFORMS.map(p => scoreSinglePlatform(parsed, p, jobDescription));
  const averageScore = Math.round(platforms.reduce((s, p) => s + p.totalScore, 0) / platforms.length);
  const passCount = platforms.filter(p => p.passed).length;
  const priorityAreas = derivePriorityAreas(platforms);

  const sectionsFound = Object.values(parsed.sections).filter(Boolean).length;

  const overview: ResumeOverview = {
    wordCount: parsed.wordCount,
    estimatedPages: parsed.estimatedPages,
    sectionsFound,
    skillsFound: parsed.skills.length,
    positionsFound: parsed.positions,
    educationEntries: parsed.educationEntries,
  };

  return {
    platforms,
    averageScore,
    passCount,
    priorityAreas,
    overview,
    detectedSkills: parsed.skills,
  };
}
