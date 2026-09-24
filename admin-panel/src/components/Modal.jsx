import { CloseIcon } from './Icons';

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={wide ? { maxWidth: 640 } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Yopish">
            <CloseIcon width={16} height={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, danger = false, confirmLabel = 'Tasdiqlash' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__title" style={{ marginBottom: 10 }}>
          {title}
        </div>
        <p className="muted" style={{ fontSize: 13.5 }}>
          {message}
        </p>
        <div className="modal__actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Bekor qilish
          </button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
