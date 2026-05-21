import { useMemo, useState } from 'react';
import { Clipboard, Trash2 } from 'lucide-react';

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const [toast, setToast] = useState('');

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.trim() ? text.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean).length : 0;
    const lines = text ? text.split(/\r?\n/).length : 0;
    const readTime = words ? Math.max(1, Math.ceil(words / 200)) : 0;

    return { words, characters, charactersNoSpaces, sentences, paragraphs, lines, readTime };
  }, [text]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setToast('Copied to clipboard.');
  };

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Word Counter</h1>
        <p>Count words, characters, sentences, paragraphs, and reading time in real time.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <textarea
          id="word-counter-input"
          className="input"
          style={{ minHeight: 260 }}
          placeholder="Start typing or paste your text here..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Text input"
        />

        <div className="stats-row">
          <div className="stat-chip"><span>Words</span><strong>{stats.words}</strong></div>
          <div className="stat-chip"><span>Characters</span><strong>{stats.characters}</strong></div>
          <div className="stat-chip"><span>No Spaces</span><strong>{stats.charactersNoSpaces}</strong></div>
          <div className="stat-chip"><span>Sentences</span><strong>{stats.sentences}</strong></div>
          <div className="stat-chip"><span>Paragraphs</span><strong>{stats.paragraphs}</strong></div>
          <div className="stat-chip"><span>Lines</span><strong>{stats.lines}</strong></div>
          <div className="stat-chip"><span>Read Time</span><strong>{stats.readTime}m</strong></div>
        </div>

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={copy} disabled={!text}>
            <Clipboard size={16} /> Copy Text
          </button>
          <button className="btn btn-danger" onClick={() => setText('')} disabled={!text}>
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
