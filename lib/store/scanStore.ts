'use client';

import { create } from 'zustand';
import type { ScanResult } from '../engine/scorer';
import type { AISuggestion } from '../types';

export type ScanStep = 'idle' | 'parsing' | 'scanning' | 'results';

interface ScanStore {
  step: ScanStep;
  resumeText: string;
  jobDescription: string;
  fileName: string;
  scanResult: ScanResult | null;
  aiSuggestions: AISuggestion[];
  aiLoading: boolean;
  aiError: string | null;

  setStep: (step: ScanStep) => void;
  setResumeText: (text: string, fileName?: string) => void;
  setJobDescription: (jd: string) => void;
  setScanResult: (result: ScanResult) => void;
  setAISuggestions: (suggestions: AISuggestion[]) => void;
  setAILoading: (loading: boolean) => void;
  setAIError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: 'idle' as ScanStep,
  resumeText: '',
  jobDescription: '',
  fileName: '',
  scanResult: null,
  aiSuggestions: [],
  aiLoading: false,
  aiError: null,
};

export const useScanStore = create<ScanStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setResumeText: (text, fileName = '') => set({ resumeText: text, fileName }),
  setJobDescription: (jd) => set({ jobDescription: jd }),
  setScanResult: (result) => set({ scanResult: result }),
  setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
  setAILoading: (loading) => set({ aiLoading: loading }),
  setAIError: (error) => set({ aiError: error }),
  reset: () => set(initialState),
}));
