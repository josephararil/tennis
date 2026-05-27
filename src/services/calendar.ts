import { ensureToken } from './googleAuth';
import type { CalendarSlot, Client } from '../types';

const BASE = 'https://www.googleapis.com/calendar/v3';

export interface NewEvent {
  clientName: string;
  startISO: string;
  endISO: string;
  timeZone: string;
  description?: string;
  location?: string;
  attendeeEmail?: string;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await ensureToken();
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

export async function createEvent(e: NewEvent): Promise<{ eventId: string; htmlLink: string }> {
  const body = {
    summary: `Tennis lesson · ${e.clientName}`,
    description: e.description ?? '',
    location: e.location ?? '',
    start: { dateTime: e.startISO, timeZone: e.timeZone },
    end: { dateTime: e.endISO, timeZone: e.timeZone },
    ...(e.attendeeEmail ? { attendees: [{ email: e.attendeeEmail }] } : {}),
  };
  const resp = await apiFetch('/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`Calendar API error: ${resp.status}`);
  const data = await resp.json();
  return { eventId: data.id, htmlLink: data.htmlLink };
}

export async function listDay(dateISO: string, clients: Client[]): Promise<CalendarSlot[]> {
  const timeMin = `${dateISO}T00:00:00Z`;
  const timeMax = `${dateISO}T23:59:59Z`;
  const resp = await apiFetch(
    `/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`
  );
  if (!resp.ok) throw new Error(`Calendar API error: ${resp.status}`);
  const data = await resp.json();
  const now = Date.now();

  return (data.items ?? []).map((item: {
    id: string;
    start?: { dateTime?: string };
    end?: { dateTime?: string };
    summary?: string;
    location?: string;
  }) => {
    const start = item.start?.dateTime ?? '';
    const end = item.end?.dateTime ?? '';
    const startMs = start ? new Date(start).getTime() : 0;
    const endMs = end ? new Date(end).getTime() : 0;
    const durationMin = Math.round((endMs - startMs) / 60000);
    const startTime = start
      ? new Date(start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      : '';
    const status: CalendarSlot['status'] =
      endMs < now ? 'done' : startMs <= now ? 'upcoming' : 'scheduled';
    const name = (item.summary ?? '').toLowerCase().replace('tennis lesson · ', '');
    const matchedClient = clients.find(
      (c) =>
        c.name.toLowerCase().includes(name) ||
        name.includes(c.name.toLowerCase().split(' ')[0])
    );
    return {
      eventId: item.id,
      start: startTime,
      end: end
        ? new Date(end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : '',
      durationMin,
      summary: item.summary ?? '',
      location: item.location,
      clientId: matchedClient?.id,
      status,
    } satisfies CalendarSlot;
  });
}
