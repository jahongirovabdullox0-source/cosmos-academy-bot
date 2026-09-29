import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { useAdmin } from '../context/AdminContext';
import { Pagination } from '../components/Pagination';
import { Modal, ConfirmDialog } from '../components/Modal';
import { EditIcon, TrashIcon, DownloadIcon, SearchIcon, CloseIcon } from '../components/Icons';
import { formatPhone, formatDay, formatDateTime } from '../utils/format';

const STATUS_OPTIONS = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'NEW', label: 'Yangi' },
  { value: 'CONTACTED', label: "Bog'lanildi" },
  { value: 'CONFIRMED', label: 'Tasdiqlandi' },
  { value: 'CANCELLED', label: 'Bekor qilindi' },
];

export function Registrations() {
  const { showToast } = useAdmin();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getRegistrations({ page, pageSize, search, status, courseId, date });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, courseId, date, showToast]);

  // "Bugun" va "Kecha" tugmalaridagi sonlar — tanlangan kurs va holat bo'yicha.
  const loadSummary = useCallback(async () => {
    try {
      setSummary(await adminApi.getRegistrationSummary({ status, courseId }));
    } catch {
      setSummary(null);
    }
  }, [status, courseId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    adminApi
      .getCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, status, courseId, date]);

  function refresh() {
    load();
    loadSummary();
  }

  async function handleQuickStatus(id, newStatus) {
    try {
      await adminApi.updateRegistration(id, { status: newStatus });
      showToast('Holat yangilandi');
      refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleSaveEdit(data) {
    try {
      await adminApi.updateRegistration(editing.id, data);
      showToast('Saqlandi');
      setEditing(null);
      refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete() {
    try {
      await adminApi.deleteRegistration(deleting.id);
      showToast("O'chirildi");
      setDeleting(null);
      refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleExport() {
    try {
      const res = await fetch(adminApi.registrationsExportUrl({ search, status, courseId, date }), {
        headers: { Authorization: `Bearer ${adminApi.getToken()}` },
      });
      if (!res.ok) throw new Error('Eksport qilishda xatolik');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = date ? `arizalar-${formatDay(date)}.xlsx` : 'arizalar.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const today = summary?.today;
  const yesterday = summary?.yesterday;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__title">Arizalar</div>
          <div className="page-header__subtitle">Kursga yozilganlar ro'yxati</div>
        </div>
        <button type="button" className="btn btn-outline" onClick={handleExport}>
          <DownloadIcon width={16} height={16} /> Excel yuklab olish
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input" style={{ position: 'relative' }}>
          <input
            className="input"
            style={{ width: '100%', paddingLeft: 36 }}
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchIcon width={16} height={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--ca-text-muted)' }} />
        </div>
        <select className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Barcha kurslar</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.titleUz}
            </option>
          ))}
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="date-filter">
          <input
            type="date"
            className="select"
            value={date}
            max={today?.date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Kun bo'yicha"
          />
          {date && (
            <button type="button" className="icon-btn" onClick={() => setDate('')} aria-label="Kunni tozalash">
              <CloseIcon width={14} height={14} />
            </button>
          )}
        </div>
      </div>

      <div className="day-chips">
        <button type="button" className={`day-chip ${!date ? 'day-chip--active' : ''}`} onClick={() => setDate('')}>
          Barcha kunlar
        </button>
        {today && (
          <button
            type="button"
            className={`day-chip ${date === today.date ? 'day-chip--active' : ''}`}
            onClick={() => setDate(today.date)}
          >
            Bugun · {formatDay(today.date)}
            <span className="day-chip__count">{today.count} ta</span>
          </button>
        )}
        {yesterday && (
          <button
            type="button"
            className={`day-chip ${date === yesterday.date ? 'day-chip--active' : ''}`}
            onClick={() => setDate(yesterday.date)}
          >
            Kecha · {formatDay(yesterday.date)}
            <span className="day-chip__count">{yesterday.count} ta</span>
          </button>
        )}
      </div>

      {date && !loading && (
        <div className="filter-summary">
          📅 {formatDay(date)} kuni: <strong>{total} ta ariza</strong>
        </div>
      )}

      <div className="table-wrap">
        {loading ? (
          <div className="skeleton" style={{ height: 300, margin: 16 }} />
        ) : items.length === 0 ? (
          <div className="table-empty">Hech narsa topilmadi</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Kurs</th>
                <th>Holat</th>
                <th>Sana</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                    {r.user?.username && (
                      <a className="subtle-link" href={`https://t.me/${r.user.username}`} target="_blank" rel="noreferrer">
                        @{r.user.username}
                      </a>
                    )}
                  </td>
                  <td>
                    <a className="phone-link" href={`tel:${r.phone}`}>
                      {formatPhone(r.phone)}
                    </a>
                  </td>
                  <td>
                    {r.course?.icon} {r.course?.titleUz}
                  </td>
                  <td>
                    <select
                      className="select"
                      style={{ fontSize: 12.5, padding: '5px 8px' }}
                      value={r.status}
                      onChange={(e) => handleQuickStatus(r.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="muted" style={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(r.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="icon-btn" onClick={() => setEditing(r)} aria-label="Tahrirlash">
                        <EditIcon width={15} height={15} />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => setDeleting(r)} aria-label="O'chirish">
                        <TrashIcon width={15} height={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && items.length > 0 && <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />}
      </div>

      {editing && (
        <Modal title="Arizani tahrirlash" onClose={() => setEditing(null)}>
          <EditRegistrationForm registration={editing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Arizani o'chirish"
          message={`"${deleting.fullName}" arizasini butunlay o'chirmoqchimisiz?`}
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function EditRegistrationForm({ registration, onSave, onCancel }) {
  const [status, setStatus] = useState(registration.status);
  const [note, setNote] = useState(registration.note || '');

  return (
    <div>
      <div className="field">
        <label className="field__label">Ism</label>
        <input className="input" style={{ width: '100%' }} value={registration.fullName} disabled />
      </div>
      <div className="field">
        <label className="field__label">Telefon</label>
        <input className="input" style={{ width: '100%' }} value={registration.phone} disabled />
      </div>
      <div className="field">
        <label className="field__label">Holat</label>
        <select className="select" style={{ width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field__label">Izoh</label>
        <textarea className="input" style={{ width: '100%', minHeight: 80 }} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="modal__actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Bekor qilish
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onSave({ status, note })}>
          Saqlash
        </button>
      </div>
    </div>
  );
}
