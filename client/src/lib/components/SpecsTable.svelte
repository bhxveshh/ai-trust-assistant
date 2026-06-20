<script lang="ts">
  type Props = { specs: Record<string, string> };
  let { specs }: Props = $props();

  const rows = $derived(Object.entries(specs ?? {}));
</script>

{#if rows.length === 0}
  <p class="text-sm text-ink-500 italic">No structured specs were found on this listing.</p>
{:else}
  <dl class="divide-y divide-desk-950/10">
    {#each rows as [key, value]}
      <div class="grid grid-cols-2 gap-3 py-2 text-sm">
        <dt class="text-desk-700 font-medium">{key}</dt>
        <dd class="font-mono text-desk-950 text-right break-words">{value}</dd>
      </div>
    {/each}
  </dl>
{/if}
