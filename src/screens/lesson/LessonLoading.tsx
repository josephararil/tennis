import { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { AppBar, Spinner } from '../../components/ui';
import { Icon } from '../../components/Icon';
import type { Client } from '../../types';
import { generate, fromFallback } from '../../services/lessonAi';
import { db } from '../../services/db';

interface Props {
  client: Client;
  onBack: () => void;
  onDone: () => void;
}

const STAGE_LABELS = [
  'Reading the last 4 sessions',
  'Checking grip & gear notes',
  'Composing warm-up',
  'Building drills',
  'Finishing flourish',
];

export function LessonLoadingScreen({ client, onBack, onDone }: Props) {
  const { genConfig, genStage, setGenResult, setGenStage, notesByClient } = useStore();
  const abortRef = useRef<AbortController | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    doneRef.current = false;

    // Advance the stage display on a timer (matches prototype 700ms cadence),
    // but actual completion advances past a stalled stage.
    const stageTimer = setInterval(() => {
      if (!doneRef.current) setGenStage(Math.min(useStore.getState().genStage + 1, STAGE_LABELS.length - 1));
    }, 700);

    async function run() {
      const notes = notesByClient[client.id] ?? [];
      let actualNotes = notes.slice(0, 4);
      if (actualNotes.length === 0) {
        try {
          actualNotes = await db.notes
            .where('clientId')
            .equals(client.id)
            .reverse()
            .sortBy('createdAt')
            .then((ns) => ns.slice(0, 4));
        } catch { /* ignore */ }
      }

      const cfg = genConfig ?? { focus: ['forehand' as const], duration: 60 as const, intensity: 'moderate' as const };

      try {
        const result = await generate(
          { client, notesLast4: actualNotes, focus: cfg.focus, duration: cfg.duration, intensity: cfg.intensity, freeText: cfg.freeText },
          {
            onStage: (stage) => {
              if (!doneRef.current) {
                // AI stage 0-4 → display stage (jump ahead if AI is faster)
                const mapped = Math.min(stage + 1, STAGE_LABELS.length - 1);
                const current = useStore.getState().genStage;
                if (mapped > current) setGenStage(mapped);
              }
            },
            signal: ctrl.signal,
          }
        );

        if (doneRef.current) return;
        clearInterval(stageTimer);
        doneRef.current = true;
        setGenStage(STAGE_LABELS.length - 1);
        setGenResult(result.phases, result.source);
        await new Promise((r) => setTimeout(r, 500));
        onDone();
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        clearInterval(stageTimer);
        const phases = fromFallback(cfg.focus, cfg.duration);
        setGenResult(phases, 'fallback');
        onDone();
      }
    }

    run();

    return () => {
      clearInterval(stageTimer);
      doneRef.current = true;
      ctrl.abort();
    };
  }, []);

  const step = genStage;

  return (
    <div className="app">
      <AppBar
        title=""
        leading={
          <button
            className="appbar__icon"
            onClick={() => { doneRef.current = true; abortRef.current?.abort(); onBack(); }}
          >
            <Icon.Close />
          </button>
        }
      />

      <div className="scroll" style={{ padding: '8px 20px 32px', display: 'flex', flexDirection: 'column' }}>
        <div className="eyebrow">Composing</div>
        <div className="display-l" style={{ marginTop: 4, fontStyle: 'italic' }}>
          A plan for {client.name.split(' ')[0]}…
        </div>

        {/* 5-step staged list — matches prototype exactly */}
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {STAGE_LABELS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: i < step ? 'var(--ink)' : i === step ? 'var(--clay-tint)' : 'var(--surface-2)',
                color: i < step ? '#fff' : i === step ? 'var(--clay-deep)' : 'var(--ink-5)',
              }}>
                {i < step
                  ? <Icon.Check size={14} stroke={2.2} />
                  : i === step
                    ? <Spinner size={14} />
                    : <span style={{ width: 6, height: 6, borderRadius: 3, background: 'currentColor', display: 'block' }} />
                }
              </div>
              <div style={{
                fontSize: 15,
                color: i <= step ? 'var(--ink)' : 'var(--ink-4)',
                fontWeight: i === step ? 500 : 400,
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Shimmer skeleton — suggests content loading below */}
        <div style={{ marginTop: 'auto', paddingTop: 36 }}>
          <div className="shimmer" style={{ height: 78, marginBottom: 10 }} />
          <div className="shimmer" style={{ height: 78, marginBottom: 10 }} />
          <div className="shimmer" style={{ height: 78, marginBottom: 10, opacity: 0.6 }} />
          <div className="shimmer" style={{ height: 78, opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
}
