import { useState } from 'react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('encode');
  const [toast, setToast] = useState('');

  const process = () => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch {
      setError('Invalid input for ' + (mode === 'decode' ? 'Base64 decoding' : 'encoding'));
      setOutput('');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setToast('Copied!');
  };

  return (
    <div className="tool-page" style={{ maxWidth: 1000 }}>
      <div className="tool-page-header">
        <h1><span className="icon">🔐</span> Base64 Tool</h1>
        <p>Encode and decode text to and from Base64 format.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <div className="toggle-group" style={{ width: 'fit-content' }}>
          <button className={`toggle-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { setMode('encode'); setOutput(''); setError(''); }}>
            🔒 Encode
          </button>
          <button className={`toggle-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { setMode('decode'); setOutput(''); setError(''); }}>
            🔓 Decode
          </button>
        </div>

        <div className="tool-grid two-col" style={{ gap: 16 }}>
          <div>
            <span className="label">{mode === 'encode' ? 'Plain Text' : 'Base64 Input'}</span>
            <textarea
              id="base64-input"
              className="input"
              style={{ minHeight: 200 }}
              placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Enter Base64 to decode…'}
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(''); setError(''); }}
              spellCheck={false}
            />
          </div>
          <div>
            <span className="label">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</span>
            <div id="base64-output" className="result-box" style={{ minHeight: 200 }}>
              {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here…</span>}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--error)', fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
            ❌ {error}
          </div>
        )}

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={process} disabled={!input}>
            {mode === 'encode' ? '🔒 Encode' : '🔓 Decode'}
          </button>
          <button className="btn btn-secondary" onClick={copy} disabled={!output}>
            📋 Copy Output
          </button>
          <button className="btn btn-danger" onClick={() => { setInput(''); setOutput(''); setError(''); }} disabled={!input}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
