import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clipboard,
  Copy,
  Download,
  FileUp,
  Play,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { allTools } from '../../data/tools';

const sampleJson = '{"name":"WebPeaker","tools":["JSON","CSV","URL"],"active":true}';

const toTitleCase = (text) =>
  text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const toSlug = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toCamel = (text) =>
  toSlug(text).replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());

const toPascal = (text) => {
  const camel = toCamel(text);
  return camel ? camel[0].toUpperCase() + camel.slice(1) : '';
};

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const decodeHtml = (text) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const unicodeBase64Encode = (text) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)));

const unicodeBase64Decode = (text) =>
  new TextDecoder().decode(Uint8Array.from(atob(text), (char) => char.charCodeAt(0)));

const textToBinary = (text) =>
  Array.from(new TextEncoder().encode(text))
    .map((num) => num.toString(2).padStart(8, '0'))
    .join(' ');

const binaryToText = (text) =>
  new TextDecoder().decode(
    Uint8Array.from(
      text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((chunk) => parseInt(chunk, 2)),
    ),
  );

const jsonToCsv = (value) => {
  const parsed = JSON.parse(value);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escapeCell = (cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((key) => escapeCell(row[key])).join(','))].join('\n');
};

const csvToJson = (value) => {
  const [headerLine, ...lines] = value.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((item) => item.trim());
  return JSON.stringify(
    lines.map((line) => {
      const cells = line.split(',').map((item) => item.trim().replace(/^"|"$/g, ''));
      return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
    }),
    null,
    2,
  );
};

const randomFrom = (chars, length) =>
  Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((num) => chars[num % chars.length])
    .join('');

const makePassword = (length = 18) =>
  randomFrom('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*', length);

const makeFakeData = () => {
  const names = ['Aarav Sharma', 'Mira Patel', 'Rohan Gupta', 'Isha Verma', 'Kabir Singh'];
  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune'];
  return JSON.stringify(
    Array.from({ length: 5 }, (_, index) => ({
      id: crypto.randomUUID(),
      name: names[index],
      email: names[index].toLowerCase().replace(/\s+/g, '.') + '@example.com',
      city: cities[index],
    })),
    null,
    2,
  );
};

const parseNumbers = (value) => value.split(/[,\s]+/).map(Number).filter((num) => !Number.isNaN(num));

const calculateMath = (value, toolName) => {
  const lower = toolName.toLowerCase();
  const nums = parseNumbers(value);

  if (lower.includes('percentage')) {
    const [part = 0, whole = 100] = nums;
    return `${part} is ${whole ? ((part / whole) * 100).toFixed(2) : 0}% of ${whole}`;
  }

  if (lower.includes('bmi')) {
    const [kg = 70, cm = 170] = nums;
    const meters = cm / 100;
    return `BMI: ${(kg / (meters * meters)).toFixed(2)}\nWeight: ${kg} kg\nHeight: ${cm} cm`;
  }

  if (lower.includes('loan')) {
    const [principal = 100000, annualRate = 10, months = 12] = nums;
    const rate = annualRate / 100 / 12;
    const emi = rate ? (principal * rate * (1 + rate) ** months) / ((1 + rate) ** months - 1) : principal / months;
    return `Monthly payment: ${emi.toFixed(2)}\nTotal payment: ${(emi * months).toFixed(2)}\nTotal interest: ${(emi * months - principal).toFixed(2)}`;
  }

  const sum = nums.reduce((total, num) => total + num, 0);
  return [
    `Count: ${nums.length}`,
    `Sum: ${sum}`,
    `Average: ${nums.length ? sum / nums.length : 0}`,
    `Min: ${nums.length ? Math.min(...nums) : 0}`,
    `Max: ${nums.length ? Math.max(...nums) : 0}`,
  ].join('\n');
};

const convertUnit = (value) => {
  const [amount = 1] = parseNumbers(value);
  return [
    `${amount} meters = ${amount * 100} centimeters`,
    `${amount} kilometers = ${(amount * 0.621371).toFixed(4)} miles`,
    `${amount} kilograms = ${(amount * 2.20462).toFixed(4)} pounds`,
    `${amount} Celsius = ${((amount * 9) / 5 + 32).toFixed(2)} Fahrenheit`,
  ].join('\n');
};

const convertData = (value, toolName) => {
  const lower = toolName.toLowerCase();
  if (lower.includes('json') && lower.includes('csv')) return jsonToCsv(value || '[{"name":"WebPeaker","type":"tool"}]');
  if (lower.includes('csv')) return csvToJson(value || 'name,type\nWebPeaker,tool');
  if (lower.includes('xml')) {
    const parsed = JSON.parse(value || '{"name":"WebPeaker","type":"tool"}');
    return Object.entries(parsed).map(([key, val]) => `<${key}>${escapeHtml(String(val))}</${key}>`).join('\n');
  }
  if (lower.includes('yaml')) {
    const parsed = JSON.parse(value || '{"name":"WebPeaker","type":"tool"}');
    return Object.entries(parsed).map(([key, val]) => `${key}: ${val}`).join('\n');
  }
  return JSON.stringify(JSON.parse(value || sampleJson), null, 2);
};

const generateRandomValue = (toolName, countValue) => {
  const lower = toolName.toLowerCase();
  const count = Math.min(Number(countValue) || 5, 100);
  if (lower.includes('name')) return ['Aarav Sharma', 'Mira Patel', 'Rohan Gupta', 'Isha Verma', 'Kabir Singh'].slice(0, count).join('\n');
  if (lower.includes('password')) return Array.from({ length: count }, () => makePassword(18)).join('\n');
  if (lower.includes('number')) return Array.from({ length: count }, () => Math.floor(Math.random() * 100000)).join('\n');
  if (lower.includes('uuid')) return Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
  if (lower.includes('hex')) return Array.from({ length: count }, () => randomFrom('0123456789abcdef', 16)).join('\n');
  if (lower.includes('api key')) return Array.from({ length: count }, () => `wp_${randomFrom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 32)}`).join('\n');
  if (lower.includes('license')) return Array.from({ length: count }, () => randomFrom('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5) + '-' + randomFrom('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5) + '-' + randomFrom('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5)).join('\n');
  if (lower.includes('fake')) return makeFakeData();
  return Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
};

const generateCss = (value, secondValue, toolName) => {
  const lower = toolName.toLowerCase();
  if (lower.includes('border radius')) return `border-radius: ${value || '12px'};`;
  if (lower.includes('shadow')) return `box-shadow: 0 18px 45px ${value || 'rgba(17, 24, 39, 0.18)'};`;
  if (lower.includes('gradient')) return `background: linear-gradient(135deg, ${value || '#6832E3'}, ${secondValue || '#14B8A6'});`;
  if (lower.includes('animation')) return '@keyframes fadeUp {\n  from { opacity: 0; transform: translateY(12px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n.element { animation: fadeUp 240ms ease both; }';
  if (lower.includes('clamp')) return `font-size: clamp(${value || '1rem'}, 2vw, ${secondValue || '2rem'});`;
  if (lower.includes('aspect')) return `aspect-ratio: ${value || '16 / 9'};`;
  if (lower.includes('filter')) return `filter: ${value || 'contrast(1.1) saturate(1.2)'};`;
  if (lower.includes('grid')) return 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\ngap: 16px;';
  if (lower.includes('flex')) return 'display: flex;\nalign-items: center;\njustify-content: center;\ngap: 16px;\nflex-wrap: wrap;';
  return `${value || '.element'} {\n  display: block;\n}`;
};

const generateSeo = (value, secondValue, toolName) => {
  const lower = toolName.toLowerCase();
  const title = value || 'WebPeaker page title';
  const description = secondValue || 'Fast browser tools for everyday web tasks.';
  if (lower.includes('robots')) return 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml';
  if (lower.includes('sitemap')) return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n</urlset>';
  if (lower.includes('keyword')) {
    const words = title.toLowerCase().match(/[a-z0-9]+/g) || [];
    const counts = words.reduce((acc, word) => ({ ...acc, [word]: (acc[word] || 0) + 1 }), {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([word, count]) => `${word}: ${count}`).join('\n');
  }
  return `<title>${escapeHtml(title)}</title>\n<meta name="description" content="${escapeHtml(description)}">\n<meta property="og:title" content="${escapeHtml(title)}">\n<meta property="og:description" content="${escapeHtml(description)}">\n<meta name="twitter:card" content="summary_large_image">`;
};

const securityTool = async (value, secondValue, toolName) => {
  const lower = toolName.toLowerCase();
  if (lower.includes('password')) return `Password: ${makePassword(Number(secondValue) || 18)}\nStrength: strong`;
  if (lower.includes('jwt')) {
    const [, payload] = value.split('.');
    return JSON.stringify(JSON.parse(unicodeBase64Decode(payload.replace(/-/g, '+').replace(/_/g, '/'))), null, 2);
  }
  if (lower.includes('token')) return randomFrom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', Number(secondValue) || 48);
  if (lower.includes('encrypt')) return unicodeBase64Encode(value);
  if (lower.includes('decrypt')) return unicodeBase64Decode(value);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const strengthLabel = (text) => {
  let score = 0;
  if (text.length >= 12) score += 1;
  if (/[a-z]/.test(text) && /[A-Z]/.test(text)) score += 1;
  if (/\d/.test(text)) score += 1;
  if (/[^a-zA-Z0-9]/.test(text)) score += 1;
  return ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][score];
};

const regexPatterns = [
  ['Email', String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`],
  ['URL', String.raw`https?:\/\/(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s]*)?`],
  ['Indian phone', String.raw`(?:\+91[-\s]?)?[6-9]\d{9}`],
  ['Date YYYY-MM-DD', String.raw`\d{4}-\d{2}-\d{2}`],
  ['UUID', String.raw`[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}`],
  ['Hex color', String.raw`#(?:[0-9a-fA-F]{3}){1,2}`],
  ['Number', String.raw`-?\d+(?:\.\d+)?`],
  ['Slug', String.raw`[a-z0-9]+(?:-[a-z0-9]+)*`],
];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const generateRegex = (description) => {
  const lower = description.toLowerCase();
  const found = regexPatterns.find(([label]) => lower.includes(label.toLowerCase().split(' ')[0]));

  if (found) {
    return `${found[0]}\n/${found[1]}/g`;
  }

  if (!description.trim()) {
    return regexPatterns.map(([label, pattern]) => `${label}: /${pattern}/g`).join('\n');
  }

  const pattern = escapeRegex(description.trim())
    .replace(/[A-Za-z]+/g, '[A-Za-z]+')
    .replace(/\d+/g, String.raw`\d+`)
    .replace(/\s+/g, String.raw`\s+`);

  return `Generated from sample\n/${pattern}/g`;
};

const normalizeRegex = (value) => {
  const trimmed = value.trim();
  const literal = trimmed.match(/^\/(.+)\/([a-z]*)$/i);
  return literal ? { pattern: literal[1], flags: literal[2] } : { pattern: trimmed, flags: 'g' };
};

const testRegex = (text, patternValue) => {
  if (!patternValue.trim()) return 'Add a regex pattern in the optional field, for example: /\\b\\w+@\\w+\\.com\\b/g';

  const { pattern, flags } = normalizeRegex(patternValue);
  const safeFlags = flags.includes('g') ? flags : `${flags}g`;
  const regex = new RegExp(pattern, safeFlags);
  const matches = [...text.matchAll(regex)];

  if (!matches.length) return 'No matches found.';

  return matches
    .map((match, index) => `${index + 1}. "${match[0]}" at index ${match.index}`)
    .join('\n');
};

const ensureUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Enter a URL or domain first.');
  return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
};

const analyzeUrl = (value) => {
  const url = ensureUrl(value);
  return JSON.stringify({
    href: url.href,
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    pathname: url.pathname,
    query: url.search,
    params: Object.fromEntries(url.searchParams.entries()),
    hash: url.hash,
  }, null, 2);
};

const checkWebsiteStatus = async (value) => {
  const url = ensureUrl(value);
  const started = performance.now();

  try {
    const response = await fetch(url.href, { method: 'GET', cache: 'no-store' });
    const elapsed = Math.round(performance.now() - started);
    return [
      `URL: ${url.href}`,
      `Status: ${response.status} ${response.statusText || ''}`.trim(),
      `OK: ${response.ok ? 'Yes' : 'No'}`,
      `Final URL: ${response.url}`,
      `Response time: ${elapsed} ms`,
      '',
      'Visible headers:',
      ...[...response.headers.entries()].map(([key, val]) => `${key}: ${val}`),
    ].join('\n');
  } catch (error) {
    return [
      `URL: ${url.href}`,
      'Status check could not be completed from this browser.',
      `Reason: ${error.message}`,
      '',
      'Many websites block browser-based cross-origin status/header checks with CORS.',
      'The URL format is valid, but a server-side checker is needed for blocked sites.',
    ].join('\n');
  }
};

const dnsLookup = async (value, recordType = 'A') => {
  const target = value.trim().replace(/^https?:\/\//i, '').split('/')[0];
  if (!target) throw new Error('Enter a domain first.');

  const type = recordType.trim().toUpperCase() || 'A';
  const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(target)}&type=${encodeURIComponent(type)}`);
  const data = await response.json();

  return JSON.stringify({
    domain: target,
    type,
    status: data.Status,
    answers: data.Answer?.map((item) => ({
      name: item.name,
      type: item.type,
      ttl: item.TTL,
      data: item.data,
    })) || [],
  }, null, 2);
};

const apiRequest = async (value, optionsValue) => {
  const url = ensureUrl(value);
  const options = optionsValue.trim()
    ? JSON.parse(optionsValue)
    : { method: 'GET' };
  const started = performance.now();
  const response = await fetch(url.href, {
    method: options.method || 'GET',
    headers: options.headers || undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  const elapsed = Math.round(performance.now() - started);

  return [
    `${response.status} ${response.statusText || ''}`.trim(),
    `Response time: ${elapsed} ms`,
    `Final URL: ${response.url}`,
    '',
    text,
  ].join('\n');
};

const inspectDomain = (value, toolName) => {
  const url = ensureUrl(value);
  const lower = toolName.toLowerCase();

  if (lower.includes('ssl')) {
    return [
      `Host: ${url.hostname}`,
      `Expected HTTPS port: ${url.port || 443}`,
      `Protocol entered: ${url.protocol}`,
      '',
      url.protocol === 'https:' ? 'HTTPS URL detected.' : 'This is not an HTTPS URL.',
      'Browsers do not expose full certificate details to JavaScript, so expiry/issuer checks need a server-side SSL checker.',
    ].join('\n');
  }

  if (lower.includes('whois')) {
    return [
      `Domain: ${url.hostname}`,
      'WHOIS lookup needs a registry-backed server API.',
      `Open lookup: https://lookup.icann.org/en/lookup?name=${url.hostname}`,
    ].join('\n');
  }

  if (lower.includes('port')) {
    return [
      `Host: ${url.hostname}`,
      `Port: ${url.port || (url.protocol === 'https:' ? '443' : '80')}`,
      'Browsers cannot open raw TCP sockets, so port scanning needs a backend service.',
    ].join('\n');
  }

  return analyzeUrl(value);
};

const analyzeGenericInput = (value, toolName) => [
  `Tool: ${toolName}`,
  `Characters: ${value.length}`,
  `Words: ${value.trim() ? value.trim().split(/\s+/).length : 0}`,
  `Lines: ${value ? value.split(/\r?\n/).length : 0}`,
  '',
  value.trim() || 'No input provided yet.',
].join('\n');

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ToolButton = ({ children, onClick, disabled, tone = 'primary', icon: Icon = Play }) => {
  const styles = {
    primary: 'bg-webpeaker-600 text-white hover:bg-webpeaker-900',
    soft: 'bg-white text-gray-700 border border-gray-200 hover:border-webpeaker-200 hover:text-webpeaker-700',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[tone]}`}
    >
      <Icon size={16} />
      {children}
    </button>
  );
};

const getToolActions = (tool, lower) => {
  const id = tool.id;
  const actions = [];
  const add = (action, label, tone = actions.length ? 'soft' : 'primary') => {
    actions.push({ action, label, tone });
  };

  if (id.includes('slug')) add('slug', 'Generate Slug');
  if (lower.includes('meta tag') || lower.includes('open graph') || lower.includes('twitter card')) add('meta', 'Generate Meta Tags');
  if (lower.includes('case')) {
    add('upper', 'Uppercase');
    add('lower', 'Lowercase', 'soft');
    add('title', 'Title Case', 'soft');
    add('camel', 'camelCase', 'soft');
    add('pascal', 'PascalCase', 'soft');
  }
  if (lower.includes('space')) add('trim', 'Clean Spaces');
  if (lower.includes('duplicate')) add('dedupe', 'Remove Duplicates');
  if (lower.includes('sort')) add('sort', 'Sort Lines');
  if (lower.includes('reverse')) add('reverse', 'Reverse Text');
  if (lower.includes('find') || lower.includes('replace')) add('find', 'Find Replace');
  if (lower.includes('regex')) {
    if (lower.includes('generator')) add('regex-generate', 'Generate Pattern');
    add('regex-test', 'Test Regex', actions.length ? 'soft' : 'primary');
    add('regex-extract', 'Extract Matches', 'soft');
  }
  if (lower.includes('json') && !lower.includes('csv')) {
    add('json-format', 'Format JSON');
    add('json-minify', 'Minify JSON', 'soft');
  }
  if (lower.includes('csv') || lower.includes('data to graph')) {
    add('json-csv', 'JSON to CSV');
    add('csv-json', 'CSV to JSON', 'soft');
  }
  if (lower.includes('base64')) {
    add('base64-encode', 'Base64 Encode');
    add('base64-decode', 'Base64 Decode', 'soft');
  }
  if (lower.includes('url encode')) {
    add('url-encode', 'URL Encode');
    add('url-decode', 'URL Decode', 'soft');
  }
  if (lower.includes('html encode')) {
    add('html-encode', 'HTML Encode');
    add('html-decode', 'HTML Decode', 'soft');
  }
  if (lower.includes('binary') || lower.includes('ascii')) {
    add('binary', 'Text to Binary');
    add('text', 'Binary to Text', 'soft');
  }
  if (lower.includes('uuid')) add('uuid', 'Generate UUIDs');
  if (lower.includes('password')) {
    add('password', 'Generate Password');
    add('strength', 'Check Strength', 'soft');
  }
  if (lower.includes('hash') || lower.includes('checksum')) add('hash', 'Generate SHA-256');
  if (lower.includes('jwt')) add('jwt', 'Decode JWT');
  if (lower.includes('fake data')) add('fake', 'Generate Fake Data');
  if (lower.includes('hex')) add('hex', 'Random Hex');
  if (lower.includes('gradient')) add('gradient', 'Gradient CSS');
  if (lower.includes('shadow')) add('shadow', 'Shadow CSS');
  if (lower.includes('flexbox')) add('flex', 'Flexbox CSS');
  if (lower.includes('grid')) add('grid', 'Grid CSS');
  if (tool.categoryId === 'css') add('css-generate', 'Generate CSS');
  if (tool.categoryId === 'seo') add('seo-generate', lower.includes('slug') ? 'Generate Slug' : 'Generate SEO');
  if (tool.categoryId === 'image') add('file-analyze', 'Analyze Image');
  if (tool.categoryId === 'pdf') add('file-analyze', 'Analyze PDF');
  if (tool.categoryId === 'file') add('file-analyze', 'Analyze File');
  if (tool.categoryId === 'security') add('security-run', lower.includes('password') ? 'Generate Password' : 'Run Security Tool');
  if (tool.categoryId === 'data') add('data-convert', 'Convert Data');
  if (tool.categoryId === 'math') {
    if (lower.includes('unit')) add('unit-convert', 'Convert Units');
    else add('math-calc', 'Calculate');
  }
  if (tool.categoryId === 'random') add('random-generate', 'Generate');
  if (lower.includes('url parser') || lower.includes('query') || lower.includes('utm')) add('url-parse', 'Parse URL');
  if (tool.categoryId === 'web') {
    add('web-status', lower.includes('headers') ? 'View Headers' : 'Check Website');
    add('url-parse', 'Analyze URL', 'soft');
  }
  if (tool.categoryId === 'network') {
    if (lower.includes('dns')) add('dns-lookup', 'DNS Lookup');
    else add('domain-inspect', 'Inspect Host');
    add('url-parse', 'Analyze URL', 'soft');
  }
  if (tool.categoryId === 'api') {
    add('api-request', 'Send Request');
    add('json-format', 'Format JSON', 'soft');
  }
  if (lower.includes('timestamp')) add('timestamp', 'Timestamp');
  if (lower.includes('date difference')) add('date-diff', 'Date Difference');
  if (lower.includes('statistics') || lower.includes('mean')) add('stats', 'Calculate Stats');
  if (tool.categoryId === 'qr') add('qr-note', 'QR Workflow');

  return actions.length ? actions : [{ action: 'generic-analyze', label: 'Analyze Input', tone: 'primary' }];
};

export default function UniversalTool() {
  const { slug } = useParams();
  const tool = useMemo(() => allTools.find((item) => item.id === slug), [slug]);
  const [input, setInput] = useState('');
  const [secondary, setSecondary] = useState('');
  const [output, setOutput] = useState('');
  const [notice, setNotice] = useState('');
  const [fileInfo, setFileInfo] = useState(null);

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-webpeaker-600">
          <ArrowLeft size={16} /> Back to tools
        </Link>
        <div className="rounded-xl border border-gray-100 bg-white p-8">
          <h1 className="text-2xl font-bold text-gray-900">Tool not found</h1>
          <p className="mt-2 text-gray-500">This utility is not available in the toolkit yet.</p>
        </div>
      </div>
    );
  }

  const lower = tool.name.toLowerCase();
  const isVisual = ['image', 'pdf', 'file', 'media', 'qr'].includes(tool.categoryId);
  const needsFileInput = isVisual || lower.includes('base64') || lower.includes('metadata') || lower.includes('checksum') || tool.categoryId === 'file';
  const toolActions = getToolActions(tool, lower);
  const inputPlaceholder = lower.includes('regex')
    ? 'For generator: describe the pattern or paste a sample. For tester: paste sample text here...'
    : ['web', 'network', 'api', 'url'].includes(tool.categoryId)
      ? 'Enter a URL or domain, for example: https://example.com'
    : tool.categoryId === 'math'
      ? 'Enter numbers, for example: 25 200 or 70 170'
    : tool.categoryId === 'data'
      ? 'Paste JSON, CSV, XML, YAML, or tabular data...'
    : tool.categoryId === 'seo'
      ? 'Enter title, URL, keywords, or page text...'
    : tool.categoryId === 'css'
      ? 'Enter a CSS value, selector, color, size, or setting...'
    : 'Paste text, JSON, URL, numbers, tokens, or any content this tool should process...';
  const secondaryPlaceholder = lower.includes('regex')
    ? 'Regex pattern for testing, for example: /[A-Z]+\\d*/g'
    : tool.categoryId === 'network'
      ? 'Optional DNS record type: A, AAAA, MX, TXT, CNAME...'
    : tool.categoryId === 'api'
      ? 'Optional JSON options: {"method":"POST","headers":{"Content-Type":"application/json"},"body":{"hello":"world"}}'
    : tool.categoryId === 'random'
      ? 'Optional count'
    : tool.categoryId === 'css' || tool.categoryId === 'seo'
      ? 'Optional second value, color, description, or setting...'
    : 'Optional: find=>replace, password length, second color, description, count...';

  const run = async (action) => {
    setNotice('');
    try {
      if (action === 'copy') {
        await navigator.clipboard.writeText(output || input);
        setNotice('Copied to clipboard.');
        return;
      }
      if (action === 'clear') {
        setInput('');
        setSecondary('');
        setOutput('');
        setFileInfo(null);
        return;
      }
      if (action === 'json-format') setOutput(JSON.stringify(JSON.parse(input || sampleJson), null, 2));
      if (action === 'json-minify') setOutput(JSON.stringify(JSON.parse(input || sampleJson)));
      if (action === 'csv-json') setOutput(csvToJson(input));
      if (action === 'json-csv') setOutput(jsonToCsv(input || '[{"name":"WebPeaker","type":"toolkit"}]'));
      if (action === 'upper') setOutput(input.toUpperCase());
      if (action === 'lower') setOutput(input.toLowerCase());
      if (action === 'title') setOutput(toTitleCase(input));
      if (action === 'slug') setOutput(toSlug(input));
      if (action === 'camel') setOutput(toCamel(input));
      if (action === 'pascal') setOutput(toPascal(input));
      if (action === 'trim') setOutput(input.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim());
      if (action === 'dedupe') setOutput([...new Set(input.split(/\r?\n/).filter(Boolean))].join('\n'));
      if (action === 'sort') setOutput(input.split(/\r?\n/).filter(Boolean).sort((a, b) => a.localeCompare(b)).join('\n'));
      if (action === 'reverse') setOutput(input.split('').reverse().join(''));
      if (action === 'find') setOutput(input.replaceAll(secondary.split('=>')[0] || '', secondary.split('=>')[1] || ''));
      if (action === 'regex-generate') setOutput(generateRegex(input));
      if (action === 'regex-test' || action === 'regex-extract') setOutput(testRegex(input, secondary));
      if (action === 'web-status') setOutput(await checkWebsiteStatus(input));
      if (action === 'dns-lookup') setOutput(await dnsLookup(input, secondary));
      if (action === 'domain-inspect') setOutput(inspectDomain(input, tool.name));
      if (action === 'api-request') setOutput(await apiRequest(input, secondary));
      if (action === 'generic-analyze') setOutput(analyzeGenericInput(input, tool.name));
      if (action === 'css-generate') setOutput(generateCss(input, secondary, tool.name));
      if (action === 'seo-generate') setOutput(lower.includes('slug') ? toSlug(input) : generateSeo(input, secondary, tool.name));
      if (action === 'security-run') setOutput(await securityTool(input, secondary, tool.name));
      if (action === 'data-convert') setOutput(convertData(input, tool.name));
      if (action === 'math-calc') setOutput(calculateMath(input, tool.name));
      if (action === 'unit-convert') setOutput(convertUnit(input));
      if (action === 'random-generate') setOutput(generateRandomValue(tool.name, secondary));
      if (action === 'file-analyze') setOutput(fileInfo ? JSON.stringify(fileInfo, null, 2) : 'Choose a file first, then run this tool.');
      if (action === 'base64-encode') setOutput(unicodeBase64Encode(input));
      if (action === 'base64-decode') setOutput(unicodeBase64Decode(input));
      if (action === 'url-encode') setOutput(encodeURIComponent(input));
      if (action === 'url-decode') setOutput(decodeURIComponent(input));
      if (action === 'html-encode') setOutput(escapeHtml(input));
      if (action === 'html-decode') setOutput(decodeHtml(input));
      if (action === 'binary') setOutput(textToBinary(input));
      if (action === 'text') setOutput(binaryToText(input));
      if (action === 'uuid') setOutput(Array.from({ length: Number(secondary) || 5 }, () => crypto.randomUUID()).join('\n'));
      if (action === 'password') setOutput(makePassword(Number(secondary) || 18));
      if (action === 'fake') setOutput(makeFakeData());
      if (action === 'hex') setOutput(randomFrom('0123456789abcdef', Number(secondary) || 32));
      if (action === 'strength') setOutput(`Strength: ${strengthLabel(input)}\nLength: ${input.length} characters`);
      if (action === 'jwt') {
        const [, payload] = input.split('.');
        setOutput(JSON.stringify(JSON.parse(unicodeBase64Decode(payload.replace(/-/g, '+').replace(/_/g, '/'))), null, 2));
      }
      if (action === 'hash') {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
        setOutput(Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join(''));
      }
      if (action === 'url-parse') {
        const url = new URL(input);
        setOutput(JSON.stringify({
          protocol: url.protocol,
          host: url.host,
          pathname: url.pathname,
          search: url.search,
          params: Object.fromEntries(url.searchParams.entries()),
        }, null, 2));
      }
      if (action === 'meta') {
        setOutput(`<title>${input || 'Page title'}</title>\n<meta name="description" content="${secondary || 'Page description'}">\n<meta property="og:title" content="${input || 'Page title'}">`);
      }
      if (action === 'date-diff') {
        const [start, end] = input.split(/\s+/);
        const days = Math.abs(new Date(end) - new Date(start)) / 86400000;
        setOutput(`${days || 0} days`);
      }
      if (action === 'timestamp') setOutput(`${Date.now()}\n${new Date().toISOString()}`);
      if (action === 'stats') {
        const nums = input.split(/[,\s]+/).map(Number).filter((num) => !Number.isNaN(num)).sort((a, b) => a - b);
        const sum = nums.reduce((total, num) => total + num, 0);
        setOutput(`Count: ${nums.length}\nMean: ${sum / nums.length || 0}\nMedian: ${nums[Math.floor(nums.length / 2)] || 0}\nMin: ${nums[0] || 0}\nMax: ${nums.at(-1) || 0}`);
      }
      if (action === 'gradient') setOutput(`background: linear-gradient(135deg, ${input || '#6832E3'}, ${secondary || '#14B8A6'});`);
      if (action === 'shadow') setOutput(`box-shadow: 0 18px 45px ${input || 'rgba(17, 24, 39, 0.18)'};`);
      if (action === 'flex') setOutput('display: flex;\nalign-items: center;\njustify-content: center;\ngap: 16px;\nflex-wrap: wrap;');
      if (action === 'grid') setOutput('display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\ngap: 16px;');
      if (action === 'qr-note') setOutput('Use the dedicated QR Generator page for live QR creation and export-ready codes.');
    } catch (error) {
      setNotice(error.message || 'Could not process that input.');
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const info = {
      name: file.name,
      type: file.type || 'Unknown',
      size: `${(file.size / 1024).toFixed(2)} KB`,
      bytes: file.size,
      modified: new Date(file.lastModified).toLocaleString(),
    };
    setFileInfo(info);

    if (lower.includes('base64') || lower.includes('metadata') || isVisual) {
      const dataUrl = await readFileAsDataUrl(file);
      const outputInfo = { ...info, dataUrl: lower.includes('base64') ? dataUrl : `${dataUrl.slice(0, 120)}...` };
      setOutput(JSON.stringify(outputInfo, null, 2));
    }
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const Icon = tool.icon;

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-webpeaker-600 hover:text-webpeaker-900">
        <ArrowLeft size={16} /> Back to all tools
      </Link>

      <section className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tool.bg} ${tool.color}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-webpeaker-600">{tool.category}</p>
              <h1 className="text-3xl font-black text-gray-900">{tool.name}</h1>
              <p className="mt-2 max-w-2xl text-gray-500">{tool.description}</p>
            </div>
          </div>
          <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">Browser workspace</span>
        </div>
      </section>

      <section className={`grid gap-6 ${needsFileInput ? 'lg:grid-cols-[1fr_360px]' : 'lg:grid-cols-1'}`}>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm font-bold text-gray-800">Input</label>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span>{wordCount} words</span>
              <span>{input.length} chars</span>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={inputPlaceholder}
            spellCheck={false}
            className="h-72 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-800 outline-none transition focus:border-webpeaker-500 focus:bg-white focus:ring-4 focus:ring-webpeaker-100"
          />
          <input
            value={secondary}
            onChange={(event) => setSecondary(event.target.value)}
            placeholder={secondaryPlaceholder}
            className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-webpeaker-500 focus:ring-4 focus:ring-webpeaker-100"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {toolActions.map((item) => (
              <ToolButton key={item.action} onClick={() => run(item.action)} tone={item.tone}>
                {item.label}
              </ToolButton>
            ))}
            <ToolButton onClick={() => run('copy')} tone="soft" icon={Copy}>Copy</ToolButton>
            <ToolButton onClick={() => run('clear')} tone="danger" icon={Trash2}>Clear</ToolButton>
          </div>
        </div>

        {needsFileInput && (
          <aside className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <label className="mb-3 block text-sm font-bold text-gray-800">File input</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center hover:border-webpeaker-300 hover:bg-webpeaker-50">
              <FileUp className="mb-3 text-webpeaker-600" size={28} />
              <span className="text-sm font-semibold text-gray-700">Choose file</span>
              <span className="mt-1 text-xs text-gray-400">Used by image, PDF, media, file, checksum, and Base64 tools</span>
              <input type="file" className="hidden" onChange={handleFile} />
            </label>

            {fileInfo && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <p className="font-bold text-gray-800">{fileInfo.name}</p>
                <p>{fileInfo.type}</p>
                <p>{fileInfo.size}</p>
                <p>{fileInfo.modified}</p>
              </div>
            )}

            {isVisual && (
              <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                Browser-only mode can inspect files, create Base64 previews, and prepare metadata. Heavy tasks such as PDF merging, background removal, and video conversion need a backend processor.
              </div>
            )}
          </aside>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-bold text-gray-800">Output</label>
          <div className="flex gap-2">
            <ToolButton onClick={() => run('copy')} tone="soft" icon={Clipboard}>Copy Output</ToolButton>
            <ToolButton onClick={() => setInput(output)} tone="soft" icon={RefreshCw}>Use as Input</ToolButton>
            <ToolButton
              onClick={() => {
                const blob = new Blob([output], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${tool.id}.txt`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              disabled={!output}
              tone="soft"
              icon={Download}
            >
              Export
            </ToolButton>
          </div>
        </div>
        <pre className="min-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-950 p-4 text-sm text-gray-100">
          {output || 'Output will appear here after you run an action.'}
        </pre>
        {notice && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-webpeaker-50 px-3 py-2 text-sm font-semibold text-webpeaker-700">
            <Sparkles size={16} /> {notice}
          </div>
        )}
      </section>
    </div>
  );
}
