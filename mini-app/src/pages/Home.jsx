import { useApp } from '../context/AppContext';
import { BookIcon, TrophyIcon, PhoneIcon } from '../components/Icons';
import { tg } from '../utils/telegram';

export function Home({ onNavigate }) {
  const { t, user, centerInfo, achievements, language } = useApp();
  const langCap = language.charAt(0).toUpperCase() + language.slice(1);
  const name = user?.firstName || '';

  function go(tab) {
    tg.haptic('light');
    onNavigate(tab);
  }

  return (
    <div>
      <div className="hero-card">
        <div className="hero-card__eyebrow">Cosmos Academy</div>
        <div className="hero-card__title">{t('home.greeting', { name })}</div>
        <p className="hero-card__text">{t('home.tagline')}</p>
        <button type="button" className="btn btn-gold" onClick={() => go('courses')}>
          {t('home.coursesCta')}
        </button>
      </div>

      <div className="quick-grid">
        <button type="button" className="quick-item" onClick={() => go('courses')}>
          <span className="quick-item__icon">
            <BookIcon width={19} height={19} />
          </span>
          {t('nav.courses')}
        </button>
        <button type="button" className="quick-item" onClick={() => go('results')}>
          <span className="quick-item__icon">
            <TrophyIcon width={19} height={19} />
          </span>
          {t('nav.results')}
        </button>
        <button type="button" className="quick-item" onClick={() => go('contact')}>
          <span className="quick-item__icon">
            <PhoneIcon width={19} height={19} />
          </span>
          {t('home.contactCta')}
        </button>
      </div>

      {achievements.length > 0 && (
        <>
          <div className="section-title">
            {t('home.resultsCta')}
            <button type="button" className="section-title__link" onClick={() => go('results')}>
              →
            </button>
          </div>
          <div className="stat-grid">
            {achievements.slice(0, 4).map((a) => (
              <div className="stat-card" key={a.id}>
                <div className="stat-card__value">{a.value}</div>
                <div className="stat-card__label">{a[`title${langCap}`]}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {centerInfo && (
        <>
          <div className="section-title">{t('home.aboutTitle')}</div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--ca-text-muted)' }}>
              {centerInfo[`about${langCap}`]}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
