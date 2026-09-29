import { useEffect } from 'react';
import { tg } from '../utils/telegram';
import { CloseIcon } from './Icons';

export function Lightbox({ src, caption, onClose }) {
  useEffect(() => tg.showBackButton(onClose), [onClose]);

  return (
    <div className="lightbox" onClick={onClose} role="dialog">
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Yopish">
        <CloseIcon width={20} height={20} />
      </button>
      <img className="lightbox__image" src={src} alt={caption || ''} onClick={(e) => e.stopPropagation()} />
      {caption && <div className="lightbox__caption">{caption}</div>}
    </div>
  );
}
