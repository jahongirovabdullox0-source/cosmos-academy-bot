import { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BottomSheet } from '../components/BottomSheet';
import { RegistrationForm, RegistrationSuccess } from '../components/RegistrationForm';
import { formatMoney } from '../utils/format';
import { lplain, shortTitle, MOCK_CODE } from '../utils/localize';
import { tg } from '../utils/telegram';

export function RegisterSheet({ onClose }) {
  const { t, language, courses } = useApp();
  const studyCourses = useMemo(() => courses.filter((c) => c.code !== MOCK_CODE), [courses]);
  const [selectedId, setSelectedId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const pickerRef = useRef(null);
  const selected = studyCourses.find((c) => c.id === selectedId);

  function choose(id) {
    tg.haptic('light');
    setSelectedId(id);
    setHighlight(false);
  }

  function showMissingCourse() {
    setHighlight(true);
    pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <BottomSheet onClose={onClose}>
      {success ? (
        <RegistrationSuccess onClose={onClose} />
      ) : (
        <>
          <div className="sheet__title">✍️ {t('register.title')}</div>
          <p className="sheet__subtitle">{t('register.subtitle')}</p>

          <div className="field" ref={pickerRef}>
            <label className="field__label">{t('register.chooseLevel')}</label>
            <div className={`level-picker ${highlight ? 'level-picker--error' : ''}`}>
              {studyCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className={`level-chip ${selectedId === course.id ? 'level-chip--active' : ''}`}
                  onClick={() => choose(course.id)}
                >
                  <span className="level-chip__icon">{course.icon}</span>
                  {shortTitle(course, language)}
                </button>
              ))}
            </div>
            {highlight && <div className="field__error">{t('register.errorCourse')}</div>}
          </div>

          {selected && (
            <div className="price-banner">
              <span>{lplain(selected, 'duration', language)}</span>
              <strong>
                {formatMoney(selected.price)} {t('common.somUnit')}
              </strong>
            </div>
          )}

          <RegistrationForm courseId={selectedId} onSuccess={() => setSuccess(true)} onMissingCourse={showMissingCourse} />
        </>
      )}
    </BottomSheet>
  );
}
