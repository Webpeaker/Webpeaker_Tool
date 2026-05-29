import { useMemo, useState } from 'react';
import { Clipboard, Trash2 } from 'lucide-react';

const toSlug = (text) =>
  text.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const toTitle = (text) => text.toLowerCase().replace(/\b[\p{L}\p{N}]/gu, (char) => char.toUpperCase());
const toSentence = (text) => text.toLowerCase().replace(/(^\s*[\p{L}\p{N}]|[.!?]\s*[\p{L}\p{N}])/gu, (char) => char.toUpperCase());
const toCamel = (text) => toSlug(text).replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
const toPascal = (text) => {
  const camel = toCamel(text);
  return camel ? camel[0].toUpperCase() + camel.slice(1) : '';
};

const cases = [
  { id: 'upper', label: 'UPPER CASE', fn: (text) => text.toUpperCase() },
  { id: 'lower', label: 'lower case', fn: (text) => text.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: toTitle },
  { id: 'sentence', label: 'Sentence case', fn: toSentence },
  { id: 'camel', label: 'camelCase', fn: toCamel },
  { id: 'pascal', label: 'PascalCase', fn: toPascal },
  { id: 'snake', label: 'snake_case', fn: (text) => toSlug(text).replace(/-/g, '_') },
  { id: 'kebab', label: 'kebab-case', fn: toSlug },
  { id: 'constant', label: 'CONSTANT_CASE', fn: (text) => toSlug(text).replace(/-/g, '_').toUpperCase() },
];

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function CaseConverter() {
  const [input, setInput] = useState('');
  const [active, setActive] = useState('upper');
  const [toast, setToast] = useState('');

  const selected = cases.find((item) => item.id === active) || cases[0];
  const output = useMemo(() => (input ? selected.fn(input) : ''), [input, selected]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setToast('Copied to clipboard.');
  };

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Case Converter</h1>
        <p>Convert text to common writing and code case formats instantly.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <textarea
          id="case-input"
          className="input"
          style={{ minHeight: 180 }}
          placeholder="Type or paste your text here..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="Input text"
        />

        <div>
          <span className="label">Case Format</span>
          <div className="toggle-group">
            {cases.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`toggle-btn ${active === item.id ? 'active' : ''}`}
                onClick={() => setActive(item.id)}
                aria-pressed={active === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Result</span>
          <div id="case-output" className="result-box" aria-live="polite">
            {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here...</span>}
          </div>
        </div>

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={copy} disabled={!output}>
            <Clipboard size={16} /> Copy Result
          </button>
          <button className="btn btn-danger" onClick={() => setInput('')} disabled={!input}>
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
