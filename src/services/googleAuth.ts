import { useStore } from '../store';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (resp: { access_token?: string; expires_in?: number; error?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
          revoke: (token: string, cb: () => void) => void;
        };
        id: {
          initialize: (cfg: { client_id: string; callback: (r: unknown) => void }) => void;
        };
      };
    };
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
const SCOPE = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';

export class AuthError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'AuthError';
  }
}

function waitForGIS(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (window.google?.accounts?.oauth2) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
}

export async function requestToken(opts: { prompt?: '' | 'consent' } = {}): Promise<string> {
  await waitForGIS();
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: async (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new AuthError(resp.error ?? 'No token'));
          return;
        }
        const store = useStore.getState();
        let email: string | undefined;
        try {
          const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${resp.access_token}` },
          });
          const data = await r.json();
          email = data.email;
        } catch {
          /* optional */
        }
        store.setGoogleAuth(resp.access_token, resp.expires_in ?? 3600, email);
        resolve(resp.access_token);
      },
    });
    client.requestAccessToken({ prompt: opts.prompt });
  });
}

export async function ensureToken(): Promise<string> {
  const { googleToken, googleTokenExpiry } = useStore.getState();
  if (googleToken && googleTokenExpiry && Date.now() < googleTokenExpiry) return googleToken;
  try {
    return await requestToken({ prompt: '' });
  } catch {
    throw new AuthError('Session expired — please reconnect Google.');
  }
}

export function signOut(): void {
  const { googleToken, clearGoogleAuth } = useStore.getState();
  if (googleToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(googleToken, () => {});
  }
  clearGoogleAuth();
}

export function isConnected(): boolean {
  const { googleToken, googleTokenExpiry } = useStore.getState();
  return !!(googleToken && googleTokenExpiry && Date.now() < googleTokenExpiry);
}
