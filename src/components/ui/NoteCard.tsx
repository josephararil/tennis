import type { Note } from '../../types';
import { formatCreatedAt } from '../../lib/format';
import { Icon } from '../Icon';

interface Props {
  note: Note;
  accent?: boolean;
  onClick?: () => void;
}

export function NoteCard({ note, accent, onClick }: Props) {
  return (
    <article
      onClick={onClick}
      style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--line)',
        background: accent ? 'var(--clay-tint)' : 'transparent',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent ? 'var(--clay-deep)' : 'var(--ink-4)' }}>
          {formatCreatedAt(note.createdAt)}
        </div>
        {onClick && <Icon.Edit size={14} style={{ color: 'var(--ink-5)', flexShrink: 0, marginLeft: 8 }} />}
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }}>{note.body}</div>
      {note.tags.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {note.tags.map((t) => (
            <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-3)', color: 'var(--ink-3)' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
