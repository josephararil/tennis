// InteractivePrototype — the live, navigable phone artboard.
// Tabs, profile open/close, schedule modal, add-note, generator flow,
// all real navigation with React state.

const { useState: useSP, useMemo: useMP, useEffect: useEP } = React;

function InteractivePrototype() {
  // route: { name, params }
  const [route, setRoute] = useSP({ name: 'today' });
  const [tab, setTab] = useSP('today');
  const [sheet, setSheet] = useSP(null); // 'schedule' | 'note' | 'confirm'
  const [confirmSummary, setConfirmSummary] = useSP(null);
  const [genConfig, setGenConfig] = useSP(null);

  const go = (name, params = {}) => setRoute({ name, params });
  const openClient = (id) => { setTab('roster'); go('profile', { id }); };

  // tab switches go to that tab's root, except 'roster' which behaves
  // like a real bottom tab.
  const onTab = (next) => {
    setTab(next);
    setSheet(null);
    if (next === 'today') go('today');
    if (next === 'roster') go('roster');
    if (next === 'settings') go('settings');
  };

  const client = route.params?.id ? clientsById[route.params.id] : null;

  let screen;
  switch (route.name) {
    case 'today':
      screen = <TodayScreen onOpenClient={openClient} onTab={onTab} />;
      break;

    case 'roster':
      screen = (
        <RosterScreen
          onOpenClient={openClient}
          onAddClient={() => go('addClient')}
          onTab={onTab}
        />
      );
      break;

    case 'profile':
      screen = (
        <ProfileScreen
          clientId={route.params.id}
          onBack={() => go('roster')}
          onSchedule={() => setSheet('schedule')}
          onAddNote={() => setSheet('note')}
          onGenerate={() => go('lessonConfig', { id: route.params.id })}
          onTab={onTab}
        />
      );
      break;

    case 'addClient':
      screen = <AddClientScreen onBack={() => go('roster')} onSave={() => go('roster')} />;
      break;

    case 'lessonConfig':
      screen = (
        <LessonConfigScreen
          client={clientsById[route.params.id]}
          onBack={() => go('profile', { id: route.params.id })}
          onGenerate={(cfg) => { setGenConfig(cfg); go('lessonLoading', { id: route.params.id }); }}
        />
      );
      break;

    case 'lessonLoading':
      screen = (
        <LessonLoadingScreen
          client={clientsById[route.params.id]}
          onBack={() => go('profile', { id: route.params.id })}
        />
      );
      // auto-advance to output
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEP(() => {
        const t = setTimeout(() => go('lessonOutput', { id: route.params.id }), 3600);
        return () => clearTimeout(t);
      }, [route.name]);
      break;

    case 'lessonOutput':
      screen = (
        <LessonOutputScreen
          client={clientsById[route.params.id]}
          focus={genConfig?.focus || ['forehand']}
          duration={genConfig?.duration || 60}
          onBack={() => go('profile', { id: route.params.id })}
          onSchedule={() => setSheet('schedule')}
        />
      );
      break;

    case 'settings':
      screen = <SettingsScreen onTab={onTab} />;
      break;

    default:
      screen = <TodayScreen onOpenClient={openClient} onTab={onTab} />;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {screen}

      {sheet === 'schedule' && client && (
        <ScheduleSheet
          client={client}
          onClose={() => setSheet(null)}
          onConfirm={() => {
            setConfirmSummary({
              time: '17:30 → 18:30',
              date: 'Thu, May 22',
              duration: 60,
            });
            setSheet('confirm');
          }}
        />
      )}

      {sheet === 'note' && client && (
        <AddNoteSheet
          client={client}
          onClose={() => setSheet(null)}
          onSave={() => setSheet(null)}
        />
      )}

      {sheet === 'confirm' && client && confirmSummary && (
        <ScheduleConfirmSheet
          client={client}
          summary={confirmSummary}
          onDone={() => setSheet(null)}
          onView={() => setSheet(null)}
        />
      )}
    </div>
  );
}

window.InteractivePrototype = InteractivePrototype;
