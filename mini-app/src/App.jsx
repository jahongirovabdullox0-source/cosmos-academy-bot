import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { Results } from './pages/Results';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { AlertIcon } from './components/Icons';

function readOnboarded() {
  try {
    return localStorage.getItem('ca_onboarded') === 'true';
  } catch {
    return false;
  }
}

function writeOnboarded() {
  try {
    localStorage.setItem('ca_onboarded', 'true');
  } catch {
    // localStorage mavjud bo'lmasa e'tiborsiz qoldiramiz
  }
}

function AppInner() {
  const { loading, error, reload, t } = useApp();
  const [onboarded, setOnboarded] = useState(readOnboarded());
  const [activeTab, setActiveTab] = useState('home');

  if (!onboarded) {
    return (
      <Onboarding
        onFinish={() => {
          writeOnboarded();
          setOnboarded(true);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-content">
          <div className="skeleton" style={{ height: 160, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 80, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 80, marginBottom: 12 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="app-content center-text" style={{ paddingTop: 80 }}>
          <AlertIcon width={40} height={40} style={{ color: 'var(--ca-danger)', margin: '0 auto 12px' }} />
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={reload}>
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  function renderTab() {
    switch (activeTab) {
      case 'courses':
        return <Courses />;
      case 'results':
        return <Results />;
      case 'profile':
        return <Profile />;
      case 'contact':
        return <Contact onBack={() => setActiveTab('home')} />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  }

  const navTab = ['home', 'courses', 'results', 'profile'].includes(activeTab) ? activeTab : 'home';

  return (
    <div className="app-shell">
      <div className="app-content">{renderTab()}</div>
      <BottomNav activeTab={navTab} onChange={setActiveTab} />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
