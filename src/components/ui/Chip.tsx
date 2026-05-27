import React from 'react';

type Tone = 'default' | 'ink' | 'clay' | 'clay-soft' | 'outline';

interface Props {
  children: React.ReactNode;
  tone?: Tone;
  size?: 'sm' | 'lg';
  onClick?: () => void;
}

export function Chip({ children, tone = 'default', size = 'sm', onClick }: Props) {
  const cls = [
    'chip',
    tone === 'ink' && 'chip--ink',
    tone === 'clay' && 'chip--clay',
    tone === 'clay-soft' && 'chip--clay-soft',
    tone === 'outline' && 'chip--outline',
    size === 'lg' && 'chip--lg',
  ].filter(Boolean).join(' ');

  return onClick
    ? <button className={cls} onClick={onClick}>{children}</button>
    : <span className={cls}>{children}</span>;
}
