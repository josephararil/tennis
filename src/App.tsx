import { useState, useEffect } from 'react';
import type { Route, TabName, SheetName, ConfirmSummary } from './types';
import { useStore } from './store';
import { db, seedIfEmpty } from './services/db';
import { TodayScreen } from './screens/Today';
import { RosterScreen } from './screens/Roster';
import { ProfileScreen } from './screens/Profile';
import { SettingsScreen } from './screens/Settings';
import { AddClientScreen } from './screens/AddClient';
import { LessonConfigScreen } from './screens/lesson/LessonConfig';
import { LessonLoadingScreen } from './screens/lesson/LessonLoading';
import { LessonOutputScreen } from './screens/lesson/LessonOutput';
import { AddNoteSheet } from './sheets/AddNoteSheet';
import { ScheduleSheet } from './sheets/ScheduleSheet';
import { ScheduleConfirmSheet } from './sheets/ScheduleConfirmSheet';

export function App() {
  const [route, setRoute] = useState<Route>({ name: 'today', params: {} });
  const [tab, setTab] = useState<TabName>('today');
  const [sheet, setSheet] = useState<SheetName>(null);
  const [confirmSummary, setConfirmSummary] = useState<ConfirmSummary | null>(null);
  const { clients, clientsById, setClients, settings, setSettings } = useStore();

  useEffect(() => {
    seedIfEmpty().then(() => loadData());
  }, []);

  async function loadData() {
    const [allClients, s] = await Promise.all([
      db.clients.orderBy('updatedAt').reverse().toArray(),
      db.settings.get('singleton'),
    ]);
    setClients(allClients);
    if (s) setSettings(s);
  }

  const go = (name: Route['name'], params: Record<string, string> = {}) =>
    setRoute({ name, params });

  const openClient = (id: string) => {
    setTab('roster');
    go('profile', { id });
  };

  const onTab = (next: TabName) => {
    setTab(next);
    setSheet(null);
    if (next === 'today') go('today');
    else if (next === 'roster') go('roster');
    else go('settings');
  };

  const client = route.params?.id ? clientsById[route.params.id] : null;

  let screen: React.ReactNode;
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
      screen = client ? (
        <ProfileScreen
          clientId={route.params.id}
          onBack={() => go('roster')}
          onSchedule={() => setSheet('schedule')}
          onAddNote={() => setSheet('note')}
          onGenerate={() => go('lessonConfig', { id: route.params.id })}
          onTab={onTab}
        />
      ) : <div className="app" />;
      break;

    case 'addClient':
      screen = (
        <AddClientScreen
          onBack={() => go('roster')}
          onSave={async () => {
            await loadData();
            go('roster');
          }}
        />
      );
      break;

    case 'lessonConfig':
      screen = client ? (
        <LessonConfigScreen
          client={client}
          onBack={() => go('profile', { id: route.params.id })}
          onGenerate={() => {
            go('lessonLoading', { id: route.params.id });
          }}
        />
      ) : null;
      break;

    case 'lessonLoading':
      screen = client ? (
        <LessonLoadingScreen
          client={client}
          onBack={() => go('profile', { id: route.params.id })}
          onDone={() => go('lessonOutput', { id: route.params.id })}
        />
      ) : null;
      break;

    case 'lessonOutput':
      screen = client ? (
        <LessonOutputScreen
          client={client}
          onBack={() => go('profile', { id: route.params.id })}
          onSchedule={() => setSheet('schedule')}
          onSaved={() => loadData()}
        />
      ) : null;
      break;

    case 'settings':
      screen = <SettingsScreen onTab={onTab} onSettingsChanged={loadData} />;
      break;

    default:
      screen = <TodayScreen onOpenClient={openClient} onTab={onTab} />;
  }

  // Suppress unused vars warnings
  void clients;
  void tab;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ position: 'relative', width: 'var(--vw)', height: 'var(--vh)' }}>
        {screen}

        {sheet === 'schedule' && client && (
          <ScheduleSheet
            client={client}
            onClose={() => setSheet(null)}
            onConfirm={(summary) => {
              setConfirmSummary(summary);
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
            onView={() => {
              if (confirmSummary.htmlLink) window.open(confirmSummary.htmlLink, '_blank');
              setSheet(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
