import type { AuthUser } from '../types';

const TOKEN_KEY = 'ata_token';
const USER_KEY = 'ata_user';

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

class AuthStore {
  token = $state<string | null>(localStorage.getItem(TOKEN_KEY));
  user = $state<AuthUser | null>(readStoredUser());

  isAuthenticated = $derived(this.token !== null);

  setSession(token: string, user: AuthUser) {
    this.token = token;
    this.user = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export const authStore = new AuthStore();
