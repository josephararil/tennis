// Shared UI primitives for the Martina app.
// Pure presentational — no app state.

const { useState, useEffect, useRef, useMemo } = React;

// ─── Avatar ────────────────────────────────────────────────────────────
function Avatar({ client, size = 44 }) {
  const tone = client.avatarTone || 'default';
  const cls =
    tone === 'clay' ? 'row__avatar row__avatar--clay' :
    tone === 'ink'  ? 'row__avatar row__avatar--ink' :
    'row__avatar';
  return (
    <div className={cls} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {client.initials}
    </div>
  );
}

// ─── App bar (top) ─────────────────────────────────────────────────────
function AppBar({ title, leading, trailing, transparent }) {
  return (
    <header className="appbar" style={transparent ? { background: 'transparent' } : null}>
      <div className={`appbar__icon ${leading ? '' : 'appbar__icon--placeholder'}`}>
        {leading || <Icon.Back />}
      </div>
      <div className="appbar__title">{title}</div>
      <div className={`appbar__icon ${trailing ? '' : 'appbar__icon--placeholder'}`}>
        {trailing}
      </div>
    </header>
  );
}

// ─── Tab bar (bottom) ──────────────────────────────────────────────────
function TabBar({ active = 'today', onChange = () => {} }) {
  const items = [
    { id: 'today',    label: 'Today',    Icon: Icon.Calendar },
    { id: 'roster',   label: 'Roster',   Icon: Icon.Users },
    { id: 'settings', label: 'Settings', Icon: Icon.Settings },
  ];
  return (
    <nav className="tabbar">
      {items.map(({ id, label, Icon: It }) => (
        <button
          key={id}
          className={`tabbar__item ${active === id ? 'tabbar__item--active' : ''}`}
          onClick={() => onChange(id)}
        >
          <It size={22} />
          <span className="tabbar__label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Chips ─────────────────────────────────────────────────────────────
function Chip({ children, tone = 'default', size = 'sm' }) {
  const cls = [
    'chip',
    tone === 'ink' && 'chip--ink',
    tone === 'clay' && 'chip--clay',
    tone === 'clay-soft' && 'chip--clay-soft',
    tone === 'outline' && 'chip--outline',
    size === 'lg' && 'chip--lg',
  ].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}

function NTRP({ value }) {
  if (value == null) return null;
  return <span className="ntrp">NTRP&nbsp;<strong>{value.toFixed(1)}</strong></span>;
}

// ─── Status dot ────────────────────────────────────────────────────────
function Dot({ tone = 'default' }) {
  const c = tone === 'ok' ? 'dot--ok' : tone === 'warn' ? 'dot--warn' : tone === 'bad' ? 'dot--bad' : '';
  return <span className={`dot ${c}`} />;
}

// ─── Search bar ────────────────────────────────────────────────────────
function SearchBar({ value = '', placeholder = 'Search', onChange = () => {}, autoFocus }) {
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

// ─── Segmented control ─────────────────────────────────────────────────
function Segmented({ items, active, onChange }) {
  return (
    <div className="segmented">
      {items.map((it) => (
        <button
          key={it.id || it}
          className={`segmented__item ${active === (it.id || it) ? 'segmented__item--active' : ''}`}
          onClick={() => onChange(it.id || it)}
        >
          {it.label || it}
        </button>
      ))}
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="field">
      {label && <div className="field__label">{label}</div>}
      {children}
    </div>
  );
}

// ─── Sheet (bottom sheet) ──────────────────────────────────────────────
function Sheet({ open, onClose, children }) {
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

// ─── Date chip / time chip ─────────────────────────────────────────────
function PickerChip({ label, value, sub, selected, onClick }) {
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
        <div style={{
          fontSize: 10,
          letterSpacing: 0.12 + 'em',
          textTransform: 'uppercase',
          opacity: selected ? 0.72 : 0.55,
          fontWeight: 500,
        }}>{label}</div>
      )}
      <div style={{ fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, opacity: selected ? 0.7 : 0.5 }}>{sub}</div>}
    </button>
  );
}

// ─── Schedule row (used on Today and after booking) ────────────────────
function ScheduleRow({ slot, clientsById, onClick }) {
  const c = clientsById[slot.clientId];
  if (!c) return null;
  const isDone = slot.status === 'done';
  const isUpcoming = slot.status === 'upcoming';

  return (
    <button onClick={onClick} style={{
      width: '100%',
      display: 'flex',
      alignItems: 'stretch',
      gap: 14,
      padding: '14px 20px',
      borderBottom: '1px solid var(--line)',
      textAlign: 'left',
      background: 'transparent',
      transition: 'background .12s',
    }}>
      <div style={{
        width: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        paddingTop: 2,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: 0,
          color: isDone ? 'var(--ink-4)' : 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
        }}>{slot.start}</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ink-4)',
          fontVariantNumeric: 'tabular-nums',
        }}>{slot.duration} min</div>
      </div>

      <div style={{
        width: 2,
        background: isUpcoming ? 'var(--clay)' : isDone ? 'var(--line-2)' : 'var(--ink)',
        borderRadius: 2,
        marginTop: 4,
        marginBottom: 4,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16,
          fontWeight: 500,
          color: isDone ? 'var(--ink-3)' : 'var(--ink)',
          letterSpacing: -0.01 + 'em',
          textDecoration: isDone ? 'line-through' : 'none',
          textDecorationColor: 'var(--ink-5)',
        }}>{c.name}</div>
        <div style={{
          fontSize: 13,
          color: 'var(--ink-4)',
          marginTop: 3,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}>
          <span>{c.archetype}</span>
          <span>·</span>
          <span>{slot.court}</span>
        </div>
      </div>

      {isUpcoming && (
        <div style={{ alignSelf: 'center', color: 'var(--clay)' }}>
          <Chip tone="clay-soft">Next</Chip>
        </div>
      )}
    </button>
  );
}

// ─── Client row (list) ─────────────────────────────────────────────────
function ClientRow({ client, onClick }) {
  return (
    <button className="row" style={{ width: '100%', textAlign: 'left' }} onClick={onClick}>
      <Avatar client={client} />
      <div className="row__body">
        <div className="row__name">
          {client.name}
        </div>
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

// ─── Note card (used on profile feed) ──────────────────────────────────
function NoteCard({ note, accent }) {
  return (
    <article style={{
      padding: '16px 20px',
      borderTop: '1px solid var(--line)',
      background: accent ? 'var(--clay-tint)' : 'transparent',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: accent ? 'var(--clay-deep)' : 'var(--ink-4)',
        marginBottom: 8,
      }}>{note.at}</div>
      <div style={{
        fontSize: 15,
        lineHeight: 1.55,
        color: 'var(--ink)',
        textWrap: 'pretty',
      }}>{note.body}</div>
    </article>
  );
}

// ─── Loading spinner ───────────────────────────────────────────────────
function Spinner({ size = 24, color = 'currentColor' }) {
  return (
    <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

Object.assign(window, {
  Avatar, AppBar, TabBar, Chip, NTRP, Dot, SearchBar, Segmented,
  Field, Sheet, PickerChip, ScheduleRow, ClientRow, NoteCard, Spinner,
});
