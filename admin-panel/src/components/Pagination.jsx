export function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="pagination">
      <div>Jami: {total}</div>
      <div className="pagination__controls">
        <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ←
        </button>
        <span style={{ padding: '0 8px' }}>
          {page} / {totalPages}
        </span>
        <button type="button" className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          →
        </button>
      </div>
    </div>
  );
}
