import { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { Lightbox } from '../components/Lightbox';
import { resolveAssetUrl } from '../api/client';
import { lf } from '../utils/localize';
import { tg } from '../utils/telegram';

export function Results() {
  const { t, achievements, loading, language } = useApp();
  const [viewing, setViewing] = useState(null);
  const closeViewer = useCallback(() => setViewing(null), []);
  const stats = achievements.filter((a) => !a.imageUrl);
  const certificates = achievements.filter((a) => a.imageUrl);
  const withDescription = stats.filter((a) => lf(a, 'description', language));

  return (
    <div>
      <PageHeader title={t('results.title')} subtitle={t('results.subtitle')} />

      {loading && (
        <div className="stat-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={90} />
          ))}
        </div>
      )}

      {!loading && achievements.length === 0 && <EmptyState icon="🏆" title={t('results.empty')} />}

      {!loading && stats.length > 0 && (
        <>
          <div className="section-title">{t('results.statsTitle')}</div>
          <div className="stat-grid">
            {stats.map((a) => (
              <div className="stat-card" key={a.id}>
                {a.value && <div className="stat-card__value">{a.value}</div>}
                <div className="stat-card__label">{lf(a, 'title', language)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && certificates.length > 0 && (
        <>
          <div className="section-title">🎓 {t('results.certificatesTitle')}</div>
          <div className="certificate-grid">
            {certificates.map((a) => {
              const title = lf(a, 'title', language);
              const src = resolveAssetUrl(a.imageUrl);
              return (
                <button
                  key={a.id}
                  type="button"
                  className="certificate-card"
                  onClick={() => {
                    tg.haptic('light');
                    setViewing({ src, caption: [a.value, title].filter(Boolean).join(' — ') });
                  }}
                >
                  <img className="certificate-card__image" src={src} alt={title} loading="lazy" />
                  <div className="certificate-card__body">
                    {a.value && <span className="chip chip--gold">{a.value}</span>}
                    <div className="certificate-card__title">{title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {!loading &&
        withDescription.map((a) => (
          <div className="card card--accent mt-16" key={`desc-${a.id}`}>
            <div className="detail-card__title">
              <span className="detail-card__value">{a.value}</span> {lf(a, 'title', language)}
            </div>
            <p className="muted detail-card__text">{lf(a, 'description', language)}</p>
          </div>
        ))}

      {viewing && <Lightbox src={viewing.src} caption={viewing.caption} onClose={closeViewer} />}
    </div>
  );
}
