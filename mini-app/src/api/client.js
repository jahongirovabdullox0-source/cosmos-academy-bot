// Bo'sh qoldirilsa (lokal rejim), so'rovlar nisbiy '/api/...' manzilga boradi va
// Vite dev-server buni proxy orqali localhost:4000'ga yo'naltiradi (ngrok orqali
// telefonda sinashda ham ishlaydi, chunki proxy so'rov qayerdan kelganiga qaramaydi).
// Productionda (Vercel) VITE_API_URL Render backend manziliga o'rnatiladi.
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getInitData() {
  return window.Telegram?.WebApp?.initData || '';
}

function getDevTelegramId() {
  try {
    return localStorage.getItem('ca_dev_id') || '111111111';
  } catch {
    return '111111111';
  }
}

async function request(path, options = {}) {
  const initData = getInitData();
  const headers = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': initData,
    ...(options.headers || {}),
  };
  if (!initData) {
    headers['x-dev-telegram-id'] = getDevTelegramId();
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/client${path}`, { ...options, headers });
  } catch {
    throw new Error("Serverga ulanib bo'lmadi. Internetni tekshiring.");
  }

  let json;
  try {
    json = await res.json();
  } catch {
    json = { success: false, message: "Server javobini o'qib bo'lmadi" };
  }

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Xatolik yuz berdi');
  }
  return json.data;
}

export const api = {
  getMe: () => request('/me'),
  setLanguage: (language) => request('/language', { method: 'POST', body: JSON.stringify({ language }) }),
  getCourses: () => request('/courses'),
  getAchievements: () => request('/achievements'),
  getCenterInfo: () => request('/center-info'),
  register: (payload) => request('/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMyRegistrations: () => request('/my-registrations'),
};
