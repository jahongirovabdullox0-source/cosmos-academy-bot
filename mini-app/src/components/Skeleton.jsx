export function Skeleton({ width = '100%', height = 16, style = {}, className = '' }) {
  return <div className={`skeleton ${className}`} style={{ width, height, ...style }} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="course-card" style={{ cursor: 'default' }}>
      <Skeleton width={52} height={52} style={{ borderRadius: 16, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Skeleton width="70%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="45%" height={12} />
      </div>
    </div>
  );
}
