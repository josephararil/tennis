import { useState } from 'react';
import { useStore } from '../../store';
import { AppBar, Chip, Spinner } from '../../components/ui';
import { Icon } from '../../components/Icon';
import type { Client, LessonPhase } from '../../types';
import { db } from '../../services/db';

interface Props {
  client: Client;
  onBack: () => void;
  onSchedule: () => void;
  onSaved: () => void;
}

// Phase visual treatment — matches prototype artboard exactly
const PHASE_STYLES = [
  { bg: 'var(--surface-2)', ink: 'var(--ink)',  eyebrow: 'var(--ink-4)',           border: '1px solid var(--line)' },
  { bg: 'var(--ink)',       ink: '#fff',         eyebrow: 'rgba(255,255,255,0.7)',  border: 'none' },
  { bg: 'var(--clay)',      ink: '#fff',         eyebrow: 'rgba(255,255,255,0.7)',  border: 'none' },
  { bg: 'var(--surface-2)', ink: 'var(--ink)',  eyebrow: 'var(--ink-4)',           border: '1px solid var(--line)' },
];

function PhaseCard({ phase, index }: { phase: LessonPhase; index: number }) {
  const s = PHASE_STYLES[index % PHASE_STYLES.length];
  const onDark = s.ink === '#fff';
  return (
    <article style={{ background: s.bg, color: s.ink, borderRadius: 16, padding: '18px 18px 16px', border: s.border }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <div className="eyebrow" style={{ color: s.eyebrow }}>{phase.tag}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: s.ink, fontVariantNumeric: 'tabular-nums' }}>{phase.min} min</div>
      </div>
      <div style={{ marginTop: 10, fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.15, letterSpacing: '-0.005em', color: s.ink, fontStyle: 'italic' }}>
        {phase.name}
      </div>
      <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: onDark ? 'rgba(255,255,255,0.78)' : 'var(--ink-3)' }}>
        {phase.desc}
      </div>
      {phase.cues && phase.cues.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {phase.cues.map((cue, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: onDark ? 'rgba(255,255,255,0.5)' : 'var(--clay)', marginTop: 6, flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: onDark ? 'rgba(255,255,255,0.78)' : 'var(--ink-3)' }}>{cue}</div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function LessonOutputScreen({ client, onBack, onSchedule, onSaved }: Props) {
  const { genPhases, genSource, genConfig, clearGen } = useStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const phases = genPhases ?? [];
  const isAi = genSource === 'ai';

  async function handleSave() {
    if (saved || saving || phases.length === 0) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await db.lessons.put({
        id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        clientId: client.id,
        createdAt: now,
        focus: genConfig?.focus ?? ['forehand'],
        duration: genConfig?.duration ?? 60,
        intensity: genConfig?.intensity ?? 'moderate',
        freeText: genConfig?.freeText,
        phases,
        source: genSource ?? 'fallback',
      });
      setSaved(true);
      onSaved();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    clearGen();
    onBack();
  }

  if (phases.length === 0) {
    return (
      <div className="app">
        <AppBar title="Lesson plan" leading={<button className="appbar__icon" onClick={handleBack}><Icon.Back /></button>} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)' }}>
          No plan generated
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <AppBar
        title={client.name}
        leading={<button className="appbar__icon" onClick={handleBack}><Icon.Back /></button>}
        trailing={
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isAi && <Chip tone="clay-soft" size="sm"><Icon.Sparkle size={10} /> AI</Chip>}
          </div>
        }
      />

      <div className="scroll">
        {/* Header summary */}
        <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {genConfig?.focus.map((f) => <Chip key={f}>{f}</Chip>)}
            <Chip>{genConfig?.duration ?? 60} min</Chip>
            <Chip>{genConfig?.intensity ?? 'moderate'}</Chip>
          </div>
          {genConfig?.freeText && (
            <div style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic' }}>
              "{genConfig.freeText}"
            </div>
          )}
        </div>

        {/* Phase strip — time distribution bar */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
            {phases.map((p, i) => (
              <div key={i} style={{ flex: p.min, background: PHASE_STYLES[i % PHASE_STYLES.length].bg, border: '1px solid var(--line)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: 6, gap: 2 }}>
            {phases.map((p, i) => (
              <div key={i} style={{ flex: p.min, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', textAlign: 'center' }}>{p.min}m</div>
            ))}
          </div>
        </div>

        {/* Phases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 20px 8px' }}>
          {phases.map((phase, i) => (
            <PhaseCard key={phase.tag} phase={phase} index={i} />
          ))}
        </div>

        {/* Fallback notice */}
        {!isAi && (
          <div style={{ padding: '12px 20px', background: 'var(--surface-2)', borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Note size={14} />
              Offline plan · add a Gemini key in Settings for tailored AI plans
            </div>
          </div>
        )}

        <div className="spacer-lg" />
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--line)', background: 'var(--surface)', display: 'flex', gap: 10 }}>
        <button
          className="btn btn--ghost"
          style={{ flex: 1 }}
          onClick={handleSave}
          disabled={saved || saving}
        >
          {saving ? <Spinner size={16} /> : saved ? <Icon.Check size={16} /> : <Icon.Note size={16} />}
          {saved ? 'Saved' : 'Save to history'}
        </button>
        <button className="btn btn--accent" style={{ flex: 1 }} onClick={onSchedule}>
          <Icon.Calendar size={16} />
          Book slot
        </button>
      </div>
    </div>
  );
}
