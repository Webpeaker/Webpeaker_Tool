import { useState } from 'react';

const words = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut',
  'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum'
];

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function LoremIpsum() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');
  const [toast, setToast] = useState('');

  const generateWord = () => words[Math.floor(Math.random() * words.length)];

  const generateSentence = () => {
    const length = Math.floor(Math.random() * 10) + 5;
    let sentence = [];
    for (let i = 0; i < length; i++) {
      sentence.push(generateWord());
    }
    const result = sentence.join(' ');
    return result.charAt(0).toUpperCase() + result.slice(1) + '.';
  };

  const generateParagraph = () => {
    const length = Math.floor(Math.random() * 5) + 3;
    let paragraph = [];
    for (let i = 0; i < length; i++) {
      paragraph.push(generateSentence());
    }
    return paragraph.join(' ');
  };

  const generate = () => {
    let result = [];
    for (let i = 0; i < count; i++) {
      if (type === 'words') {
        result.push(generateWord());
      } else if (type === 'sentences') {
        result.push(generateSentence());
      } else {
        result.push(generateParagraph());
      }
    }
    setOutput(result.join(type === 'paragraphs' ? '\n\n' : ' '));
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setToast('Copied!');
  };

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1><span className="icon">📄</span> Lorem Ipsum Generator</h1>
        <p>Generate placeholder text by words, sentences or paragraphs.</p>
      </div>

      <div className="tool-grid" style={{ gap: 20 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <span className="label">Generate</span>
            <div className="toggle-group">
              <button className={`toggle-btn ${type === 'words' ? 'active' : ''}`} onClick={() => setType('words')}>Words</button>
              <button className={`toggle-btn ${type === 'sentences' ? 'active' : ''}`} onClick={() => setType('sentences')}>Sentences</button>
              <button className={`toggle-btn ${type === 'paragraphs' ? 'active' : ''}`} onClick={() => setType('paragraphs')}>Paragraphs</button>
            </div>
          </div>
          <div>
            <span className="label">Count</span>
            <input
              type="number"
              className="input"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 100 }}
              min="1"
            />
          </div>
          <button className="btn btn-primary" onClick={generate} style={{ marginTop: 22 }}>
            ⚡ Generate
          </button>
        </div>

        <div>
          <span className="label">Output</span>
          <div className="result-box" style={{ minHeight: 240, whiteSpace: 'pre-wrap' }}>
            {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here…</span>}
          </div>
        </div>

        <div className="copy-btn-row">
          <button className="btn btn-primary" onClick={copy} disabled={!output}>
            📋 Copy Text
          </button>
          <button className="btn btn-danger" onClick={() => setOutput('')} disabled={!output}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
