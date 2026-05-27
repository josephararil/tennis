interface Item { id: string | number; label: string; }

interface Props {
  items: (Item | string)[];
  active: string | number;
  onChange: (v: string | number) => void;
}

export function Segmented({ items, active, onChange }: Props) {
  return (
    <div className="segmented">
      {items.map((it) => {
        const id = typeof it === 'object' ? it.id : it;
        const label = typeof it === 'object' ? it.label : it;
        return (
          <button
            key={String(id)}
            className={`segmented__item ${active === id ? 'segmented__item--active' : ''}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
