import React from 'react';

interface Props {
  label?: string;
  children: React.ReactNode;
}

export function Field({ label, children }: Props) {
  return (
    <div className="field">
      {label && <div className="field__label">{label}</div>}
      {children}
    </div>
  );
}
