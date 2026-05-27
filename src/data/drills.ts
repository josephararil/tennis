import type { FocusId } from '../types';

export interface DrillSet {
  warmup: { name: string; desc: string };
  technical: { name: string; desc: string };
  tactical: { name: string; desc: string };
  finish: { name: string; desc: string };
}

export const DRILLS_FALLBACK: Record<FocusId, DrillSet> = {
  forehand: {
    warmup:    { name: 'Mini-court rallies, cross-court',     desc: 'Service-box only · feet, racquet face, finish' },
    technical: { name: 'Inside-out forehand · spot feed',     desc: 'Deuce ad-court target · 3 sets × 10 · prep early' },
    tactical:  { name: 'Crosscourt deep / inside-out attack', desc: 'Live ball · 2nd-ball aggression · 4-ball patterns' },
    finish:    { name: '"Spanish X" footwork · 4 cones',      desc: 'Forehand-only · 3 × 90s · breathing, recovery hops' },
  },
  backhand: {
    warmup:    { name: 'Backhand pat-ups, mini rally',        desc: 'Loose grip · early take-back · contact in front' },
    technical: { name: 'Two-hander down-the-line',            desc: 'Spot feed · 3 × 10 each side · shoulder rotation' },
    tactical:  { name: 'Slice approach + first volley',       desc: 'Live ball · low slice, close to net · split-step' },
    finish:    { name: 'King-of-the-court · backhand only',   desc: '4 players or shadow · 12 min · point play' },
  },
  serve: {
    warmup:    { name: 'Shadow serves + ball drops',          desc: 'Trophy pose · toss-and-catch × 20 · then live' },
    technical: { name: 'Kick serve · target boxes',           desc: 'Ad-side T · 3 × 8 · brush up, pronate, finish left' },
    tactical:  { name: 'Serve + 1 patterns',                  desc: 'Wide / body / T · plan the +1 before toss' },
    finish:    { name: 'First-serve % game to 11',            desc: 'Make 2, score; miss, opponent scores' },
  },
  footwork: {
    warmup:    { name: 'Ladder + dynamic',                    desc: 'Quick feet × 4 patterns · 5 min flow' },
    technical: { name: 'Recovery footwork · 5-cone',          desc: 'Forehand → recover → backhand · 3 × 8' },
    tactical:  { name: 'Two-on-one wide-ball coverage',       desc: 'Live ball · forced movement · 12 min' },
    finish:    { name: 'Suicide sprints to net & back',       desc: '4 × 30s · 30s rest · racquet in hand' },
  },
  fitness: {
    warmup:    { name: 'Dynamic mobility + 2 min jog',        desc: 'Hips, ankles, shoulders · easy' },
    technical: { name: 'Rally to 20 · controlled pace',       desc: 'No winners · build the engine' },
    tactical:  { name: 'Live ball · longer points only count', desc: 'Points <4 shots = replay · 20 min' },
    finish:    { name: '"Around the world" + cool down',      desc: 'Touch each line, then 5-min walk' },
  },
  tactics: {
    warmup:    { name: 'Pattern warm-up · crosscourt',        desc: '10 min cooperative rally · deuce side' },
    technical: { name: 'Serve + 2 shot pattern',              desc: '1st serve wide → approach mid → volley · 3×8' },
    tactical:  { name: 'King-of-the-court · full points',     desc: 'Server must follow to net · 20 min' },
    finish:    { name: 'Tiebreak pressure game',              desc: 'First to 7 wins · alternate serve every 2' },
  },
};
