import { useEffect, useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Registrations } from './pages/Registrations';
import { Courses } from './pages/Courses';
import { Achievements } from './pages/Achievements';
import { CenterInfo } from './pages/CenterInfo';
import { Users } from './pages/Users';
import { Broadcast } from './pages/Broadcast';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { MenuIcon } from './components/Icons';

const PAGES = {
  dashboard: Dashboard,
  registrations: Registrations,
  courses: Courses,
  achievements: Achievements,
  centerInfo: CenterInfo,
  users: Users,
  broadcast: Broadcast,
};

const TITLES = {
  dashboard: 'Boshqaruv paneli',
  registrations: 'Arizalar',
  courses: 'Kurslar',
  achievements: 'Yutuqlar',
  centerInfo: "Markaz ma'lumotlari",
  users: 'Foydalanuvchilar',
  broadcast: 'Xabar yuborish',
};

function readHash() {
  const key = window.location.hash.replace('#/', '').replace('#', '');
  return PAGES[key] ? key : 'dashboard';
}

function AppInner() {
  const { isAuthenticated, logout } = useAdmin();
  const [page, setPage] = useState(readHash());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleHashChange() {
      setPage(readHash());
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function navigate(key) {
    window.location.hash = `/${key}`;
    setPage(key);
  }

  if (!isAuthenticated) return <Login />;

  const PageComponent = PAGES[page] || Dashboard;

  return (
    <div className="admin-shell">
      <div className="mobile-topbar">
        <button
          type="button"
          className="icon-btn"
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff' }}
          onClick={() => setMobileOpen(true)}
          aria-label="Menyu"
        >
          <MenuIcon width={18} height={18} />
        </button>
        <strong>{TITLES[page]}</strong>
        <div style={{ width: 34 }} />
      </div>

      <Sidebar active={page} onNavigate={navigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={logout} />

      <main className="main-area">
        <PageComponent />
      </main>

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <AppInner />
    </AdminProvider>
  );
}
