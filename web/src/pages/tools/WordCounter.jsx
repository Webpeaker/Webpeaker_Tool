import { useState } from 'react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const [toast, setToast] = useState('');

  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.trim() === '' ? 0 : text.split(/\n+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  const copy = () => {
    navigator.clipboard.writeText(text);
    setToast('Copied to clipboard!');
  };
  const clear = () => setText('');

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1><span className="icon">📝</span> Word Counter</h1>
        <p>Count words, characters, sentences and paragraphs in real time.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <textarea
          id="word-counter-input"
          className="input"
          style={{ minHeight: 240 }}
          placeholder="Start typing or paste your text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Text input"
        />

        <div className="stats-row">
          <div className="stat-chip">
            <span>Words</span>
            <strong>{words}</strong>
          </div>
          <div className="stat-chip">
            <span>Characters</span>
            <strong>{chars}</strong>
          </div>
          <div className="stat-chip">
            <span>No Spaces</span>
            <strong>{charsNoSpace}</strong>
          </div>
          <div className="stat-chip">
            <span>Sentences</span>
            <strong>{sentences}</strong>
          </div>
          <div className="stat-chip">
            <span>Paragraphs</span>
            <strong>{paragraphs}</strong>
          </div>
          <div className="stat-chip">
            <span>Read Time</span>
            <strong>{readTime}m</strong>
          </div>
        </div>

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={copy} disabled={!text}>
            📋 Copy Text
          </button>
          <button className="btn btn-danger" onClick={clear} disabled={!text}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
