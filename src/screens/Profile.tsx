import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AppBar, TabBar, Avatar, NTRP, Chip, NoteCard } from '../components/ui';
import { Icon } from '../components/Icon';
import type { TabName } from '../types';
import { db } from '../services/db';

interface Props {
  clientId: string;
  onBack: () => void;
  onSchedule: () => void;
  onAddNote: () => void;
  onGenerate: () => void;
  onTab: (tab: TabName) => void;
}

type ProfileTab = 'info' | 'notes' | 'lessons';

export function ProfileScreen({ clientId, onBack, onSchedule, onAddNote, onGenerate, onTab }: Props) {
  const { clientsById, notesByClient, setNotesForClient, settings } = useStore();
  const client = clientsById[clientId];
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [lessonCount, setLessonCount] = useState(0);

  const notes = notesByClient[clientId] ?? [];

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

  const defaultDuration = settings?.defaultDuration ?? 60;

  return (
    <div className="app">
      <AppBar
        title=""
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Back /></button>}
        trailing={
          <button className="appbar__icon" onClick={onSchedule}>
            <Icon.Calendar size={20} />
          </button>
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
              {defaultDuration} min plan
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
            {client.gear && (
              <div className="row row--compact">
                <Icon.ArrowRight size={18} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="field__label">Gear</div>
                  <div style={{ fontSize: 15 }}>{client.gear}</div>
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
            <LessonsTab clientId={clientId} onGenerate={onGenerate} defaultDuration={defaultDuration} />
          </div>
        )}

        <div className="spacer-lg" />
      </div>

      <TabBar active="roster" onChange={onTab} />
    </div>
  );
}

function LessonsTab({ clientId, onGenerate, defaultDuration }: { clientId: string; onGenerate: () => void; defaultDuration: number }) {
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
          {defaultDuration} min plan
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
