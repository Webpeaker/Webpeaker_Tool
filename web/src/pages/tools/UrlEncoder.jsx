import { useState } from 'react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [toast, setToast] = useState('');

  const process = () => {
    try {
      setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
    } catch {
      setOutput('Invalid input');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setToast('Copied!');
  };

  return (
    <div className="tool-page" style={{ maxWidth: 1000 }}>
      <div className="tool-page-header">
        <h1><span className="icon">🔗</span> URL Encoder / Decoder</h1>
        <p>Encode or decode URLs and query string parameters safely.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <div className="toggle-group" style={{ width: 'fit-content' }}>
          <button className={`toggle-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { setMode('encode'); setOutput(''); }}>
            🔗 Encode
          </button>
          <button className={`toggle-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { setMode('decode'); setOutput(''); }}>
            🔀 Decode
          </button>
        </div>

        <div className="tool-grid two-col" style={{ gap: 16 }}>
          <div>
            <span className="label">{mode === 'encode' ? 'Raw URL / Text' : 'Encoded URL'}</span>
            <textarea
              id="url-input"
              className="input"
              style={{ minHeight: 180 }}
              placeholder={mode === 'encode' ? 'https://example.com/path?q=hello world&foo=bar' : 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world'}
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(''); }}
              spellCheck={false}
            />
          </div>
          <div>
            <span className="label">{mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}</span>
            <div id="url-output" className="result-box" style={{ minHeight: 180 }}>
              {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here…</span>}
            </div>
          </div>
        </div>

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={process} disabled={!input}>
            {mode === 'encode' ? '🔗 Encode' : '🔀 Decode'}
          </button>
          <button className="btn btn-secondary" onClick={copy} disabled={!output}>
            📋 Copy Output
          </button>
          <button className="btn btn-danger" onClick={() => { setInput(''); setOutput(''); }} disabled={!input}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
