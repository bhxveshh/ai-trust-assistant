import type { Verdict } from './types';

export type Tone = 'trust' | 'caution' | 'risk';

export function toneForVerdict(verdict: Verdict): Tone {
  if (verdict === 'Highly Trusted') return 'trust';
  if (verdict === 'Exercise Caution') return 'caution';
  return 'risk';
}

export function toneForScore(score: number): Tone {
  if (score >= 75) return 'trust';
  if (score >= 50) return 'caution';
  return 'risk';
}

export const toneClasses: Record<Tone, { text: string; border: string; bg: string; dot: string }> = {
  trust: { text: 'text-trust-500', border: 'border-trust-500', bg: 'bg-trust-600', dot: 'bg-trust-500' },
  caution: { text: 'text-caution-500', border: 'border-caution-500', bg: 'bg-caution-600', dot: 'bg-caution-500' },
  risk: { text: 'text-risk-500', border: 'border-risk-500', bg: 'bg-risk-600', dot: 'bg-risk-500' }
};
