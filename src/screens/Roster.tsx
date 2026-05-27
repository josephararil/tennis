import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { AppBar, TabBar, SearchBar, Segmented, ClientRow } from '../components/ui';
import { Icon } from '../components/Icon';
import type { TabName } from '../types';

interface Props {
  onOpenClient: (id: string) => void;
  onAddClient: () => void;
  onTab: (tab: TabName) => void;
}

type Filter = 'all' | 'adults' | 'juniors';

const FILTER_ITEMS = [
  { id: 'all', label: 'All' },
  { id: 'adults', label: 'Adults' },
  { id: 'juniors', label: 'Juniors' },
];

export function RosterScreen({ onOpenClient, onAddClient, onTab }: Props) {
  const { clients } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    let list = clients;
    if (filter === 'adults') list = list.filter((c) => c.archetypeId.startsWith('adult'));
    if (filter === 'juniors') list = list.filter((c) => c.archetypeId === 'junior' || c.archetypeId === 'group');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.archetype.toLowerCase().includes(q) ||
          (c.style ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [clients, search, filter]);

  return (
    <div className="app">
      <AppBar
        title="Roster"
        trailing={
          <button className="appbar__icon" onClick={onAddClient}>
            <Icon.Plus size={22} />
          </button>
        }
      />

      <div style={{ padding: '8px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        <SearchBar value={search} placeholder="Search clients…" onChange={setSearch} />
        <Segmented items={FILTER_ITEMS} active={filter} onChange={(v) => setFilter(v as Filter)} />
      </div>

      <div className="scroll">
        {filtered.length === 0 && search && (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎾</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>No results for "{search}"</div>
            <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>Try a different name or archetype</div>
          </div>
        )}

        {filtered.length === 0 && !search && clients.length === 0 && (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <Icon.Users size={40} />
            <div style={{ marginTop: 16, fontSize: 16, fontWeight: 500 }}>No clients yet</div>
            <div style={{ marginTop: 6, fontSize: 14, color: 'var(--ink-4)' }}>Tap + to add your first client</div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn--accent" onClick={onAddClient}>
                <Icon.Plus size={18} />
                Add client
              </button>
            </div>
          </div>
        )}

        {filtered.map((client) => (
          <ClientRow key={client.id} client={client} onClick={() => onOpenClient(client.id)} />
        ))}

        {filtered.length > 0 && (
          <div style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--ink-5)', fontSize: 12 }}>
            {filtered.length} client{filtered.length !== 1 ? 's' : ''}
          </div>
        )}

        <div className="spacer-lg" />
      </div>

      <TabBar active="roster" onChange={onTab} />
    </div>
  );
}
