import { useState } from 'react';
import { Clipboard, Package, Trash2, Wand2 } from 'lucide-react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [toast, setToast] = useState('');

  const parseInput = () => JSON.parse(input);

  const format = () => {
    try {
      setOutput(JSON.stringify(parseInput(), null, indent));
      setError('');
    } catch (err) {
      setError(err.message);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      setOutput(JSON.stringify(parseInput()));
      setError('');
    } catch (err) {
      setError(err.message);
      setOutput('');
    }
  };

  const validate = () => {
    try {
      parseInput();
      setToast('Valid JSON.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setToast('Copied to clipboard.');
  };

  return (
    <div className="tool-page" style={{ maxWidth: 1000 }}>
      <div className="tool-page-header">
        <h1><span className="icon">{'{ }'}</span> JSON Formatter</h1>
        <p>Beautify, minify, and validate JSON data with instant feedback.</p>
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
            onChange={(event) => { setInput(event.target.value); setError(''); setOutput(''); }}
            aria-label="JSON input"
            spellCheck={false}
          />

          {error && (
            <div style={{ color: 'var(--error)', fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="label" style={{ margin: 0 }}>Indent:</span>
            {[2, 4].map((size) => (
              <button key={size} type="button" className={`toggle-btn ${indent === size ? 'active' : ''}`} onClick={() => setIndent(size)} style={{ padding: '4px 12px' }}>
                {size} spaces
              </button>
            ))}
          </div>

          <div className="copy-btn-row">
            <button className="btn btn-primary" onClick={format} disabled={!input}><Wand2 size={16} /> Beautify</button>
            <button className="btn btn-secondary" onClick={minify} disabled={!input}><Package size={16} /> Minify</button>
            <button className="btn btn-secondary" onClick={validate} disabled={!input}>Validate</button>
            <button className="btn btn-danger" onClick={() => { setInput(''); setOutput(''); setError(''); }} disabled={!input}><Trash2 size={16} /> Clear</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="label">Output</span>
          <div id="json-output" className="result-box" style={{ minHeight: 320, flex: 1 }} aria-live="polite">
            {output || <span style={{ color: 'var(--text-muted)' }}>Formatted JSON will appear here...</span>}
          </div>
          <button className="btn btn-primary" onClick={copy} disabled={!output}>
            <Clipboard size={16} /> Copy Output
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
