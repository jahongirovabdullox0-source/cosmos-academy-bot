import { HomeIcon, BookIcon, TrophyIcon, UserIcon } from './Icons';
import { useApp } from '../context/AppContext';
import { tg } from '../utils/telegram';

const TABS = [
  { key: 'home', Icon: HomeIcon, labelKey: 'nav.home' },
  { key: 'courses', Icon: BookIcon, labelKey: 'nav.courses' },
  { key: 'results', Icon: TrophyIcon, labelKey: 'nav.results' },
  { key: 'profile', Icon: UserIcon, labelKey: 'nav.profile' },
];

export function BottomNav({ activeTab, onChange }) {
  const { t } = useApp();
  return (
    <nav className="bottom-nav">
      {TABS.map(({ key, Icon, labelKey }) => (
        <button
          key={key}
          type="button"
          className={`bottom-nav__item ${activeTab === key ? 'bottom-nav__item--active' : ''}`}
          onClick={() => {
            tg.haptic('light');
            onChange(key);
          }}
        >
          <Icon />
          <span>{t(labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
