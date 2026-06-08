'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanStore } from '../store/scanStore';
import { parseResume } from '../engine/nlp';
import { scorePlatforms } from '../engine/scorer';

const STEPS = ['Upload', 'Parse', 'Scan', 'Results'] as const;
type StepLabel = typeof STEPS[number];

const STEP_MAP: Record<string, StepLabel> = {
  idle: 'Upload', parsing: 'Parse', scanning: 'Scan', results: 'Results',
};

const PLATFORM_NAMES = ['Workday', 'Taleo', 'iCIMS', 'Greenhouse', 'Lever', 'SuccessFactors'];

const SAMPLE_RESUME = `Alex Morgan
alex.morgan@email.com | linkedin.com/in/alexmorgan | github.com/alexmorgan | San Francisco, CA

EXPERIENCE

Senior Software Engineer — Stripe, San Francisco, CA (Jan 2022 – Present)
• Architected and shipped a real-time payment fraud detection system processing 2M+ transactions/day, reducing chargebacks by 34%
• Led a team of 5 engineers to migrate legacy monolith to microservices, cutting deployment time from 3 hours to 12 minutes
• Optimized PostgreSQL query performance by 78% through index redesign and query plan analysis
• Mentored 3 junior engineers who were promoted to mid-level roles within 18 months

Software Engineer — Airbnb, San Francisco, CA (Mar 2019 – Dec 2021)
• Built and maintained search ranking algorithms serving 150M+ monthly active users across 62 countries
• Reduced page load time by 42% by implementing React lazy-loading and server-side rendering optimizations
• Delivered 8 A/B tests that improved booking conversion rate by 11% collectively

Software Engineer — Dropbox, San Francisco, CA (Jun 2017 – Feb 2019)
• Implemented end-to-end encrypted file sharing feature adopted by 500K+ enterprise users in Q1 2018
• Reduced infrastructure costs by $1.2M/year through caching layer redesign using Redis

SKILLS
Languages: Python, TypeScript, JavaScript, Go, SQL
Frontend: React, Next.js, Vue.js, Tailwind CSS, GraphQL
Backend: Node.js, FastAPI, Django, gRPC, REST APIs
Cloud & DevOps: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes, Terraform, CI/CD
Databases: PostgreSQL, Redis, MongoDB, Elasticsearch
Tools: Git, Jira, Datadog, Figma

EDUCATION
B.S. Computer Science — UC Berkeley (2013 – 2017) · GPA: 3.8

CERTIFICATIONS
AWS Certified Solutions Architect – Associate (2023)
Google Cloud Professional Data Engineer (2022)

PROJECTS
OpenMetrics — Open-source observability toolkit with 1,200+ GitHub stars
ResumeAI — Side project: AI-powered resume optimizer built with Next.js and Claude API`;

function StepIndicator({ step }: { step: string }) {
  const current = STEP_MAP[step] ?? 'Upload';
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((s, i) => {
        const isActive = s === current;
        const isDone = i < idx;
        return (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isActive ? 'bg-[#0070f3]/20 text-[#00d4d4] border border-[#00d4d4]/30'
              : isDone  ? 'text-[#22e3a0]'
              : 'text-white/25'
            }`}>
              {isDone
                ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#00d4d4] animate-pulse' : 'bg-white/20'}`} />
              }
              {s}
            </div>
            {i < STEPS.length - 1 && (
              <span className={`mx-2 text-xs ${i < idx ? 'text-[#22e3a0]/40' : 'text-white/10'}`}>—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnalyzingView({ step, fileName }: { step: string; fileName: string }) {
  const [lockedCount, setLockedCount] = useState(0);

  useEffect(() => {
    if (step !== 'scanning') { setLockedCount(0); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setLockedCount(i);
      if (i >= PLATFORM_NAMES.length) clearInterval(id);
    }, 320);
    return () => clearInterval(id);
  }, [step]);

  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-16">
      <StepIndicator step={step} />

      <div className="relative glass-card p-8 text-center overflow-hidden">
        <div className="scanbeam" />

        {/* Spinner */}
        <div className="flex justify-center mb-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#00d4d4] border-r-[#22e3a0] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#00d4d4" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-1.5">
          {step === 'parsing' ? 'Parsing your resume…' : 'Decoding across 6 ATS systems…'}
        </h2>
        {fileName && (
          <p className="text-white/30 text-xs font-mono mb-6">{fileName}</p>
        )}

        {/* Platform lock-in grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {PLATFORM_NAMES.map((name, i) => {
            const isLocked = step === 'scanning' && i < lockedCount;
            const isActive = step === 'scanning' && i === lockedCount;
            return (
              <motion.div
                key={name}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300"
                style={{
                  border: isLocked
                    ? '1px solid rgba(34,227,160,0.35)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isLocked
                    ? 'rgba(34,227,160,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  opacity: step === 'parsing' ? 0.35 : 1,
                }}
              >
                <span className={`font-mono text-xs ${isLocked ? 'text-[#22e3a0]' : 'text-white/40'}`}>{name}</span>
                {isLocked
                  ? <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#22e3a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#00d4d4] animate-pulse' : 'bg-white/20'}`} />
                }
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ResumeUploader() {
  const {
    step, jobDescription,
    setStep, setResumeText, setJobDescription,
    setScanResult, setAISuggestions, setAILoading, setAIError, fileName,
  } = useScanStore();

  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [showJD, setShowJD] = useState(false);

  const isProcessing = step === 'parsing' || step === 'scanning';

  const runScan = useCallback(async (text: string) => {
    setParseError(null);
    setStep('scanning');
    const parsed = parseResume(text);
    const result = scorePlatforms(parsed, jobDescription);
    setScanResult(result);
    setStep('results');

    setAILoading(true);
    setAIError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text, jobDescription }),
      });
      const data = await res.json();
      setAISuggestions(data.suggestions ?? []);
      if (data.fallback) setAIError('fallback');
    } catch {
      setAIError('Failed to load AI suggestions');
      setAISuggestions([]);
    } finally {
      setAILoading(false);
    }
  }, [jobDescription, setStep, setScanResult, setAILoading, setAIError, setAISuggestions]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setParseError(null);
    setStep('parsing');
    try {
      const { extractText } = await import('../engine/parser');
      const text = await extractText(file);
      if (text.trim().length < 50) throw new Error('Could not extract text. Try pasting your resume instead.');
      setResumeText(text, file.name);
      await runScan(text);
    } catch (err) {
      setStep('idle');
      setParseError(err instanceof Error ? err.message : 'Failed to parse file.');
    }
  }, [setStep, setResumeText, runScan]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: step !== 'idle',
  });

  const handlePasteSubmit = async () => {
    if (pasteText.trim().length < 50) {
      setParseError('Please paste at least 50 characters of resume text.');
      return;
    }
    setResumeText(pasteText, 'Pasted Resume');
    setStep('parsing');
    await runScan(pasteText);
  };

  const handleSample = async () => {
    setResumeText(SAMPLE_RESUME, 'Alex_Morgan_Resume.pdf');
    setStep('parsing');
    await runScan(SAMPLE_RESUME);
  };

  if (isProcessing) {
    return <AnalyzingView step={step} fileName={fileName} />;
  }

  const currentStepLabel = STEP_MAP[step] ?? 'Upload';
  const stepIndex = STEPS.indexOf(currentStepLabel);

  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-16">
      <StepIndicator step={step} />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Scan your <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #00d4d4, #0070f3)' }}>resume</span>
        </h1>
        <p className="text-white/40 text-sm">
          Scored across {PLATFORM_NAMES.slice(0, 3).join(', ')}, and {PLATFORM_NAMES.length - 3} more
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center mb-5">
        <div className="flex p-1 rounded-full border border-white/10 bg-white/[0.03]">
          {['Upload File', 'Paste Text'].map((label, i) => (
            <button
              key={label}
              onClick={() => setIsPasteMode(i === 1)}
              className={`px-5 py-1.5 text-sm rounded-full transition-all font-medium ${
                isPasteMode === (i === 1)
                  ? 'text-[#07070f] shadow-sm'
                  : 'text-white/45 hover:text-white/70'
              }`}
              style={isPasteMode === (i === 1) ? { background: 'linear-gradient(135deg, #00d4d4, #0070f3)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isPasteMode ? (
          <motion.div key="dropzone" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div
              {...getRootProps()}
              className={`relative rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 border-2 border-dashed overflow-hidden ${
                isDragActive ? 'border-[#00d4d4] bg-[#00d4d4]/5 scale-[1.01]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              {isDragActive && <div className="scanbeam" />}
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isDragActive ? 'bg-[#00d4d4]/20' : 'bg-white/[0.05] border border-white/10'
                }`}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={isDragActive ? '#00d4d4' : 'rgba(255,255,255,0.4)'} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">
                    {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-white/35 text-xs font-mono">PDF or DOCX · Max 10 MB · Parsed in your browser</p>
                </div>
                <button
                  type="button"
                  className="px-5 py-2 rounded-full text-sm font-semibold text-[#07070f] transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #00d4d4, #0070f3)' }}
                >
                  Browse File
                </button>
              </div>
            </div>

            {/* Sample resume shortcut */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-white/25 text-xs">No resume handy?</span>
              <button
                onClick={handleSample}
                className="flex items-center gap-1.5 text-[#00d4d4] text-xs font-semibold hover:text-[#22e3a0] transition-colors"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Try a sample resume
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="paste" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your resume text here…"
              className="w-full h-52 bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-white/80 text-sm resize-none outline-none focus:border-[#00d4d4]/40 transition-colors placeholder:text-white/20"
            />
            <button
              onClick={handlePasteSubmit}
              disabled={pasteText.trim().length < 50}
              className="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-[#07070f] transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #00d4d4, #0070f3)' }}
            >
              Scan Resume
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {parseError && (
        <motion.div
          className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {parseError}
        </motion.div>
      )}

      {/* Job description */}
      <div className="mt-5">
        <button
          onClick={() => setShowJD(!showJD)}
          className="flex items-center gap-2 text-white/35 text-sm hover:text-white/55 transition-colors w-full"
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`transition-transform ${showJD ? 'rotate-90' : ''}`}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add job description for targeted keyword scoring{showJD ? '' : ' (optional)'}
        </button>

        <AnimatePresence>
          {showJD && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to improve keyword matching accuracy…"
                className="mt-3 w-full h-32 bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-white/70 text-sm resize-none outline-none focus:border-[#00d4d4]/30 transition-colors placeholder:text-white/20"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trust badges */}
      <div className="mt-8 flex items-center justify-center gap-5 text-white/20 text-xs">
        {['Private by design', 'No signup needed', 'Instant results'].map((t) => (
          <span key={t} className="flex items-center gap-1">
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
