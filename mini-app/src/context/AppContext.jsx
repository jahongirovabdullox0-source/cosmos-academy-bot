import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { translate, normalizeLang } from '../i18n';
import { tg } from '../utils/telegram';

const AppContext = createContext(null);

function readCachedLang() {
  try {
    return localStorage.getItem('ca_lang') || 'uz';
  } catch {
    return 'uz';
  }
}

function writeCachedLang(lang) {
  try {
    localStorage.setItem('ca_lang', lang);
  } catch {
    // localStorage mavjud bo'lmasa e'tiborsiz qoldiramiz
  }
}

export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(readCachedLang());
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [centerInfo, setCenterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    tg.init();
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, courseList, achievementList, info] = await Promise.all([
        api.getMe(),
        api.getCourses(),
        api.getAchievements(),
        api.getCenterInfo(),
      ]);
      setUser(me);
      setCourses(courseList);
      setAchievements(achievementList);
      setCenterInfo(info);
      const lang = normalizeLang(me.language);
      setLanguageState(lang);
      writeCachedLang(lang);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const changeLanguage = useCallback(async (lang) => {
    setLanguageState(lang);
    writeCachedLang(lang);
    try {
      const updated = await api.setLanguage(lang);
      setUser(updated);
    } catch {
      // internetsiz bo'lsa ham interfeys darhol o'zgaradi, keyinroq qayta urinadi
    }
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const t = useCallback((key, params) => translate(language, key, params), [language]);

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      user,
      courses,
      achievements,
      centerInfo,
      loading,
      error,
      reload: loadAll,
      toast,
      showToast,
      clearToast: () => setToast(null),
      t,
    }),
    [language, changeLanguage, user, courses, achievements, centerInfo, loading, error, loadAll, toast, showToast, t]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp faqat AppProvider ichida ishlatiladi');
  return ctx;
}
