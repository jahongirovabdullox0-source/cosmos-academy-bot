import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { useAdmin } from '../context/AdminContext';
import { Modal, ConfirmDialog } from '../components/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import { formatMoney } from '../utils/format';

const EMPTY_COURSE = {
  code: '',
  order: 0,
  icon: '📘',
  isActive: true,
  titleUz: '',
  titleEn: '',
  titleRu: '',
  descriptionUz: '',
  descriptionEn: '',
  descriptionRu: '',
  price: '',
  duration: '',
};

const LANGS = [
  { code: 'Uz', label: "O'z" },
  { code: 'En', label: 'En' },
  { code: 'Ru', label: 'Ru' },
];

export function Courses() {
  const { showToast } = useAdmin();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCourses(await adminApi.getCourses());
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(data) {
    try {
      if (editing.id) {
        await adminApi.updateCourse(editing.id, data);
      } else {
        await adminApi.createCourse(data);
      }
      showToast('Saqlandi');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleToggleActive(course) {
    try {
      await adminApi.updateCourse(course.id, { isActive: !course.isActive });
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete() {
    try {
      await adminApi.deleteCourse(deleting.id);
      showToast("O'chirildi");
      setDeleting(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__title">Kurslar</div>
          <div className="page-header__subtitle">Kurs turlari, narxlari va tavsiflari</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({ ...EMPTY_COURSE })}>
          <PlusIcon width={16} height={16} /> Yangi kurs
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="skeleton" style={{ height: 200, margin: 16 }} />
        ) : courses.length === 0 ? (
          <div className="table-empty">Hozircha kurslar yo'q</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th> </th>
                <th>Nomi</th>
                <th>Kod</th>
                <th>Narxi</th>
                <th>Davomiyligi</th>
                <th>Holati</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontSize: 20 }}>{c.icon}</td>
                  <td>{c.titleUz}</td>
                  <td className="muted">{c.code}</td>
                  <td>{formatMoney(c.price)} so'm</td>
                  <td className="muted">{c.duration}</td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${c.isActive ? 'badge-active' : 'badge-inactive'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => handleToggleActive(c)}
                    >
                      {c.isActive ? 'Faol' : 'Faol emas'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="icon-btn" onClick={() => setEditing(c)} aria-label="Tahrirlash">
                        <EditIcon width={15} height={15} />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => setDeleting(c)} aria-label="O'chirish">
                        <TrashIcon width={15} height={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && <CourseForm course={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}

      {deleting && (
        <ConfirmDialog
          title="Kursni o'chirish"
          message={`"${deleting.titleUz}" kursini butunlay o'chirmoqchimisiz? Agar bu kursga arizalar mavjud bo'lsa, xatolik chiqadi — bunday holda uni "Faol emas" holatiga o'tkazing.`}
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function CourseForm({ course, onSave, onCancel }) {
  const [form, setForm] = useState(course);
  const [lang, setLang] = useState('Uz');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price), order: Number(form.order) || 0 });
  }

  return (
    <Modal title={course.id ? 'Kursni tahrirlash' : 'Yangi kurs'} onClose={onCancel} wide>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field">
            <label className="field__label">Kod (masalan A1, IELTS_FOUNDATION)</label>
            <input
              className="input"
              style={{ width: '100%' }}
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              disabled={Boolean(course.id)}
              required
            />
          </div>
          <div className="field">
            <label className="field__label">Ikonka (emoji)</label>
            <input className="input" style={{ width: '100%' }} value={form.icon} onChange={(e) => set('icon', e.target.value)} />
          </div>
        </div>

        <div className="lang-tabs">
          {LANGS.map((l) => (
            <button
              type="button"
              key={l.code}
              className={`lang-tab ${lang === l.code ? 'lang-tab--active' : ''}`}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="field">
          <label className="field__label">Nomi ({lang})</label>
          <input
            className="input"
            style={{ width: '100%' }}
            value={form[`title${lang}`]}
            onChange={(e) => set(`title${lang}`, e.target.value)}
            required={lang === 'Uz'}
          />
        </div>
        <div className="field">
          <label className="field__label">Tavsif ({lang})</label>
          <textarea
            className="input"
            style={{ width: '100%', minHeight: 80 }}
            value={form[`description${lang}`]}
            onChange={(e) => set(`description${lang}`, e.target.value)}
            required={lang === 'Uz'}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field__label">Narxi (so'm)</label>
            <input
              type="number"
              min="0"
              className="input"
              style={{ width: '100%' }}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field__label">Davomiyligi (masalan "2 oy")</label>
            <input className="input" style={{ width: '100%' }} value={form.duration || ''} onChange={(e) => set('duration', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field__label">Tartib raqami</label>
            <input type="number" className="input" style={{ width: '100%' }} value={form.order} onChange={(e) => set('order', e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Holati</label>
            <select
              className="select"
              style={{ width: '100%' }}
              value={form.isActive ? '1' : '0'}
              onChange={(e) => set('isActive', e.target.value === '1')}
            >
              <option value="1">Faol</option>
              <option value="0">Faol emas</option>
            </select>
          </div>
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Bekor qilish
          </button>
          <button type="submit" className="btn btn-primary">
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  );
}
