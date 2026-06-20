<script lang="ts">
  import { ShieldCheck, FileSearch, Loader2 } from '@lucide/svelte';
  import { api } from '../api';
  import { ApiError } from '../types';
  import { authStore } from '../stores/auth.svelte';
  import { appState } from '../stores/app.svelte';

  let mode = $state<'login' | 'register'>('login');
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  const isRegister = $derived(mode === 'register');
  const heading = $derived(isRegister ? 'Open an account' : 'Sign in to the desk');
  const submitLabel = $derived(isRegister ? 'Create account' : 'Sign in');

  function switchMode(next: 'login' | 'register') {
    mode = next;
    error = null;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = null;

    if (isRegister && name.trim().length < 2) {
      error = 'Enter your full name to open an account.';
      return;
    }
    if (!email.includes('@')) {
      error = 'Enter a valid email address.';
      return;
    }
    if (password.length < 6) {
      error = 'Passwords need at least 6 characters.';
      return;
    }

    loading = true;
    try {
      const res = isRegister
        ? await api.register(name.trim(), email.trim(), password)
        : await api.login(email.trim(), password);
      authStore.setSession(res.token, res.user);
      appState.goTo('analyze');
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Something went wrong. Try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen grid lg:grid-cols-2">
  <!-- Brand panel -->
  <div class="hidden lg:flex flex-col justify-between p-12 bg-desk-900 border-r border-desk-700 relative overflow-hidden">
    <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brass-500/10 blur-3xl"></div>
    <div class="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-trust-600/10 blur-3xl"></div>

    <div class="relative z-10 flex items-center gap-2">
      <ShieldCheck class="w-6 h-6 text-brass-400" />
      <span class="font-display font-semibold tracking-tight">AI Trust Assistant</span>
    </div>

    <div class="relative z-10 max-w-md">
      <p class="case-label mb-4">Listing investigation desk</p>
      <h1 class="font-display text-4xl leading-tight font-semibold text-ink-100 mb-5">
        Open a case on any listing before you pay.
      </h1>
      <p class="text-ink-300 leading-relaxed">
        Paste a product link and we pull the page data, cross-check it against the open web, and
        run it past a clinical fraud-review model. You get a trust score, the evidence behind it,
        and a verdict — before your card does.
      </p>

      <div class="mt-10 flex items-center gap-4 case-card p-4 w-fit">
        <FileSearch class="w-8 h-8 text-brass-400 shrink-0" />
        <div>
          <p class="text-sm text-ink-100 font-medium">Case #2026-0619 — closed</p>
          <p class="case-label !text-risk-500 !text-[0.65rem]">Verdict: High risk</p>
        </div>
      </div>
    </div>

    <p class="relative z-10 text-xs text-ink-500">Scraper · Web evidence · Gemini 2.5 Flash review</p>
  </div>

  <!-- Intake form -->
  <div class="flex items-center justify-center p-6 sm:p-10">
    <div class="w-full max-w-sm">
      <div class="lg:hidden flex items-center gap-2 mb-8 justify-center">
        <ShieldCheck class="w-5 h-5 text-brass-400" />
        <span class="font-display font-semibold tracking-tight">AI Trust Assistant</span>
      </div>

      <div class="case-card p-7">
        <div class="flex gap-1 mb-6 bg-desk-900 rounded-md p-1">
          <button
            type="button"
            class="flex-1 py-2 rounded text-sm font-display font-medium transition-colors"
            class:bg-brass-500={mode === 'login'}
            class:text-desk-950={mode === 'login'}
            class:text-ink-300={mode !== 'login'}
            onclick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            class="flex-1 py-2 rounded text-sm font-display font-medium transition-colors"
            class:bg-brass-500={mode === 'register'}
            class:text-desk-950={mode === 'register'}
            class:text-ink-300={mode !== 'register'}
            onclick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        <h2 class="font-display text-xl font-semibold mb-1">{heading}</h2>
        <p class="text-sm text-ink-500 mb-6">
          {isRegister ? 'Set up your desk to start opening cases.' : 'Welcome back to the desk.'}
        </p>

        <form class="space-y-4" onsubmit={handleSubmit}>
          {#if isRegister}
            <div>
              <label for="name" class="case-label block mb-1.5">Full name</label>
              <input id="name" class="field-input" type="text" autocomplete="name" bind:value={name} placeholder="Jordan Reyes" />
            </div>
          {/if}

          <div>
            <label for="email" class="case-label block mb-1.5">Email</label>
            <input id="email" class="field-input" type="email" autocomplete="email" bind:value={email} placeholder="you@example.com" />
          </div>

          <div>
            <label for="password" class="case-label block mb-1.5">Password</label>
            <input
              id="password"
              class="field-input"
              type="password"
              autocomplete={isRegister ? 'new-password' : 'current-password'}
              bind:value={password}
              placeholder="••••••••"
            />
          </div>

          {#if error}
            <p class="text-sm text-risk-500 border border-risk-600/40 bg-risk-600/10 rounded-md px-3 py-2" role="alert">
              {error}
            </p>
          {/if}

          <button type="submit" class="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {#if loading}
              <Loader2 class="w-4 h-4 animate-spin" />
            {/if}
            {submitLabel}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-ink-500 mt-5">
        {isRegister ? 'Already have a desk login?' : "Don't have an account yet?"}
        <button class="text-brass-400 hover:underline" onclick={() => switchMode(isRegister ? 'login' : 'register')}>
          {isRegister ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </div>
  </div>
</div>
