import { useState } from 'react';
import { AppBar, Field } from '../components/ui';
import { Icon } from '../components/Icon';
import type { ArchetypeId, AvatarTone, BallType } from '../types';
import { db } from '../services/db';
import { deriveInitials } from '../lib/format';
import { useStore } from '../store';

interface Props {
  onBack: () => void;
  onSave: () => Promise<void>;
}

type PlayerType = 'adult' | 'junior' | 'group';

const NTRP_DESCRIPTIONS: Record<string, string> = {
  '1.0': 'Just starting out. Learning basic racket handling, scoring, and ball tracking.',
  '1.5': 'Has some court experience. Working mainly on getting the ball over the net consistently.',
  '2.0': 'Can sustain a short rally. Developing basic forehand and backhand groundstrokes.',
  '2.5': 'Learning to judge ball position and timing. Beginning to develop a few reliable strokes.',
  '3.0': 'Can direct groundstrokes and control depth. More consistent serves with improved placement.',
  '3.5': 'More reliable strokes with directional control. Beginning to use spin; approaches the net occasionally.',
  '4.0': 'Consistent strokes with direction and depth on both wings. Uses spin and moves well around the court.',
  '4.5': 'Uses pace and spin variation to exploit weaknesses. Strong first serves; consistent second serves.',
  '5.0': 'Powerful groundstrokes with great anticipation. Attacks pace confidently and defends well under pressure.',
  '5.5': 'Power, consistency, and good anticipation. Varies game style to create pressure and force errors.',
  '6.0': 'Executes all strokes with precision, power, and control. High-level tactical and competitive experience.',
  '6.5': 'Nationally ranked player with extensive high-level competitive experience.',
  '7.0': 'World-class professional or top collegiate player.',
};

const BALL_TYPE_OPTIONS: { id: BallType; label: string; note: string }[] = [
  { id: 'red', label: 'Red', note: 'Foam / beginners' },
  { id: 'orange', label: 'Orange', note: 'Low compression' },
  { id: 'green', label: 'Green dot', note: 'Transition stage' },
  { id: 'yellow', label: 'Standard', note: 'Regular yellow' },
];

function deriveArchetypeId(playerType: PlayerType, ntrp: number): ArchetypeId {
  if (playerType === 'junior') return 'junior';
  if (playerType === 'group') return 'group';
  if (ntrp <= 2.5) return 'adult-beg';
  if (ntrp <= 4.0) return 'adult-int';
  return 'adult-adv';
}

function deriveArchetype(playerType: PlayerType, ntrp: number): string {
  if (playerType === 'junior') return 'Junior';
  if (playerType === 'group') return 'Group';
  if (ntrp <= 2.5) return 'Adult · Beginner';
  if (ntrp <= 4.0) return 'Adult · Intermediate';
  return 'Adult · Advanced';
}

function deriveAvatarTone(playerType: PlayerType, ntrp: number): AvatarTone {
  if (playerType === 'junior' || playerType === 'group') return 'clay';
  if (ntrp > 4.0) return 'ink';
  return 'default';
}

function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

export function AddClientScreen({ onBack, onSave }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [playerType, setPlayerType] = useState<PlayerType>('adult');
  const [ntrp, setNtrp] = useState(3.0);
  const [hasRacket, setHasRacket] = useState<boolean | null>(null);
  const [ballType, setBallType] = useState<BallType | null>(null);
  const [style, setStyle] = useState('');
  const [preferences, setPreferences] = useState('');
  const [cadence, setCadence] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setClients } = useStore();

  const canSave = name.trim().length >= 2;
  const showNtrp = playerType !== 'group';
  const ntrpKey = ntrp.toFixed(1);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const baseId = toSlug(name);
      const existing = await db.clients.where('id').startsWith(baseId).toArray();
      const id = existing.length > 0 ? `${baseId}-${Date.now()}` : baseId;

      await db.clients.put({
        id,
        name: name.trim(),
        initials: deriveInitials(name),
        avatarTone: deriveAvatarTone(playerType, ntrp),
        archetypeId: deriveArchetypeId(playerType, ntrp),
        archetype: deriveArchetype(playerType, ntrp),
        phone: phone.trim() || undefined,
        age: age ? parseInt(age) : null,
        ntrp: showNtrp ? ntrp : null,
        style: style.trim() || undefined,
        hasRacket: hasRacket !== null ? hasRacket : undefined,
        ballType: ballType ?? undefined,
        preferences: preferences.trim() || undefined,
        cadence: cadence.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      });

      const allClients = await db.clients.orderBy('updatedAt').reverse().toArray();
      setClients(allClients);
      await onSave();
    } catch (e) {
      setError((e as Error).message ?? 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <AppBar
        title="New client"
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Back /></button>}
        trailing={
          <button
            className="appbar__icon"
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{ color: canSave ? 'var(--clay)' : 'var(--ink-5)', fontWeight: 600, fontSize: 15, width: 'auto', padding: '0 4px' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        }
      />

      <div className="scroll">
        <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ fontSize: 13, color: 'var(--status-bad)', padding: '10px 12px', background: 'var(--clay-tint)', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <Field label="Name *">
            <input
              className="field__input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </Field>

          {/* Player type */}
          <Field label="Type">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['adult', 'junior', 'group'] as PlayerType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPlayerType(t)}
                  className={`chip chip--lg ${playerType === t ? 'chip--ink' : 'chip--outline'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </Field>

          {/* NTRP slider */}
          {showNtrp && (
            <Field label="NTRP level">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-4)' }}>1.0</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: 'var(--clay)' }}>{ntrpKey}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-4)' }}>7.0</span>
                </div>
                <input
                  type="range"
                  className="ntrp-slider"
                  min={1}
                  max={7}
                  step={0.5}
                  value={ntrp}
                  onChange={(e) => setNtrp(parseFloat(e.target.value))}
                  style={{ '--fill': `${((ntrp - 1) / 6) * 100}%` } as React.CSSProperties}
                />
                <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8, minHeight: 48 }}>
                  {NTRP_DESCRIPTIONS[ntrpKey] ?? ''}
                </div>
              </div>
            </Field>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Age">
              <input className="field__input" type="number" placeholder="e.g. 28" value={age} onChange={(e) => setAge(e.target.value)} min={3} max={99} />
            </Field>
          </div>

          <Field label="Phone">
            <input className="field__input" type="tel" placeholder="+44 7700 900 123" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>

          {/* Own racket */}
          <Field label="Own racket?">
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ val: true, label: 'Yes' }, { val: false, label: 'No — coach provides' }].map(({ val, label }) => (
                <button
                  key={String(val)}
                  onClick={() => setHasRacket(hasRacket === val ? null : val)}
                  className={`chip chip--lg ${hasRacket === val ? 'chip--ink' : 'chip--outline'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {/* Ball type */}
          <Field label="Ball type">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {BALL_TYPE_OPTIONS.map(({ id, label, note }) => (
                <button
                  key={id}
                  onClick={() => setBallType(ballType === id ? null : id)}
                  className={`chip chip--lg ${ballType === id ? 'chip--ink' : 'chip--outline'}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'auto', padding: '8px 14px', gap: 2 }}
                >
                  <span>{label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>{note}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Style">
            <input className="field__input" type="text" placeholder="e.g. Baseliner · Heavy topspin" value={style} onChange={(e) => setStyle(e.target.value)} />
          </Field>

          <Field label="Cadence">
            <input className="field__input" type="text" placeholder="e.g. Weekly · Mondays" value={cadence} onChange={(e) => setCadence(e.target.value)} />
          </Field>

          <Field label="Preferences & notes">
            <textarea
              className="field__input"
              placeholder="Coaching preferences, goals, anything to remember…"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={4}
            />
          </Field>
        </div>

        <div style={{ padding: '8px 20px 24px' }}>
          <button className="btn btn--accent btn--block btn--lg" onClick={handleSave} disabled={!canSave || saving}>
            {saving ? 'Saving…' : 'Add client'}
          </button>
        </div>
      </div>
    </div>
  );
}
