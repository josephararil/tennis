// Main screens: Today, Roster (+ empty + search), Profile, Settings.

const { useState: useS, useEffect: useE, useMemo: useM } = React;

// helper map
const clientsById = Object.fromEntries(CLIENTS.map((c) => [c.id, c]));

// ───────────────────────────────────────────────────────────────────────
//  TODAY — schedule glance
// ───────────────────────────────────────────────────────────────────────
function TodayScreen({ onOpenClient, onTab }) {
  const todays = SCHEDULE.filter((s) => s.day === 'today');
  const tomorrow = SCHEDULE.filter((s) => s.day === 'tomorrow');
  const sat = SCHEDULE.filter((s) => s.day === 'sat');

  return (
    <div className="app">
      <AppBar
        leading={<Icon.Logo size={26} />}
        trailing={<button className="appbar__icon"><Icon.Bell /></button>}
        title=""
      />

      <div className="scroll">
        {/* Editorial header */}
        <div style={{ padding: '6px 20px 18px' }}>
          <div className="eyebrow">{TODAY_LABEL.split(',')[0]}</div>
          <div className="display-l" style={{ marginTop: 6, fontStyle: 'italic' }}>
            Three on court.
          </div>
          <div className="body-2" style={{ marginTop: 10 }}>
            {TODAY_LABEL}. <span style={{ color: 'var(--ink)' }}>Margot finished, Charlotte finished.</span> Daniel at 17:30.
          </div>
        </div>

        {/* Day sections */}
        <DaySection label="Today" hint="2 of 3 done">
          {todays.map((s, i) => (
            <ScheduleRow key={i} slot={s} clientsById={clientsById} onClick={() => onOpenClient(s.clientId)} />
          ))}
        </DaySection>

        <DaySection label="Tomorrow" hint="Thu, May 22">
          {tomorrow.map((s, i) => (
            <ScheduleRow key={i} slot={s} clientsById={clientsById} onClick={() => onOpenClient(s.clientId)} />
          ))}
        </DaySection>

        <DaySection label="Saturday" hint="May 24">
          {sat.map((s, i) => (
            <ScheduleRow key={i} slot={s} clientsById={clientsById} onClick={() => onOpenClient(s.clientId)} />
          ))}
        </DaySection>

        <div style={{ padding: '20px 20px 32px' }}>
          <button className="btn btn--ghost btn--block">
            <Icon.Calendar size={18} /> Open week
          </button>
        </div>
      </div>

      <TabBar active="today" onChange={onTab} />
    </div>
  );
}

function DaySection({ label, hint, children }) {
  return (
    <section>
      <div className="section-head">
        <div className="section-head__title">{label}</div>
        <div className="section-head__count">{hint}</div>
      </div>
      {children}
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  ROSTER — client list
// ───────────────────────────────────────────────────────────────────────
function RosterScreen({ onOpenClient, onAddClient, onTab, initialSearch = '' }) {
  const [query, setQuery] = useS(initialSearch);
  const [filter, setFilter] = useS('all');

  const filtered = useM(() => {
    let xs = CLIENTS;
    if (filter === 'adults') xs = xs.filter((c) => c.archetype.startsWith('Adult'));
    if (filter === 'juniors') xs = xs.filter((c) => c.archetype.startsWith('Junior') || c.archetype.startsWith('Group'));
    if (query) {
      const q = query.toLowerCase();
      xs = xs.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.archetype.toLowerCase().includes(q) ||
        (c.style || '').toLowerCase().includes(q)
      );
    }
    return xs;
  }, [query, filter]);

  return (
    <div className="app">
      <AppBar
        title=""
        leading={<span />}
        trailing={
          <button className="appbar__icon" onClick={onAddClient}>
            <Icon.Plus />
          </button>
        }
      />

      <div className="scroll">
        <div style={{ padding: '6px 20px 18px' }}>
          <div className="eyebrow">Roster</div>
          <div className="display-l" style={{ marginTop: 6 }}>
            <span style={{ fontStyle: 'italic' }}>Players</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-4)', marginLeft: 12, verticalAlign: 'middle' }}>
              {CLIENTS.length}
            </span>
          </div>
        </div>

        <div style={{ padding: '0 20px 14px' }}>
          <SearchBar value={query} onChange={setQuery} placeholder="Search players, style, level" />
        </div>

        <div style={{ padding: '0 20px 18px' }}>
          <Segmented
            items={[
              { id: 'all', label: 'All' },
              { id: 'adults', label: 'Adults' },
              { id: 'juniors', label: 'Juniors & groups' },
            ]}
            active={filter}
            onChange={setFilter}
          />
        </div>

        {filtered.length === 0 ? (
          <RosterEmptyResult query={query} />
        ) : (
          <div>
            {filtered.map((c) => (
              <ClientRow key={c.id} client={c} onClick={() => onOpenClient(c.id)} />
            ))}
          </div>
        )}

        <div style={{ height: 28 }} />
      </div>

      <TabBar active="roster" onChange={onTab} />
    </div>
  );
}

function RosterEmptyResult({ query }) {
  return (
    <div style={{ padding: '48px 32px', textAlign: 'center' }}>
      <div className="eyebrow" style={{ color: 'var(--ink-4)' }}>No matches</div>
      <div className="display-m" style={{ marginTop: 10, fontStyle: 'italic' }}>
        Nobody by “{query}”.
      </div>
      <div className="body-2" style={{ marginTop: 14 }}>Try a different name, level, or style.</div>
    </div>
  );
}

// Empty roster (no clients yet)
function RosterEmptyScreen({ onAddClient, onTab }) {
  return (
    <div className="app">
      <AppBar
        title=""
        leading={<span />}
        trailing={<button className="appbar__icon" onClick={onAddClient}><Icon.Plus /></button>}
      />
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '6px 20px 18px' }}>
          <div className="eyebrow">Roster</div>
          <div className="display-l" style={{ marginTop: 6 }}><span style={{ fontStyle: 'italic' }}>Players</span></div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
          <div style={{ textAlign: 'center', maxWidth: 280 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 32, background: 'var(--surface-2)', color: 'var(--ink-3)', marginBottom: 18 }}>
              <Icon.Users size={28} />
            </div>
            <div className="display-m" style={{ fontStyle: 'italic' }}>No players yet.</div>
            <div className="body-2" style={{ marginTop: 12, marginBottom: 24 }}>
              Add the first player and you can book lessons, log notes, and generate sessions from their profile.
            </div>
            <button className="btn btn--accent btn--lg" onClick={onAddClient}>
              <Icon.Plus size={18} />
              Add first player
            </button>
          </div>
        </div>
      </div>
      <TabBar active="roster" onChange={onTab} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  PROFILE — split metadata / notes / generator entry
// ───────────────────────────────────────────────────────────────────────
function ProfileScreen({ clientId, onBack, onSchedule, onAddNote, onGenerate, onTab }) {
  const c = clientsById[clientId];
  const [tab, setTab] = useS('notes');

  if (!c) return null;

  return (
    <div className="app">
      <AppBar
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Back /></button>}
        trailing={<button className="appbar__icon"><Icon.More /></button>}
        title={c.name}
      />

      <div className="scroll">
        {/* Hero */}
        <div style={{ padding: '12px 20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <Avatar client={c} size={64} />
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <div className="display-m" style={{ letterSpacing: '-0.015em' }}>
                {c.name.split(' ')[0]} <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>{c.name.split(' ').slice(1).join(' ')}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                {c.ntrp != null && <NTRP value={c.ntrp} />}
                {c.ntrp != null && <span style={{ color: 'var(--ink-5)' }}>·</span>}
                <span className="caption" style={{ color: 'var(--ink-3)' }}>{c.archetype}</span>
              </div>
            </div>
          </div>

          {/* Quick action row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            <button className="btn btn--accent" style={{ flex: 2, height: 52 }} onClick={onSchedule}>
              <Icon.Calendar size={18} />
              Book lesson
            </button>
            <button className="btn btn--ghost" style={{ flex: 1, height: 52 }} onClick={onAddNote}>
              <Icon.Note size={18} />
              Note
            </button>
          </div>

          {/* Generator CTA */}
          <button
            onClick={onGenerate}
            style={{
              marginTop: 12,
              width: '100%',
              height: 64,
              borderRadius: 14,
              background: 'var(--ink)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '0 18px',
              textAlign: 'left',
              transition: 'transform .08s ease-out',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = '')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 18, background: 'var(--clay)', color: '#fff' }}>
              <Icon.Sparkle size={18} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic', lineHeight: 1.1 }}>
                Generate today's lesson
              </span>
              <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                60 min · based on the last 4 sessions
              </span>
            </span>
            <Icon.ChevronRight size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tabs__item ${tab === 'notes' ? 'tabs__item--active' : ''}`} onClick={() => setTab('notes')}>
            Notes <span style={{ color: 'var(--ink-4)' }}>· {c.notes.length}</span>
          </button>
          <button className={`tabs__item ${tab === 'details' ? 'tabs__item--active' : ''}`} onClick={() => setTab('details')}>
            Details
          </button>
          <button className={`tabs__item ${tab === 'history' ? 'tabs__item--active' : ''}`} onClick={() => setTab('history')}>
            History
          </button>
        </div>

        {tab === 'notes' && (
          <div>
            <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow">Lesson notes</div>
              <button className="chip chip--outline" onClick={onAddNote} style={{ gap: 4 }}>
                <Icon.Plus size={14} /> Add
              </button>
            </div>
            {c.notes.map((n, i) => (
              <NoteCard key={i} note={n} accent={i === 0} />
            ))}
            <div style={{ padding: '20px 20px 8px', color: 'var(--ink-4)', fontSize: 12, textAlign: 'center' }}>
              End of feed · {c.notes.length} notes
            </div>
          </div>
        )}

        {tab === 'details' && <ProfileDetails client={c} />}

        {tab === 'history' && <ProfileHistory client={c} />}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function ProfileDetails({ client: c }) {
  const rows = [
    { label: 'Phone',         value: c.phone, action: <Icon.Phone size={18} /> },
    { label: 'Age',           value: c.age != null ? `${c.age} years` : '—' },
    { label: 'Cadence',       value: c.cadence },
    { label: 'Handedness',    value: c.handed },
    { label: 'Grip',          value: c.grip },
    { label: 'Gear',          value: c.gear },
    { label: 'Style',         value: c.style },
  ];

  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--line)', gap: 16,
        }}>
          <div className="lab" style={{ flexShrink: 0, width: 92, color: 'var(--ink-4)' }}>{r.label}</div>
          <div style={{ flex: 1, textAlign: 'right', fontSize: 15, color: 'var(--ink)', minWidth: 0 }}>
            <span style={{ textWrap: 'pretty' }}>{r.value}</span>
          </div>
          {r.action && <span style={{ color: 'var(--ink-3)', marginLeft: 8 }}>{r.action}</span>}
        </div>
      ))}

      <div style={{ padding: '20px' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Preferences</div>
        <div style={{
          padding: '18px',
          background: 'var(--surface-2)',
          borderRadius: 12,
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--ink-2)',
          textWrap: 'pretty',
        }}>
          {c.preferences}
        </div>
      </div>

      {c.members && (
        <div style={{ padding: '0 20px 20px' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Members</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {c.members.map((m) => <Chip key={m} tone="outline" size="lg">{m}</Chip>)}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileHistory({ client: c }) {
  return (
    <div style={{ padding: '20px' }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>Recent sessions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {c.notes.slice(0, 5).map((n, i) => (
          <div key={i} style={{
            display: 'flex', gap: 16, padding: '14px 0',
            borderBottom: i < 4 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)',
              letterSpacing: '0.04em', width: 92, flexShrink: 0, paddingTop: 2,
            }}>{n.at.split(' · ')[0]}</div>
            <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)' }}>
              {n.body.length > 80 ? n.body.slice(0, 80) + '…' : n.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  SETTINGS
// ───────────────────────────────────────────────────────────────────────
function SettingsScreen({ onTab, revealKeys = false }) {
  const [reveal, setReveal] = useS(revealKeys);
  const [calOk] = useS(true);

  return (
    <div className="app">
      <AppBar title="" leading={<span />} trailing={<span />} />
      <div className="scroll">
        <div style={{ padding: '6px 20px 22px' }}>
          <div className="eyebrow">Settings</div>
          <div className="display-l" style={{ marginTop: 6, fontStyle: 'italic' }}>Studio</div>
          <div className="body-2" style={{ marginTop: 8 }}>
            Connections, keys, and how the AI plans your sessions.
          </div>
        </div>

        {/* Section: Connections */}
        <SettingSection title="Connections">
          <SettingRow
            leading={<Icon.Calendar />}
            title="Google Calendar"
            sub={calOk ? 'Connected · martina.gledacheva@gmail.com' : 'Not connected'}
            trailing={
              <Chip tone={calOk ? 'outline' : 'clay-soft'} size="sm">
                <Dot tone={calOk ? 'ok' : 'bad'} /> {calOk ? 'OK' : 'Connect'}
              </Chip>
            }
          />
          <SettingRow
            leading={<Icon.Link />}
            title="Club calendar feed"
            sub="St Andrews TC · synced 2 min ago"
            trailing={<Chip tone="outline"><Dot tone="ok" />OK</Chip>}
          />
        </SettingSection>

        {/* Section: AI */}
        <SettingSection title="Lesson AI">
          <div style={{ padding: '14px 20px 20px', borderBottom: '1px solid var(--line)' }}>
            <div className="field__label">LLM API key</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <div className="field__input" style={{
                flex: 1, display: 'flex', alignItems: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: 0,
                color: reveal ? 'var(--ink)' : 'var(--ink-3)',
              }}>
                {reveal ? 'sk-ant-api03-2yL8…hQ9X' : '••••••••••••••••••••••••'}
              </div>
              <button className="btn btn--icon" onClick={() => setReveal(!reveal)} style={{ background: 'var(--surface-2)' }}>
                {reveal ? <Icon.EyeOff size={20} /> : <Icon.Eye size={20} />}
              </button>
              <button className="btn btn--icon" style={{ background: 'var(--surface-2)' }}>
                <Icon.Copy size={20} />
              </button>
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-4)' }}>
              <Dot tone="ok" /> Valid · last call 12 min ago
            </div>
          </div>

          <SettingRow
            leading={<Icon.Sparkle />}
            title="Default session length"
            sub="60 minutes · 4 phases"
            trailing={<Icon.ChevronRight size={18} />}
          />
          <SettingRow
            leading={<Icon.Refresh />}
            title="Re-generate behaviour"
            sub="Ask each time"
            trailing={<Icon.ChevronRight size={18} />}
          />
        </SettingSection>

        {/* Section: Coach */}
        <SettingSection title="Coach">
          <SettingRow
            leading={<Avatar client={{ initials: 'MG', avatarTone: 'ink' }} size={36} />}
            title="Martina Gledacheva"
            sub="Personal practice · St Andrews TC"
            trailing={<Icon.ChevronRight size={18} />}
          />
        </SettingSection>

        <div style={{ padding: '24px 20px 16px', fontSize: 12, color: 'var(--ink-4)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
          v0.4 · build 240521
        </div>
      </div>

      <TabBar active="settings" onChange={onTab} />
    </div>
  );
}

function SettingSection({ title, children }) {
  return (
    <section>
      <div className="section-head">
        <div className="section-head__title" style={{ fontSize: 20 }}>{title}</div>
      </div>
      {children}
    </section>
  );
}

function SettingRow({ leading, title, sub, trailing }) {
  return (
    <button className="row" style={{ width: '100%', textAlign: 'left' }}>
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
        {leading}
      </div>
      <div className="row__body">
        <div className="row__name" style={{ fontSize: 15 }}>{title}</div>
        {sub && <div className="row__meta">{sub}</div>}
      </div>
      <div className="row__tail">{trailing}</div>
    </button>
  );
}

Object.assign(window, {
  TodayScreen, RosterScreen, RosterEmptyScreen, ProfileScreen, SettingsScreen,
  clientsById,
});
