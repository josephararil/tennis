import { useState } from 'react';
import type { Client, NoteTag } from '../types';
import { Icon } from '../components/Icon';
import { Chip } from '../components/ui';
import { db } from '../services/db';
import { useStore } from '../store';

interface Props {
  client: Client;
  onClose: () => void;
  onSave: () => void;
}

const ALL_TAGS: NoteTag[] = ['Forehand', 'Backhand', 'Serve', 'Footwork', 'Tactics', 'Mental'];

export function AddNoteSheet({ client, onClose, onSave }: Props) {
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<NoteTag[]>([]);
  const [saving, setSaving] = useState(false);
  const { setNotesForClient } = useStore();

  function toggleTag(tag: NoteTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  const canSave = body.trim().length >= 3;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await db.notes.put({
        id,
        clientId: client.id,
        body: body.trim(),
        tags,
        createdAt: new Date().toISOString(),
      });
      // Reload notes for this client
      const notes = await db.notes.where('clientId').equals(client.id).reverse().sortBy('createdAt');
      setNotesForClient(client.id, notes);
      onSave();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '85%' }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__header">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>
            Note · {client.name.split(' ')[0]}
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
                <Chip
                  key={tag}
                  tone={tags.includes(tag) ? 'ink' : 'outline'}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px 0' }}>
          <button
            className="btn btn--accent btn--block btn--lg"
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </div>
    </>
  );
}
