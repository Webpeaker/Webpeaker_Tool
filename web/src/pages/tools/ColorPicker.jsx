import { useState, useCallback } from 'react';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function Toast({ msg, onDone }) {
  return <div className="toast" onAnimationEnd={onDone}>{msg}</div>;
}

export default function ColorPicker() {
  const [color, setColor] = useState('#7c3aed');
  const [toast, setToast] = useState('');

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const copy = useCallback((val) => {
    navigator.clipboard.writeText(val);
    setToast(`Copied: ${val}`);
  }, []);

  const formats = [
    { label: 'HEX', value: color.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
  ];

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1><span className="icon">🎨</span> Color Picker</h1>
        <p>Pick a color and convert between HEX, RGB, HSL formats instantly.</p>
      </div>

      <div className="tool-grid" style={{ gap: 24 }}>
        {/* Swatch + picker */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div
            className="color-swatch"
            style={{ background: color, flex: '1 1 200px', maxWidth: 320 }}
            aria-label={`Color preview: ${color}`}
          />
          <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="label">Pick Color</span>
            <input
              id="color-picker-input"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Color picker"
              style={{ width: 80, height: 80, borderRadius: 'var(--radius)', cursor: 'pointer', border: '2px solid var(--border-card)' }}
            />
            <span className="label" style={{ marginBottom: 4 }}>Or enter HEX</span>
            <input
              type="text"
              className="input"
              value={color}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setColor(v);
              }}
              maxLength={7}
              aria-label="Hex color input"
              style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}
            />
          </div>
        </div>

        {/* Color values grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {formats.map((f) => (
            <div key={f.label} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="label" style={{ margin: 0 }}>{f.label}</span>
              <code style={{ fontSize: 14, color: 'var(--accent-light)', fontFamily: 'monospace' }}>{f.value}</code>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12, marginTop: 'auto' }} onClick={() => copy(f.value)}>
                📋 Copy
              </button>
            </div>
          ))}
        </div>

        {/* RGB sliders */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ marginBottom: 4 }}>RGB Sliders</h3>
          {['r', 'g', 'b'].map((ch, i) => {
            const labels = ['Red', 'Green', 'Blue'];
            const colors = ['#ef4444', '#10b981', '#3b82f6'];
            return (
              <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 44, fontSize: 13, color: colors[i], fontWeight: 600 }}>{labels[i]}</span>
                <input
                  type="range"
                  min={0} max={255}
                  value={rgb[ch]}
                  onChange={(e) => {
                    const newRgb = { ...rgb, [ch]: Number(e.target.value) };
                    const hex = '#' + [newRgb.r, newRgb.g, newRgb.b].map((v) => v.toString(16).padStart(2, '0')).join('');
                    setColor(hex);
                  }}
                  aria-label={`${labels[i]} channel`}
                  style={{ '--track-color': colors[i] }}
                />
                <span style={{ width: 36, fontSize: 13, textAlign: 'right', color: 'var(--text-head)', fontWeight: 600 }}>{rgb[ch]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
