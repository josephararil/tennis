import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, children }: Props) {
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        {children}
      </div>
    </>
  );
}
