import { useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { useAdmin } from '../context/AdminContext';
import { ConfirmDialog } from '../components/Modal';
import { MegaphoneIcon } from '../components/Icons';

function formatDate(iso) {
  return new Date(iso).toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Broadcast() {
  const { showToast } = useAdmin();
  const [text, setText] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      setHistory(await adminApi.getBroadcastHistory());
    } catch {
      // tarixni yuklab bo'lmasa sokin o'tkazib yuboramiz
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSend() {
    setSending(true);
    try {
      const result = await adminApi.sendBroadcast(text);
      showToast(`Yuborildi: ${result.sentCount}/${result.total}`);
      setText('');
      setConfirming(false);
      loadHistory();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header__title">Xabar yuborish</div>
          <div className="page-header__subtitle">Barcha bot foydalanuvchilariga bir vaqtning o'zida xabar yuborish</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="field">
          <label className="field__label">Xabar matni</label>
          <textarea
            className="input"
            style={{ width: '100%', minHeight: 120 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Masalan: Assalomu alaykum! Yangi CEFR guruhimiz ochildi..."
          />
        </div>
        <button type="button" className="btn btn-primary" disabled={!text.trim() || sending} onClick={() => setConfirming(true)}>
          <MegaphoneIcon width={16} height={16} /> Yuborish
        </button>
      </div>

      <div className="card-title">Yuborilgan xabarlar tarixi</div>
      <div className="table-wrap">
        {history.length === 0 ? (
          <div className="table-empty">Hozircha xabar yuborilmagan</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Matn</th>
                <th>Yetdi</th>
                <th>Xato</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td style={{ maxWidth: 340, whiteSpace: 'normal' }}>{h.text}</td>
                  <td>{h.sentCount}</td>
                  <td>{h.failCount}</td>
                  <td className="muted">{formatDate(h.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirming && (
        <ConfirmDialog
          title="Xabarni yuborish"
          message="Bu xabar botdan foydalanadigan BARCHA foydalanuvchilarga yuboriladi. Davom etasizmi?"
          confirmLabel={sending ? 'Yuborilmoqda...' : 'Ha, yuborish'}
          onCancel={() => setConfirming(false)}
          onConfirm={handleSend}
        />
      )}
    </div>
  );
}
