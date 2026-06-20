<script lang="ts">
  import { FileSearch, ArrowRight } from '@lucide/svelte';
  import { api } from '../api';
  import { ApiError } from '../types';
  import { authStore } from '../stores/auth.svelte';
  import { appState } from '../stores/app.svelte';
  import ScanProgress from './ScanProgress.svelte';

  let url = $state('');
  let stage = $state(0); // 0 idle, 1-3 in progress, 4 complete
  let error = $state<string | null>(null);

  const analyzing = $derived(stage > 0 && stage < 4);

  let timers: ReturnType<typeof setTimeout>[] = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function isLikelyUrl(value: string) {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = null;

    const trimmed = url.trim();
    if (!isLikelyUrl(trimmed)) {
      error = 'Paste a full product link, starting with http:// or https://.';
      return;
    }
    if (!authStore.token) {
      error = 'Your session expired. Sign in again to open a case.';
      return;
    }

    stage = 1;
    timers.push(setTimeout(() => { if (stage === 1) stage = 2; }, 3200));
    timers.push(setTimeout(() => { if (stage === 2) stage = 3; }, 8500));

    try {
      const record = await api.analyze(trimmed, authStore.token);
      clearTimers();
      stage = 4;
      await new Promise((r) => setTimeout(r, 500)); // let the last checkmark land
      appState.openCase(record);
      url = '';
      stage = 0;
    } catch (err) {
      clearTimers();
      stage = 0;
      error =
        err instanceof ApiError
          ? err.message
          : 'The case could not be opened. Try again in a moment.';
    }
  }
</script>

<div class="max-w-2xl mx-auto px-5 py-14 sm:py-20">
  <p class="case-label mb-3">New case intake</p>
  <h1 class="font-display text-3xl sm:text-4xl font-semibold mb-3">Investigate a listing</h1>
  <p class="text-ink-300 mb-10 max-w-lg">
    Paste the product page you're unsure about. We'll pull the listing data, check it against the
    open web, and return a trust score with the evidence behind it.
  </p>

  <div class="case-card p-6 sm:p-7">
    <form class="space-y-4" onsubmit={handleSubmit}>
      <div>
        <label for="targetUrl" class="case-label block mb-1.5">Subject listing URL</label>
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            id="targetUrl"
            class="field-input flex-1"
            type="url"
            placeholder="https://www.amazon.com/dp/..."
            bind:value={url}
            disabled={analyzing}
          />
          <button
            type="submit"
            class="btn-primary flex items-center justify-center gap-2 shrink-0"
            disabled={analyzing || url.trim().length === 0}
          >
            <FileSearch class="w-4 h-4" />
            Open case file
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      {#if error}
        <p class="text-sm text-risk-500 border border-risk-600/40 bg-risk-600/10 rounded-md px-3 py-2" role="alert">
          {error}
        </p>
      {/if}
    </form>
  </div>

  {#if stage > 0}
    <div class="mt-6">
      <ScanProgress {stage} />
    </div>
  {/if}
</div>
