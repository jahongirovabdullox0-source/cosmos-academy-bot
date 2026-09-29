import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { PhoneIcon, MapPinIcon, ClockIcon, InstagramIcon, SendIcon, ChevronRightIcon } from '../components/Icons';
import { lf, lplain } from '../utils/localize';
import { tg } from '../utils/telegram';

export function Contact({ onBack }) {
  const { t, centerInfo, language } = useApp();

  if (!centerInfo) return null;

  const address = lf(centerInfo, 'address', language);
  const hours = lplain(centerInfo, 'workHours', language);
  const mapUrl =
    centerInfo.latitude && centerInfo.longitude
      ? `https://maps.google.com/?q=${centerInfo.latitude},${centerInfo.longitude}`
      : `https://maps.google.com/?q=${encodeURIComponent(address || '')}`;

  return (
    <div>
      <PageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} onBack={onBack} />

      <div className="card">
        {(centerInfo.phones || []).map((phone) => (
          <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="contact-row" onClick={() => tg.haptic('light')}>
            <span className="contact-row__icon">
              <PhoneIcon width={18} height={18} />
            </span>
            <div className="contact-row__text">
              <div className="contact-row__label">{t('contact.call')}</div>
              <div className="contact-row__value">{phone}</div>
            </div>
            <span className="contact-row__chevron">
              <ChevronRightIcon width={16} height={16} />
            </span>
          </a>
        ))}

        {address && (
          <button
            type="button"
            className="contact-row contact-row--button"
            onClick={() => {
              tg.haptic('light');
              tg.openLink(mapUrl);
            }}
          >
            <span className="contact-row__icon contact-row__icon--gold">
              <MapPinIcon width={18} height={18} />
            </span>
            <div className="contact-row__text">
              <div className="contact-row__label">
                {t('contact.address')} · {t('contact.openMap')}
              </div>
              <div className="contact-row__value">{address}</div>
            </div>
            <span className="contact-row__chevron">
              <ChevronRightIcon width={16} height={16} />
            </span>
          </button>
        )}

        {hours && (
          <div className="contact-row">
            <span className="contact-row__icon contact-row__icon--green">
              <ClockIcon width={18} height={18} />
            </span>
            <div className="contact-row__text">
              <div className="contact-row__label">{t('contact.hours')}</div>
              <div className="contact-row__value">{hours}</div>
            </div>
          </div>
        )}
      </div>

      {(centerInfo.instagram || centerInfo.telegram) && (
        <>
          <div className="section-title">{t('contact.social')}</div>
          <div className="social-grid">
            {centerInfo.instagram && (
              <button type="button" className="social-button social-button--instagram" onClick={() => tg.openLink(centerInfo.instagram)}>
                <InstagramIcon width={20} height={20} />
                Instagram
              </button>
            )}
            {centerInfo.telegram && (
              <button type="button" className="social-button social-button--telegram" onClick={() => tg.openLink(centerInfo.telegram)}>
                <SendIcon width={20} height={20} />
                Telegram
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
