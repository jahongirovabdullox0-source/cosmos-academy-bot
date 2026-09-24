import { useEffect } from 'react';
import { tg } from '../utils/telegram';

export function BottomSheet({ onClose, children }) {
  useEffect(() => tg.showBackButton(onClose), [onClose]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        {children}
      </div>
    </div>
  );
}
