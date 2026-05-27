import React from 'react';
import { Icon } from '../Icon';

interface Props {
  title?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  transparent?: boolean;
}

export function AppBar({ title = '', leading, trailing, transparent }: Props) {
  return (
    <header className="appbar" style={transparent ? { background: 'transparent' } : undefined}>
      <div className={`appbar__icon ${leading ? '' : 'appbar__icon--placeholder'}`}>{leading || <Icon.Back />}</div>
      <div className="appbar__title">{title}</div>
      <div className={`appbar__icon ${trailing ? '' : 'appbar__icon--placeholder'}`}>{trailing}</div>
    </header>
  );
}
