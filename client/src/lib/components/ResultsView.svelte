<script lang="ts">
  import { ExternalLink, ImageOff, Star, FilePlus2 } from '@lucide/svelte';
  import type { AnalysisRecord } from '../types';
  import { appState } from '../stores/app.svelte';
  import VerdictStamp from './VerdictStamp.svelte';
  import TrustGauge from './TrustGauge.svelte';
  import SpecsTable from './SpecsTable.svelte';
  import RedFlagList from './RedFlagList.svelte';

  type Props = { record: AnalysisRecord };
  let { record }: Props = $props();

  let imgError = $state(false);

  const caseId = $derived(
    record._id ? record._id.slice(-8).toUpperCase() : 'PENDING'
  );

  const dateLabel = $derived(
    record.createdAt
      ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.createdAt))
      : ''
  );

  let hostname = $derived.by(() => {
    try {
      return new URL(record.targetUrl).hostname.replace('www.', '');
    } catch {
      return record.targetUrl;
    }
  });
</script>

<div class="max-w-6xl mx-auto px-5 py-10 sm:py-14">
  <!-- Case header -->
  <div class="case-card p-6 mb-6 flex flex-wrap items-start justify-between gap-5">
    <div>
      <p class="case-label mb-2">Case file #{caseId}</p>
      <h1 class="font-display text-2xl font-semibold mb-2 max-w-xl truncate" title={record.scrapedData.title}>
        {record.scrapedData.title || 'Untitled listing'}
      </h1>
      <a
        href={record.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-ink-300 hover:text-brass-400 transition-colors inline-flex items-center gap-1.5"
      >
        {hostname}
        <ExternalLink class="w-3.5 h-3.5" />
      </a>
      {#if dateLabel}
        <p class="case-label !text-ink-500 mt-2">Opened {dateLabel}</p>
      {/if}
    </div>
    <VerdictStamp verdict={record.aiAssessment.verdict} />
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
    <!-- Exhibit A: scraped listing data -->
    <div class="lg:col-span-3 exhibit-card p-6">
      <p class="case-label !text-desk-600 mb-4">Exhibit A — Listing as scraped</p>

      <div class="flex flex-col sm:flex-row gap-5 mb-5">
        <div class="w-full sm:w-36 h-36 rounded bg-desk-950/10 border border-desk-950/15 flex flex-col items-center justify-center gap-1.5 overflow-hidden shrink-0">
          {#if record.scrapedData.imageUrl && !imgError}
            <img
              src={record.scrapedData.imageUrl}
              alt={record.scrapedData.title}
              class="w-full h-full object-contain"
              onerror={() => (imgError = true)}
            />
          {:else}
            <ImageOff class="w-7 h-7 text-desk-950/45" />
            <span class="case-label !text-desk-950/45 !text-[0.6rem]">No image</span>
          {/if}
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-display text-lg font-semibold mb-2 leading-snug">{record.scrapedData.title || 'Untitled listing'}</p>
          <div class="flex items-center gap-4 flex-wrap">
            <div>
              <p class="case-label !text-desk-600">Listed price</p>
              <p class="font-display text-2xl font-semibold">{record.scrapedData.price || '—'}</p>
            </div>
            {#if record.scrapedData.rating}
              <div class="flex items-center gap-1 text-sm">
                <Star class="w-4 h-4 fill-brass-500 text-brass-500" />
                {record.scrapedData.rating}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="border-t border-desk-950/10 pt-4">
        <p class="case-label !text-desk-600 mb-2">Specifications</p>
        <SpecsTable specs={record.scrapedData.specs} />
      </div>

      <p class="case-label !text-desk-950/35 mt-5">Captured directly from {hostname} at intake — Tier 1 source</p>
    </div>

    <!-- Findings -->
    <div class="lg:col-span-2 flex flex-col gap-6">
      <div class="case-card p-6 flex flex-col items-center text-center">
        <TrustGauge score={record.aiAssessment.trustScore} />
        <p class="text-sm text-ink-300 leading-relaxed mt-5">{record.aiAssessment.summary}</p>
      </div>

      <div class="case-card p-6">
        <p class="case-label mb-3">Exhibit B — Red flags</p>
        <RedFlagList flags={record.aiAssessment.redFlags ?? []} />
      </div>
    </div>
  </div>

  <!-- Action bar -->
  <div class="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-between case-card p-5">
    <p class="text-sm text-ink-300">
      Verdict: <span class="text-ink-100 font-medium">{record.aiAssessment.verdict}</span> — the decision to buy is still yours.
    </p>
    <div class="flex gap-3 w-full sm:w-auto">
      <button class="btn-ghost flex-1 sm:flex-none flex items-center justify-center gap-2" onclick={() => appState.newCase()}>
        <FilePlus2 class="w-4 h-4" />
        Open new case
      </button>
      <a
        href={record.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2"
      >
        Buy from this listing
        <ExternalLink class="w-4 h-4" />
      </a>
    </div>
  </div>
</div>
