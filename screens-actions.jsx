// Action screens: Add client, Add note, Schedule (modal+confirm), Lesson (config/loading/output).

const { useState: useSA, useEffect: useEA, useMemo: useMA, useRef: useRA } = React;

// ───────────────────────────────────────────────────────────────────────
//  ADD CLIENT — full-page form
// ───────────────────────────────────────────────────────────────────────
function AddClientScreen({ onBack, onSave }) {
  const [name, setName] = useSA('');
  const [phone, setPhone] = useSA('');
  const [archetype, setArchetype] = useSA('adult');
  const [ntrp, setNtrp] = useSA(null);

  return (
    <div className="app">
      <AppBar
        title="New player"
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Close /></button>}
        trailing={
          <button
            className="appbar__icon"
            onClick={onSave}
            style={{ color: name ? 'var(--clay)' : 'var(--ink-5)', fontWeight: 500, fontSize: 14, width: 'auto', padding: '0 12px' }}
          >
            Save
          </button>
        }
      />

      <div className="scroll" style={{ padding: '8px 20px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Field label="Name">
            <input
              className="field__input"
              autoFocus
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Phone">
            <input
              className="field__input"
              type="tel"
              placeholder="+44 7700 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field label="Who are they">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { id: 'adult-beg', label: 'Adult · Beginner' },
                { id: 'adult-int', label: 'Adult · Intermediate' },
                { id: 'adult-adv', label: 'Adult · Advanced' },
                { id: 'junior', label: 'Junior' },
                { id: 'group', label: 'Group' },
                { id: 'other', label: 'Other' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setArchetype(o.id)}
                  style={{
                    height: 52,
                    borderRadius: 10,
                    background: archetype === o.id ? 'var(--ink)' : 'var(--surface-2)',
                    color: archetype === o.id ? '#fff' : 'var(--ink)',
                    fontSize: 14, fontWeight: 500,
                    transition: 'background .12s, color .12s',
                  }}
                >{o.label}</button>
              ))}
            </div>
          </Field>

          <Field label="NTRP level (optional)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[null, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5].map((v, i) => (
                <button
                  key={i}
                  onClick={() => setNtrp(v)}
                  style={{
                    minWidth: 56, height: 40, padding: '0 14px', borderRadius: 999,
                    background: ntrp === v ? 'var(--clay)' : 'var(--surface-2)',
                    color: ntrp === v ? '#fff' : 'var(--ink-2)',
                    fontFamily: v == null ? 'var(--font-body)' : 'var(--font-mono)',
                    fontSize: 13, fontWeight: 500, letterSpacing: 0,
                  }}
                >{v == null ? 'N/A' : v.toFixed(1)}</button>
              ))}
            </div>
          </Field>

          <Field label="Preferences & notes">
            <textarea
              className="field__input"
              rows={4}
              placeholder="Anything I should remember — gear, scheduling quirks, goals, parent contact…"
            />
          </Field>

          <button
            className="btn btn--accent btn--lg btn--block"
            disabled={!name}
            style={!name ? { background: 'var(--surface-3)', color: 'var(--ink-5)' } : null}
            onClick={onSave}
          >
            <Icon.Plus size={18} /> Add to roster
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  ADD NOTE — bottom sheet (overlaid on profile)
// ───────────────────────────────────────────────────────────────────────
function AddNoteSheet({ client, onClose, onSave }) {
  const [body, setBody] = useSA('');
  return (
    <Sheet open onClose={onClose}>
      <div className="sheet__header">
        <div>
          <div className="eyebrow">During lesson</div>
          <div className="display-s" style={{ marginTop: 4, fontStyle: 'italic' }}>
            Quick note · {client.name.split(' ')[0]}
          </div>
        </div>
        <button className="appbar__icon" onClick={onClose}>
          <Icon.Close />
        </button>
      </div>

      <div style={{ padding: '4px 20px 14px' }}>
        <textarea
          className="field__input"
          autoFocus
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What happened. What to remember. One sentence is fine."
          style={{ fontSize: 16, lineHeight: 1.5 }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {['Forehand', 'Backhand', 'Serve', 'Footwork', 'Tactics', 'Mental'].map((t) => (
            <button key={t} className="chip chip--outline">{t}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn btn--ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary"
            style={{ flex: 2 }}
            disabled={!body.trim()}
            onClick={onSave}
          >
            <Icon.Check size={18} /> Save note
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: 'var(--ink-4)', fontSize: 12 }}>
          <Icon.Clock size={13} /> Timestamped {new Date().toLocaleString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })} · now
        </div>
      </div>
    </Sheet>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  SCHEDULE LESSON — bottom sheet (one-click feel)
// ───────────────────────────────────────────────────────────────────────
function ScheduleSheet({ client, onClose, onConfirm, initialDate = 1, initialTime = '17:30', initialDuration = 60 }) {
  const [dateIdx, setDate] = useSA(initialDate); // 0 = today
  const [time, setTime] = useSA(initialTime);
  const [duration, setDuration] = useSA(initialDuration);

  const days = [
    { label: 'Today', day: 'Wed', date: '21', month: 'May' },
    { label: 'Tom.',  day: 'Thu', date: '22', month: 'May' },
    { label: 'Fri',   day: 'Fri', date: '23', month: 'May' },
    { label: 'Sat',   day: 'Sat', date: '24', month: 'May' },
    { label: 'Sun',   day: 'Sun', date: '25', month: 'May' },
    { label: 'Mon',   day: 'Mon', date: '26', month: 'May' },
    { label: 'Tue',   day: 'Tue', date: '27', month: 'May' },
  ];

  const times = ['07:30', '08:00', '11:00', '13:00', '15:30', '17:30', '19:00'];
  const durations = [45, 60, 90, 120];

  return (
    <Sheet open onClose={onClose}>
      <div className="sheet__header">
        <div>
          <div className="eyebrow">Book lesson</div>
          <div className="display-s" style={{ marginTop: 4 }}>
            With <span style={{ fontStyle: 'italic' }}>{client.name.split(' ')[0]}</span>
          </div>
        </div>
        <button className="appbar__icon" onClick={onClose}>
          <Icon.Close />
        </button>
      </div>

      <div style={{ padding: '4px 20px 14px', overflowY: 'auto' }}>
        {/* Date scroller */}
        <div className="field__label" style={{ marginBottom: 10 }}>Date</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginLeft: -2, marginRight: -2, paddingLeft: 2, paddingRight: 2 }}>
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => setDate(i)}
              style={{
                flexShrink: 0,
                minWidth: 56, padding: '10px 6px', borderRadius: 12,
                background: dateIdx === i ? 'var(--ink)' : 'var(--surface-2)',
                color: dateIdx === i ? '#fff' : 'var(--ink)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                transition: 'background .12s, color .12s',
              }}
            >
              <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d.day}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, marginTop: 2 }}>{d.date}</div>
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{d.month}</div>
            </button>
          ))}
        </div>

        {/* Time */}
        <div className="field__label" style={{ marginTop: 22, marginBottom: 10 }}>Start time</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {times.map((t) => (
            <button
              key={t}
              onClick={() => setTime(t)}
              style={{
                height: 48,
                borderRadius: 10,
                background: time === t ? 'var(--ink)' : 'var(--surface-2)',
                color: time === t ? '#fff' : 'var(--ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: 15, fontWeight: 500, letterSpacing: 0,
                fontVariantNumeric: 'tabular-nums',
              }}
            >{t}</button>
          ))}
        </div>

        {/* Duration */}
        <div className="field__label" style={{ marginTop: 22, marginBottom: 10 }}>Duration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              style={{
                height: 56,
                borderRadius: 10,
                background: duration === d ? 'var(--ink)' : 'var(--surface-2)',
                color: duration === d ? '#fff' : 'var(--ink)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500 }}>{d}</div>
              <div style={{ fontSize: 10, opacity: 0.6 }}>min</div>
            </button>
          ))}
        </div>

        {/* Summary line */}
        <div style={{
          marginTop: 22, padding: '14px 16px',
          borderRadius: 12, background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon.Clock size={20} />
          <div style={{ flex: 1, fontSize: 14 }}>
            <span style={{ color: 'var(--ink-3)' }}>{days[dateIdx].day}, {days[dateIdx].month} {days[dateIdx].date}</span>
            <span style={{ color: 'var(--ink-3)' }}> · </span>
            <span className="mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>{time}</span>
            <span style={{ color: 'var(--ink-3)' }}> → </span>
            <span className="mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>{addMin(time, duration)}</span>
          </div>
        </div>

        <button
          className="btn btn--accent btn--lg btn--block"
          style={{ marginTop: 16 }}
          onClick={onConfirm}
        >
          <Icon.Calendar size={18} /> Book to Google Calendar
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-4)', marginTop: 10 }}>
          One tap. Invite sent to <span className="mono">{client.name.split(' ')[0].toLowerCase()}@…</span>
        </div>
      </div>
    </Sheet>
  );
}

function addMin(t, m) {
  const [h, mm] = t.split(':').map(Number);
  const total = h * 60 + mm + m;
  const H = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const M = String(total % 60).padStart(2, '0');
  return `${H}:${M}`;
}

// ───────────────────────────────────────────────────────────────────────
//  SCHEDULE CONFIRM — success state (after book click)
// ───────────────────────────────────────────────────────────────────────
function ScheduleConfirmSheet({ client, summary, onDone, onView }) {
  return (
    <Sheet open onClose={onDone}>
      <div style={{ padding: '12px 28px 28px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 32,
          background: 'var(--clay-tint)', color: 'var(--clay-deep)',
          margin: '8px auto 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon.Check size={32} stroke={2} />
        </div>
        <div className="eyebrow" style={{ color: 'var(--clay-deep)' }}>Booked</div>
        <div className="display-m" style={{ marginTop: 8, fontStyle: 'italic' }}>
          You're on the books with {client.name.split(' ')[0]}.
        </div>

        <div style={{
          marginTop: 22,
          padding: '18px',
          background: 'var(--surface-2)',
          borderRadius: 14,
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar client={client} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{client.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{client.archetype}</div>
            </div>
          </div>
          <div style={{
            marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)',
            display: 'flex', alignItems: 'baseline', gap: 12,
          }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)' }}>
              {summary.time}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              {summary.date} · {summary.duration} min
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.Calendar size={14} /> Synced to Google Calendar · invite sent
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button className="btn btn--ghost" style={{ flex: 1 }} onClick={onView}>
            View in calendar
          </button>
          <button className="btn btn--primary" style={{ flex: 1 }} onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  LESSON GENERATOR — config screen
// ───────────────────────────────────────────────────────────────────────
function LessonConfigScreen({ client, onBack, onGenerate }) {
  const [focus, setFocus] = useSA(['forehand']);
  const [intensity, setIntensity] = useSA('moderate');
  const [duration, setDuration] = useSA(60);

  const toggle = (f) => setFocus(focus.includes(f)
    ? focus.filter((x) => x !== f)
    : [...focus.filter((x) => x !== 'general'), f]);

  return (
    <div className="app">
      <AppBar
        title="Generate lesson"
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Back /></button>}
      />

      <div className="scroll" style={{ padding: '6px 20px 28px' }}>
        <div className="eyebrow">For</div>
        <div className="display-l" style={{ marginTop: 4, fontStyle: 'italic' }}>
          {client.name.split(' ')[0]}'s plan
        </div>
        <div className="body-2" style={{ marginTop: 10, marginBottom: 26 }}>
          The AI will draw on the last 4 sessions, {client.archetype.toLowerCase()}, and {client.style ? `their ${client.style.toLowerCase()} style` : 'their profile'}.
        </div>

        <Field label="Focus today">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { id: 'forehand', label: 'Forehand' },
              { id: 'backhand', label: 'Backhand' },
              { id: 'serve', label: 'Serve' },
              { id: 'footwork', label: 'Footwork' },
              { id: 'fitness', label: 'Fitness' },
              { id: 'tactics', label: 'Tactics' },
            ].map((o) => {
              const on = focus.includes(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => toggle(o.id)}
                  style={{
                    height: 52, borderRadius: 10,
                    background: on ? 'var(--ink)' : 'var(--surface-2)',
                    color: on ? '#fff' : 'var(--ink)',
                    fontSize: 14, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {on && <Icon.Check size={16} />}
                  {o.label}
                </button>
              );
            })}
          </div>
        </Field>

        <div style={{ height: 22 }} />

        <Field label="Session length">
          <Segmented
            items={[
              { id: 30, label: '30 min' },
              { id: 60, label: '60 min' },
              { id: 90, label: '90 min' },
            ]}
            active={duration}
            onChange={setDuration}
          />
        </Field>

        <div style={{ height: 22 }} />

        <Field label="Intensity">
          <Segmented
            items={[
              { id: 'easy', label: 'Easy' },
              { id: 'moderate', label: 'Moderate' },
              { id: 'hard', label: 'Hard' },
            ]}
            active={intensity}
            onChange={setIntensity}
          />
        </Field>

        <div style={{ height: 22 }} />

        <Field label="Free-form notes (optional)">
          <textarea
            className="field__input"
            rows={3}
            placeholder="e.g. Indoor court today. Daniel's hip slightly sore — avoid heavy lateral."
          />
        </Field>

        <button
          className="btn btn--accent btn--lg btn--block"
          style={{ marginTop: 26 }}
          onClick={() => onGenerate({ focus, duration, intensity })}
        >
          <Icon.Sparkle size={18} /> Generate {duration}-min plan
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  LESSON LOADING — streaming-ish state
// ───────────────────────────────────────────────────────────────────────
function LessonLoadingScreen({ client, onBack }) {
  const [step, setStep] = useSA(0);
  const steps = [
    'Reading the last 4 sessions',
    'Checking grip & gear notes',
    'Composing warm-up',
    'Building drills',
    'Finishing flourish',
  ];
  useEA(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="app">
      <AppBar
        title=""
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Close /></button>}
      />
      <div className="scroll" style={{ padding: '8px 20px 32px', display: 'flex', flexDirection: 'column' }}>
        <div className="eyebrow">Composing</div>
        <div className="display-l" style={{ marginTop: 4, fontStyle: 'italic' }}>
          A plan for {client.name.split(' ')[0]}…
        </div>

        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < step ? 'var(--ink)' : i === step ? 'var(--clay-tint)' : 'var(--surface-2)',
                color: i < step ? '#fff' : i === step ? 'var(--clay-deep)' : 'var(--ink-5)',
              }}>
                {i < step ? <Icon.Check size={14} stroke={2.2} /> : i === step ? <Spinner size={14} /> : (
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: 'currentColor' }} />
                )}
              </div>
              <div style={{
                fontSize: 15,
                color: i <= step ? 'var(--ink)' : 'var(--ink-4)',
                fontWeight: i === step ? 500 : 400,
              }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 36 }}>
          <div className="shimmer" style={{ height: 78, marginBottom: 10 }} />
          <div className="shimmer" style={{ height: 78, marginBottom: 10 }} />
          <div className="shimmer" style={{ height: 78, marginBottom: 10, opacity: 0.6 }} />
          <div className="shimmer" style={{ height: 78, opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  LESSON OUTPUT — 4-phase plan
// ───────────────────────────────────────────────────────────────────────
function LessonOutputScreen({ client, focus = ['forehand'], duration = 60, onBack, onSchedule }) {
  // pick the first focus from DRILLS_FALLBACK, fall back to forehand
  const lib = DRILLS_FALLBACK[focus[0]] || DRILLS_FALLBACK.forehand;
  const split = duration === 30 ? [5, 10, 10, 5]
              : duration === 90 ? [15, 30, 30, 15]
              : [10, 20, 20, 10]; // 60

  const phases = [
    { tag: '1 · Warm-up',         min: split[0], drill: lib.warmup,    accent: 'var(--surface-2)', ink: 'var(--ink)' },
    { tag: '2 · Technical drill', min: split[1], drill: lib.technical, accent: 'var(--ink)',       ink: '#fff' },
    { tag: '3 · Tactical drill',  min: split[2], drill: lib.tactical,  accent: 'var(--clay)',      ink: '#fff' },
    { tag: '4 · Finish',          min: split[3], drill: lib.finish,    accent: 'var(--surface-2)', ink: 'var(--ink)' },
  ];

  const focusLabel = focus.map(capitalize).join(' · ');

  return (
    <div className="app">
      <AppBar
        title=""
        leading={<button className="appbar__icon" onClick={onBack}><Icon.Back /></button>}
        trailing={<button className="appbar__icon"><Icon.Refresh /></button>}
      />

      <div className="scroll" style={{ paddingBottom: 24 }}>
        {/* Heading */}
        <div style={{ padding: '6px 20px 18px' }}>
          <div className="eyebrow">{focusLabel} · {duration} min</div>
          <div className="display-l" style={{ marginTop: 6, fontStyle: 'italic' }}>
            {client.name.split(' ')[0]}'s lesson
          </div>
          <div className="body-2" style={{ marginTop: 10, textWrap: 'pretty' }}>
            Carries forward from Tuesday: kick-serve target work, and the inside-out forehand pattern that finally clicked.
          </div>
        </div>

        {/* Phase strip — visual map of the hour */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
            {phases.map((p, i) => (
              <div key={i} style={{ flex: p.min, background: p.accent, opacity: p.accent === 'var(--surface-2)' ? 1 : 1 }} />
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: 6, gap: 2 }}>
            {phases.map((p, i) => (
              <div key={i} style={{
                flex: p.min, fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--ink-4)', textAlign: 'center',
              }}>{p.min}m</div>
            ))}
          </div>
        </div>

        {/* Phase cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 20px 8px' }}>
          {phases.map((p, i) => (
            <PhaseCard key={i} phase={p} />
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn--ghost" style={{ flex: 1 }}>
              <Icon.Send size={16} /> Send to player
            </button>
            <button className="btn btn--ghost" style={{ flex: 1 }} onClick={onSchedule}>
              <Icon.Calendar size={16} /> Book slot
            </button>
          </div>
          <button className="btn btn--primary btn--block">
            <Icon.Check size={18} /> Save to {client.name.split(' ')[0]}'s history
          </button>
        </div>

        <div style={{ padding: '8px 20px 0', fontSize: 11, color: 'var(--ink-4)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
          generated · {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function PhaseCard({ phase }) {
  const onDark = phase.ink === '#fff';
  return (
    <article style={{
      background: phase.accent,
      color: phase.ink,
      borderRadius: 16,
      padding: '18px 18px 16px',
      border: phase.accent === 'var(--surface-2)' ? '1px solid var(--line)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <div className="eyebrow" style={{ color: onDark ? 'rgba(255,255,255,0.7)' : 'var(--ink-4)' }}>
          {phase.tag}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500,
          color: onDark ? '#fff' : 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
        }}>{phase.min} min</div>
      </div>

      <div style={{
        marginTop: 10,
        fontFamily: 'var(--font-display)',
        fontSize: 22, lineHeight: 1.15, letterSpacing: '-0.005em',
        color: phase.ink, fontStyle: 'italic',
      }}>
        {phase.drill.name}
      </div>

      <div style={{
        marginTop: 8, fontSize: 14, lineHeight: 1.5,
        color: onDark ? 'rgba(255,255,255,0.78)' : 'var(--ink-3)',
        textWrap: 'pretty',
      }}>
        {phase.drill.desc}
      </div>
    </article>
  );
}

Object.assign(window, {
  AddClientScreen, AddNoteSheet, ScheduleSheet, ScheduleConfirmSheet,
  LessonConfigScreen, LessonLoadingScreen, LessonOutputScreen,
});
