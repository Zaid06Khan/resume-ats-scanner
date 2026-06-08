import { SKILLS_TAXONOMY, SKILL_STEMS } from '../data/skills-taxonomy';
import { ACTION_VERBS } from '../data/action-verbs';

export interface DetectedSections {
  contact: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  summary: boolean;
}

export interface ParsedResume {
  fullText: string;
  sections: DetectedSections;
  skills: string[];
  bullets: string[];
  quantifiedBullets: number;
  actionVerbBullets: number;
  totalBullets: number;
  wordCount: number;
  estimatedPages: number;
  detectedDegree: boolean;
  hasMultiColumn: boolean;
  hasContactInfo: boolean;
  positions: number;
  educationEntries: number;
}

const SECTION_PATTERNS: Record<keyof DetectedSections, RegExp> = {
  contact:        /\b(contact|phone|email|linkedin|github|address|mobile|tel)\b/i,
  experience:     /\b(experience|work history|employment|professional background|work experience|career)\b/i,
  education:      /\b(education|academic|degree|university|college|school)\b/i,
  skills:         /\b(skills|technical skills|competencies|technologies|expertise|proficiencies)\b/i,
  projects:       /\b(projects?|portfolio|side projects?|open source|personal projects?)\b/i,
  certifications: /\b(certifications?|licenses?|credentials|certificates?|accreditations?)\b/i,
  summary:        /\b(summary|objective|profile|about me|overview|professional summary)\b/i,
};

const QUANTIFICATION_RE = /\d+[%$]?|\$[\d,]+|[\d,]+\s*(percent|million|billion|thousand|k\b)/i;
const DEGREE_RE = /\b(bachelor'?s?|master'?s?|phd|ph\.d|b\.s\.?|m\.s\.?|b\.a\.?|m\.a\.?|mba|associate'?s?|doctorate)\b/i;
const DATE_RANGE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[\s.]*\d{4}\s*[-–—to]+\s*(present|current|now|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|\d{4})/gi;
const YEAR_RANGE_RE = /\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|current|now)\b/gi;

export function detectSections(text: string): DetectedSections {
  const result = {} as DetectedSections;
  for (const key of Object.keys(SECTION_PATTERNS) as Array<keyof DetectedSections>) {
    result[key] = SECTION_PATTERNS[key].test(text);
  }
  return result;
}

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const skill of SKILLS_TAXONOMY) {
    if (lower.includes(skill)) {
      found.add(skill);
    }
  }

  for (const [stem, canonical] of Object.entries(SKILL_STEMS)) {
    if (lower.includes(stem) && !found.has(canonical)) {
      found.add(canonical);
    }
  }

  return Array.from(found).sort();
}

export function extractBullets(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^[•\-\*•▪◦–—►▸▶→·]\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[•\-\*•▪◦–—►▸▶→·]\s+/, '').trim());
    } else if (/^\d+\.\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^\d+\.\s+/, '').trim());
    }
  }

  return bullets.filter(b => b.length > 10);
}

export function detectQuantifiedBullets(bullets: string[]): number {
  return bullets.filter(b => QUANTIFICATION_RE.test(b)).length;
}

export function detectActionVerbBullets(bullets: string[]): number {
  return bullets.filter(bullet => {
    const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    return ACTION_VERBS.includes(firstWord);
  }).length;
}

export function detectDegree(text: string): boolean {
  return DEGREE_RE.test(text);
}

export function detectPositions(text: string): number {
  const dateMatches = text.match(DATE_RANGE_RE) || [];
  const yearMatches = text.match(YEAR_RANGE_RE) || [];
  const total = dateMatches.length + yearMatches.length;
  // Divide by 2 since each position has start + end dates; clamp to reasonable range
  return Math.min(Math.max(Math.round(total / 1.5), 0), 20);
}

export function detectMultiColumn(text: string): boolean {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 10) return false;
  const shortLines = lines.filter(l => l.trim().length <= 35);
  return shortLines.length / lines.length > 0.6;
}

export function detectContactInfo(text: string): boolean {
  const emailRe = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
  const phoneRe = /(\+?\d[\d\s\-().]{7,}\d)/;
  const linkedinRe = /linkedin\.com\/(in\/[\w-]+)?/i;
  return emailRe.test(text) || phoneRe.test(text) || linkedinRe.test(text);
}

export function estimatePages(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 350));
}

export function parseResume(text: string): ParsedResume {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sections = detectSections(text);
  const skills = extractSkills(text);
  const bullets = extractBullets(text);
  const quantifiedBullets = detectQuantifiedBullets(bullets);
  const actionVerbBullets = detectActionVerbBullets(bullets);
  const positions = detectPositions(text);

  const educationEntries = Math.max(
    (text.match(/\b(university|college|institute of technology|school of)\b/gi) || []).length,
    positions > 0 ? 1 : 0
  );

  return {
    fullText: text,
    sections,
    skills,
    bullets,
    quantifiedBullets,
    actionVerbBullets,
    totalBullets: bullets.length,
    wordCount,
    estimatedPages: estimatePages(wordCount),
    detectedDegree: detectDegree(text),
    hasMultiColumn: detectMultiColumn(text),
    hasContactInfo: detectContactInfo(text),
    positions,
    educationEntries,
  };
}
