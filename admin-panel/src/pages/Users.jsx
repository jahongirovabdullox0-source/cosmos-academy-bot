import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { useAdmin } from '../context/AdminContext';
import { Pagination } from '../components/Pagination';
import { SearchIcon } from '../components/Icons';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric' });
}

const LANG_LABEL = { uz: "O'zbek", en: 'English', ru: 'Русский' };

export function Users() {
  const { showToast } = useAdmin();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({ page, pageSize, search });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleToggleBlock(user) {
    try {
      await adminApi.setUserBlocked(user.id, !user.isBlocked);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__title">Foydalanuvchilar</div>
          <div className="page-header__subtitle">Botdan foydalanayotgan barcha odamlar</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-input" style={{ position: 'relative' }}>
          <input
            className="input"
            style={{ width: '100%', paddingLeft: 36 }}
            placeholder="Ism, username yoki telefon bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchIcon width={16} height={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--ca-text-muted)' }} />
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="skeleton" style={{ height: 300, margin: 16 }} />
        ) : items.length === 0 ? (
          <div className="table-empty">Hech kim topilmadi</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ism</th>
                <th>Username</th>
                <th>Telefon</th>
                <th>Til</th>
                <th>Arizalar</th>
                <th>Ro'yxatdan o'tgan</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="muted">{u.username ? `@${u.username}` : '—'}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{LANG_LABEL[u.language] || u.language}</td>
                  <td>{u._count?.registrations ?? 0}</td>
                  <td className="muted">{formatDate(u.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${u.isBlocked ? 'badge-cancelled' : 'badge-active'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => handleToggleBlock(u)}
                    >
                      {u.isBlocked ? 'Bloklangan' : 'Faol'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && items.length > 0 && <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />}
      </div>
    </div>
  );
}
