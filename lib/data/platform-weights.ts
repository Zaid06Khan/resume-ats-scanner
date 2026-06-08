export interface DimensionWeights {
  formatting: number;
  keywords: number;
  sections: number;
  experienceQuality: number;
  education: number;
}

export interface PlatformConfig {
  id: string;
  name: string;
  weights: DimensionWeights;
  passingScore: number;
  description: string;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'workday',
    name: 'Workday',
    passingScore: 70,
    description: 'Balances formatting and keyword matching',
    weights: { formatting: 0.30, keywords: 0.35, sections: 0.15, experienceQuality: 0.15, education: 0.05 },
  },
  {
    id: 'taleo',
    name: 'Taleo',
    passingScore: 70,
    description: 'Strictest keyword matching system',
    weights: { formatting: 0.20, keywords: 0.45, sections: 0.15, experienceQuality: 0.15, education: 0.05 },
  },
  {
    id: 'icims',
    name: 'iCIMS',
    passingScore: 70,
    description: 'Most forgiving, prioritizes section completeness',
    weights: { formatting: 0.25, keywords: 0.30, sections: 0.20, experienceQuality: 0.15, education: 0.10 },
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    passingScore: 70,
    description: 'Prioritizes clean formatting above all',
    weights: { formatting: 0.35, keywords: 0.25, sections: 0.20, experienceQuality: 0.15, education: 0.05 },
  },
  {
    id: 'lever',
    name: 'Lever',
    passingScore: 70,
    description: 'Values experience quality and impact',
    weights: { formatting: 0.25, keywords: 0.30, sections: 0.20, experienceQuality: 0.20, education: 0.05 },
  },
  {
    id: 'successfactors',
    name: 'SuccessFactors',
    passingScore: 70,
    description: 'Balanced with emphasis on education',
    weights: { formatting: 0.20, keywords: 0.35, sections: 0.20, experienceQuality: 0.15, education: 0.10 },
  },
];
