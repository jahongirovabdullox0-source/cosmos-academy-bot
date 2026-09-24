import { GridIcon, ListIcon, BookIcon, TrophyIcon, InfoIcon, UsersIcon, MegaphoneIcon, LogOutIcon } from './Icons';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Boshqaruv paneli', Icon: GridIcon },
  { key: 'registrations', label: 'Arizalar', Icon: ListIcon },
  { key: 'courses', label: 'Kurslar', Icon: BookIcon },
  { key: 'achievements', label: 'Yutuqlar', Icon: TrophyIcon },
  { key: 'centerInfo', label: "Markaz ma'lumotlari", Icon: InfoIcon },
  { key: 'users', label: 'Foydalanuvchilar', Icon: UsersIcon },
  { key: 'broadcast', label: 'Xabar yuborish', Icon: MegaphoneIcon },
];

export function Sidebar({ active, onNavigate, mobileOpen, onClose, onLogout }) {
  return (
    <>
      {mobileOpen && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <img src="/logo.jpg" alt="" className="sidebar__logo" />
          <div>
            <div className="sidebar__brand-name">Cosmos Academy</div>
            <div className="sidebar__brand-sub">Admin panel</div>
          </div>
        </div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              className={`sidebar__link ${active === key ? 'sidebar__link--active' : ''}`}
              onClick={() => {
                onNavigate(key);
                if (onClose) onClose();
              }}
            >
              <Icon width={18} height={18} />
              {label}
            </button>
          ))}
        </nav>
        <button type="button" className="sidebar__logout" onClick={onLogout}>
          <LogOutIcon width={18} height={18} />
          Chiqish
        </button>
      </aside>
    </>
  );
}
