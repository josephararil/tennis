import { Icon } from '../Icon';

interface Props {
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ value = '', placeholder = 'Search', onChange = () => {}, autoFocus }: Props) {
  return (
    <label className="search">
      <Icon.Search size={18} />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
      {value && (
        <button onClick={() => onChange('')} style={{ color: 'var(--ink-4)' }}>
          <Icon.Close size={16} />
        </button>
      )}
    </label>
  );
}
