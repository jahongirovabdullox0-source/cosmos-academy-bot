import { useApp } from '../context/AppContext';
import { BookIcon, TrophyIcon, PhoneIcon } from '../components/Icons';
import { formatMoney } from '../utils/format';
import { lf, lplain, MOCK_CODE } from '../utils/localize';
import { tg } from '../utils/telegram';

export function Home({ onNavigate, onRegister, onOpenCourse }) {
  const { t, user, centerInfo, achievements, courses, language } = useApp();
  const name = user?.firstName ? user.firstName.split(' ')[0] : '';
  const mock = courses.find((c) => c.code === MOCK_CODE);
  const stats = achievements.filter((a) => !a.imageUrl).slice(0, 4);

  function go(tab) {
    tg.haptic('light');
    onNavigate(tab);
  }

  return (
    <div>
      <div className="hero-card">
        <div className="hero-card__head">
          <img src="/logo.jpg" alt="" className="hero-card__logo" />
          <div className="hero-card__eyebrow">Cosmos Academy</div>
        </div>
        <div className="hero-card__title">{t('home.greeting', { name })}</div>
        <p className="hero-card__text">{t('home.tagline')}</p>
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => {
            tg.haptic('medium');
            onRegister();
          }}
        >
          ✍️ {t('home.registerCta')}
        </button>
      </div>

      <div className="quick-grid">
        <button type="button" className="quick-item" onClick={() => go('courses')}>
          <span className="quick-item__icon">
            <BookIcon width={20} height={20} />
          </span>
          {t('nav.courses')}
        </button>
        <button type="button" className="quick-item" onClick={() => go('results')}>
          <span className="quick-item__icon quick-item__icon--gold">
            <TrophyIcon width={20} height={20} />
          </span>
          {t('nav.results')}
        </button>
        <button type="button" className="quick-item" onClick={() => go('contact')}>
          <span className="quick-item__icon quick-item__icon--green">
            <PhoneIcon width={20} height={20} />
          </span>
          {t('home.contactCta')}
        </button>
      </div>

      {mock && (
        <button
          type="button"
          className="mock-banner"
          onClick={() => {
            tg.haptic('light');
            onOpenCourse(mock);
          }}
        >
          <div className="mock-banner__body">
            <span className="mock-banner__eyebrow">📝 {t('home.mockEyebrow')}</span>
            <div className="mock-banner__title">{t('home.mockTitle')}</div>
            <div className="mock-banner__meta">
              <span className="chip chip--navy">🗓 {lplain(mock, 'duration', language)}</span>
              <span className="chip chip--white">
                {formatMoney(mock.price)} {t('common.somUnit')}
              </span>
            </div>
          </div>
          <span className="mock-banner__cta">{t('home.mockCta')} →</span>
        </button>
      )}

      {stats.length > 0 && (
        <>
          <div className="section-title">
            {t('home.resultsCta')}
            <button type="button" className="section-title__link" onClick={() => go('results')}>
              →
            </button>
          </div>
          <div className="stat-grid">
            {stats.map((a) => (
              <div className="stat-card" key={a.id}>
                <div className="stat-card__value">{a.value}</div>
                <div className="stat-card__label">{lf(a, 'title', language)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {centerInfo && (
        <>
          <div className="section-title">{t('home.aboutTitle')}</div>
          <div className="card card--accent">
            <p className="about-text">{lf(centerInfo, 'about', language)}</p>
          </div>
        </>
      )}
    </div>
  );
}
