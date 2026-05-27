import type { Client, Note, FocusId, Intensity, LessonPhase, GenConfig } from '../types';
import { DRILLS_FALLBACK } from '../data/drills';
import { durationSplit } from '../lib/split';
import { useStore } from '../store';

export interface GenInput {
  client: Client;
  notesLast4: Note[];
  focus: FocusId[];
  duration: 30 | 60 | 90;
  intensity: Intensity;
  freeText?: string;
}

export interface GenResult {
  phases: LessonPhase[];
  source: 'ai' | 'fallback';
}

const PHASE_TAGS = ['1 · Warm-up', '2 · Technical drill', '3 · Tactical drill', '4 · Finish'];

export function fromFallback(focus: FocusId[], duration: 30 | 60 | 90): LessonPhase[] {
  const focusKey = focus[0] ?? 'forehand';
  const lib = DRILLS_FALLBACK[focusKey] ?? DRILLS_FALLBACK.forehand;
  const split = durationSplit(duration);
  const drills = [lib.warmup, lib.technical, lib.tactical, lib.finish];
  return drills.map((d, i) => ({ tag: PHASE_TAGS[i], min: split[i], name: d.name, desc: d.desc }));
}

function buildPrompt(input: GenInput): string {
  const { client, notesLast4, focus, duration, intensity } = input;
  const notesText =
    notesLast4.length > 0
      ? notesLast4.map((n) => `- ${n.body}`).join('\n')
      : '(No recent notes)';
  return `You are a tennis-coaching assistant for Martina Gledacheva, a former WTA pro.
Produce EXACTLY four phases — warm-up, technical drill, tactical drill, finish — as JSON matching the provided schema.
Each phase: a concrete drill \`name\`, a one-line \`desc\` (court setup + rep scheme), and 1–3 short \`cues\`.
Keep language glanceable at 6 ft. Honour the player's level and preferences. Do not include timings.

Player: ${client.name}, age ${client.age ?? 'unknown'}, ${client.archetype}, NTRP ${client.ntrp ?? 'N/A'}, style ${client.style ?? 'unspecified'}.
Preferences: ${client.preferences ?? 'none'}.
Recent notes (most recent first):
${notesText}
Session: ${duration} min, focus ${focus.join(' + ')}, intensity ${intensity}.
${input.freeText ? `Coach note: ${input.freeText}` : ''}`;
}

const responseSchema = {
  type: 'object',
  properties: {
    phases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          desc: { type: 'string' },
          cues: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'desc'],
      },
      minItems: 4,
      maxItems: 4,
    },
  },
  required: ['phases'],
};

export async function generate(
  input: GenInput,
  opts?: { onStage?: (stage: number) => void; signal?: AbortSignal }
): Promise<GenResult> {
  const settings = useStore.getState().settings;
  const apiKey = settings?.geminiApiKey;

  if (!apiKey) {
    return { phases: fromFallback(input.focus, input.duration), source: 'fallback' };
  }

  opts?.onStage?.(0);
  const prompt = buildPrompt(input);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

  let attempt = 0;
  while (attempt < 2) {
    try {
      opts?.onStage?.(Math.min(1 + attempt, 3));
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key' : apiKey },
        signal: opts?.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.7,
          },
        }),
      });

      if (resp.status === 429) {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
          attempt++;
          continue;
        }
        return { phases: fromFallback(input.focus, input.duration), source: 'fallback' };
      }

      if (resp.status === 400 || resp.status === 403) {
        const data = await resp.json().catch(() => ({}));
        const msg = ((data as { error?: { message?: string } })?.error?.message ?? '').toLowerCase();
        if (msg.includes('api_key') || msg.includes('invalid')) {
          if (settings) useStore.getState().updateSettings({ geminiApiKey: undefined });
        }
        return { phases: fromFallback(input.focus, input.duration), source: 'fallback' };
      }

      if (!resp.ok) {
        attempt++;
        continue;
      }

      opts?.onStage?.(3);
      const data = await resp.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      let parsed: { phases: { name: string; desc: string; cues?: string[] }[] };
      try {
        parsed = JSON.parse(text);
      } catch {
        if (attempt === 0) {
          attempt++;
          continue;
        }
        return { phases: fromFallback(input.focus, input.duration), source: 'fallback' };
      }

      if (!parsed?.phases || parsed.phases.length !== 4) {
        return { phases: fromFallback(input.focus, input.duration), source: 'fallback' };
      }

      const split = durationSplit(input.duration);
      opts?.onStage?.(4);
      const phases: LessonPhase[] = parsed.phases.map((p, i) => ({
        tag: PHASE_TAGS[i],
        min: split[i],
        name: p.name,
        desc: p.desc,
        cues: p.cues,
      }));
      return { phases, source: 'ai' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      return { phases: fromFallback(input.focus, input.duration), source: 'fallback' };
    }
  }
  return { phases: fromFallback(input.focus, input.duration), source: 'fallback' };
}

// Re-export GenConfig for convenience
export type { GenConfig };
