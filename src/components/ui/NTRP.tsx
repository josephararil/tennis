interface Props { value?: number | null; }

export function NTRP({ value }: Props) {
  if (value == null) return null;
  return <span className="ntrp">NTRP&nbsp;<strong>{value.toFixed(1)}</strong></span>;
}
