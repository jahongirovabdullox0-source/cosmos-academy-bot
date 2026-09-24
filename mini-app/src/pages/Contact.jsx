import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { PhoneIcon, MapPinIcon, ClockIcon, InstagramIcon, SendIcon } from '../components/Icons';
import { tg } from '../utils/telegram';

export function Contact({ onBack }) {
  const { t, centerInfo, language } = useApp();
  const langCap = language.charAt(0).toUpperCase() + language.slice(1);

  if (!centerInfo) return null;

  const address = centerInfo[`address${langCap}`];
  const mapUrl =
    centerInfo.latitude && centerInfo.longitude
      ? `https://maps.google.com/?q=${centerInfo.latitude},${centerInfo.longitude}`
      : `https://maps.google.com/?q=${encodeURIComponent(address || '')}`;

  return (
    <div>
      <TopBar title={t('contact.title')} onBack={onBack} />

      <div className="card">
        {(centerInfo.phones || []).map((phone) => (
          <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="contact-row" onClick={() => tg.haptic('light')}>
            <span className="contact-row__icon">
              <PhoneIcon width={18} height={18} />
            </span>
            <div>
              <div className="contact-row__label">{t('contact.call')}</div>
              <div className="contact-row__value">{phone}</div>
            </div>
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
            <span className="contact-row__icon">
              <MapPinIcon width={18} height={18} />
            </span>
            <div>
              <div className="contact-row__label">{t('contact.address')}</div>
              <div className="contact-row__value">{address}</div>
            </div>
          </button>
        )}

        {centerInfo.workHours && (
          <div className="contact-row">
            <span className="contact-row__icon">
              <ClockIcon width={18} height={18} />
            </span>
            <div>
              <div className="contact-row__label">{t('contact.hours')}</div>
              <div className="contact-row__value">{centerInfo.workHours}</div>
            </div>
          </div>
        )}
      </div>

      {(centerInfo.instagram || centerInfo.telegram) && (
        <>
          <div className="section-title">{t('contact.social')}</div>
          <div className="card">
            {centerInfo.instagram && (
              <button
                type="button"
                className="contact-row contact-row--button"
                onClick={() => tg.openLink(centerInfo.instagram)}
              >
                <span className="contact-row__icon">
                  <InstagramIcon width={18} height={18} />
                </span>
                <div className="contact-row__value">Instagram</div>
              </button>
            )}
            {centerInfo.telegram && (
              <button
                type="button"
                className="contact-row contact-row--button"
                onClick={() => tg.openLink(centerInfo.telegram)}
              >
                <span className="contact-row__icon">
                  <SendIcon width={18} height={18} />
                </span>
                <div className="contact-row__value">Telegram</div>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
