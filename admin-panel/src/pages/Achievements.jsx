import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi, resolveAssetUrl } from '../api/client';
import { useAdmin } from '../context/AdminContext';
import { Modal, ConfirmDialog } from '../components/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import { compressImage } from '../utils/format';

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
          <div className="page-header__title">Natijalar va sertifikatlar</div>
          <div className="page-header__subtitle">
            Rasmsiz yozuvlar raqamlar sifatida, rasmlilar esa "Sertifikatlar" bo'limida ko'rinadi (bot va Mini App'da)
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({ ...EMPTY_ACHIEVEMENT })}>
          <PlusIcon width={16} height={16} /> Yangi qo'shish
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="skeleton" style={{ height: 200, margin: 16 }} />
        ) : items.length === 0 ? (
          <div className="table-empty">Hozircha natijalar yo'q</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rasm</th>
                <th>Qiymat</th>
                <th>Nomi</th>
                <th>Holati</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.imageUrl ? (
                      <img className="thumb" src={resolveAssetUrl(item.imageUrl)} alt="" loading="lazy" />
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
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
          title="O'chirish"
          message={`"${deleting.titleUz}" yozuvini (rasmi bilan birga) butunlay o'chirmoqchimisiz?`}
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function AchievementForm({ item, onSave, onCancel }) {
  const { showToast } = useAdmin();
  const [form, setForm] = useState(item);
  const [lang, setLang] = useState('Uz');
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const blob = await compressImage(file);
      const { url } = await adminApi.uploadImage(blob);
      set('imageUrl', url);
      showToast('Rasm yuklandi — saqlashni unutmang');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.titleUz || !form.titleUz.trim()) {
      setLang('Uz');
      showToast("O'zbekcha nomini kiriting", 'error');
      return;
    }
    onSave({ ...form, order: Number(form.order) || 0 });
  }

  return (
    <Modal title={item.id ? 'Tahrirlash' : "Yangi natija yoki sertifikat"} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label">Sertifikat rasmi (ixtiyoriy)</label>
          <div className="image-upload">
            {form.imageUrl ? (
              <img className="image-upload__preview" src={resolveAssetUrl(form.imageUrl)} alt="" />
            ) : (
              <div className="image-upload__empty">Rasm tanlanmagan</div>
            )}
            <div className="image-upload__actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInput.current.click()} disabled={uploading}>
                {uploading ? 'Yuklanmoqda...' : form.imageUrl ? 'Boshqa rasm' : 'Rasm yuklash'}
              </button>
              {form.imageUrl && !uploading && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => set('imageUrl', '')}>
                  Olib tashlash
                </button>
              )}
            </div>
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={handleFile} />
          </div>
          <div className="field__hint">Rasm avtomatik kichraytiriladi. Rasmli yozuvlar "Sertifikatlar" bo'limida chiqadi.</div>
        </div>

        <div className="field">
          <label className="field__label">Qiymat (masalan "IELTS 7.5", "500+", "2019")</label>
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
          <label className="field__label">
            Nomi ({lang}){lang === 'Uz' ? ' *' : ''}
          </label>
          <input
            className="input"
            style={{ width: '100%' }}
            value={form[`title${lang}`] || ''}
            onChange={(e) => set(`title${lang}`, e.target.value)}
            placeholder={lang === 'Uz' ? "Masalan: Aziz Karimov yoki bitiruvchi" : "Bo'sh qolsa, o'zbekchasi ko'rsatiladi"}
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

        <div className="field">
          <label className="field__label">Tartib raqami (kichigi oldinda)</label>
          <input type="number" className="input" style={{ width: '100%' }} value={form.order} onChange={(e) => set('order', e.target.value)} />
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Bekor qilish
          </button>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  );
}
