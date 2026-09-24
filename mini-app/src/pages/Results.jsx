import { useApp } from '../context/AppContext';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

export function Results() {
  const { t, achievements, loading, language } = useApp();
  const langCap = language.charAt(0).toUpperCase() + language.slice(1);
  const withDescription = achievements.filter((a) => a[`description${langCap}`]);

  return (
    <div>
      <h1 className="page-heading">{t('results.title')}</h1>

      {loading && (
        <div className="stat-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={90} />
          ))}
        </div>
      )}

      {!loading && achievements.length === 0 && <EmptyState icon="🏆" title={t('results.empty')} />}

      {!loading && achievements.length > 0 && (
        <div className="stat-grid">
          {achievements.map((a) => (
            <div className="stat-card" key={a.id}>
              {a.value && <div className="stat-card__value">{a.value}</div>}
              <div className="stat-card__label">{a[`title${langCap}`]}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && withDescription.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {withDescription.map((a) => (
            <div className="card mt-16" key={`desc-${a.id}`}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {a.value} {a[`title${langCap}`]}
              </div>
              <p className="muted" style={{ fontSize: 13.5, margin: 0, lineHeight: 1.55 }}>
                {a[`description${langCap}`]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
