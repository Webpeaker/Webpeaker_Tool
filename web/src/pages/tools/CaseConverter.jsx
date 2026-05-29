import { useState } from 'react';

const cases = [
  { id: 'upper', label: 'UPPER CASE', fn: (t) => t.toUpperCase() },
  { id: 'lower', label: 'lower case', fn: (t) => t.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: (t) => t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
  { id: 'sentence', label: 'Sentence case', fn: (t) => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()) },
  { id: 'camel', label: 'camelCase', fn: (t) => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
  { id: 'pascal', label: 'PascalCase', fn: (t) => t.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (c) => c.toUpperCase()) },
  { id: 'snake', label: 'snake_case', fn: (t) => t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') },
  { id: 'kebab', label: 'kebab-case', fn: (t) => t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') },
  { id: 'constant', label: 'CONSTANT_CASE', fn: (t) => t.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_') },
];

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function CaseConverter() {
  const [input, setInput] = useState('');
  const [active, setActive] = useState('upper');
  const [toast, setToast] = useState('');

  const selected = cases.find((c) => c.id === active);
  const output = input ? selected.fn(input) : '';

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setToast('Copied!');
  };

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1><span className="icon">🔡</span> Case Converter</h1>
        <p>Convert text to any case format instantly.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <textarea
          id="case-input"
          className="input"
          placeholder="Type or paste your text here…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Input text"
        />

        <div>
          <span className="label">Select Case Format</span>
          <div className="toggle-group">
            {cases.map((c) => (
              <button
                key={c.id}
                className={`toggle-btn ${active === c.id ? 'active' : ''}`}
                onClick={() => setActive(c.id)}
                aria-pressed={active === c.id}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Result</span>
          <div id="case-output" className="result-box" aria-live="polite">{output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here…</span>}</div>
        </div>

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={copy} disabled={!output}>
            📋 Copy Result
          </button>
          <button className="btn btn-danger" onClick={() => setInput('')} disabled={!input}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
