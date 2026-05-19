import { useState } from 'react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [toast, setToast] = useState('');

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setToast('Copied!');
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setToast('✅ Valid JSON!');
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: 1000 }}>
      <div className="tool-page-header">
        <h1><span className="icon">{'{ }'}</span> JSON Formatter</h1>
        <p>Beautify, minify and validate JSON data with instant feedback.</p>
      </div>

      <div className="tool-grid two-col" style={{ gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="label">Input JSON</span>
          <textarea
            id="json-input"
            className="input"
            style={{ minHeight: 320 }}
            placeholder='{"key": "value", "array": [1, 2, 3]}'
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); setOutput(''); }}
            aria-label="JSON input"
            spellCheck={false}
          />
          {error && (
            <div style={{ color: 'var(--error)', fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
              ❌ {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="label" style={{ margin: 0 }}>Indent:</span>
            {[2, 4].map((n) => (
              <button key={n} className={`toggle-btn ${indent === n ? 'active' : ''}`} onClick={() => setIndent(n)} style={{ padding: '4px 12px' }}>
                {n} spaces
              </button>
            ))}
          </div>
          <div className="copy-btn-row">
            <button className="btn btn-primary" onClick={format} disabled={!input}>⚙️ Beautify</button>
            <button className="btn btn-secondary" onClick={minify} disabled={!input}>📦 Minify</button>
            <button className="btn btn-secondary" onClick={validate} disabled={!input}>✅ Validate</button>
            <button className="btn btn-danger" onClick={() => { setInput(''); setOutput(''); setError(''); }} disabled={!input}>🗑️ Clear</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="label">Output</span>
          <div
            id="json-output"
            className="result-box"
            style={{ minHeight: 320, flex: 1 }}
            aria-live="polite"
          >
            {output || <span style={{ color: 'var(--text-muted)' }}>Formatted JSON will appear here…</span>}
          </div>
          <button className="btn btn-primary" onClick={copy} disabled={!output}>
            📋 Copy Output
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
