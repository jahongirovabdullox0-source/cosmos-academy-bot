function formatShortDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function BarChart({ data, valueKey = 'count', labelKey = 'date', height = 150 }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height }}>
      {data.map((d) => {
        const barHeight = Math.max(4, (d[valueKey] / max) * (height - 34));
        return (
          <div key={d[labelKey]} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ca-blue)' }}>{d[valueKey]}</div>
            <div
              style={{
                width: '100%',
                maxWidth: 30,
                height: barHeight,
                background: d[valueKey] > 0 ? 'var(--ca-blue)' : 'var(--ca-border)',
                borderRadius: 7,
              }}
            />
            <div style={{ fontSize: 10.5, color: 'var(--ca-text-muted)' }}>{formatShortDate(d[labelKey])}</div>
          </div>
        );
      })}
    </div>
  );
}
