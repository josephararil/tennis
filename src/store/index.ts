import { create } from 'zustand';
import type { Client, Note, Settings, CalendarSlot, GenConfig, LessonPhase } from '../types';

interface ClientsSlice {
  clients: Client[];
  clientsById: Record<string, Client>;
  setClients: (clients: Client[]) => void;
}

interface NotesSlice {
  notesByClient: Record<string, Note[]>;
  setNotesForClient: (clientId: string, notes: Note[]) => void;
}

interface SettingsSlice {
  settings: Settings | null;
  setSettings: (s: Settings) => void;
  updateSettings: (partial: Partial<Settings>) => void;
}

interface AuthSlice {
  googleToken: string | null;
  googleTokenExpiry: number | null;
  googleEmail: string | null;
  setGoogleAuth: (token: string, expiresIn: number, email?: string) => void;
  clearGoogleAuth: () => void;
}

interface GenSlice {
  genConfig: GenConfig | null;
  genPhases: LessonPhase[] | null;
  genSource: 'ai' | 'fallback' | null;
  genStage: number;
  setGenConfig: (c: GenConfig) => void;
  setGenResult: (phases: LessonPhase[], source: 'ai' | 'fallback') => void;
  setGenStage: (stage: number) => void;
  clearGen: () => void;
}

interface CalendarSlice {
  todaySlots: CalendarSlot[];
  setTodaySlots: (slots: CalendarSlot[]) => void;
}

type Store = ClientsSlice & NotesSlice & SettingsSlice & AuthSlice & GenSlice & CalendarSlice;

export const useStore = create<Store>((set) => ({
  // Clients
  clients: [],
  clientsById: {},
  setClients: (clients) =>
    set({ clients, clientsById: Object.fromEntries(clients.map((c) => [c.id, c])) }),

  // Notes
  notesByClient: {},
  setNotesForClient: (clientId, notes) =>
    set((s) => ({ notesByClient: { ...s.notesByClient, [clientId]: notes } })),

  // Settings
  settings: null,
  setSettings: (settings) => set({ settings }),
  updateSettings: (partial) =>
    set((s) => ({ settings: s.settings ? { ...s.settings, ...partial } : null })),

  // Auth
  googleToken: null,
  googleTokenExpiry: null,
  googleEmail: null,
  setGoogleAuth: (token, expiresIn, email) =>
    set({ googleToken: token, googleTokenExpiry: Date.now() + expiresIn * 1000 - 60000, googleEmail: email ?? null }),
  clearGoogleAuth: () => set({ googleToken: null, googleTokenExpiry: null, googleEmail: null }),

  // Gen
  genConfig: null,
  genPhases: null,
  genSource: null,
  genStage: 0,
  setGenConfig: (genConfig) => set({ genConfig, genPhases: null, genSource: null, genStage: 0 }),
  setGenResult: (genPhases, genSource) => set({ genPhases, genSource }),
  setGenStage: (genStage) => set({ genStage }),
  clearGen: () => set({ genConfig: null, genPhases: null, genSource: null, genStage: 0 }),

  // Calendar
  todaySlots: [],
  setTodaySlots: (todaySlots) => set({ todaySlots }),
}));
