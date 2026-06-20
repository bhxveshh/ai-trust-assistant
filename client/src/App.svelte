<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { authStore } from './lib/stores/auth.svelte';
  import { appState } from './lib/stores/app.svelte';
  import AuthView from './lib/components/AuthView.svelte';
  import AnalyzeView from './lib/components/AnalyzeView.svelte';
  import ResultsView from './lib/components/ResultsView.svelte';
  import TopBar from './lib/components/TopBar.svelte';

  // Decide the starting view once, on load.
  appState.view = authStore.isAuthenticated ? 'analyze' : 'auth';
</script>

<div class="min-h-screen flex flex-col">
  {#if appState.view !== 'auth'}
    <TopBar />
  {/if}

  <main class="flex-1">
    {#if appState.view === 'auth'}
      <div in:fade={{ duration: 220 }}>
        <AuthView />
      </div>
    {:else if appState.view === 'analyze'}
      <div in:fly={{ y: 8, duration: 220 }}>
        <AnalyzeView />
      </div>
    {:else if appState.view === 'results' && appState.currentCase}
      <div in:fly={{ y: 8, duration: 220 }}>
        <ResultsView record={appState.currentCase} />
      </div>
    {/if}
  </main>
</div>
