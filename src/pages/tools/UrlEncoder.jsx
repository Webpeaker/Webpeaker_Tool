import { useState } from 'react';
import { Clipboard, Link, Shuffle, Trash2 } from 'lucide-react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('encode');
  const [toast, setToast] = useState('');

  const process = () => {
    setError('');
    try {
      setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
    } catch {
      setError('Invalid URL encoded input.');
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
        <h1>URL Encode / Decode</h1>
        <p>Encode unsafe URL characters or decode percent-encoded strings.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <div className="toggle-group" style={{ width: 'fit-content' }}>
          <button type="button" className={`toggle-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { setMode('encode'); setOutput(''); setError(''); }}>
            <Link size={16} /> Encode
          </button>
          <button type="button" className={`toggle-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { setMode('decode'); setOutput(''); setError(''); }}>
            <Shuffle size={16} /> Decode
          </button>
        </div>

        <div className="tool-grid two-col" style={{ gap: 16 }}>
          <div>
            <span className="label">{mode === 'encode' ? 'Raw URL / Text' : 'Encoded URL'}</span>
            <textarea
              id="url-input"
              className="input"
              style={{ minHeight: 180 }}
              placeholder={mode === 'encode' ? 'https://example.com/path?q=hello world' : 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world'}
              value={input}
              onChange={(event) => { setInput(event.target.value); setOutput(''); setError(''); }}
              spellCheck={false}
            />
          </div>
          <div>
            <span className="label">{mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}</span>
            <div id="url-output" className="result-box" style={{ minHeight: 180 }}>
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
            {mode === 'encode' ? <Link size={16} /> : <Shuffle size={16} />}
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
