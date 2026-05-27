import type { Client } from '../../types';

interface Props { client: Pick<Client, 'initials' | 'avatarTone'>; size?: number; }

export function Avatar({ client, size = 44 }: Props) {
  const tone = client.avatarTone || 'default';
  const cls = tone === 'clay' ? 'row__avatar row__avatar--clay' : tone === 'ink' ? 'row__avatar row__avatar--ink' : 'row__avatar';
  return <div className={cls} style={{ width: size, height: size, fontSize: size * 0.42 }}>{client.initials}</div>;
}
