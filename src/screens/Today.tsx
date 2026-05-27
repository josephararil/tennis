import { useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { AppBar, TabBar, ScheduleRow } from '../components/ui';
import { Icon } from '../components/Icon';
import type { TabName, CalendarSlot } from '../types';
import { listDay } from '../services/calendar';
import { isConnected, requestToken } from '../services/googleAuth';

interface Props {
  onOpenClient: (id: string) => void;
  onTab: (tab: TabName) => void;
}

// Seed fallback schedule (relative to today = 2026-05-27)
const TODAY_DATE = '2026-05-27';
const TOMORROW_DATE = '2026-05-28';

const FALLBACK_TODAY: CalendarSlot[] = [
  { eventId: 'seed-mb', start: '08:00', end: '09:30', durationMin: 90, summary: 'Tennis lesson · Margot Beaumont', location: 'Court 3 · Club', clientId: 'margot-beaumont', status: 'done' },
  { eventId: 'seed-cw', start: '11:00', end: '12:00', durationMin: 60, summary: 'Tennis lesson · Charlotte Whitfield-Hayes', location: 'Court 3 · Club', clientId: 'charlotte-whitfield-hayes', status: 'done' },
  { eventId: 'seed-dc', start: '17:30', end: '19:00', durationMin: 90, summary: 'Tennis lesson · Daniel Costa', location: 'Court 3 · Club', clientId: 'daniel-costa', status: 'upcoming' },
];

const FALLBACK_TOMORROW: CalendarSlot[] = [
  { eventId: 'seed-rp', start: '07:30', end: '08:30', durationMin: 60, summary: 'Tennis lesson · Ravi Patel', location: 'Court 3 · Club', clientId: 'ravi-patel', status: 'scheduled' },
  { eventId: 'seed-ak', start: '15:30', end: '16:30', durationMin: 60, summary: 'Tennis lesson · Alex Kim', location: 'Court 3 · Club', clientId: 'alex-kim', status: 'scheduled' },
];

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function TodayScreen({ onOpenClient, onTab }: Props) {
  const { clientsById, todaySlots, setTodaySlots } = useStore();

  useEffect(() => {
    if (todaySlots.length === 0) {
      setTodaySlots(FALLBACK_TODAY);
    }
  }, []);

  useEffect(() => {
    if (isConnected()) {
      const clients = useStore.getState().clients;
      listDay(TODAY_DATE, clients)
        .then((slots) => { if (slots.length > 0) setTodaySlots(slots); })
        .catch(() => {});
    }
  }, []);

  const todayLabel = formatDayLabel(TODAY_DATE);
  const tomorrowLabel = formatDayLabel(TOMORROW_DATE);

  // Determine which clients today has — for the "next" label
  const tomorrowSlots = useMemo(() => {
    return FALLBACK_TOMORROW;
  }, []);

  const connected = isConnected();

  async function handleConnect() {
    try {
      await requestToken({ prompt: 'consent' });
      const clients = useStore.getState().clients;
      const slots = await listDay(TODAY_DATE, clients);
      if (slots.length > 0) setTodaySlots(slots);
    } catch {
      // ignore
    }
  }

  return (
    <div className="app">
      <AppBar
        title=""
        leading={<Icon.Logo size={24} />}
        trailing={
          <button className="appbar__icon" onClick={() => onTab('settings')}>
            <Icon.Person size={20} />
          </button>
        }
      />

      <div className="scroll">
        {/* Date hero */}
        <div style={{ padding: '16px 20px 12px' }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Today</div>
          <div className="display-s">{todayLabel}</div>
        </div>

        {/* Calendar connect card */}
        {!connected && (
          <div style={{ margin: '0 20px 16px', padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>Connect Google Calendar</div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Sync lessons and book slots</div>
              </div>
              <button className="btn btn--ghost" style={{ height: 36, padding: '0 14px', fontSize: 13 }} onClick={handleConnect}>
                Connect
              </button>
            </div>
          </div>
        )}

        {/* Today's schedule */}
        <div className="section-head">
          <div className="section-head__title">Schedule</div>
          <div className="section-head__count">{todaySlots.length} sessions</div>
        </div>

        {todaySlots.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <Icon.Calendar size={32} />
            <div style={{ marginTop: 12, fontSize: 15 }}>No sessions today</div>
          </div>
        )}

        {todaySlots.map((slot) => (
          <ScheduleRow
            key={slot.eventId}
            slot={slot}
            clientsById={clientsById}
            onClick={() => slot.clientId && onOpenClient(slot.clientId)}
          />
        ))}

        {/* Tomorrow */}
        {tomorrowSlots.length > 0 && (
          <>
            <div className="section-head" style={{ paddingTop: 28 }}>
              <div className="section-head__title" style={{ fontSize: 18, color: 'var(--ink-3)' }}>Tomorrow</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{tomorrowLabel}</div>
            </div>
            {tomorrowSlots.map((slot) => (
              <ScheduleRow
                key={slot.eventId}
                slot={slot}
                clientsById={clientsById}
                onClick={() => slot.clientId && onOpenClient(slot.clientId)}
              />
            ))}
          </>
        )}

        <div className="spacer-lg" />
      </div>

      <TabBar active="today" onChange={onTab} />
    </div>
  );
}
