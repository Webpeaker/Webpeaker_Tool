import { useState } from 'react';
import { Clipboard, Lock, Trash2, Unlock } from 'lucide-react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

const encodeBase64 = (value) => btoa(String.fromCharCode(...new TextEncoder().encode(value)));
const decodeBase64 = (value) => new TextDecoder().decode(Uint8Array.from(atob(value.trim()), (char) => char.charCodeAt(0)));

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('encode');
  const [toast, setToast] = useState('');

  const process = () => {
    setError('');
    try {
      setOutput(mode === 'encode' ? encodeBase64(input) : decodeBase64(input));
    } catch {
      setError(mode === 'decode' ? 'Invalid Base64 input.' : 'Could not encode that text.');
      setOutput('');
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setToast('Copied to clipboard.');
  };

  return (
    <div className="tool-page" style={{ maxWidth: 1000 }}>
      <div className="tool-page-header">
        <h1>Base64 Encode / Decode</h1>
        <p>Encode text to Base64 or decode Base64 back to readable text.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <div className="toggle-group" style={{ width: 'fit-content' }}>
          <button type="button" className={`toggle-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { setMode('encode'); setOutput(''); setError(''); }}>
            <Lock size={16} /> Encode
          </button>
          <button type="button" className={`toggle-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { setMode('decode'); setOutput(''); setError(''); }}>
            <Unlock size={16} /> Decode
          </button>
        </div>

        <div className="tool-grid two-col" style={{ gap: 16 }}>
          <div>
            <span className="label">{mode === 'encode' ? 'Plain Text' : 'Base64 Input'}</span>
            <textarea
              id="base64-input"
              className="input"
              style={{ minHeight: 200 }}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
              value={input}
              onChange={(event) => { setInput(event.target.value); setOutput(''); setError(''); }}
              spellCheck={false}
            />
          </div>
          <div>
            <span className="label">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</span>
            <div id="base64-output" className="result-box" style={{ minHeight: 200 }}>
              {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here...</span>}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--error)', fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={process} disabled={!input}>
            {mode === 'encode' ? <Lock size={16} /> : <Unlock size={16} />}
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          <button className="btn btn-secondary" onClick={copy} disabled={!output}>
            <Clipboard size={16} /> Copy Output
          </button>
          <button className="btn btn-danger" onClick={() => { setInput(''); setOutput(''); setError(''); }} disabled={!input}>
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
