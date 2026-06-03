import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AppBar, TabBar, Dot, Segmented, Field } from '../components/ui';
import { Icon } from '../components/Icon';
import type { TabName, Settings } from '../types';
import { db } from '../services/db';
import { requestToken, signOut, isConnected } from '../services/googleAuth';
import { driveIsConnected, driveGetEmail, driveConnect, driveDisconnect, drivePushSync, drivePullSync } from '../services/drive';

interface Props {
  onTab: (tab: TabName) => void;
  onSettingsChanged: () => void;
}

export function SettingsScreen({ onTab, onSettingsChanged }: Props) {
  const { settings, setSettings } = useStore();
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [driveConnecting, setDriveConnecting] = useState(false);
  const [drivePushing, setDrivePushing] = useState(false);
  const [drivePulling, setDrivePulling] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveSuccess, setDriveSuccess] = useState<string | null>(null);
  const [driveConnected, setDriveConnected] = useState(() => driveIsConnected());
  const [editingCoach, setEditingCoach] = useState(false);
  const [coachName, setCoachName] = useState('');
  const [coachClub, setCoachClub] = useState('');
  const [coachInitials, setCoachInitials] = useState('');
  const { googleEmail } = useStore();

  useEffect(() => {
    if (settings?.geminiApiKey) {
      setKeyInput(settings.geminiApiKey);
    }
  }, [settings?.geminiApiKey]);

  if (!settings) {
    return (
      <div className="app">
        <AppBar title="Settings" />
        <div style={{ flex: 1 }} />
        <TabBar active="settings" onChange={onTab} />
      </div>
    );
  }

  async function saveSettings(patch: Partial<Settings>) {
    if (!settings) return;
    const updated = { ...settings, ...patch };
    await db.settings.put(updated);
    setSettings(updated);
    onSettingsChanged();
  }

  function startEditCoach() {
    if (!settings) return;
    setCoachName(settings.coach.name);
    setCoachClub(settings.coach.club);
    setCoachInitials(settings.coach.initials);
    setEditingCoach(true);
  }

  async function saveCoach() {
    if (!settings) return;
    await saveSettings({
      coach: {
        ...settings.coach,
        name: coachName.trim(),
        club: coachClub.trim(),
        initials: coachInitials.trim().slice(0, 3).toUpperCase(),
      },
    });
    setEditingCoach(false);
  }

  async function saveKey() {
    const trimmed = keyInput.trim();
    await saveSettings({ geminiApiKey: trimmed || undefined });
  }

  async function handleCopyKey() {
    if (settings?.geminiApiKey) {
      await navigator.clipboard.writeText(settings.geminiApiKey).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  async function handleConnectGoogle() {
    setGoogleConnecting(true);
    setGoogleError(null);
    try {
      await requestToken({ prompt: 'consent' });
      await saveSettings({ googleConnected: true });
    } catch (e) {
      setGoogleError((e as Error).message ?? 'Failed to connect');
    } finally {
      setGoogleConnecting(false);
    }
  }

  function handleDisconnectGoogle() {
    signOut();
    saveSettings({ googleConnected: false });
  }

  async function handleDriveConnect() {
    setDriveConnecting(true);
    setDriveError(null);
    setDriveSuccess(null);
    try {
      await driveConnect();
      setDriveConnected(true);
    } catch (e) {
      setDriveError((e as Error).message ?? 'Failed to connect');
    } finally {
      setDriveConnecting(false);
    }
  }

  function handleDriveDisconnect() {
    driveDisconnect();
    setDriveConnected(false);
    setDriveError(null);
    setDriveSuccess(null);
  }

  async function handleDrivePush() {
    setDrivePushing(true);
    setDriveError(null);
    setDriveSuccess(null);
    try {
      await drivePushSync();
      setDriveSuccess('Data saved to Drive.');
      setTimeout(() => setDriveSuccess(null), 3000);
    } catch (e) {
      setDriveError((e as Error).message ?? 'Save failed');
    } finally {
      setDrivePushing(false);
    }
  }

  async function handleDrivePull() {
    setDrivePulling(true);
    setDriveError(null);
    setDriveSuccess(null);
    try {
      await drivePullSync(); // reloads page on success
    } catch (e) {
      setDriveError((e as Error).message ?? 'Load failed');
      setDrivePulling(false);
    }
  }

  const connected = isConnected() || (settings.googleConnected && !!googleEmail);

  return (
    <div className="app">
      <AppBar title="Settings" />

      <div className="scroll">
        {/* Coach profile */}
        <div className="section-head">
          <div className="section-head__title">Coach</div>
        </div>
        <div style={{ padding: '4px 20px 16px' }}>
          {editingCoach ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Name">
                <input className="field__input" value={coachName} onChange={(e) => setCoachName(e.target.value)} autoFocus />
              </Field>
              <Field label="Club / court">
                <input className="field__input" value={coachClub} onChange={(e) => setCoachClub(e.target.value)} />
              </Field>
              <Field label="Initials">
                <input className="field__input" value={coachInitials} onChange={(e) => setCoachInitials(e.target.value)} maxLength={3} placeholder="e.g. MG" />
              </Field>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--accent btn--block" onClick={saveCoach} disabled={!coachName.trim()}>Save</button>
                <button className="btn btn--ghost btn--block" onClick={() => setEditingCoach(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 12 }}>
              <div className="row__avatar row__avatar--ink" style={{ width: 48, height: 48, fontSize: 18, flexShrink: 0 }}>
                {settings.coach.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{settings.coach.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>{settings.coach.club}</div>
              </div>
              <button className="appbar__icon" onClick={startEditCoach} style={{ color: 'var(--ink-4)' }}>
                <Icon.Edit size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Session defaults */}
        <div className="section-head">
          <div className="section-head__title">Session defaults</div>
        </div>
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <div className="field__label">Regenerate lesson plan</div>
            <Segmented
              items={[
                { id: 'ask', label: 'Ask' },
                { id: 'always', label: 'Always' },
                { id: 'never', label: 'Never' },
              ]}
              active={settings.regenBehaviour}
              onChange={(v) => saveSettings({ regenBehaviour: v as Settings['regenBehaviour'] })}
            />
          </div>
        </div>

        {/* Gemini API */}
        <div className="section-head">
          <div className="section-head__title">AI · Gemini</div>
        </div>
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Dot tone={settings.geminiApiKey ? 'ok' : 'bad'} />
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {settings.geminiApiKey ? 'API key saved' : 'No key — using offline plans'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 4 }}>
            Starts with AIza… · Get your key at <span style={{ color: 'var(--clay)' }}>aistudio.google.com</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onBlur={saveKey}
                placeholder="AIzaSy…"
                className="field__input"
                style={{ border: 'none', background: 'transparent', borderRadius: 0, paddingRight: 8 }}
              />
              <button style={{ padding: '0 10px', color: 'var(--ink-4)', flexShrink: 0 }} onClick={() => setShowKey((v) => !v)}>
                {showKey ? <Icon.EyeOff size={16} /> : <Icon.Eye size={16} />}
              </button>
              {settings.geminiApiKey && (
                <button style={{ padding: '0 10px', color: 'var(--ink-4)', flexShrink: 0 }} onClick={handleCopyKey}>
                  {copied ? <Icon.Check size={16} /> : <Icon.Copy size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Google Calendar */}
        <div className="section-head">
          <div className="section-head__title">Google Calendar</div>
        </div>
        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dot tone={connected ? 'ok' : 'default'} />
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {connected ? (googleEmail ?? 'Connected') : 'Not connected'}
            </span>
          </div>
          {googleError && (
            <div style={{ fontSize: 13, color: 'var(--status-bad)', padding: '8px 12px', background: 'var(--clay-tint)', borderRadius: 8 }}>
              {googleError}
            </div>
          )}
          {!connected ? (
            <button
              className="btn btn--ghost btn--block"
              onClick={handleConnectGoogle}
              disabled={googleConnecting}
            >
              <Icon.Link size={18} />
              {googleConnecting ? 'Connecting…' : 'Connect Google Calendar'}
            </button>
          ) : (
            <button className="btn btn--ghost btn--block" onClick={handleDisconnectGoogle}>
              <Icon.Close size={16} />
              Disconnect
            </button>
          )}
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div style={{ fontSize: 12, color: 'var(--ink-4)', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
              Set VITE_GOOGLE_CLIENT_ID in .env.local to enable Google Calendar integration.
            </div>
          )}
        </div>

        {/* Google Drive */}
        <div className="section-head">
          <div className="section-head__title">Google Drive</div>
        </div>
        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dot tone={driveConnected ? 'ok' : 'default'} />
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {driveConnected ? driveGetEmail() : 'Not connected'}
            </span>
          </div>
          {driveError && (
            <div style={{ fontSize: 13, color: 'var(--status-bad)', padding: '8px 12px', background: 'var(--clay-tint)', borderRadius: 8 }}>
              {driveError}
            </div>
          )}
          {driveSuccess && (
            <div style={{ fontSize: 13, color: 'var(--ink-2)', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
              {driveSuccess}
            </div>
          )}
          {!driveConnected ? (
            <button className="btn btn--ghost btn--block" onClick={handleDriveConnect} disabled={driveConnecting}>
              <Icon.Link size={18} />
              {driveConnecting ? 'Connecting…' : 'Connect Google Drive'}
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn--ghost btn--block"
                  onClick={handleDrivePush}
                  disabled={drivePushing || drivePulling}
                >
                  {drivePushing ? 'Saving…' : 'Save to Drive'}
                </button>
                <button
                  className="btn btn--ghost btn--block"
                  onClick={handleDrivePull}
                  disabled={drivePulling || drivePushing}
                >
                  {drivePulling ? 'Loading…' : 'Load from Drive'}
                </button>
              </div>
              <button className="btn btn--ghost btn--block" onClick={handleDriveDisconnect}>
                <Icon.Close size={16} />
                Disconnect Drive
              </button>
            </>
          )}
        </div>

        {/* Install on iPhone */}
        <IosInstallHint />

        {/* App info */}
        <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-5)', fontSize: 12 }}>
            <span>Tennis Coach · Martina</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>

      <TabBar active="settings" onChange={onTab} />
    </div>
  );
}

function IosInstallHint() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  if (!isIOS || isStandalone) return null;

  return (
    <>
      <div className="section-head">
        <div className="section-head__title">Install on iPhone</div>
      </div>
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            Add this app to your home screen so it opens full-screen, works offline, and stays on your dock.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Open this page in Safari (not Chrome)',
              'Tap the Share button at the bottom of the screen',
              'Scroll down and tap "Add to Home Screen"',
              'Tap "Add" — done!',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--clay)', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
