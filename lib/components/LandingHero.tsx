'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import Link from 'next/link';
import { getColorForScore } from '../engine/platforms';

// ── data ───────────────────────────────────────────────────────────────────

const ROTATING_PLATFORMS = ['Workday', 'Oracle Taleo', 'iCIMS', 'Greenhouse', 'Lever', 'SuccessFactors'];

const PILL_SETS = [
  [['Workday', 93], ['Taleo', 69], ['Greenhouse', 84]],
  [['iCIMS', 88], ['Lever', 76], ['SuccessFactors', 81]],
  [['Greenhouse', 91], ['Workday', 72], ['Taleo', 64]],
] as [string, number][][];

const STATS = [
  { value: 12400, suffix: '+', label: 'Resumes Scanned' },
  { value: 6,     suffix: '',  label: 'ATS Platforms' },
  { value: 100,   suffix: '%', label: 'Free & Open Source' },
  { text: 'Any',               label: 'Industry or Role' },
];

const PLATFORMS = [
  'Workday', 'Oracle Taleo', 'iCIMS', 'Greenhouse', 'Lever', 'SAP SuccessFactors',
  'Workday', 'Oracle Taleo', 'iCIMS', 'Greenhouse', 'Lever', 'SAP SuccessFactors',
];

const FEATURES = [
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    gradient: 'from-violet-500 to-purple-600', glow: '#7c3aed',
    title: 'Real ATS Simulation',
    desc: 'Scores against 6 actual enterprise HCMS platforms used by Fortune 500 companies — not a generic algorithm.',
  },
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" /></svg>,
    gradient: 'from-blue-500 to-cyan-500', glow: '#3b82f6',
    title: 'Keyword Intelligence',
    desc: 'Exact, fuzzy, and semantic matching that mirrors how each system filters and ranks your resume.',
  },
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    gradient: 'from-pink-500 to-rose-500', glow: '#ec4899',
    title: 'Per-System Breakdown',
    desc: 'See exactly why each platform scores you — formatting, keywords, sections, experience, education.',
  },
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
    gradient: 'from-amber-500 to-orange-500', glow: '#f59e0b',
    title: 'AI Suggestions',
    desc: 'Claude reads your actual resume and delivers specific, prioritized fixes — never generic advice.',
  },
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    gradient: 'from-teal-500 to-emerald-500', glow: '#14b8a6',
    title: 'Job-Description Match',
    desc: 'Paste any posting for targeted keyword matching that shows precisely which skills you are missing.',
  },
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
    gradient: 'from-indigo-500 to-blue-600', glow: '#6366f1',
    title: 'Private by Design',
    desc: 'Your resume is parsed entirely in your browser. The file never leaves your device. No account.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>,
    title: 'Upload Your Resume',
    desc: 'PDF or DOCX, parsed client-side. The file itself never gets uploaded anywhere.',
  },
  {
    num: '02',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
    title: 'Add a Job Description',
    desc: 'Optional. Paste a JD for targeted scoring, or skip for general ATS-readiness.',
  },
  {
    num: '03',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
    title: 'Scored by 6 Systems',
    desc: 'Workday, Taleo, iCIMS, Greenhouse, Lever, SuccessFactors — each scores differently.',
  },
  {
    num: '04',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    title: 'See What to Fix',
    desc: 'Per-system breakdown plus prioritized AI suggestions to push past the filters.',
  },
];

// ── sub-components ──────────────────────────────────────────────────────────

function Typewriter({ words, color }: { words: string[]; color: string }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'hold' | 'erasing'>('typing');

  useEffect(() => {
    const word = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (displayed.length < word.length) {
        timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setPhase('hold'), 2200);
      }
    } else if (phase === 'hold') {
      timeout = setTimeout(() => setPhase('erasing'), 400);
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28);
      } else {
        setWordIdx((i) => (i + 1) % words.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, phase, wordIdx, words]);

  return (
    <span style={{ color }}>
      {displayed}
      <span className="tw-cursor" style={{ background: color }} />
    </span>
  );
}

function AnimatedCounter({ target, suffix, text }: { target?: number; suffix?: string; text?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (text) { ref.current.textContent = text; return; }
    const ctrl = animate(0, target ?? 0, {
      duration: 1.8, ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + (suffix ?? ''); },
    });
    return () => ctrl.stop();
  }, [inView, target, suffix, text]);

  return <span ref={ref} className="tabular-nums">{text ?? '0'}</span>;
}

function CyclingScorePills() {
  const [set, setSet] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSet((s) => (s + 1) % PILL_SETS.length);
        setVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-2" style={{ minHeight: 116 }}>
      {PILL_SETS[set].map(([name, score]) => {
        const color = getColorForScore(score as number);
        return (
          <motion.div
            key={set + name}
            className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -4 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white/45 text-xs font-mono w-24 truncate">{name}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden min-w-[50px]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums font-mono" style={{ color }}>{score}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function HeroGauge({ score }: { score: number }) {
  const size = 148;
  const strokeWidth = 9;
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctrl = animate(0, score, {
      duration: 1.4, ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toString(); },
    });
    return () => ctrl.stop();
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="url(#heroGrad)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,212,212,0.5))' }}
        />
        <defs>
          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4d4" />
            <stop offset="100%" stopColor="#22e3a0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center leading-none">
        <span ref={ref} className="font-bold tabular-nums text-3xl" style={{ color: '#00d4d4' }}>0</span>
        <span className="text-white/35 text-xs mt-1">/ 100</span>
        <span className="text-[9px] text-white/35 font-mono mt-1.5 uppercase tracking-wider">Good Standing</span>
      </div>
    </div>
  );
}

function DecoderCard() {
  return (
    <motion.div
      className="relative glass-card p-6 overflow-hidden"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
    >
      <div className="scanbeam" />
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono text-[10px] text-white/30 tracking-wider">
          ats_decoder/<span className="text-[#00d4d4]">live</span>
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[#22e3a0] font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22e3a0] animate-pulse" />
          SCANNING
        </span>
      </div>

      <div className="flex justify-center mb-5">
        <HeroGauge score={87} />
      </div>

      <div className="border-t border-white/[0.06] pt-4">
        <p className="text-white/25 text-[9px] font-mono uppercase tracking-widest mb-3">Platform Results</p>
        <CyclingScorePills />
      </div>
    </motion.div>
  );
}

function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      className="glass-card p-5 flex flex-col gap-4 cursor-default"
      style={{
        transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.3s',
        transform: hover ? 'translateY(-4px)' : 'none',
        borderColor: hover ? `${f.glow}55` : 'rgba(255,255,255,0.08)',
        boxShadow: hover ? `0 18px 50px -16px ${f.glow}77, 0 0 0 1px ${f.glow}18 inset` : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
    >
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white`}
        style={{
          transition: 'transform 0.25s',
          transform: hover ? 'scale(1.06) rotate(-3deg)' : 'none',
          boxShadow: `0 10px 26px -8px ${f.glow}bb`,
        }}
      >
        {f.icon}
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1.5">{f.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
      </div>
    </motion.div>
  );
}

// ── main component ──────────────────────────────────────────────────────────

export default function LandingHero() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-4 pt-16 pb-16 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div className="flex flex-col gap-6">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/60 text-xs font-medium backdrop-blur-sm self-start"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4d4] animate-pulse" />
              Free Forever · Open Source · No Limits
            </motion.div>

            <motion.p
              className="text-sm font-semibold uppercase tracking-widest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <Typewriter words={['Stop guessing. Start scoring.']} color="#00d4d4" />
            </motion.p>

            <motion.h1
              className="text-5xl sm:text-6xl font-bold text-white leading-[1.08] tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your resume vs.{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #00d4d4 0%, #0070f3 50%, #818cf8 100%)' }}
              >
                Real ATS Systems
              </span>
            </motion.h1>

            <motion.p
              className="text-white/50 text-base max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              See how{' '}
              <Typewriter words={ROTATING_PLATFORMS} color="#22e3a0" />
              {' '}and other enterprise HCMS platforms parse, filter, and score your
              resume — powered by documented ATS behavior, not a generic algorithm.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-start gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/scanner"
                className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-[#07070f] text-sm transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #00d4d4, #0070f3)', boxShadow: '0 0 40px rgba(0,112,243,0.35)' }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Scan Your Resume
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm text-white/55 border border-white/10 hover:text-white hover:border-white/20 transition-all"
              >
                Learn How It Works
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </a>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-6 pt-5 border-t border-white/[0.06]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="text-2xl font-bold" style={{ color: '#00d4d4' }}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} text={s.text} />
                  </span>
                  <span className="text-white/30 text-[10px] uppercase tracking-widest font-mono">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Decoder card (desktop only) */}
          <div className="hidden lg:block">
            <DecoderCard />
          </div>
        </div>
      </section>

      {/* ── PLATFORM MARQUEE ── */}
      <section className="py-10 overflow-hidden border-y border-white/[0.04]">
        <p className="text-center text-white/25 text-[10px] uppercase tracking-[0.2em] mb-6 font-mono">
          Simulates real enterprise ATS platforms used by 75%+ of Fortune 500
        </p>
        <div className="relative flex">
          <div className="flex animate-marquee gap-8 whitespace-nowrap">
            {PLATFORMS.map((name, i) => (
              <span key={i} className="text-white/30 text-sm font-medium px-4 py-2 border border-white/[0.06] rounded-lg bg-white/[0.02] flex-shrink-0">
                {name}
              </span>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none" style={{ background: 'linear-gradient(to right, #07070f, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none" style={{ background: 'linear-gradient(to left, #07070f, transparent)' }} />
        </div>
      </section>

      {/* ── WHY ATS SCREENER ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#00d4d4] text-xs font-semibold uppercase tracking-widest mb-3">Why ATS Screener</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Not another{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #00d4d4, #818cf8)' }}>
                fake ATS score
              </span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-base leading-relaxed">
              Most ATS screeners use arbitrary algorithms with no connection to real systems.
              This one simulates what actually happens inside enterprise HCMS platforms.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#00d4d4] text-xs font-semibold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Four steps to{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #00d4d4, #0070f3)' }}>
                real scores
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#00d4d4]/40 font-mono text-xs font-bold tracking-wider">{s.num}</span>
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60">
                    {s.icon}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1.5 text-sm">{s.title}</h4>
                  <p className="text-white/45 text-xs leading-relaxed">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-[1px] bg-white/10 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div
            className="rounded-2xl p-10 border border-white/10 flex flex-col items-center gap-6"
            style={{ background: 'linear-gradient(135deg, rgba(0,112,243,0.1), rgba(0,212,212,0.05))' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to beat the algorithms?</h2>
            <p className="text-white/50 text-sm">Free. No signup. Your resume stays in your browser.</p>
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-[#07070f] text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00d4d4, #0070f3)', boxShadow: '0 0 30px rgba(0,112,243,0.3)' }}
            >
              Scan My Resume — It&apos;s Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.04] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#00d4d4] to-[#0070f3] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M4 6.5L6 8.5L10 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white/30 text-xs">ATS Scanner</span>
            </div>
            <p className="text-white/20 text-xs font-mono">© 2026 Zaid Khan. Open source.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
