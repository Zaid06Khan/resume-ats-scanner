import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { AISuggestion } from '@/lib/types';
import { parseResume } from '@/lib/engine/nlp';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(resumeText: string, jobDescription?: string): string {
  const jdSection = jobDescription?.trim()
    ? `\n\nJob Description:\n${jobDescription.slice(0, 1500)}`
    : '';

  return `Analyze this resume for ATS (Applicant Tracking System) optimization. Return ONLY a JSON array of 4-6 suggestion objects. Each object must have these fields:
- priority: "CRITICAL", "HIGH", or "MEDIUM"
- title: short actionable title (under 10 words)
- description: specific explanation of the issue and fix (1-2 sentences)
- example: optional concrete example of the improvement

Focus on: keyword density, section completeness, bullet point quality, quantification of achievements, formatting issues, and action verbs.

Resume:
${resumeText.slice(0, 3000)}${jdSection}

Return only valid JSON array, no markdown, no prose.`;
}

function generateFallbackSuggestions(resumeText: string): AISuggestion[] {
  const parsed = parseResume(resumeText);
  const suggestions: AISuggestion[] = [];

  const actionVerbRatio = parsed.totalBullets > 0
    ? parsed.actionVerbBullets / parsed.totalBullets
    : 0;

  const quantifiedRatio = parsed.totalBullets > 0
    ? parsed.quantifiedBullets / parsed.totalBullets
    : 0;

  if (actionVerbRatio < 0.6) {
    suggestions.push({
      priority: 'CRITICAL',
      title: 'Start bullets with strong action verbs',
      description: 'Most of your bullet points don\'t begin with action verbs. ATS and recruiters expect each bullet to start with words like "Built", "Led", "Implemented", or "Optimized".',
      example: 'Change "Responsible for managing team" to "Led a 5-person engineering team that shipped 3 major features per quarter."',
    });
  }

  if (quantifiedRatio < 0.3) {
    suggestions.push({
      priority: 'CRITICAL',
      title: 'Add quantifiable achievements',
      description: 'Less than 30% of your bullets contain numbers or metrics. ATS systems score higher for quantified impact — include percentages, dollar amounts, team sizes, or time savings.',
      example: 'Change "Improved application performance" to "Reduced page load time by 40%, improving user retention by 15%."',
    });
  }

  if (!parsed.sections.skills) {
    suggestions.push({
      priority: 'HIGH',
      title: 'Add a dedicated Skills section',
      description: 'No skills section was detected. ATS systems scan for a clearly labeled "Skills" or "Technical Skills" section to extract and match your competencies.',
    });
  }

  if (parsed.skills.length < 8) {
    suggestions.push({
      priority: 'HIGH',
      title: 'Expand your technical skills list',
      description: `Only ${parsed.skills.length} skills were detected. Include all relevant tools, languages, and frameworks you have experience with to improve keyword matching.`,
    });
  }

  if (parsed.wordCount < 400) {
    suggestions.push({
      priority: 'HIGH',
      title: 'Expand resume content',
      description: 'Your resume appears too short. ATS systems generally expect 400-700 words for entry-level and 600-900 words for senior roles. Add more detail to your experience bullets.',
    });
  } else if (parsed.wordCount > 900) {
    suggestions.push({
      priority: 'MEDIUM',
      title: 'Condense resume to one page',
      description: 'Your resume may be too long. Most ATS systems and recruiters prefer a focused one-page resume. Remove older or less relevant experience.',
    });
  }

  if (!parsed.sections.certifications) {
    suggestions.push({
      priority: 'MEDIUM',
      title: 'Add certifications section',
      description: 'A certifications section signals continuous learning and boosts keyword scores. List any relevant certifications, even in-progress ones.',
    });
  }

  if (parsed.hasMultiColumn) {
    suggestions.push({
      priority: 'CRITICAL',
      title: 'Remove multi-column layout',
      description: 'A multi-column layout was detected. Most ATS systems parse resumes linearly and will scramble content from multi-column formats, causing critical information to be missed.',
    });
  }

  if (!parsed.sections.summary) {
    suggestions.push({
      priority: 'MEDIUM',
      title: 'Add a professional summary',
      description: 'A 2-3 sentence summary at the top of your resume lets ATS systems and recruiters quickly understand your profile and match it against job requirements.',
    });
  }

  return suggestions.slice(0, 6);
}

function parseClaudeResponse(text: string): AISuggestion[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found');
  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) throw new Error('Response is not an array');
  return parsed.filter(
    (item): item is AISuggestion =>
      typeof item === 'object' &&
      ['CRITICAL', 'HIGH', 'MEDIUM'].includes(item.priority) &&
      typeof item.title === 'string' &&
      typeof item.description === 'string'
  );
}

export async function POST(req: NextRequest) {
  let resumeText = '';
  let jobDescription = '';

  try {
    const body = await req.json();
    resumeText = body.resumeText ?? '';
    jobDescription = body.jobDescription ?? '';

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Resume text is too short or missing' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        suggestions: generateFallbackSuggestions(resumeText),
        fallback: true,
      });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildPrompt(resumeText, jobDescription) }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

    const suggestions = parseClaudeResponse(content.text);
    if (suggestions.length === 0) throw new Error('No valid suggestions parsed');

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({
      suggestions: generateFallbackSuggestions(resumeText),
      fallback: true,
    });
  }
}
