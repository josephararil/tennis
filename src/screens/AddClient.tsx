import { useState } from 'react';
import { AppBar, Field, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';
import type { ArchetypeId, AvatarTone } from '../types';
import { db } from '../services/db';
import { deriveInitials } from '../lib/format';
import { useStore } from '../store';

interface Props {
  onBack: () => void;
  onSave: () => Promise<void>;
}

const ARCHETYPE_OPTIONS = [
  { id: 'adult-beg', label: 'Beg' },
  { id: 'adult-int', label: 'Int' },
  { id: 'adult-adv', label: 'Adv' },
  { id: 'junior', label: 'Junior' },
  { id: 'group', label: 'Group' },
];

const ARCHETYPE_LABELS: Record<ArchetypeId, string> = {
  'adult-beg': 'Adult · Beginner',
  'adult-int': 'Adult · Intermediate',
  'adult-adv': 'Adult · Advanced',
  'junior': 'Junior',
  'group': 'Group',
  'other': 'Other',
};

function deriveAvatarTone(archetypeId: ArchetypeId): AvatarTone {
  if (archetypeId === 'junior' || archetypeId === 'group') return 'clay';
  if (archetypeId === 'adult-adv') return 'ink';
  return 'default';
}

function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

export function AddClientScreen({ onBack, onSave }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [ntrp, setNtrp] = useState('');
  const [archetypeId, setArchetypeId] = useState<ArchetypeId>('adult-int');
  const [style, setStyle] = useState('');
  const [gear, setGear] = useState('');
  const [preferences, setPreferences] = useState('');
  const [cadence, setCadence] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setClients } = useStore();

  const canSave = name.trim().length >= 2;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const baseId = toSlug(name);
      // Make id unique
      const existing = await db.clients.where('id').startsWith(baseId).toArray();
      const id = existing.length > 0 ? `${baseId}-${Date.now()}` : baseId;

      await db.clients.put({
        id,
        name: name.trim(),
        initials: deriveInitials(name),
        avatarTone: deriveAvatarTone(archetypeId),
        archetypeId,
        archetype: ARCHETYPE_LABELS[archetypeId],
        phone: phone.trim() || undefined,
        age: age ? parseInt(age) : null,
        ntrp: ntrp ? parseFloat(ntrp) : null,
        style: style.trim() || undefined,
        gear: gear.trim() || undefined,
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

          <Field label="Level">
            <Segmented
              items={ARCHETYPE_OPTIONS}
              active={archetypeId}
              onChange={(v) => setArchetypeId(v as ArchetypeId)}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Age">
              <input className="field__input" type="number" placeholder="e.g. 28" value={age} onChange={(e) => setAge(e.target.value)} min={3} max={99} />
            </Field>
            <Field label="NTRP">
              <input className="field__input" type="number" placeholder="e.g. 3.5" value={ntrp} onChange={(e) => setNtrp(e.target.value)} min={1} max={7} step={0.5} />
            </Field>
          </div>

          <Field label="Phone">
            <input className="field__input" type="tel" placeholder="+44 7700 900 123" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>

          <Field label="Style">
            <input className="field__input" type="text" placeholder="e.g. Baseliner · Heavy topspin" value={style} onChange={(e) => setStyle(e.target.value)} />
          </Field>

          <Field label="Cadence">
            <input className="field__input" type="text" placeholder="e.g. Weekly · Mondays" value={cadence} onChange={(e) => setCadence(e.target.value)} />
          </Field>

          <Field label="Gear">
            <input className="field__input" type="text" placeholder="Racquet · string · weight" value={gear} onChange={(e) => setGear(e.target.value)} />
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
