import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export function Login() {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src="/logo.jpg" alt="Cosmos Academy" className="login-card__logo" />
        <div className="login-card__title">Cosmos Academy</div>
        <div className="login-card__subtitle">Admin panelga kirish</div>
        <div className="field" style={{ textAlign: 'left' }}>
          <label className="field__label" htmlFor="password">
            Parol
          </label>
          <input
            id="password"
            type="password"
            className="input"
            style={{ width: '100%' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error && (
          <div className="field__hint" style={{ color: 'var(--ca-danger)', marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading || !password}>
          {loading ? 'Tekshirilmoqda...' : 'Kirish'}
        </button>
      </form>
    </div>
  );
}
