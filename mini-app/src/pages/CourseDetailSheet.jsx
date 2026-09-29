import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BottomSheet } from '../components/BottomSheet';
import { RegistrationForm, RegistrationSuccess } from '../components/RegistrationForm';
import { formatMoney } from '../utils/format';
import { lf, lplain } from '../utils/localize';

export function CourseDetailSheet({ course, onClose }) {
  const { t, language } = useApp();
  const [success, setSuccess] = useState(false);
  const duration = lplain(course, 'duration', language);

  return (
    <BottomSheet onClose={onClose}>
      {success ? (
        <RegistrationSuccess onClose={onClose} />
      ) : (
        <>
          <div className="sheet-course">
            <div className="sheet-course__icon">{course.icon}</div>
            <div>
              <div className="sheet__title">{lf(course, 'title', language)}</div>
              {duration && <span className="chip chip--gold">{duration}</span>}
            </div>
          </div>
          <p className="sheet-course__description">{lf(course, 'description', language)}</p>
          <div className="price-banner">
            <span>{t('courses.priceLabel')}</span>
            <strong>
              {formatMoney(course.price)} {t('common.somUnit')}
            </strong>
          </div>
          <RegistrationForm courseId={course.id} onSuccess={() => setSuccess(true)} />
        </>
      )}
    </BottomSheet>
  );
}
