import { useMemo, useState } from 'react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

function buildPassword(length, uppercase, lowercase, numbers, symbols) {
  let charset = '';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  if (!charset) return '';

  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return pass;
}

export default function PasswordGen() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setUppercase_lower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState('');

  const password = useMemo(
    () => buildPassword(length, uppercase, lowercase, numbers, symbols),
    // refreshKey intentionally asks for a fresh random password with the same options.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [length, uppercase, lowercase, numbers, symbols, refreshKey],
  );

  const copy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setToast('Copied!');
  };

  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 8) score += 1;
    if (password.length > 12) score += 1;
    if (password.length >= 16) score += 1;
    if (uppercase) score += 1;
    if (lowercase) score += 1;
    if (numbers) score += 1;
    if (symbols) score += 2;
    return Math.min(100, (score / 8) * 100);
  };

  const strength = getStrength();
  let strengthColor = 'var(--error)';
  if (strength > 40) strengthColor = 'var(--warning)';
  if (strength > 75) strengthColor = 'var(--success)';

  return (
    <div className="tool-page" style={{ maxWidth: 800 }}>
      <div className="tool-page-header">
        <h1><span className="icon">🔑</span> Password Generator</h1>
        <p>Generate strong, secure, random passwords with custom rules.</p>
      </div>

      <div className="tool-grid" style={{ gap: 24 }}>
        <div>
          <div className="result-box" style={{ fontSize: 24, textAlign: 'center', letterSpacing: 2, padding: '24px 16px' }}>
            {password || <span style={{ color: 'var(--text-muted)' }}>Select options to generate</span>}
          </div>
          <div className="strength-bar">
            <div className="strength-fill" style={{ width: `${strength}%`, background: strengthColor }} />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="label" style={{ margin: 0 }}>Password Length</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-light)' }}>{length}</span>
            </div>
            <input
              type="range"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label className="checkbox-row">
              <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
              Uppercase (A-Z)
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={lowercase} onChange={(e) => setUppercase_lower(e.target.checked)} />
              Lowercase (a-z)
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} />
              Numbers (0-9)
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
              Symbols (!@#$)
            </label>
          </div>
        </div>

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={copy} disabled={!password}>
            📋 Copy Password
          </button>
          <button className="btn btn-secondary" onClick={() => setRefreshKey((key) => key + 1)}>
            🔄 Generate New
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
