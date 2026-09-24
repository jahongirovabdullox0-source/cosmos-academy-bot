function getWebApp() {
  return window.Telegram?.WebApp;
}

function init() {
  const wa = getWebApp();
  if (!wa) return;
  try {
    wa.ready();
    wa.expand();
    wa.setHeaderColor('#ffffff');
    wa.setBackgroundColor('#f7f8fa');
  } catch {
    // eski Telegram versiyalarida ba'zi metodlar yo'q bo'lishi mumkin
  }
}

function getUnsafeUser() {
  return getWebApp()?.initDataUnsafe?.user || null;
}

function haptic(style = 'light') {
  try {
    getWebApp()?.HapticFeedback?.impactOccurred(style);
  } catch {
    // no-op
  }
}

function notify(type = 'success') {
  try {
    getWebApp()?.HapticFeedback?.notificationOccurred(type);
  } catch {
    // no-op
  }
}

function showBackButton(onClick) {
  const wa = getWebApp();
  if (!wa?.BackButton) return () => {};
  wa.BackButton.show();
  wa.BackButton.onClick(onClick);
  return () => {
    try {
      wa.BackButton.offClick(onClick);
      wa.BackButton.hide();
    } catch {
      // no-op
    }
  };
}

function openLink(url) {
  const wa = getWebApp();
  if (wa?.openLink) wa.openLink(url);
  else window.open(url, '_blank', 'noopener,noreferrer');
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const wa = getWebApp();
    if (wa?.showConfirm) {
      wa.showConfirm(message, (ok) => resolve(ok));
    } else {
      resolve(window.confirm(message)); // eslint-disable-line no-alert
    }
  });
}

function isInsideTelegram() {
  return Boolean(getWebApp()?.initData);
}

export const tg = {
  init,
  getUnsafeUser,
  haptic,
  notify,
  showBackButton,
  openLink,
  showConfirm,
  isInsideTelegram,
};
