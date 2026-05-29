import { useState } from 'react';
import { Clipboard, Trash2 } from 'lucide-react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function TextFormatter() {
  const [text, setText] = useState('');
  const [toast, setToast] = useState('');

  const transform = (type) => {
    const lines = text.split(/\r?\n/);
    if (type === 'uppercase') setText(text.toUpperCase());
    if (type === 'lowercase') setText(text.toLowerCase());
    if (type === 'remove-spaces') setText(text.replace(/\s+/g, ''));
    if (type === 'trim') setText(text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim());
    if (type === 'dedupe') {
      const cleanLines = lines.map((line) => line.trim()).filter(Boolean);
      setText(cleanLines.length > 1 ? [...new Set(cleanLines)].join('\n') : [...new Set(text.trim().split(/\s+/).filter(Boolean))].join(' '));
    }
    if (type === 'sort') setText(lines.filter(Boolean).sort((a, b) => a.localeCompare(b)).join('\n'));
    if (type === 'reverse') setText([...text].reverse().join(''));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setToast('Copied to clipboard.');
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Text Formatter</h1>
        <p>Clean, sort, deduplicate, and transform text in one workspace.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <div className="toggle-group">
          <button type="button" onClick={() => transform('uppercase')} className="toggle-btn">Uppercase</button>
          <button type="button" onClick={() => transform('lowercase')} className="toggle-btn">Lowercase</button>
          <button type="button" onClick={() => transform('remove-spaces')} className="toggle-btn">Remove Spaces</button>
          <button type="button" onClick={() => transform('trim')} className="toggle-btn">Clean Spaces</button>
          <button type="button" onClick={() => transform('dedupe')} className="toggle-btn">Remove Duplicates</button>
          <button type="button" onClick={() => transform('sort')} className="toggle-btn">Sort Lines</button>
          <button type="button" onClick={() => transform('reverse')} className="toggle-btn">Reverse</button>
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste your text here..."
          className="input"
          style={{ minHeight: 260 }}
        />

        <div className="copy-btn-row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="label" style={{ margin: 0 }}>
            {text.length} characters · {words} words · {text ? text.split(/\r?\n/).length : 0} lines
          </span>
          <span className="copy-btn-row">
            <button className="btn btn-primary" onClick={copy} disabled={!text}>
              <Clipboard size={16} /> Copy Text
            </button>
            <button className="btn btn-danger" onClick={() => setText('')} disabled={!text}>
              <Trash2 size={16} /> Clear
            </button>
          </span>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
