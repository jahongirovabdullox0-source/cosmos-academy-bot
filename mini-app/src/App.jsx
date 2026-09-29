import { useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { Results } from './pages/Results';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';
import { CourseDetailSheet } from './pages/CourseDetailSheet';
import { RegisterSheet } from './pages/RegisterSheet';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { AlertIcon } from './components/Icons';
import { MOCK_CODE } from './utils/localize';

const TABS = ['home', 'courses', 'results', 'profile', 'contact'];

// Bot tugmalari Mini App'ni "#/results" kabi manzil bilan ochadi; Telegram esa oxiriga
// "?tgWebAppData=..." qo'shadi — shuning uchun faqat yo'l qismini olamiz.
function readDeepLink() {
  const path = window.location.hash.replace(/^#/, '').split(/[?&]/)[0];
  return path.startsWith('/') ? path.slice(1) : '';
}

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

function LoadingScreen() {
  const { t } = useApp();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-shell">
      <div className="app-content">
        <div className="skeleton" style={{ height: 190, marginBottom: 16, borderRadius: 22 }} />
        <div className="skeleton" style={{ height: 84, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 84, marginBottom: 12 }} />
        {slow && <p className="waking-hint">⏳ {t('common.wakingServer')}</p>}
      </div>
    </div>
  );
}

function AppInner() {
  const { loading, error, reload, t, courses } = useApp();
  const deepLink = readDeepLink();
  const [onboarded, setOnboarded] = useState(readOnboarded());
  const [activeTab, setActiveTab] = useState(TABS.includes(deepLink) ? deepLink : 'home');
  const [openCourse, setOpenCourse] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(deepLink === 'register');
  const [pendingMock, setPendingMock] = useState(deepLink === 'mock');
  const closeCourse = useCallback(() => setOpenCourse(null), []);
  const closeRegister = useCallback(() => setRegisterOpen(false), []);
  const openRegister = useCallback(() => setRegisterOpen(true), []);
  const goHome = useCallback(() => setActiveTab('home'), []);

  useEffect(() => {
    if (!pendingMock || courses.length === 0) return;
    const mock = courses.find((c) => c.code === MOCK_CODE);
    if (mock) setOpenCourse(mock);
    setPendingMock(false);
  }, [pendingMock, courses]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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

  if (loading) return <LoadingScreen />;

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
        return <Courses onOpenCourse={setOpenCourse} onRegister={openRegister} />;
      case 'results':
        return <Results />;
      case 'profile':
        return <Profile />;
      case 'contact':
        return <Contact onBack={goHome} />;
      default:
        return <Home onNavigate={setActiveTab} onRegister={openRegister} onOpenCourse={setOpenCourse} />;
    }
  }

  const navTab = ['home', 'courses', 'results', 'profile'].includes(activeTab) ? activeTab : 'home';

  return (
    <div className="app-shell">
      <div className="app-content" key={activeTab}>
        {renderTab()}
      </div>
      <BottomNav activeTab={navTab} onChange={setActiveTab} />
      {openCourse && <CourseDetailSheet course={openCourse} onClose={closeCourse} />}
      {registerOpen && <RegisterSheet onClose={closeRegister} />}
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
