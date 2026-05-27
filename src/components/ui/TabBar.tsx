import React from 'react';
import { Icon } from '../Icon';

type Tab = 'today' | 'roster' | 'settings';

interface Props {
  active?: Tab;
  onChange?: (tab: Tab) => void;
}

export function TabBar({ active = 'today', onChange = () => {} }: Props) {
  const items: { id: Tab; label: string; Ic: React.ComponentType<{ size?: number }> }[] = [
    { id: 'today', label: 'Today', Ic: Icon.Calendar },
    { id: 'roster', label: 'Roster', Ic: Icon.Users },
    { id: 'settings', label: 'Settings', Ic: Icon.Settings },
  ];
  return (
    <nav className="tabbar">
      {items.map(({ id, label, Ic }) => (
        <button key={id} className={`tabbar__item ${active === id ? 'tabbar__item--active' : ''}`} onClick={() => onChange(id)}>
          <Ic size={22} />
          <span className="tabbar__label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
