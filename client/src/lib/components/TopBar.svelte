<script lang="ts">
  import { ShieldCheck, LogOut, FilePlus2 } from '@lucide/svelte';
  import { authStore } from '../stores/auth.svelte';
  import { appState } from '../stores/app.svelte';

  function signOut() {
    authStore.clearSession();
    appState.goTo('auth');
  }
</script>

<header class="border-b border-desk-700 bg-desk-900/80 backdrop-blur sticky top-0 z-20">
  <div class="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
    <button
      class="flex items-center gap-2 text-ink-100 cursor-pointer"
      onclick={() => appState.goTo('analyze')}
      aria-label="Go to case intake"
    >
      <ShieldCheck class="w-5 h-5 text-brass-400" strokeWidth={2} />
      <span class="font-display font-semibold tracking-tight">AI Trust Assistant</span>
    </button>

    <div class="flex items-center gap-3">
      {#if appState.view === 'results'}
        <button class="btn-ghost flex items-center gap-2 !py-2 !px-3 text-sm" onclick={() => appState.newCase()}>
          <FilePlus2 class="w-4 h-4" />
          <span class="hidden sm:inline">New case</span>
        </button>
      {/if}
      {#if authStore.user}
        <span class="case-label hidden md:inline">{authStore.user.name}</span>
      {/if}
      <button
        class="btn-ghost flex items-center gap-2 !py-2 !px-3 text-sm"
        onclick={signOut}
        aria-label="Sign out"
      >
        <LogOut class="w-4 h-4" />
        <span class="hidden sm:inline">Sign out</span>
      </button>
    </div>
  </div>
</header>
