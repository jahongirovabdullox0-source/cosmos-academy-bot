import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { initials, formatMoney } from '../utils/format';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { tg } from '../utils/telegram';

const LANGS = [
  { code: 'uz', label: "🇺🇿 O'zbekcha" },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ru', label: '🇷🇺 Русский' },
];

const STATUS_CLASS = {
  NEW: 'badge-new',
  CONTACTED: 'badge-contacted',
  CONFIRMED: 'badge-confirmed',
  CANCELLED: 'badge-cancelled',
};

export function Profile() {
  const { t, user, language, changeLanguage, centerInfo } = useApp();
  const langCap = language.charAt(0).toUpperCase() + language.slice(1);
  const [registrations, setRegistrations] = useState(null);

  useEffect(() => {
    api
      .getMyRegistrations()
      .then(setRegistrations)
      .catch(() => setRegistrations([]));
  }, []);

  return (
    <div>
      <h1 className="page-heading">{t('profile.title')}</h1>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="avatar">{initials(user?.firstName, user?.lastName)}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {user?.firstName} {user?.lastName}
          </div>
          {user?.username && <div className="muted" style={{ fontSize: 13 }}>@{user.username}</div>}
        </div>
      </div>

      <div className="section-title">{t('profile.language')}</div>
      <div className="lang-list">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            className={`lang-option ${language === l.code ? 'lang-option--active' : ''}`}
            onClick={() => {
              tg.haptic('light');
              changeLanguage(l.code);
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="section-title">{t('profile.myRegistrations')}</div>
      {registrations === null && <Skeleton height={70} />}
      {registrations && registrations.length === 0 && <EmptyState icon="📝" title={t('profile.noRegistrations')} />}
      {registrations &&
        registrations.map((r) => (
          <div className="card" key={r.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{r.course?.[`title${langCap}`]}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                  {formatMoney(r.course?.price)} {t('common.somUnit')}
                </div>
              </div>
              <span className={`badge ${STATUS_CLASS[r.status] || 'badge-new'}`}>{t(`profile.status${r.status}`)}</span>
            </div>
          </div>
        ))}

      {centerInfo && (
        <>
          <div className="section-title">{t('profile.about')}</div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ca-text-muted)' }}>
              {centerInfo[`about${langCap}`]}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
