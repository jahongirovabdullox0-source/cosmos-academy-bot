import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircleIcon, AlertIcon } from './Icons';

export function Toast() {
  const { toast, clearToast } = useApp();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(clearToast, 2600);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className={`toast ${toast.type === 'error' ? 'toast--error' : ''}`}>
      {toast.type === 'error' ? <AlertIcon width={18} height={18} /> : <CheckCircleIcon width={18} height={18} />}
      <span>{toast.message}</span>
    </div>
  );
}
