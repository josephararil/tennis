export type AvatarTone = 'default' | 'ink' | 'clay';
export type ArchetypeId = 'adult-beg' | 'adult-int' | 'adult-adv' | 'junior' | 'group' | 'other';
export type BallType = 'red' | 'orange' | 'green' | 'yellow';
export type NoteTag = 'Forehand' | 'Backhand' | 'Serve' | 'Footwork' | 'Tactics' | 'Mental';
export type FocusId = 'forehand' | 'backhand' | 'serve' | 'footwork' | 'fitness' | 'tactics';
export type Intensity = 'easy' | 'moderate' | 'hard';

export interface Client {
  id: string;
  name: string;
  initials: string;
  avatarTone: AvatarTone;
  phone?: string;
  age?: number | null;
  ntrp?: number | null;
  archetypeId: ArchetypeId;
  archetype: string;
  style?: string;
  grip?: string;
  handed?: string;
  hasRacket?: boolean;
  ballType?: BallType;
  preferences?: string;
  cadence?: string;
  members?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  clientId: string;
  body: string;
  tags: NoteTag[];
  createdAt: string;
}

export interface LessonPhase {
  tag: string;
  min: number;
  name: string;
  desc: string;
  cues?: string[];
}

export interface Lesson {
  id: string;
  clientId: string;
  createdAt: string;
  focus: FocusId[];
  duration: 30 | 60 | 90;
  intensity: Intensity;
  freeText?: string;
  phases: LessonPhase[];
  source: 'ai' | 'fallback';
  calendarEventId?: string;
}

export interface CoachProfile {
  name: string;
  club: string;
  email?: string;
  initials: string;
  defaultCourt?: string;
}

export interface Settings {
  id: 'singleton';
  geminiApiKey?: string;
  defaultDuration: 30 | 60 | 90;
  regenBehaviour: 'ask' | 'always' | 'never';
  coach: CoachProfile;
  googleConnected: boolean;
}

export interface CalendarSlot {
  eventId: string;
  start: string;
  end: string;
  durationMin: number;
  summary: string;
  location?: string;
  clientId?: string;
  status: 'done' | 'upcoming' | 'scheduled';
}

// Router types
export type RouteName = 'today' | 'roster' | 'profile' | 'addClient' | 'editClient' | 'lessonConfig' | 'lessonLoading' | 'lessonOutput' | 'settings';
export interface Route { name: RouteName; params: Record<string, string>; }
export type TabName = 'today' | 'roster' | 'settings';
export type SheetName = 'schedule' | 'note' | 'confirm' | null;

export interface ConfirmSummary {
  time: string;
  date: string;
  duration: number;
  eventId?: string;
  htmlLink?: string;
}

export interface GenConfig {
  focus: FocusId[];
  duration: 30 | 60 | 90;
  intensity: Intensity;
  freeText?: string;
}
