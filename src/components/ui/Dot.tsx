type Tone = 'default' | 'ok' | 'warn' | 'bad';

interface Props { tone?: Tone; }

export function Dot({ tone = 'default' }: Props) {
  const c = tone === 'ok' ? 'dot--ok' : tone === 'warn' ? 'dot--warn' : tone === 'bad' ? 'dot--bad' : '';
  return <span className={`dot ${c}`} />;
}
