<script lang="ts">
  import { ShieldCheck, ShieldAlert, ShieldX } from '@lucide/svelte';
  import { toneForVerdict } from '../verdict';
  import type { Verdict } from '../types';

  type Props = { verdict: Verdict };
  let { verdict }: Props = $props();

  const tone = $derived(toneForVerdict(verdict));
  const Icon = $derived(tone === 'trust' ? ShieldCheck : tone === 'caution' ? ShieldAlert : ShieldX);

  const colorVar = $derived(
    tone === 'trust' ? 'var(--color-trust-500)' : tone === 'caution' ? 'var(--color-caution-500)' : 'var(--color-risk-500)'
  );
</script>

<div
  class="select-none inline-flex items-center gap-2 px-4 py-2 rounded-sm border-[3px] -rotate-6 shadow-lg"
  style="border-color: {colorVar}; color: {colorVar}; box-shadow: 0 0 0 1px {colorVar} inset, 0 6px 18px -8px {colorVar};"
>
  <Icon class="w-5 h-5" strokeWidth={2.5} />
  <span class="font-display font-bold tracking-wide uppercase text-sm whitespace-nowrap">{verdict}</span>
</div>
