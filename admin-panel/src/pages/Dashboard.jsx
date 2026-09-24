import { useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { StatTile } from '../components/StatTile';
import { BarChart } from '../components/BarChart';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [live, setLive] = useState(true);

  async function load() {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    if (!live) return undefined;
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [live]);

  if (error && !stats) {
    return (
      <div className="card">
        <p className="muted">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stat-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 90 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__title">Boshqaruv paneli</div>
          <div className="page-header__subtitle">Cosmos Academy — umumiy ko'rsatkichlar</div>
        </div>
      </div>

      <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ca-text-muted)' }}>
          <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
          Jonli yangilanish (10 sek)
        </label>
      </div>

      <div className="stat-grid">
        <StatTile label="Jami foydalanuvchilar" value={stats.users.total} hint={`+${stats.users.today} bugun`} />
        <StatTile label="Jami arizalar" value={stats.registrations.total} hint={`+${stats.registrations.today} bugun`} />
        <StatTile label="Yangi arizalar" value={stats.registrations.byStatus.NEW} />
        <StatTile label="Tasdiqlangan arizalar" value={stats.registrations.byStatus.CONFIRMED} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Oxirgi 7 kunlik arizalar</div>
          <BarChart data={stats.registrations.daily} />
        </div>
        <div className="card">
          <div className="card-title">Kurslar bo'yicha arizalar</div>
          {stats.registrations.byCourse.length === 0 && (
            <p className="muted" style={{ fontSize: 13 }}>
              Hozircha ariza yo'q
            </p>
          )}
          {stats.registrations.byCourse.map((row) => (
            <div
              key={row.courseId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: '1px solid var(--ca-border)',
                fontSize: 13.5,
              }}
            >
              <span>{row.title}</span>
              <strong>{row.count}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
