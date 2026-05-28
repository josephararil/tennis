import { useState } from 'react';
import { AppBar, Segmented, Field } from '../../components/ui';
import { Icon } from '../../components/Icon';
import type { Client, FocusId, Intensity, GenConfig } from '../../types';
import { useStore } from '../../store';

interface Props {
  client: Client;
  onBack: () => void;
  onGenerate: (cfg: GenConfig) => void;
}

const FOCUS_OPTIONS: { id: FocusId; label: string }[] = [
  { id: 'forehand', label: 'Forehand' },
  { id: 'backhand', label: 'Backhand' },
  { id: 'serve', label: 'Serve' },
  { id: 'footwork', label: 'Footwork' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'tactics', label: 'Tactics' },
];

export function LessonConfigScreen({ client, onBack, onGenerate }: Props) {
  const { settings, setGenConfig } = useStore();
  const [focus, setFocus] = useState<FocusId[]>(['forehand']);
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [freeText, setFreeText] = useState('');

  function toggleFocus(id: FocusId) {
    setFocus((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((f) => f !== id) : prev;
      }
      return [...prev, id];
    });
  }

  function handleGenerate() {
    const cfg: GenConfig = { focus, duration: 60, intensity, freeText: freeText.trim() || undefined };
    setGenConfig(cfg);
    onGenerate(cfg);
  }

  return (
    <div className="app">
      <AppBar
        title={client.name}
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Back /></button>}
      />

      <div className="scroll">
        <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Focus areas */}
          <Field label="Focus">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {FOCUS_OPTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => toggleFocus(id)}
                  className={`chip chip--lg ${focus.includes(id) ? 'chip--ink' : 'chip--outline'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {/* Intensity */}
          <Field label="Intensity">
            <Segmented
              items={[
                { id: 'easy', label: 'Easy' },
                { id: 'moderate', label: 'Moderate' },
                { id: 'hard', label: 'Hard' },
              ]}
              active={intensity}
              onChange={(v) => setIntensity(v as Intensity)}
            />
          </Field>

          {/* Free text */}
          <Field label="Coach note (optional)">
            <textarea
              className="field__input"
              placeholder="Anything specific to focus on today…"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={3}
            />
          </Field>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
        <button className="btn btn--accent btn--block btn--lg" onClick={handleGenerate}>
          <Icon.Sparkle size={18} />
          Generate 60 min plan
        </button>
        {!settings?.geminiApiKey && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-4)', textAlign: 'center' }}>
            No Gemini key — will use offline plan
          </div>
        )}
      </div>
    </div>
  );
}
