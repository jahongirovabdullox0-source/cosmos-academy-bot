import { useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { useAdmin } from '../context/AdminContext';

const LANGS = [
  { code: 'Uz', label: "O'z" },
  { code: 'En', label: 'En' },
  { code: 'Ru', label: 'Ru' },
];

export function CenterInfo() {
  const { showToast } = useAdmin();
  const [form, setForm] = useState(null);
  const [lang, setLang] = useState('Uz');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getCenterInfo()
      .then((data) => {
        setForm({ ...data, phones: (data.phones || []).join(', ') });
      })
      .catch((err) => showToast(err.message, 'error'));
  }, [showToast]);

  if (!form) return <div className="skeleton" style={{ height: 300 }} />;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        phones: form.phones.split(',').map((p) => p.trim()).filter(Boolean),
        latitude: form.latitude === '' || form.latitude === null || form.latitude === undefined ? null : Number(form.latitude),
        longitude: form.longitude === '' || form.longitude === null || form.longitude === undefined ? null : Number(form.longitude),
      };
      await adminApi.updateCenterInfo(payload);
      showToast('Saqlandi');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__title">Markaz ma'lumotlari</div>
          <div className="page-header__subtitle">Bot va Mini App'da ko'rinadigan asosiy ma'lumotlar</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="card">
            <div className="card-title">Nomi va tavsif</div>
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
              <label className="field__label">Markaz nomi ({lang})</label>
              <input
                className="input"
                style={{ width: '100%' }}
                value={form[`name${lang}`] || ''}
                onChange={(e) => set(`name${lang}`, e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label">Markaz haqida ({lang})</label>
              <textarea
                className="input"
                style={{ width: '100%', minHeight: 100 }}
                value={form[`about${lang}`] || ''}
                onChange={(e) => set(`about${lang}`, e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label">Manzil ({lang})</label>
              <input
                className="input"
                style={{ width: '100%' }}
                value={form[`address${lang}`] || ''}
                onChange={(e) => set(`address${lang}`, e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">Aloqa va joylashuv</div>
            <div className="field">
              <label className="field__label">Telefon raqamlari (vergul bilan ajratib yozing)</label>
              <input
                className="input"
                style={{ width: '100%' }}
                value={form.phones}
                onChange={(e) => set('phones', e.target.value)}
                placeholder="+998 90 123 45 67, +998 91 234 56 78"
              />
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field__label">Kenglik (latitude)</label>
                <input className="input" style={{ width: '100%' }} value={form.latitude ?? ''} onChange={(e) => set('latitude', e.target.value)} />
              </div>
              <div className="field">
                <label className="field__label">Uzunlik (longitude)</label>
                <input className="input" style={{ width: '100%' }} value={form.longitude ?? ''} onChange={(e) => set('longitude', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Ish vaqti</label>
              <input className="input" style={{ width: '100%' }} value={form.workHours || ''} onChange={(e) => set('workHours', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Instagram havolasi</label>
              <input className="input" style={{ width: '100%' }} value={form.instagram || ''} onChange={(e) => set('instagram', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Telegram havolasi</label>
              <input className="input" style={{ width: '100%' }} value={form.telegram || ''} onChange={(e) => set('telegram', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">Facebook havolasi</label>
              <input className="input" style={{ width: '100%' }} value={form.facebook || ''} onChange={(e) => set('facebook', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">YouTube havolasi</label>
              <input className="input" style={{ width: '100%' }} value={form.youtube || ''} onChange={(e) => set('youtube', e.target.value)} />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </form>
    </div>
  );
}
