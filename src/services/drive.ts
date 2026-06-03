import { db } from './db';
import type { Client, Note, Lesson, Settings } from '../types';

const DRIVE_CLIENT_ID = '618607613623-9rgn8un996p7hrnje4op3gc5l1spd27e.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_ROOT_FOLDER = 'TennisCoach';
const SYNC_FILE_NAME = 'tennis-coach-sync.json';

const KEY_EMAIL = 'tennis_drive_email';
const KEY_ROOT_ID = 'tennis_drive_root_id';
const KEY_SYNC_FILE_ID = 'tennis_drive_sync_file_id';

let _driveToken: string | null = null;
let _driveExpiry = 0;

function _driveGetToken(forcePrompt: boolean): Promise<string> {
  if (!forcePrompt && _driveToken && Date.now() < _driveExpiry - 60000) {
    return Promise.resolve(_driveToken);
  }
  if (!window.google?.accounts?.oauth2) {
    return Promise.reject(new Error('Google Sign-In library not loaded yet — try again in a moment.'));
  }
  return new Promise((resolve, reject) => {
    const tid = setTimeout(() => reject(new Error('Google auth timed out.')), 90000);
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: DRIVE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (r) => {
        clearTimeout(tid);
        if (r.error || !r.access_token) {
          reject(new Error(r.error ?? 'Auth error'));
          return;
        }
        _driveToken = r.access_token;
        _driveExpiry = Date.now() + (r.expires_in ?? 3600) * 1000;
        resolve(_driveToken);
      },
    });
    client.requestAccessToken(forcePrompt ? { prompt: 'select_account' } : {});
  });
}

async function _driveJsonFetch(path: string, opts?: RequestInit): Promise<unknown> {
  const token = await _driveGetToken(false);
  const url = path.startsWith('https://') ? path : `https://www.googleapis.com/drive/v3${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...((opts?.headers as Record<string, string>) ?? {}),
    },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(e?.error?.message ?? `Drive API error ${res.status}`);
  }
  return res.json();
}

async function _driveFindFolder(name: string, parentId: string | null): Promise<string | null> {
  const parent = parentId ?? 'root';
  const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parent}' in parents and trashed=false`;
  const d = await _driveJsonFetch(`/files?q=${encodeURIComponent(q)}&fields=files(id)`) as { files?: { id: string }[] };
  return d.files?.[0]?.id ?? null;
}

async function _driveCreateFolder(name: string, parentId: string | null): Promise<string> {
  const body: Record<string, unknown> = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) body.parents = [parentId];
  const d = await _driveJsonFetch('/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as { id: string };
  return d.id;
}

async function _driveEnsureFolders(): Promise<void> {
  if (localStorage.getItem(KEY_ROOT_ID)) return;
  const rootId =
    (await _driveFindFolder(DRIVE_ROOT_FOLDER, null)) ??
    (await _driveCreateFolder(DRIVE_ROOT_FOLDER, null));
  localStorage.setItem(KEY_ROOT_ID, rootId);
}

async function _driveMultipartUpload(filename: string, blob: Blob, folderId: string): Promise<string> {
  const BOUND = `tennis${Date.now()}`;
  const enc = new TextEncoder();
  const meta = JSON.stringify({ name: filename, parents: [folderId] });
  const parts: Uint8Array[] = [
    enc.encode(`--${BOUND}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n`),
    enc.encode(`--${BOUND}\r\nContent-Type: ${blob.type}\r\n\r\n`),
    new Uint8Array(await blob.arrayBuffer()),
    enc.encode(`\r\n--${BOUND}--`),
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const body = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { body.set(p, off); off += p.length; }

  const token = await _driveGetToken(false);
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${BOUND}`,
    },
    body,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(e?.error?.message ?? `Drive upload error ${res.status}`);
  }
  return (await res.json() as { id: string }).id;
}

type SyncPayload = {
  version: number;
  clients: Client[];
  notes: Note[];
  lessons: Lesson[];
  settings: Omit<Settings, 'geminiApiKey'>[];
};

async function _buildSyncPayload(): Promise<string> {
  const [clients, notes, lessons, settingsRows] = await Promise.all([
    db.clients.toArray(),
    db.notes.toArray(),
    db.lessons.toArray(),
    db.settings.toArray(),
  ]);
  // Exclude geminiApiKey — it's a secret that should not leave the device
  const settings = settingsRows.map(({ geminiApiKey: _k, ...rest }) => rest);
  const payload: SyncPayload = { version: 1, clients, notes, lessons, settings };
  return JSON.stringify(payload);
}

export function driveIsConnected(): boolean {
  return !!localStorage.getItem(KEY_EMAIL);
}

export function driveGetEmail(): string {
  return localStorage.getItem(KEY_EMAIL) ?? '';
}

export async function driveConnect(): Promise<void> {
  await _driveGetToken(true);
  const token = _driveToken!;
  const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to get Google account info.');
  const data = await res.json() as { user?: { emailAddress?: string } };
  localStorage.setItem(KEY_EMAIL, data.user?.emailAddress ?? '');
  await _driveEnsureFolders();
}

export function driveDisconnect(): void {
  if (_driveToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(_driveToken, () => {});
  }
  _driveToken = null;
  _driveExpiry = 0;
  localStorage.removeItem(KEY_EMAIL);
  localStorage.removeItem(KEY_ROOT_ID);
  localStorage.removeItem(KEY_SYNC_FILE_ID);
}

export async function drivePushSync(): Promise<void> {
  await _driveEnsureFolders();
  const rootId = localStorage.getItem(KEY_ROOT_ID)!;
  const payload = await _buildSyncPayload();
  const blob = new Blob([payload], { type: 'application/json' });

  const existingFileId = localStorage.getItem(KEY_SYNC_FILE_ID);
  if (existingFileId) {
    const token = await _driveGetToken(false);
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: blob,
      },
    );
    if (res.ok) return;
    if (res.status !== 404) {
      const e = await res.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(e?.error?.message ?? `Drive upload error ${res.status}`);
    }
    // File was deleted on Drive — fall through to create a new one
    localStorage.removeItem(KEY_SYNC_FILE_ID);
  }

  const fileId = await _driveMultipartUpload(SYNC_FILE_NAME, blob, rootId);
  localStorage.setItem(KEY_SYNC_FILE_ID, fileId);
}

export async function drivePullSync(): Promise<void> {
  await _driveEnsureFolders();
  const rootId = localStorage.getItem(KEY_ROOT_ID)!;

  let fileId = localStorage.getItem(KEY_SYNC_FILE_ID);
  if (!fileId) {
    const q = `name='${SYNC_FILE_NAME}' and '${rootId}' in parents and trashed=false`;
    const d = await _driveJsonFetch(`/files?q=${encodeURIComponent(q)}&fields=files(id)`) as { files?: { id: string }[] };
    fileId = d.files?.[0]?.id ?? null;
    if (!fileId) throw new Error('No saved data found in Drive. Use "Save to Drive" first.');
    localStorage.setItem(KEY_SYNC_FILE_ID, fileId);
  }

  const token = await _driveGetToken(false);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 404) {
      localStorage.removeItem(KEY_SYNC_FILE_ID);
      throw new Error('Sync file not found in Drive — try "Save to Drive" first.');
    }
    throw new Error(`Drive download error ${res.status}`);
  }

  const data = await res.json() as SyncPayload;
  await db.transaction('rw', db.clients, db.notes, db.lessons, db.settings, async () => {
    await db.clients.clear();
    await db.notes.clear();
    await db.lessons.clear();
    await db.clients.bulkPut(data.clients);
    await db.notes.bulkPut(data.notes);
    await db.lessons.bulkPut(data.lessons);
    // Preserve the local geminiApiKey — it was excluded from the sync payload
    const existing = await db.settings.get('singleton');
    for (const s of data.settings) {
      await db.settings.put({ ...s, geminiApiKey: existing?.geminiApiKey });
    }
  });

  window.location.reload();
}
