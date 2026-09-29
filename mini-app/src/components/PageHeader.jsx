import { ArrowLeftIcon } from './Icons';

export function PageHeader({ title, subtitle, onBack, children }) {
  return (
    <header className="page-hero">
      <div className="page-hero__top">
        {onBack ? (
          <button type="button" className="page-hero__back" onClick={onBack} aria-label="Orqaga">
            <ArrowLeftIcon width={18} height={18} />
          </button>
        ) : (
          <img src="/logo.jpg" alt="" className="page-hero__logo" />
        )}
        <span className="page-hero__eyebrow">Cosmos Academy</span>
      </div>
      <h1 className="page-hero__title">{title}</h1>
      {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
      {children}
    </header>
  );
}
