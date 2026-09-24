import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CourseCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ChevronRightIcon } from '../components/Icons';
import { formatMoney } from '../utils/format';
import { CourseDetailSheet } from './CourseDetailSheet';

export function Courses() {
  const { t, courses, loading, language } = useApp();
  const langCap = language.charAt(0).toUpperCase() + language.slice(1);
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <h1 className="page-heading">{t('courses.title')}</h1>

      {loading && Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)}

      {!loading && courses.length === 0 && <EmptyState icon="📚" title={t('courses.empty')} />}

      {!loading &&
        courses.map((course) => (
          <button key={course.id} type="button" className="course-card" onClick={() => setSelected(course)}>
            <div className="course-card__icon">{course.icon}</div>
            <div className="course-card__body">
              <div className="course-card__title">{course[`title${langCap}`]}</div>
              <div className="course-card__meta">{course.duration || ''}</div>
            </div>
            <div className="course-card__price">
              {formatMoney(course.price)} {t('common.somUnit')}
            </div>
            <ChevronRightIcon className="course-card__chevron" width={18} height={18} />
          </button>
        ))}

      {selected && <CourseDetailSheet course={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
