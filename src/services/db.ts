import Dexie, { type Table } from 'dexie';
import type { Client, Note, Lesson, Settings } from '../types';

class TennisDB extends Dexie {
  clients!: Table<Client>;
  notes!: Table<Note>;
  lessons!: Table<Lesson>;
  settings!: Table<Settings>;

  constructor() {
    super('TennisCoachDB');
    this.version(1).stores({
      clients: 'id, archetypeId, updatedAt',
      notes: 'id, clientId, createdAt',
      lessons: 'id, clientId, createdAt',
      settings: 'id',
    });
  }
}

export const db = new TennisDB();

export async function seedIfEmpty(): Promise<void> {
  const count = await db.clients.count();
  if (count > 0) return;
  const { SEED_CLIENTS, SEED_NOTES } = await import('../data/seed');
  await db.transaction('rw', db.clients, db.notes, async () => {
    await db.clients.bulkPut(SEED_CLIENTS);
    await db.notes.bulkPut(SEED_NOTES);
  });
  const existing = await db.settings.get('singleton');
  if (!existing) {
    await db.settings.put({
      id: 'singleton',
      defaultDuration: 60,
      regenBehaviour: 'ask',
      googleConnected: false,
      coach: {
        name: 'Martina Gledacheva',
        club: 'St Andrews TC',
        initials: 'MG',
        defaultCourt: 'Court 3 · Club',
      },
    });
  }
}
