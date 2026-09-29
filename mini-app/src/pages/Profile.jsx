import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { initials, formatMoney } from '../utils/format';
import { lf } from '../utils/localize';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { tg } from '../utils/telegram';

const LANGS = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbekcha" },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
];

const STATUS_CLASS = {
  NEW: 'badge-new',
  CONTACTED: 'badge-contacted',
  CONFIRMED: 'badge-confirmed',
  CANCELLED: 'badge-cancelled',
};

export function Profile() {
  const { t, user, language, changeLanguage, centerInfo } = useApp();
  const [registrations, setRegistrations] = useState(null);

  useEffect(() => {
    api
      .getMyRegistrations()
      .then(setRegistrations)
      .catch(() => setRegistrations([]));
  }, []);

  return (
    <div>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')}>
        <div className="profile-card">
          <div className="avatar">{initials(user?.firstName, user?.lastName)}</div>
          <div className="profile-card__text">
            <div className="profile-card__name">
              {user?.firstName} {user?.lastName}
            </div>
            {user?.username && <div className="profile-card__username">@{user.username}</div>}
          </div>
        </div>
      </PageHeader>

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
            <span className="lang-option__flag">{l.flag}</span>
            <span className="lang-option__label">{l.label}</span>
            {language === l.code && <span className="lang-option__check">✓</span>}
          </button>
        ))}
      </div>

      <div className="section-title">{t('profile.myRegistrations')}</div>
      {registrations === null && <Skeleton height={70} />}
      {registrations && registrations.length === 0 && <EmptyState icon="📝" title={t('profile.noRegistrations')} />}
      {registrations &&
        registrations.map((r) => (
          <div className="registration-card" key={r.id}>
            <div className="registration-card__icon">{r.course?.icon}</div>
            <div className="registration-card__body">
              <div className="registration-card__title">{lf(r.course, 'title', language)}</div>
              <div className="registration-card__meta">
                {formatMoney(r.course?.price)} {t('common.somUnit')}
              </div>
            </div>
            <span className={`badge ${STATUS_CLASS[r.status] || 'badge-new'}`}>{t(`profile.status${r.status}`)}</span>
          </div>
        ))}

      {centerInfo && (
        <>
          <div className="section-title">{t('profile.about')}</div>
          <div className="card card--accent">
            <p className="about-text">{lf(centerInfo, 'about', language)}</p>
          </div>
        </>
      )}
    </div>
  );
}
