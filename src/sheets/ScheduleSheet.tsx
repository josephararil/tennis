import { useState, useMemo } from 'react';
import type { Client, ConfirmSummary } from '../types';
import { Icon } from '../components/Icon';
import { PickerChip } from '../components/ui';
import { createEvent } from '../services/calendar';
import { AuthError, isConnected, requestToken } from '../services/googleAuth';
import { useStore } from '../store';
import { addMin } from '../lib/format';

interface Props {
  client: Client;
  onClose: () => void;
  onConfirm: (summary: ConfirmSummary) => void;
}

const TIME_SLOTS = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '14:00', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
const DURATION_OPTIONS: { value: 30 | 60 | 90; label: string }[] = [
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
];

function getNext7Days(): { label: string; short: string; iso: string; dateStr: string }[] {
  const result = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' });
    const short = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    result.push({ label, short, iso, dateStr: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) });
  }
  return result;
}

export function ScheduleSheet({ client, onClose, onConfirm }: Props) {
  const { settings } = useStore();
  const days = useMemo(() => getNext7Days(), []);

  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState<30 | 60 | 90>(settings?.defaultDuration ?? 60);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connected = isConnected();
  const selectedDay = days[dayIndex];

  async function handleBook() {
    setBooking(true);
    setError(null);

    const dayIso = selectedDay.iso;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startISO = `${dayIso}T${time}:00`;
    const endISO = `${dayIso}T${addMin(time, duration)}:00`;

    if (!connected) {
      // Try to connect first
      try {
        await requestToken({ prompt: 'consent' });
      } catch {
        // Save locally — no calendar
        onConfirm({
          time,
          date: selectedDay.dateStr,
          duration,
        });
        return;
      }
    }

    try {
      const { eventId, htmlLink } = await createEvent({
        clientName: client.name,
        startISO,
        endISO,
        timeZone: tz,
        location: settings?.coach.defaultCourt,
      });
      onConfirm({
        time,
        date: selectedDay.dateStr,
        duration,
        eventId,
        htmlLink,
      });
    } catch (e) {
      if (e instanceof AuthError) {
        setError('Google Calendar not connected — saved locally.');
        onConfirm({ time, date: selectedDay.dateStr, duration });
      } else {
        setError((e as Error).message ?? 'Booking failed');
        setBooking(false);
      }
    }
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__header">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>
            Schedule · {client.name.split(' ')[0]}
          </div>
          <button className="appbar__icon" onClick={onClose}>
            <Icon.Close size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Day picker */}
          <div>
            <div className="field__label" style={{ marginBottom: 8 }}>Date</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {days.map((d, i) => (
                <button
                  key={d.iso}
                  onClick={() => setDayIndex(i)}
                  style={{
                    flexShrink: 0,
                    minWidth: 64,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: dayIndex === i ? 'var(--ink)' : 'var(--surface-2)',
                    color: dayIndex === i ? '#fff' : 'var(--ink)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'background .12s',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 500, opacity: dayIndex === i ? 0.7 : 0.55, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{d.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{d.short}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time picker */}
          <div>
            <div className="field__label" style={{ marginBottom: 8 }}>Time</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`chip chip--lg ${time === t ? 'chip--ink' : 'chip--outline'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="field__label" style={{ marginBottom: 8 }}>Duration</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {DURATION_OPTIONS.map(({ value, label }) => (
                <PickerChip
                  key={value}
                  value={label}
                  selected={duration === value}
                  onClick={() => setDuration(value)}
                />
              ))}
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 13, color: 'var(--status-bad)', padding: '10px 12px', background: 'var(--clay-tint)', borderRadius: 8 }}>
              {error}
            </div>
          )}

          {!connected && (
            <div style={{ fontSize: 12, color: 'var(--ink-4)', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
              Google Calendar not connected — booking will be saved locally only.
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px 0' }}>
          <button className="btn btn--accent btn--block btn--lg" onClick={handleBook} disabled={booking}>
            <Icon.Calendar size={18} />
            {booking ? 'Booking…' : `Book ${time} · ${duration} min`}
          </button>
        </div>
      </div>
    </>
  );
}
