import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { useAdmin } from '../context/AdminContext';
import { Pagination } from '../components/Pagination';
import { Modal, ConfirmDialog } from '../components/Modal';
import { EditIcon, TrashIcon, DownloadIcon, SearchIcon } from '../components/Icons';
import { formatPhone } from '../utils/format';

const STATUS_OPTIONS = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'NEW', label: 'Yangi' },
  { value: 'CONTACTED', label: "Bog'lanildi" },
  { value: 'CONFIRMED', label: 'Tasdiqlandi' },
  { value: 'CANCELLED', label: 'Bekor qilindi' },
];

function formatDate(iso) {
  return new Date(iso).toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Registrations() {
  const { showToast } = useAdmin();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getRegistrations({ page, pageSize, search, status, courseId });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, courseId, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    adminApi
      .getCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, status, courseId]);

  async function handleQuickStatus(id, newStatus) {
    try {
      await adminApi.updateRegistration(id, { status: newStatus });
      showToast('Holat yangilandi');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleSaveEdit(data) {
    try {
      await adminApi.updateRegistration(editing.id, data);
      showToast('Saqlandi');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete() {
    try {
      await adminApi.deleteRegistration(deleting.id);
      showToast("O'chirildi");
      setDeleting(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleExport() {
    try {
      const res = await fetch(`${adminApi.baseUrl}/api/admin/registrations/export`, {
        headers: { Authorization: `Bearer ${adminApi.getToken()}` },
      });
      if (!res.ok) throw new Error('Eksport qilishda xatolik');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arizalar.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

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
      </div>

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
                  <td className="muted">{formatDate(r.createdAt)}</td>
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
