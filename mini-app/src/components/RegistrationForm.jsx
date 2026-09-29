import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { tg } from '../utils/telegram';

const NAME_PATTERN = /^[\p{L}\s'ʻʼ‘’`.-]+$/u;

function isValidNamePart(value) {
  const trimmed = value.trim();
  return NAME_PATTERN.test(trimmed) && trimmed.replace(/[^\p{L}]/gu, '').length >= 2;
}

export function RegistrationForm({ courseId, onSuccess, onMissingCourse }) {
  const { t, user, showToast } = useApp();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!courseId) next.course = true;
    if (!isValidNamePart(firstName)) next.firstName = t('register.errorFirstName');
    if (!isValidNamePart(lastName)) next.lastName = t('register.errorLastName');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) next.phone = t('register.errorPhone');
    setErrors(next);
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      tg.notify('error');
      if (next.course && onMissingCourse) onMissingCourse();
      return;
    }
    setSubmitting(true);
    try {
      await api.register({ courseId, fullName: `${firstName.trim()} ${lastName.trim()}`, phone });
      tg.notify('success');
      onSuccess();
    } catch (err) {
      tg.notify('error');
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="field">
          <label className="field__label" htmlFor="firstName">
            {t('register.firstNameLabel')}
          </label>
          <input
            id="firstName"
            className={`field__input ${errors.firstName ? 'field__input--error' : ''}`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t('register.firstNamePlaceholder')}
            autoComplete="given-name"
          />
          {errors.firstName && <div className="field__error">{errors.firstName}</div>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="lastName">
            {t('register.lastNameLabel')}
          </label>
          <input
            id="lastName"
            className={`field__input ${errors.lastName ? 'field__input--error' : ''}`}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t('register.lastNamePlaceholder')}
            autoComplete="family-name"
          />
          {errors.lastName && <div className="field__error">{errors.lastName}</div>}
        </div>
      </div>
      <div className="field">
        <label className="field__label" htmlFor="phone">
          {t('register.phoneLabel')}
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          className={`field__input ${errors.phone ? 'field__input--error' : ''}`}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('register.phonePlaceholder')}
          autoComplete="tel"
        />
        {errors.phone && <div className="field__error">{errors.phone}</div>}
      </div>
      <button type="submit" className="btn btn-primary btn-sticky" disabled={submitting}>
        {submitting ? t('register.submitting') : t('register.submit')}
      </button>
    </form>
  );
}

export function RegistrationSuccess({ onClose }) {
  const { t } = useApp();
  return (
    <div className="success-view">
      <div className="success-view__badge">✓</div>
      <div className="sheet__title">{t('register.success')}</div>
      <p className="muted">{t('register.successText')}</p>
      <button type="button" className="btn btn-primary mt-16" onClick={onClose}>
        {t('register.done')}
      </button>
    </div>
  );
}
