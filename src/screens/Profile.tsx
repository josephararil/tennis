import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AppBar, TabBar, Avatar, NTRP, Chip, NoteCard } from '../components/ui';
import { Icon } from '../components/Icon';
import type { TabName, BallType } from '../types';
import { db } from '../services/db';

const BALL_TYPE_LABELS: Record<BallType, string> = {
  red: 'Red balls',
  orange: 'Orange balls',
  green: 'Green dot balls',
  yellow: 'Standard yellow balls',
};

interface Props {
  clientId: string;
  onBack: () => void;
  onSchedule: () => void;
  onAddNote: () => void;
  onGenerate: () => void;
  onDelete: () => Promise<void>;
  onTab: (tab: TabName) => void;
}

type ProfileTab = 'info' | 'notes' | 'lessons';

export function ProfileScreen({ clientId, onBack, onSchedule, onAddNote, onGenerate, onDelete, onTab }: Props) {
  const { clientsById, notesByClient, setNotesForClient, setClients } = useStore();
  const client = clientsById[clientId];
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [lessonCount, setLessonCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const notes = notesByClient[clientId] ?? [];

  async function handleDelete() {
    setDeleting(true);
    try {
      await db.transaction('rw', db.clients, db.notes, db.lessons, async () => {
        await db.clients.delete(clientId);
        await db.notes.where('clientId').equals(clientId).delete();
        await db.lessons.where('clientId').equals(clientId).delete();
      });
      const allClients = await db.clients.orderBy('updatedAt').reverse().toArray();
      setClients(allClients);
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    db.notes.where('clientId').equals(clientId).reverse().sortBy('createdAt').then((ns) => {
      setNotesForClient(clientId, ns);
    });
    db.lessons.where('clientId').equals(clientId).count().then(setLessonCount);
  }, [clientId]);

  if (!client) {
    return (
      <div className="app">
        <AppBar title="Client" leading={<button className="appbar__icon" onClick={onBack}><Icon.Back /></button>} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)' }}>Client not found</div>
        <TabBar active="roster" onChange={onTab} />
      </div>
    );
  }

  return (
    <div className="app">
      <AppBar
        title=""
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Back /></button>}
        trailing={
          <div style={{ display: 'flex', gap: 0 }}>
            <button className="appbar__icon" onClick={onSchedule}>
              <Icon.Calendar size={20} />
            </button>
            <button className="appbar__icon" onClick={() => setShowDeleteConfirm(true)} style={{ color: 'var(--ink-4)' }}>
              <Icon.Trash size={20} />
            </button>
          </div>
        }
      />

      <div className="scroll">
        {/* Hero */}
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Avatar client={client} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.2 }}>{client.name}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-4)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{client.archetype}</span>
                {client.ntrp != null && <NTRP value={client.ntrp} />}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--accent btn--lg" style={{ flex: 1 }} onClick={onGenerate}>
              <Icon.Sparkle size={18} />
              60 min plan
            </button>
            <button className="btn btn--ghost" style={{ height: 60, width: 60, padding: 0, borderRadius: 12, flexShrink: 0 }} onClick={onSchedule}>
              <Icon.Calendar size={20} />
            </button>
            <button className="btn btn--ghost" style={{ height: 60, width: 60, padding: 0, borderRadius: 12, flexShrink: 0 }} onClick={onAddNote}>
              <Icon.Note size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ flexShrink: 0 }}>
          {(['info', 'notes', 'lessons'] as ProfileTab[]).map((t) => (
            <button key={t} className={`tabs__item ${activeTab === t ? 'tabs__item--active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'info' ? 'Info' : t === 'notes' ? `Notes ${notes.length > 0 ? `(${notes.length})` : ''}` : `Sessions ${lessonCount > 0 ? `(${lessonCount})` : ''}`}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {activeTab === 'info' && (
          <div style={{ padding: '16px 0' }}>
            {client.phone && (
              <div className="row row--compact">
                <Icon.Phone size={18} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="field__label">Phone</div>
                  <div style={{ fontSize: 15 }}>{client.phone}</div>
                </div>
              </div>
            )}
            {(client.age != null || client.handed) && (
              <div className="row row--compact">
                <Icon.Person size={18} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="field__label">Player</div>
                  <div style={{ fontSize: 15, display: 'flex', gap: 12 }}>
                    {client.age != null && <span>Age {client.age}</span>}
                    {client.handed && <span>{client.handed}</span>}
                  </div>
                </div>
              </div>
            )}
            {client.style && (
              <div className="row row--compact">
                <Icon.Tennis size={18} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="field__label">Style</div>
                  <div style={{ fontSize: 15 }}>{client.style}</div>
                  {client.grip && <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>{client.grip}</div>}
                </div>
              </div>
            )}
            {(client.hasRacket != null || client.ballType) && (
              <div className="row row--compact">
                <Icon.Tennis size={18} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="field__label">Equipment</div>
                  <div style={{ fontSize: 15 }}>
                    {client.hasRacket != null && (
                      <span>{client.hasRacket ? 'Has own racket' : 'No racket — coach provides'}</span>
                    )}
                    {client.hasRacket != null && client.ballType && <span> · </span>}
                    {client.ballType && <span>{BALL_TYPE_LABELS[client.ballType]}</span>}
                  </div>
                </div>
              </div>
            )}
            {client.cadence && (
              <div className="row row--compact">
                <Icon.Clock size={18} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="field__label">Cadence</div>
                  <div style={{ fontSize: 15 }}>{client.cadence}</div>
                </div>
              </div>
            )}
            {client.preferences && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)' }}>
                <div className="field__label" style={{ marginBottom: 8 }}>Preferences & notes</div>
                <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>{client.preferences}</div>
              </div>
            )}
            {client.members && client.members.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)' }}>
                <div className="field__label" style={{ marginBottom: 8 }}>Group members</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {client.members.map((m) => <Chip key={m}>{m}</Chip>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes tab */}
        {activeTab === 'notes' && (
          <div>
            <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" style={{ height: 36, padding: '0 14px', fontSize: 13, gap: 6 }} onClick={onAddNote}>
                <Icon.Plus size={14} />
                Add note
              </button>
            </div>
            {notes.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-4)' }}>
                <Icon.Note size={32} />
                <div style={{ marginTop: 12, fontSize: 15 }}>No session notes yet</div>
              </div>
            )}
            {notes.map((note, i) => (
              <NoteCard key={note.id} note={note} accent={i === 0} />
            ))}
            <div className="spacer-lg" />
          </div>
        )}

        {/* Lessons tab */}
        {activeTab === 'lessons' && (
          <div>
            <LessonsTab clientId={clientId} onGenerate={onGenerate} />
          </div>
        )}

        <div className="spacer-lg" />
      </div>

      <TabBar active="roster" onChange={onTab} />

      {showDeleteConfirm && (
        <>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(14,14,12,0.5)', zIndex: 20 }}
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderRadius: '16px 16px 0 0', padding: '24px 20px', zIndex: 21, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>Remove {client.name}?</div>
            <div style={{ fontSize: 14, color: 'var(--ink-4)', lineHeight: 1.5 }}>
              All sessions and notes for this client will be permanently deleted.
            </div>
            <button
              className="btn btn--block btn--lg"
              style={{ background: 'var(--status-bad)', color: '#fff', marginTop: 4 }}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Removing…' : 'Remove client'}
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LessonsTab({ clientId, onGenerate }: { clientId: string; onGenerate: () => void }) {
  const [lessons, setLessons] = useState<import('../types').Lesson[]>([]);

  useEffect(() => {
    db.lessons.where('clientId').equals(clientId).reverse().sortBy('createdAt').then(setLessons);
  }, [clientId]);

  if (lessons.length === 0) {
    return (
      <div style={{ padding: '48px 20px', textAlign: 'center' }}>
        <Icon.Sparkle size={32} style={{ color: 'var(--clay)' }} />
        <div style={{ marginTop: 12, fontSize: 16, fontWeight: 500 }}>No lessons yet</div>
        <div style={{ marginTop: 6, fontSize: 14, color: 'var(--ink-4)', marginBottom: 20 }}>Generate a plan to get started</div>
        <button className="btn btn--accent" onClick={onGenerate}>
          <Icon.Sparkle size={18} />
          60 min plan
        </button>
      </div>
    );
  }

  return (
    <div>
      {lessons.map((lesson) => (
        <div key={lesson.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
              {new Date(lesson.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="chip">{lesson.duration} min</span>
              {lesson.source === 'ai' && <span className="chip chip--clay-soft"><Icon.Sparkle size={10} /> AI</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {lesson.focus.map((f) => <span key={f} className="chip">{f}</span>)}
          </div>
          {lesson.phases.slice(0, 2).map((phase) => (
            <div key={phase.tag} style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-3)' }}>
              <span style={{ color: 'var(--ink-4)', marginRight: 6 }}>{phase.tag}</span>{phase.name}
            </div>
          ))}
        </div>
      ))}
      <div className="spacer-lg" />
    </div>
  );
}
