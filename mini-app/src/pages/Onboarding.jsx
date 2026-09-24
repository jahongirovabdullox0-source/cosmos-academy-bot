import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tg } from '../utils/telegram';

const SLIDES = [
  { emoji: '🚀', titleKey: 'onboarding.slide1Title', textKey: 'onboarding.slide1Text' },
  { emoji: '📚', titleKey: 'onboarding.slide2Title', textKey: 'onboarding.slide2Text' },
  { emoji: '🏆', titleKey: 'onboarding.slide3Title', textKey: 'onboarding.slide3Text' },
];

export function Onboarding({ onFinish }) {
  const { t } = useApp();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function next() {
    tg.haptic('light');
    if (isLast) onFinish();
    else setIndex((i) => i + 1);
  }

  return (
    <div className="onboarding">
      <img src="/logo.jpg" alt="Cosmos Academy" className="onboarding__logo" />
      <div className="onboarding__slides">
        <div className="onboarding__emoji">{slide.emoji}</div>
        <div className="onboarding__title">{t(slide.titleKey)}</div>
        <div className="onboarding__text">{t(slide.textKey)}</div>
      </div>
      <div className="onboarding__dots">
        {SLIDES.map((s, i) => (
          <div key={s.titleKey} className={`onboarding__dot ${i === index ? 'onboarding__dot--active' : ''}`} />
        ))}
      </div>
      <button type="button" className="btn btn-gold" onClick={next}>
        {isLast ? t('onboarding.start') : '→'}
      </button>
    </div>
  );
}
