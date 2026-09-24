import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { useAdmin } from '../context/AdminContext';
import { Modal, ConfirmDialog } from '../components/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../components/Icons';

const EMPTY_ACHIEVEMENT = {
  order: 0,
  isActive: true,
  value: '',
  titleUz: '',
  titleEn: '',
  titleRu: '',
  descriptionUz: '',
  descriptionEn: '',
  descriptionRu: '',
  imageUrl: '',
};

const LANGS = [
  { code: 'Uz', label: "O'z" },
  { code: 'En', label: 'En' },
  { code: 'Ru', label: 'Ru' },
];

export function Achievements() {
  const { showToast } = useAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminApi.getAchievements());
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
        await adminApi.updateAchievement(editing.id, data);
      } else {
        await adminApi.createAchievement(data);
      }
      showToast('Saqlandi');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleToggleActive(item) {
    try {
      await adminApi.updateAchievement(item.id, { isActive: !item.isActive });
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete() {
    try {
      await adminApi.deleteAchievement(deleting.id);
      showToast("O'chirildi");
      setDeleting(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__title">Yutuqlar</div>
          <div className="page-header__subtitle">Markazning natijalari va yutuqlari (Mini App'da ko'rinadi)</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({ ...EMPTY_ACHIEVEMENT })}>
          <PlusIcon width={16} height={16} /> Yangi yutuq
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="skeleton" style={{ height: 200, margin: 16 }} />
        ) : items.length === 0 ? (
          <div className="table-empty">Hozircha yutuqlar yo'q</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Qiymat</th>
                <th>Nomi</th>
                <th>Holati</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: 'var(--ca-blue)' }}>{item.value}</td>
                  <td>{item.titleUz}</td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${item.isActive ? 'badge-active' : 'badge-inactive'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => handleToggleActive(item)}
                    >
                      {item.isActive ? 'Faol' : 'Faol emas'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="icon-btn" onClick={() => setEditing(item)} aria-label="Tahrirlash">
                        <EditIcon width={15} height={15} />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => setDeleting(item)} aria-label="O'chirish">
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

      {editing && <AchievementForm item={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}

      {deleting && (
        <ConfirmDialog
          title="Yutuqni o'chirish"
          message={`"${deleting.titleUz}" yutug'ini butunlay o'chirmoqchimisiz?`}
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function AchievementForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState(item);
  const [lang, setLang] = useState('Uz');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, order: Number(form.order) || 0 });
  }

  return (
    <Modal title={item.id ? 'Yutuqni tahrirlash' : 'Yangi yutuq'} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label">Qiymat (masalan "500+", "2019", "7.0+")</label>
          <input className="input" style={{ width: '100%' }} value={form.value || ''} onChange={(e) => set('value', e.target.value)} />
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
          <label className="field__label">Sarlavha ({lang})</label>
          <input
            className="input"
            style={{ width: '100%' }}
            value={form[`title${lang}`]}
            onChange={(e) => set(`title${lang}`, e.target.value)}
            required={lang === 'Uz'}
          />
        </div>
        <div className="field">
          <label className="field__label">Tavsif ({lang}, ixtiyoriy)</label>
          <textarea
            className="input"
            style={{ width: '100%', minHeight: 70 }}
            value={form[`description${lang}`] || ''}
            onChange={(e) => set(`description${lang}`, e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field__label">Rasm URL (ixtiyoriy)</label>
            <input className="input" style={{ width: '100%' }} value={form.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Tartib raqami</label>
            <input type="number" className="input" style={{ width: '100%' }} value={form.order} onChange={(e) => set('order', e.target.value)} />
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
