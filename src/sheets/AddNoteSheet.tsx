import { useState } from 'react';
import type { Client, Note, NoteTag } from '../types';
import { Icon } from '../components/Icon';
import { Chip } from '../components/ui';
import { db } from '../services/db';
import { useStore } from '../store';

interface Props {
  client: Client;
  onClose: () => void;
  onSave: () => void;
  note?: Note;
}

const ALL_TAGS: NoteTag[] = ['Forehand', 'Backhand', 'Serve', 'Footwork', 'Tactics', 'Mental'];

export function AddNoteSheet({ client, onClose, onSave, note }: Props) {
  const [body, setBody] = useState(note?.body ?? '');
  const [tags, setTags] = useState<NoteTag[]>(note?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { setNotesForClient } = useStore();

  const isEditing = !!note;
  const canSave = body.trim().length >= 3;

  function toggleTag(tag: NoteTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function reloadNotes() {
    const notes = await db.notes.where('clientId').equals(client.id).reverse().sortBy('createdAt');
    setNotesForClient(client.id, notes);
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      if (isEditing) {
        await db.notes.put({ ...note, body: body.trim(), tags });
      } else {
        const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        await db.notes.put({ id, clientId: client.id, body: body.trim(), tags, createdAt: new Date().toISOString() });
      }
      await reloadNotes();
      onSave();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!note) return;
    setDeleting(true);
    try {
      await db.notes.delete(note.id);
      await reloadNotes();
      onSave();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '85%' }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__header">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>
            {isEditing ? 'Edit note' : `Note · ${client.name.split(' ')[0]}`}
          </div>
          <button className="appbar__icon" onClick={onClose}>
            <Icon.Close size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>
          <textarea
            className="field__input"
            placeholder="What happened in today's session?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ minHeight: 140, marginBottom: 16 }}
            autoFocus
          />

          <div style={{ marginBottom: 8 }}>
            <div className="field__label" style={{ marginBottom: 8 }}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_TAGS.map((tag) => (
                <Chip key={tag} tone={tags.includes(tag) ? 'ink' : 'outline'} onClick={() => toggleTag(tag)}>
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn--accent btn--block btn--lg" onClick={handleSave} disabled={!canSave || saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Save note'}
          </button>
          {isEditing && (
            <button
              className="btn btn--ghost btn--block"
              onClick={handleDelete}
              disabled={deleting}
              style={{ color: 'var(--status-bad)' }}
            >
              {deleting ? 'Deleting…' : 'Delete note'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
