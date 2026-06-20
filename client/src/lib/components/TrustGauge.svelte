<script lang="ts">
  import { toneForScore, toneClasses } from '../verdict';

  type Props = { score: number };
  let { score }: Props = $props();

  const clamped = $derived(Math.max(0, Math.min(100, Math.round(score))));
  const tone = $derived(toneForScore(clamped));

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = $derived(circumference - (clamped / 100) * circumference);

  const strokeColor = $derived(
    tone === 'trust' ? 'var(--color-trust-500)' : tone === 'caution' ? 'var(--color-caution-500)' : 'var(--color-risk-500)'
  );
</script>

<div class="flex flex-col items-center">
  <div class="relative w-40 h-40">
    <svg viewBox="0 0 150 150" class="w-40 h-40 -rotate-90">
      <circle cx="75" cy="75" r={radius} fill="none" stroke="var(--color-desk-700)" stroke-width="10" />
      <circle
        cx="75"
        cy="75"
        r={radius}
        fill="none"
        stroke={strokeColor}
        stroke-width="10"
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={offset}
        style="transition: stroke-dashoffset 700ms ease, stroke 300ms ease;"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="font-display text-4xl font-semibold {toneClasses[tone].text}">{clamped}</span>
      <span class="case-label !text-ink-500">/ 100</span>
    </div>
  </div>
  <p class="case-label mt-3">Trust score</p>
</div>
