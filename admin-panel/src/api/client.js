// Bo'sh qoldirilsa (lokal rejim), so'rovlar nisbiy '/api/...' manzilga boradi va
// Vite dev-server buni proxy orqali localhost:4000'ga yo'naltiradi.
// Productionda (Vercel) VITE_API_URL Render backend manziliga o'rnatiladi.
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'ca_admin_token';

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage mavjud bo'lmasa e'tiborsiz qoldiramiz
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/admin${path}`, { ...options, headers });
  } catch {
    throw new Error("Serverga ulanib bo'lmadi. Internetni tekshiring.");
  }

  if (res.status === 401 && path !== '/login') {
    setToken(null);
    window.dispatchEvent(new Event('ca-admin-logout'));
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

function qs(params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null));
  return new URLSearchParams(clean).toString();
}

export const adminApi = {
  getToken,
  setToken,
  baseUrl: BASE_URL,

  login: (password) => request('/login', { method: 'POST', body: JSON.stringify({ password }) }),

  getDashboardStats: () => request('/dashboard/stats'),

  getRegistrations: (params) => request(`/registrations?${qs(params)}`),
  updateRegistration: (id, data) => request(`/registrations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRegistration: (id) => request(`/registrations/${id}`, { method: 'DELETE' }),

  getUsers: (params) => request(`/users?${qs(params)}`),
  setUserBlocked: (id, isBlocked) => request(`/users/${id}/block`, { method: 'PATCH', body: JSON.stringify({ isBlocked }) }),

  getCourses: () => request('/courses'),
  createCourse: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id, data) => request(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),

  getAchievements: () => request('/achievements'),
  createAchievement: (data) => request('/achievements', { method: 'POST', body: JSON.stringify(data) }),
  updateAchievement: (id, data) => request(`/achievements/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAchievement: (id) => request(`/achievements/${id}`, { method: 'DELETE' }),

  getCenterInfo: () => request('/center-info'),
  updateCenterInfo: (data) => request('/center-info', { method: 'PUT', body: JSON.stringify(data) }),

  sendBroadcast: (text) => request('/broadcast', { method: 'POST', body: JSON.stringify({ text }) }),
  getBroadcastHistory: () => request('/broadcast/history'),
};
