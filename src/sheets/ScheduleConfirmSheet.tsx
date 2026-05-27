import type { Client, ConfirmSummary } from '../types';
import { Icon } from '../components/Icon';

interface Props {
  client: Client;
  summary: ConfirmSummary;
  onDone: () => void;
  onView: () => void;
}

export function ScheduleConfirmSheet({ client, summary, onDone, onView }: Props) {
  const hasCalendar = !!summary.htmlLink;

  return (
    <>
      <div className="scrim" onClick={onDone} />
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />

        <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center' }}>
          {/* Success icon */}
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: hasCalendar ? 'var(--clay)' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasCalendar
              ? <Icon.Check size={28} style={{ color: '#fff' }} />
              : <Icon.Clock size={28} style={{ color: 'var(--ink-4)' }} />
            }
          </div>

          <div>
            <div className="display-s" style={{ marginBottom: 6 }}>
              {hasCalendar ? 'Booked!' : 'Noted locally'}
            </div>
            <div style={{ fontSize: 15, color: 'var(--ink-3)' }}>
              {client.name}
            </div>
          </div>

          {/* Details */}
          <div style={{ width: '100%', background: 'var(--surface-2)', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon.Calendar size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
              <div style={{ fontSize: 15, color: 'var(--ink)' }}>{summary.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon.Clock size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
              <div style={{ fontSize: 15, color: 'var(--ink)' }}>{summary.time} · {summary.duration} min</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ width: '100%', display: 'flex', gap: 10 }}>
            <button className="btn btn--ghost" style={{ flex: 1 }} onClick={onDone}>
              Done
            </button>
            {hasCalendar && (
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={onView}>
                <Icon.Link size={16} />
                View in Calendar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
