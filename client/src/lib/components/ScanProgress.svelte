<script lang="ts">
  import { Check, Loader2, FileSearch, Globe2, Brain } from '@lucide/svelte';

  type Props = { stage: number }; // 0 idle, 1-3 active step, 4 complete
  let { stage }: Props = $props();

  const steps = [
    { label: 'Extracting listing data', detail: 'Reading the page — title, price, rating, specs', icon: FileSearch },
    { label: 'Cross-referencing web evidence', detail: '5 parallel checks: reputation, domain trust, fraud signals, price benchmark, complaints', icon: Globe2 },
    { label: 'Running the clinical assessment', detail: 'Weighing scraped data against web evidence', icon: Brain }
  ];

  function statusFor(index: number): 'pending' | 'active' | 'done' {
    const stepNumber = index + 1;
    if (stage > stepNumber) return 'done';
    if (stage === stepNumber) return 'active';
    return 'pending';
  }
</script>

<div class="space-y-3" role="status" aria-live="polite">
  {#each steps as step, i}
    {@const status = statusFor(i)}
    <div
      class="case-card flex items-start gap-4 p-4 transition-colors"
      class:border-brass-500={status === 'active'}
      class:opacity-50={status === 'pending'}
    >
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border"
        class:border-trust-500={status === 'done'}
        class:bg-trust-600={status === 'done'}
        class:border-brass-400={status === 'active'}
        class:border-desk-600={status === 'pending'}
      >
        {#if status === 'done'}
          <Check class="w-4 h-4 text-desk-950" />
        {:else if status === 'active'}
          <Loader2 class="w-4 h-4 text-brass-400 animate-spin" />
        {:else}
          <step.icon class="w-4 h-4 text-ink-500" />
        {/if}
      </div>
      <div>
        <p class="text-sm font-medium text-ink-100">{step.label}</p>
        <p class="text-xs text-ink-500 mt-0.5">{step.detail}</p>
      </div>
    </div>
  {/each}
</div>
