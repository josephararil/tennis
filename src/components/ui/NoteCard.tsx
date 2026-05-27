import type { Note } from '../../types';
import { formatCreatedAt } from '../../lib/format';

interface Props {
  note: Note;
  accent?: boolean;
}

export function NoteCard({ note, accent }: Props) {
  return (
    <article style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', background: accent ? 'var(--clay-tint)' : 'transparent' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent ? 'var(--clay-deep)' : 'var(--ink-4)', marginBottom: 8 }}>
        {formatCreatedAt(note.createdAt)}
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
