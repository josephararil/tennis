interface Props {
  label?: string;
  value: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}

export function PickerChip({ label, value, sub, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        minHeight: 56,
        padding: '10px 12px',
        borderRadius: 12,
        background: selected ? 'var(--ink)' : 'var(--surface-2)',
        color: selected ? '#fff' : 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        transition: 'background .12s, color .12s',
      }}
    >
      {label && (
        <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: selected ? 0.72 : 0.55, fontWeight: 500 }}>
          {label}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, opacity: selected ? 0.7 : 0.5 }}>{sub}</div>}
    </button>
  );
}
