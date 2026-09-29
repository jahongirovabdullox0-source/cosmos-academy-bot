import { useApp } from '../context/AppContext';
import { CourseCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ChevronRightIcon } from '../components/Icons';
import { formatMoney } from '../utils/format';
import { lf, lplain, MOCK_CODE } from '../utils/localize';
import { tg } from '../utils/telegram';

export function Courses({ onOpenCourse, onRegister }) {
  const { t, courses, loading, language } = useApp();

  return (
    <div>
      <PageHeader title={t('courses.title')} subtitle={t('courses.subtitle')}>
        <button
          type="button"
          className="btn btn-gold btn-compact"
          onClick={() => {
            tg.haptic('medium');
            onRegister();
          }}
        >
          ✍️ {t('home.registerCta')}
        </button>
      </PageHeader>

      {loading && Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)}

      {!loading && courses.length === 0 && <EmptyState icon="📚" title={t('courses.empty')} />}

      {!loading &&
        courses.map((course) => {
          const duration = lplain(course, 'duration', language);
          return (
            <button
              key={course.id}
              type="button"
              className={`course-card ${course.code === MOCK_CODE ? 'course-card--featured' : ''}`}
              onClick={() => {
                tg.haptic('light');
                onOpenCourse(course);
              }}
            >
              <div className="course-card__icon">{course.icon}</div>
              <div className="course-card__body">
                <div className="course-card__title">{lf(course, 'title', language)}</div>
                <div className="course-card__meta">
                  <span className="course-card__price">
                    {formatMoney(course.price)} {t('common.somUnit')}
                  </span>
                  {duration && <span className="course-card__duration">· {duration}</span>}
                </div>
              </div>
              <span className="course-card__chevron">
                <ChevronRightIcon width={16} height={16} />
              </span>
            </button>
          );
        })}
    </div>
  );
}
