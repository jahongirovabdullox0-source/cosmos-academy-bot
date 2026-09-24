import { useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { CheckCircleIcon, AlertIcon } from './Icons';

export function Toast() {
  const { toast, clearToast } = useAdmin();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(clearToast, 3000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className={`toast ${toast.type === 'error' ? 'toast--error' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {toast.type === 'error' ? <AlertIcon width={18} height={18} /> : <CheckCircleIcon width={18} height={18} />}
      {toast.message}
    </div>
  );
}
