interface Props {
  size?: number;
  color?: string;
}

export function Spinner({ size = 24, color = 'currentColor' }: Props) {
  return (
    <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
