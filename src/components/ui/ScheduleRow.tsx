import type { Client, CalendarSlot } from '../../types';
import { Chip } from './Chip';

interface Props {
  slot: CalendarSlot;
  clientsById: Record<string, Client>;
  onClick: () => void;
}

export function ScheduleRow({ slot, clientsById, onClick }: Props) {
  const c = clientsById[slot.clientId ?? ''];
  if (!c) return null;
  const isDone = slot.status === 'done';
  const isUpcoming = slot.status === 'upcoming';

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'stretch',
        gap: 14,
        padding: '14px 20px',
        borderBottom: '1px solid var(--line)',
        textAlign: 'left',
        background: 'transparent',
        transition: 'background .12s',
      }}
    >
      <div style={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, paddingTop: 2 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: isDone ? 'var(--ink-4)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          {slot.start}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', fontVariantNumeric: 'tabular-nums' }}>
          {slot.durationMin} min
        </div>
      </div>
      <div style={{ width: 2, background: isUpcoming ? 'var(--clay)' : isDone ? 'var(--line-2)' : 'var(--ink)', borderRadius: 2, marginTop: 4, marginBottom: 4 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: isDone ? 'var(--ink-3)' : 'var(--ink)', letterSpacing: '-0.01em', textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: 'var(--ink-5)' }}>
          {c.name}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span>{c.archetype}</span><span>·</span><span>{slot.location ?? 'Court'}</span>
        </div>
      </div>
      {isUpcoming && (
        <div style={{ alignSelf: 'center', color: 'var(--clay)' }}>
          <Chip tone="clay-soft">Next</Chip>
        </div>
      )}
    </button>
  );
}
