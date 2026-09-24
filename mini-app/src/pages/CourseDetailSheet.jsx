import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BottomSheet } from '../components/BottomSheet';
import { CheckCircleIcon } from '../components/Icons';
import { formatMoney } from '../utils/format';
import { api } from '../api/client';
import { tg } from '../utils/telegram';

export function CourseDetailSheet({ course, onClose }) {
  const { t, language, user, showToast } = useApp();
  const langCap = language.charAt(0).toUpperCase() + language.slice(1);
  const [fullName, setFullName] = useState(() => `${user?.firstName || ''} ${user?.lastName || ''}`.trim());
  const [phone, setPhone] = useState(user?.phone || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const next = {};
    if (!fullName || fullName.trim().length < 2) next.fullName = t('register.errorName');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) next.phone = t('register.errorPhone');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      tg.notify('error');
      return;
    }
    setSubmitting(true);
    try {
      await api.register({ courseId: course.id, fullName: fullName.trim(), phone });
      tg.notify('success');
      setSuccess(true);
    } catch (err) {
      tg.notify('error');
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      {success ? (
        <div className="center-text" style={{ padding: '20px 0' }}>
          <CheckCircleIcon width={56} height={56} style={{ color: 'var(--ca-green)', margin: '0 auto 14px' }} />
          <div className="sheet__title">{t('register.success')}</div>
          <p className="muted" style={{ fontSize: 14 }}>
            {t('register.successText')}
          </p>
          <button type="button" className="btn btn-primary mt-16" onClick={onClose}>
            {t('register.done')}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
            <div className="course-card__icon" style={{ width: 48, height: 48, fontSize: 22 }}>
              {course.icon}
            </div>
            <div>
              <div className="sheet__title">{course[`title${langCap}`]}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {course.duration}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ca-text-muted)' }}>{course[`description${langCap}`]}</p>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span className="muted" style={{ fontSize: 13 }}>
              {t('courses.priceLabel')}
            </span>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--ca-blue)' }}>
              {formatMoney(course.price)} {t('common.somUnit')}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field__label" htmlFor="fullName">
                {t('register.nameLabel')}
              </label>
              <input
                id="fullName"
                className="field__input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('register.namePlaceholder')}
              />
              {errors.fullName && <div className="field__error">{errors.fullName}</div>}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="phone">
                {t('register.phoneLabel')}
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                className="field__input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('register.phonePlaceholder')}
              />
              {errors.phone && <div className="field__error">{errors.phone}</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-sticky" disabled={submitting}>
              {submitting ? t('register.submitting') : t('register.submit')}
            </button>
          </form>
        </>
      )}
    </BottomSheet>
  );
}
