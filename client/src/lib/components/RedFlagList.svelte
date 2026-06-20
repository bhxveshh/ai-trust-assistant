<script lang="ts">
  import { AlertTriangle, CheckCircle2 } from '@lucide/svelte';

  type Props = { flags: string[] };
  let { flags }: Props = $props();
</script>

{#if flags.length === 0}
  <div class="flex items-center gap-3 case-card p-4 border-trust-500/40">
    <CheckCircle2 class="w-5 h-5 text-trust-500 shrink-0" />
    <p class="text-sm text-ink-300">No red flags were raised against this listing.</p>
  </div>
{:else}
  <ul class="space-y-2">
    {#each flags as flag, i}
      <li class="flex items-start gap-3 case-card border-risk-500/30 p-3">
        <span class="case-label !text-risk-500 shrink-0 mt-0.5">B-{i + 1}</span>
        <AlertTriangle class="w-4 h-4 text-risk-500 shrink-0 mt-0.5" />
        <p class="text-sm text-ink-100 leading-relaxed">{flag}</p>
      </li>
    {/each}
  </ul>
{/if}
