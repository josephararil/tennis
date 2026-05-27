// App — design canvas composition.
// Each artboard = one screen state. The first is the interactive prototype.

const VW = 390, VH = 844;

// ───── Static-screen wrappers — render a single screen in a fixed state,
// with all interactive callbacks no-op'd so the artboard reads as a
// reference specimen rather than a half-broken prototype.

const noop = () => {};
const danielId = 'daniel-costa';
const charlotteId = 'charlotte-whitfield-hayes';
const eleniId = 'eleni-vasilakos';
const theoId = 'theo-marchetti';
const henleyId = 'henley-juniors';

// ───── Today ─────
const Today = () => <TodayScreen onOpenClient={noop} onTab={noop} />;

// ───── Roster ─────
const Roster = () => (
  <RosterScreen onOpenClient={noop} onAddClient={noop} onTab={noop} />
);
const RosterSearch = () => (
  <RosterScreen onOpenClient={noop} onAddClient={noop} onTab={noop} initialSearch="Margot" />
);
const RosterEmpty = () => <RosterEmptyScreen onAddClient={noop} onTab={noop} />;

// ───── Profile variants ─────
const ProfileAdvanced = () => (
  <ProfileScreen
    clientId={danielId}
    onBack={noop} onSchedule={noop} onAddNote={noop} onGenerate={noop} onTab={noop}
  />
);
const ProfileSocial = () => (
  <ProfileScreen
    clientId={charlotteId}
    onBack={noop} onSchedule={noop} onAddNote={noop} onGenerate={noop} onTab={noop}
  />
);
const ProfileKid = () => (
  <ProfileScreen
    clientId={theoId}
    onBack={noop} onSchedule={noop} onAddNote={noop} onGenerate={noop} onTab={noop}
  />
);
const ProfileGroup = () => (
  <ProfileScreen
    clientId={henleyId}
    onBack={noop} onSchedule={noop} onAddNote={noop} onGenerate={noop} onTab={noop}
  />
);
const ProfileBeginner = () => (
  <ProfileScreen
    clientId={eleniId}
    onBack={noop} onSchedule={noop} onAddNote={noop} onGenerate={noop} onTab={noop}
  />
);

// ───── Add client ─────
const AddClient = () => <AddClientScreen onBack={noop} onSave={noop} />;

// ───── Add note (overlaid on profile) ─────
const AddNote = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <ProfileScreen
      clientId={danielId}
      onBack={noop} onSchedule={noop} onAddNote={noop} onGenerate={noop} onTab={noop}
    />
    <AddNoteSheet client={clientsById[danielId]} onClose={noop} onSave={noop} />
  </div>
);

// ───── Schedule modal ─────
const ScheduleModal = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <ProfileScreen
      clientId={charlotteId}
      onBack={noop} onSchedule={noop} onAddNote={noop} onGenerate={noop} onTab={noop}
    />
    <ScheduleSheet client={clientsById[charlotteId]} onClose={noop} onConfirm={noop} />
  </div>
);

// ───── Schedule confirm ─────
const ScheduleConfirm = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <ProfileScreen
      clientId={charlotteId}
      onBack={noop} onSchedule={noop} onAddNote={noop} onGenerate={noop} onTab={noop}
    />
    <ScheduleConfirmSheet
      client={clientsById[charlotteId]}
      summary={{ time: '11:00 → 12:00', date: 'Mon, May 27', duration: 60 }}
      onDone={noop} onView={noop}
    />
  </div>
);

// ───── Lesson generator ─────
const LessonConfig = () => (
  <LessonConfigScreen client={clientsById[danielId]} onBack={noop} onGenerate={noop} />
);
const LessonLoading = () => (
  <LessonLoadingScreen client={clientsById[danielId]} onBack={noop} />
);
const LessonOutput60Serve = () => (
  <LessonOutputScreen
    client={clientsById[danielId]}
    focus={['serve']}
    duration={60}
    onBack={noop} onSchedule={noop}
  />
);
const LessonOutputFootwork = () => (
  <LessonOutputScreen
    client={clientsById[charlotteId]}
    focus={['footwork', 'tactics']}
    duration={60}
    onBack={noop} onSchedule={noop}
  />
);

// ───── Settings ─────
const Settings = () => <SettingsScreen onTab={noop} />;
const SettingsRevealed = () => <SettingsScreen onTab={noop} revealKeys={true} />;

// ───────────────────────────────────────────────────────────────────────
// App shell
// ───────────────────────────────────────────────────────────────────────

function Frame({ children }) {
  // Every artboard is rendered inside a Frame so screens get the right
  // host dimensions and a clipping container.
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fff',
      overflow: 'hidden',
      position: 'relative',
    }}>{children}</div>
  );
}

function App() {
  return (
    <DesignCanvas minScale={0.15} maxScale={2.5}>

      {/* ───── 1 · Live prototype ───── */}
      <DCSection
        id="live"
        title="Live prototype"
        subtitle="Tap around — bottom tabs, profile, generator, scheduling all wired. Real React state."
      >
        <DCArtboard id="live-phone" label="Interactive · start on Today" width={VW} height={VH}>
          <Frame><InteractivePrototype /></Frame>
        </DCArtboard>
      </DCSection>

      {/* ───── 2 · Today & navigation ───── */}
      <DCSection
        id="today"
        title="Today & navigation"
        subtitle="The home view. Editorial 'glance' header + day sections, mono times, clay marks 'next'."
      >
        <DCArtboard id="today" label="Today · home" width={VW} height={VH}>
          <Frame><Today /></Frame>
        </DCArtboard>
      </DCSection>

      {/* ───── 3 · Roster ───── */}
      <DCSection
        id="roster"
        title="Roster · CRM"
        subtitle="The client database. Search, segment, drill into a profile. Empty state included."
      >
        <DCArtboard id="roster" label="Roster · default" width={VW} height={VH}>
          <Frame><Roster /></Frame>
        </DCArtboard>
        <DCArtboard id="roster-search" label="Roster · searching 'Margot'" width={VW} height={VH}>
          <Frame><RosterSearch /></Frame>
        </DCArtboard>
        <DCArtboard id="roster-empty" label="Roster · empty state" width={VW} height={VH}>
          <Frame><RosterEmpty /></Frame>
        </DCArtboard>
      </DCSection>

      {/* ───── 4 · Profile variants ───── */}
      <DCSection
        id="profile"
        title="Player profile"
        subtitle="Three player archetypes. Header → quick actions → generator CTA → tabbed body."
      >
        <DCArtboard id="profile-advanced" label="Advanced · Daniel" width={VW} height={VH}>
          <Frame><ProfileAdvanced /></Frame>
        </DCArtboard>
        <DCArtboard id="profile-social" label="Social · Charlotte" width={VW} height={VH}>
          <Frame><ProfileSocial /></Frame>
        </DCArtboard>
        <DCArtboard id="profile-beginner" label="Beginner · Eleni" width={VW} height={VH}>
          <Frame><ProfileBeginner /></Frame>
        </DCArtboard>
        <DCArtboard id="profile-kid" label="Junior · Theo (age 5)" width={VW} height={VH}>
          <Frame><ProfileKid /></Frame>
        </DCArtboard>
        <DCArtboard id="profile-group" label="Group · Henley Juniors" width={VW} height={VH}>
          <Frame><ProfileGroup /></Frame>
        </DCArtboard>
      </DCSection>

      {/* ───── 5 · Forms & notes ───── */}
      <DCSection
        id="forms"
        title="Add data"
        subtitle="Add a new player. Add an inline lesson note (sheet over profile, optimised for one-handed use mid-lesson)."
      >
        <DCArtboard id="add-client" label="New player form" width={VW} height={VH}>
          <Frame><AddClient /></Frame>
        </DCArtboard>
        <DCArtboard id="add-note" label="Quick note sheet" width={VW} height={VH}>
          <Frame><AddNote /></Frame>
        </DCArtboard>
      </DCSection>

      {/* ───── 6 · Scheduling ───── */}
      <DCSection
        id="schedule"
        title="One-click scheduling"
        subtitle="From any profile: a sheet with date / time / duration → one tap to book to Google Calendar → success state."
      >
        <DCArtboard id="schedule-modal" label="Schedule sheet" width={VW} height={VH}>
          <Frame><ScheduleModal /></Frame>
        </DCArtboard>
        <DCArtboard id="schedule-confirm" label="Booking confirmed" width={VW} height={VH}>
          <Frame><ScheduleConfirm /></Frame>
        </DCArtboard>
      </DCSection>

      {/* ───── 7 · AI Lesson generator ───── */}
      <DCSection
        id="lesson"
        title="AI lesson generator"
        subtitle="The on-court reference sheet. Config → loading → 4-phase plan. Mono times, large type, glanceable at 6 ft."
      >
        <DCArtboard id="lesson-config" label="Config · pick focus" width={VW} height={VH}>
          <Frame><LessonConfig /></Frame>
        </DCArtboard>
        <DCArtboard id="lesson-loading" label="Generating…" width={VW} height={VH}>
          <Frame><LessonLoading /></Frame>
        </DCArtboard>
        <DCArtboard id="lesson-output-serve" label="Output · 60 min · Serve" width={VW} height={VH}>
          <Frame><LessonOutput60Serve /></Frame>
        </DCArtboard>
        <DCArtboard id="lesson-output-footwork" label="Output · 60 min · Footwork+Tactics" width={VW} height={VH}>
          <Frame><LessonOutputFootwork /></Frame>
        </DCArtboard>
      </DCSection>

      {/* ───── 8 · Settings ───── */}
      <DCSection
        id="settings"
        title="Settings & API"
        subtitle="Calendar connection state and a masked LLM API key. Eye-icon reveals; copy + sync indicators included."
      >
        <DCArtboard id="settings" label="Settings · default" width={VW} height={VH}>
          <Frame><Settings /></Frame>
        </DCArtboard>
        <DCArtboard id="settings-revealed" label="API key revealed" width={VW} height={VH}>
          <Frame><SettingsRevealed /></Frame>
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
