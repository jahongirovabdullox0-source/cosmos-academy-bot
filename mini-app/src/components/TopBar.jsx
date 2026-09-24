import { ArrowLeftIcon } from './Icons';

export function TopBar({ title, onBack, logo }) {
  return (
    <div className="top-bar">
      {onBack && (
        <button type="button" className="top-bar__back" onClick={onBack} aria-label="Orqaga">
          <ArrowLeftIcon width={18} height={18} />
        </button>
      )}
      {logo && <img src={logo} alt="" className="top-bar__logo" />}
      <div className="top-bar__title">{title}</div>
    </div>
  );
}
