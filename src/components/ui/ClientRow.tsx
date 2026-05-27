import type { Client } from '../../types';
import { Avatar } from './Avatar';
import { NTRP } from './NTRP';
import { Icon } from '../Icon';

interface Props {
  client: Client;
  onClick: () => void;
}

export function ClientRow({ client, onClick }: Props) {
  return (
    <button className="row" style={{ width: '100%', textAlign: 'left' }} onClick={onClick}>
      <Avatar client={client} />
      <div className="row__body">
        <div className="row__name">{client.name}</div>
        <div className="row__meta">
          <span>{client.archetype}</span>
          {client.style && <><span>·</span><span>{client.style}</span></>}
        </div>
      </div>
      <div className="row__tail">
        {client.ntrp != null && <NTRP value={client.ntrp} />}
        <Icon.ChevronRight size={18} />
      </div>
    </button>
  );
}
