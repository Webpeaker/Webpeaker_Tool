import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clipboard, Copy, Play, RefreshCw, Trash2 } from 'lucide-react';
import { allTools } from '../../data/tools';

const toSlug = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toTitleCase = (text) => text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
const toCamel = (text) => toSlug(text).replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
const toPascal = (text) => {
  const camel = toCamel(text);
  return camel ? camel[0].toUpperCase() + camel.slice(1) : '';
};
const toSnake = (text) => toSlug(text).replace(/-/g, '_');
const toConstant = (text) => toSnake(text).toUpperCase();

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

const base64Encode = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text)));
const base64Decode = (text) => new TextDecoder().decode(Uint8Array.from(atob(text), (char) => char.charCodeAt(0)));

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

const normalizeRegex = (value) => {
  const trimmed = value.trim();
  const literal = trimmed.match(/^\/(.+)\/([a-z]*)$/i);
  return literal ? { pattern: literal[1], flags: literal[2] } : { pattern: trimmed, flags: 'g' };
};

const prettyJson = (value) => JSON.stringify(JSON.parse(value || '{"name":"WebPeaker","active":true}'), null, 2);
const minifyJson = (value) => JSON.stringify(JSON.parse(value || '{"name":"WebPeaker","active":true}'));

const simpleBeautify = (value) =>
  value
    .replace(/([{};>])/g, '$1\n')
    .replace(/</g, '\n<')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

const simpleMinify = (value) => value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').trim();

const regexPresets = [
  ['email', String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`],
  ['url', String.raw`https?:\/\/(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s]*)?`],
  ['phone', String.raw`(?:\+\d{1,3}[-\s]?)?(?:\(?\d{3,4}\)?[-\s]?)?\d{3,4}[-\s]?\d{4}`],
  ['date', String.raw`\d{4}-\d{2}-\d{2}`],
  ['uuid', String.raw`[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}`],
  ['hex', String.raw`#(?:[0-9a-fA-F]{3}){1,2}`],
  ['number', String.raw`-?\d+(?:\.\d+)?`],
];

const generateRegexPattern = (value) => {
  const lower = value.toLowerCase();
  const preset = regexPresets.find(([name]) => lower.includes(name));
  if (preset) return `/${preset[1]}/g`;
  if (!value.trim()) return regexPresets.map(([name, pattern]) => `${name}: /${pattern}/g`).join('\n');
  return `/${value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, String.raw`\s+`)}/g`;
};

const testRegexMatches = (text, patternValue) => {
  if (!patternValue.trim()) throw new Error('Add a regex pattern in the optional field, for example /error|warning/gi');
  const { pattern, flags } = normalizeRegex(patternValue);
  const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
  const matches = [...text.matchAll(regex)];
  return matches.length
    ? matches.map((match, index) => `${index + 1}. ${match[0]} at index ${match.index}`).join('\n')
    : 'No matches found.';
};

const parseLogs = (value) => {
  const lines = value.split(/\r?\n/).filter(Boolean);
  const groups = { error: [], warning: [], info: [], other: [] };
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (lower.includes('error') || lower.includes('exception') || lower.includes('failed')) groups.error.push(line);
    else if (lower.includes('warn')) groups.warning.push(line);
    else if (lower.includes('info') || lower.includes('debug')) groups.info.push(line);
    else groups.other.push(line);
  });

  return [
    `Total lines: ${lines.length}`,
    `Errors: ${groups.error.length}`,
    `Warnings: ${groups.warning.length}`,
    `Info/debug: ${groups.info.length}`,
    `Other: ${groups.other.length}`,
    '',
    ...Object.entries(groups)
      .filter(([, groupLines]) => groupLines.length)
      .flatMap(([name, groupLines]) => [`[${name.toUpperCase()}]`, ...groupLines.slice(0, 20), '']),
  ].join('\n').trim();
};

const inspectGraphql = (value) => {
  const trimmed = value.trim();
  const openBraces = (trimmed.match(/{/g) || []).length;
  const closeBraces = (trimmed.match(/}/g) || []).length;
  const operation = trimmed.match(/\b(query|mutation|subscription)\b/i)?.[1] || 'anonymous selection';
  const fields = [...trimmed.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(|{|$)/g)]
    .map((match) => match[1])
    .filter((field) => !['query', 'mutation', 'subscription', 'fragment', 'on'].includes(field.toLowerCase()));

  return [
    `Operation: ${operation}`,
    `Brace balance: ${openBraces === closeBraces ? 'OK' : `Mismatch (${openBraces} open, ${closeBraces} close)`}`,
    `Top fields: ${[...new Set(fields)].slice(0, 12).join(', ') || 'none detected'}`,
    '',
    simpleBeautify(trimmed),
  ].join('\n');
};

const extractCriticalCss = (css, selectorText) => {
  const selectors = selectorText.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  const rules = css.match(/[^{}]+{[^{}]*}/g) || [];
  const selectedRules = selectors.length
    ? rules.filter((rule) => selectors.some((selector) => rule.trim().startsWith(selector)))
    : rules.slice(0, 8);
  return selectedRules.join('\n') || 'No matching CSS rules found. Add selectors in the optional field, one per line.';
};

const makeSchema = (value) => {
  const parsed = JSON.parse(value || '{"name":"WebPeaker","active":true}');
  const shape = Array.isArray(parsed) ? parsed[0] || {} : parsed;
  return JSON.stringify(
    {
      type: Array.isArray(parsed) ? 'array' : 'object',
      properties: Object.fromEntries(
        Object.entries(shape).map(([key, val]) => [
          key,
          { type: Array.isArray(val) ? 'array' : val === null ? 'null' : typeof val },
        ]),
      ),
    },
    null,
    2,
  );
};

const jsonPath = (value, path) => {
  const parsed = JSON.parse(value || '{}');
  const keys = path.replace(/^\$\.?/, '').split('.').filter(Boolean);
  const result = keys.reduce((current, key) => current?.[key], parsed);
  return JSON.stringify(result ?? null, null, 2);
};

const xmlFormat = (value) =>
  value
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

const yamlFormat = (value) => {
  const parsed = JSON.parse(value || '{"name":"WebPeaker","active":true}');
  return Object.entries(parsed).map(([key, val]) => `${key}: ${Array.isArray(val) ? `[${val.join(', ')}]` : val}`).join('\n');
};

const makeTable = (value) => {
  const rows = value.trim().split(/\r?\n/).filter(Boolean).map((row) => row.split(',').map((cell) => cell.trim()));
  if (!rows.length) return '<table>\n  <tr><td>WebPeaker</td></tr>\n</table>';
  return ['<table>', ...rows.map((row) => `  <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`), '</table>'].join('\n');
};

const diffLines = (value, compareValue) => {
  const left = value.split(/\r?\n/);
  const right = compareValue.split(/\r?\n/);
  const max = Math.max(left.length, right.length);
  return Array.from({ length: max }, (_, index) => {
    if (left[index] === right[index]) return `  ${left[index] ?? ''}`;
    return `- ${left[index] ?? ''}\n+ ${right[index] ?? ''}`;
  }).join('\n');
};

const removeDuplicateText = (value) => {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (lines.length > 1) {
    return [...new Set(lines)].join('\n');
  }

  return [...new Set(value.trim().split(/\s+/).filter(Boolean))].join(' ');
};

const createTextActions = (toolName) => {
  const lower = toolName.toLowerCase();
  if (lower.includes('case style')) return ['slug', 'camel', 'pascal', 'snake', 'constant'];
  if (lower.includes('case')) return ['upper', 'lower', 'title', 'camel', 'pascal'];
  if (lower.includes('remove spaces')) return ['remove-spaces', 'trim', 'dedupe'];
  if (lower.includes('sort')) return ['sort-asc', 'sort-desc'];
  if (lower.includes('bulk')) return ['bulk-replace'];
  if (lower.includes('find') || lower.includes('replace')) return ['replace'];
  if (lower.includes('reverse')) return ['reverse'];
  if (lower.includes('email')) return ['extract-email'];
  if (lower.includes('phone')) return ['extract-phone'];
  if (lower.includes('encoding detector')) return ['detect-encoding'];
  if (lower.includes('unicode')) return ['unicode-encode', 'unicode-decode'];
  if (lower.includes('markdown')) return ['markdown-preview'];
  if (lower.includes('clipboard')) return ['clipboard-history'];
  return ['analyze', 'upper', 'lower', 'title'];
};

const createDeveloperActions = (toolName) => {
  const lower = toolName.toLowerCase();
  if (lower.includes('json schema')) return ['json-schema'];
  if (lower.includes('json path')) return ['json-path'];
  if (lower.includes('json merge')) return ['json-merge'];
  if (lower.includes('json split')) return ['json-split'];
  if (lower.includes('json')) return ['json-format', 'json-minify'];
  if (lower.includes('graphql')) return ['graphql-test', 'beautify-code'];
  if (lower.includes('log file')) return ['log-parse'];
  if (lower.includes('critical path')) return ['critical-css'];
  if (lower.includes('regex') && lower.includes('generator')) return ['regex-generate', 'regex-test'];
  if (lower.includes('regex') && lower.includes('replace')) return ['regex-replace', 'regex-test'];
  if (lower.includes('regex')) return ['regex-test', 'regex-extract'];
  if (lower.includes('uuid')) return ['uuid'];
  if (lower.includes('diff')) return ['diff'];
  if (lower.includes('minifier')) return ['minify-code'];
  if (lower.includes('xml')) return ['xml-format'];
  if (lower.includes('yaml')) return ['yaml-format'];
  if (lower.includes('sql')) return ['sql-format'];
  if (lower.includes('table')) return ['html-table'];
  if (lower.includes('line counter')) return ['line-count'];
  if (lower.includes('obfuscator')) return ['js-obfuscate'];
  if (lower.includes('deobfuscator')) return ['js-deobfuscate'];
  if (lower.includes('size')) return ['size-report'];
  return ['beautify-code', 'minify-code'];
};

const createEncodingActions = (toolName) => {
  const lower = toolName.toLowerCase();
  if (lower.includes('base64')) return ['base64-encode', 'base64-decode'];
  if (lower.includes('url')) return ['url-encode', 'url-decode'];
  if (lower.includes('html')) return ['html-encode', 'html-decode'];
  if (lower.includes('binary')) return ['binary-encode', 'binary-decode'];
  return ['ascii-codes', 'ascii-text'];
};

const actionLabels = {
  analyze: 'Analyze',
  upper: 'Uppercase',
  lower: 'Lowercase',
  title: 'Title Case',
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  constant: 'CONSTANT_CASE',
  slug: 'Slug',
  'remove-spaces': 'Remove Spaces',
  trim: 'Clean Spaces',
  dedupe: 'Remove Duplicates',
  'sort-asc': 'Sort A-Z',
  'sort-desc': 'Sort Z-A',
  replace: 'Replace',
  'bulk-replace': 'Bulk Replace',
  reverse: 'Reverse',
  'extract-email': 'Extract Emails',
  'extract-phone': 'Extract Phones',
  'detect-encoding': 'Detect',
  'unicode-encode': 'Unicode Escape',
  'unicode-decode': 'Decode Unicode',
  'markdown-preview': 'Preview Text',
  'clipboard-history': 'Save Snapshot',
  'json-format': 'Format JSON',
  'json-minify': 'Minify JSON',
  'json-schema': 'Create Schema',
  'json-path': 'Run JSON Path',
  'json-merge': 'Merge JSON',
  'json-split': 'Split JSON',
  'regex-generate': 'Generate Regex',
  'regex-test': 'Test Regex',
  'regex-extract': 'Extract Matches',
  'regex-replace': 'Regex Replace',
  'graphql-test': 'Inspect Query',
  'log-parse': 'Parse Log',
  'critical-css': 'Extract CSS',
  'js-obfuscate': 'Obfuscate',
  'js-deobfuscate': 'Deobfuscate',
  uuid: 'Generate UUIDs',
  diff: 'Compare',
  'beautify-code': 'Beautify',
  'minify-code': 'Minify',
  'xml-format': 'Format XML',
  'yaml-format': 'JSON to YAML',
  'sql-format': 'Format SQL',
  'html-table': 'Create Table',
  'line-count': 'Count Lines',
  'size-report': 'Analyze Size',
  'base64-encode': 'Encode',
  'base64-decode': 'Decode',
  'url-encode': 'Encode',
  'url-decode': 'Decode',
  'html-encode': 'Encode',
  'html-decode': 'Decode',
  'binary-encode': 'Text to Binary',
  'binary-decode': 'Binary to Text',
  'ascii-codes': 'Text to ASCII',
  'ascii-text': 'ASCII to Text',
};

function getCategoryToolActions(categoryId, toolName) {
  if (categoryId === 'text') return createTextActions(toolName);
  if (categoryId === 'developer') return createDeveloperActions(toolName);
  return createEncodingActions(toolName);
}

const secondaryActions = new Set([
  'replace',
  'bulk-replace',
  'json-path',
  'json-merge',
  'regex-test',
  'regex-extract',
  'regex-replace',
  'uuid',
  'diff',
  'critical-css',
]);

const getInputPlaceholder = (tool, actions) => {
  const action = actions[0];
  const examples = {
    'remove-spaces': 'Example: hello   world   again',
    trim: 'Example: hello     world\n\n\nnew paragraph',
    dedupe: 'Example: apple apple orange\nor duplicate lines on separate rows',
    'sort-asc': 'Example:\nBanana\nApple\nCherry',
    replace: 'Text to edit goes here. Example: I like apples and apples are sweet.',
    'bulk-replace': 'Text to edit goes here. Example: red apple and green banana',
    reverse: 'Example: WebPeaker',
    'extract-email': 'Example: Contact sales@example.com and help@example.org',
    'extract-phone': 'Example: Call +91 9876543210 or 555-123-4567',
    'detect-encoding': 'Example: Hello नमस्ते こんにちは',
    'unicode-encode': 'Example: A नमस्ते',
    'markdown-preview': 'Example:\n# Title\n**Bold text** and `code`',
    slug: 'Example: My New Blog Post Title',
    camel: 'Example: my new variable name',
    'json-format': 'Example: {"name":"WebPeaker","active":true}',
    'json-schema': 'Example: {"name":"WebPeaker","active":true}',
    'json-path': 'Example: {"user":{"name":"Rohit","city":"Delhi"}}',
    'json-merge': 'First JSON object. Example: {"name":"Rohit"}',
    'json-split': 'Example: {"name":"Rohit","city":"Delhi"}',
    'regex-generate': 'Describe what to match. Example: email address',
    'regex-test': 'Text to test. Example: Error 404 at /login',
    'regex-replace': 'Text to edit. Example: Order 123 and Order 456',
    uuid: 'Leave empty, or enter count in the extra input.',
    diff: 'First text/code block to compare.',
    'critical-css': 'Paste CSS rules here. Example: .hero { color: red; }',
    'html-table': 'Example:\nName,Age\nRohit,25\nAsha,30',
    'line-count': 'Paste code or text to count lines.',
    'base64-encode': 'Example: Hello WebPeaker',
    'url-encode': 'Example: https://example.com/search?q=hello world',
    'html-encode': 'Example: <div class="box">Hello & welcome</div>',
    'binary-encode': 'Example: Hello',
    'ascii-codes': 'Example: ABC',
  };

  return examples[action] || `Example input for ${tool.name}`;
};

const getSecondaryPlaceholder = (actions) => {
  const action = actions.find((item) => secondaryActions.has(item));
  const examples = {
    replace: 'Example: apples=>oranges',
    'bulk-replace': 'Example:\nred=>blue\napple=>mango',
    'json-path': 'Example: $.user.name',
    'json-merge': 'Second JSON object. Example: {"city":"Delhi"}',
    'regex-test': 'Example: /error|warning/gi',
    'regex-extract': 'Example: /\\d+/g',
    'regex-replace': 'Example: /Order \\d+/g=>Order XXXX',
    uuid: 'Example: 10',
    diff: 'Second text/code block to compare.',
    'critical-css': 'Selectors to keep. Example: .hero, #main',
  };

  return examples[action] || 'Extra input for this tool.';
};

export default function CategoryToolPage({ categoryId, toolId }) {
  const { slug } = useParams();
  const activeSlug = toolId || slug;
  const tool = useMemo(() => allTools.find((item) => item.id === activeSlug && item.categoryId === categoryId), [activeSlug, categoryId]);
  const [input, setInput] = useState('');
  const [secondary, setSecondary] = useState('');
  const [output, setOutput] = useState('');
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState([]);

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-webpeaker-600">
          <ArrowLeft size={16} /> Back to tools
        </Link>
        <div className="rounded-lg border border-gray-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tool not found</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">This utility is not available in this category.</p>
        </div>
      </div>
    );
  }

  const Icon = tool.icon;
  const actions = getCategoryToolActions(categoryId, tool.name);
  const hasSecondaryInput = actions.some((action) => secondaryActions.has(action));
  const inputPlaceholder = getInputPlaceholder(tool, actions);
  const secondaryPlaceholder = getSecondaryPlaceholder(actions);
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

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
        return;
      }
      if (action === 'analyze') setOutput(`Characters: ${input.length}\nWords: ${wordCount}\nLines: ${input ? input.split(/\r?\n/).length : 0}`);
      if (action === 'upper') setOutput(input.toUpperCase());
      if (action === 'lower') setOutput(input.toLowerCase());
      if (action === 'title') setOutput(toTitleCase(input));
      if (action === 'camel') setOutput(toCamel(input));
      if (action === 'pascal') setOutput(toPascal(input));
      if (action === 'snake') setOutput(toSnake(input));
      if (action === 'constant') setOutput(toConstant(input));
      if (action === 'slug') setOutput(toSlug(input));
      if (action === 'remove-spaces') setOutput(input.replace(/\s+/g, ''));
      if (action === 'trim') setOutput(input.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim());
      if (action === 'dedupe') setOutput(removeDuplicateText(input));
      if (action === 'sort-asc') setOutput(input.split(/\r?\n/).filter(Boolean).sort((a, b) => a.localeCompare(b)).join('\n'));
      if (action === 'sort-desc') setOutput(input.split(/\r?\n/).filter(Boolean).sort((a, b) => b.localeCompare(a)).join('\n'));
      if (action === 'replace') {
        if (!secondary.includes('=>')) throw new Error('Use find=>replace in the optional field. Example: apple=>orange');
        const [find, replaceWith = ''] = secondary.split('=>');
        if (!find) throw new Error('Add the word or line to find before =>. Example: apple=>orange');
        setOutput(input.replaceAll(find, replaceWith));
      }
      if (action === 'bulk-replace') {
        if (!secondary.includes('=>')) throw new Error('Add one replacement per line: find=>replace');
        const rules = secondary
          .split(/\r?\n/)
          .map((line) => line.split('=>'))
          .filter(([find]) => find);
        if (!rules.length) throw new Error('Add one replacement per line: find=>replace');
        setOutput(rules.reduce((text, [find, replaceWith = '']) => text.replaceAll(find, replaceWith), input));
      }
      if (action === 'reverse') setOutput(input.split('').reverse().join(''));
      if (action === 'extract-email') setOutput((input.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []).join('\n'));
      if (action === 'extract-phone') setOutput((input.match(/(?:\+\d{1,3}[-\s]?)?(?:\(?\d{3,4}\)?[-\s]?)?\d{3,4}[-\s]?\d{4}/g) || []).join('\n'));
      if (action === 'detect-encoding') {
        const bytes = new Blob([input]).size;
        const ascii = [...input].every((char) => char.codePointAt(0) <= 127);
        setOutput(`Detected: ${ascii ? 'ASCII-compatible UTF-8' : 'Unicode UTF-8'}\nCharacters: ${input.length}\nUTF-8 bytes: ${bytes}`);
      }
      if (action === 'unicode-encode') setOutput([...input].map((char) => `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' '));
      if (action === 'unicode-decode') {
        setOutput(input.replace(/(?:U\+|\\u\{?)([\dA-Fa-f]{2,6})\}?/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16))));
      }
      if (action === 'markdown-preview') {
        setOutput(
          input
            .replace(/^### (.*)$/gm, '$1\n' + '-'.repeat(18))
            .replace(/^## (.*)$/gm, '$1\n' + '-'.repeat(24))
            .replace(/^# (.*)$/gm, '$1\n' + '='.repeat(24))
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1'),
        );
      }
      if (action === 'clipboard-history') {
        const item = { id: crypto.randomUUID(), time: new Date().toLocaleString(), text: input };
        const nextHistory = [item, ...history].slice(0, 8);
        setHistory(nextHistory);
        setOutput(nextHistory.map((entry, index) => `${index + 1}. ${entry.time}\n${entry.text}`).join('\n\n'));
      }
      if (action === 'json-format') setOutput(prettyJson(input));
      if (action === 'json-minify') setOutput(minifyJson(input));
      if (action === 'json-schema') setOutput(makeSchema(input));
      if (action === 'json-path') setOutput(jsonPath(input, secondary || '$'));
      if (action === 'json-merge') setOutput(JSON.stringify({ ...JSON.parse(input || '{}'), ...JSON.parse(secondary || '{}') }, null, 2));
      if (action === 'json-split') setOutput(JSON.stringify(Object.entries(JSON.parse(input || '{}')).map(([key, value]) => ({ [key]: value })), null, 2));
      if (action === 'regex-generate') setOutput(generateRegexPattern(input));
      if (action === 'regex-test' || action === 'regex-extract') setOutput(testRegexMatches(input, secondary));
      if (action === 'regex-replace') {
        const [patternValue, replacement = ''] = secondary.split('=>');
        if (!secondary.includes('=>') || !patternValue) throw new Error('Add replacement as /pattern/g=>replacement in the optional field.');
        const { pattern, flags } = normalizeRegex(patternValue || '');
        setOutput(input.replace(new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`), replacement));
      }
      if (action === 'graphql-test') setOutput(inspectGraphql(input));
      if (action === 'log-parse') setOutput(parseLogs(input));
      if (action === 'critical-css') setOutput(extractCriticalCss(input, secondary));
      if (action === 'uuid') setOutput(Array.from({ length: Number(secondary) || 5 }, () => crypto.randomUUID()).join('\n'));
      if (action === 'diff') setOutput(diffLines(input, secondary));
      if (action === 'beautify-code') setOutput(simpleBeautify(input));
      if (action === 'minify-code') setOutput(simpleMinify(input));
      if (action === 'xml-format') setOutput(xmlFormat(input));
      if (action === 'yaml-format') setOutput(yamlFormat(input));
      if (action === 'sql-format') setOutput(input.replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|INSERT|UPDATE|DELETE|VALUES|JOIN)\b/gi, '\n$1').trim());
      if (action === 'html-table') setOutput(makeTable(input));
      if (action === 'line-count') setOutput(`Lines: ${input ? input.split(/\r?\n/).length : 0}\nBlank lines: ${(input.match(/^\s*$/gm) || []).length}\nCharacters: ${input.length}`);
      if (action === 'size-report') setOutput(`Characters: ${input.length}\nBytes: ${new Blob([input]).size}\nGzip estimate: browser compression needed for exact size`);
      if (action === 'js-obfuscate') setOutput(`eval(atob("${base64Encode(input)}"));`);
      if (action === 'js-deobfuscate') {
        const encoded = input.match(/atob\(["']([^"']+)["']\)/)?.[1] || input.trim();
        setOutput(base64Decode(encoded));
      }
      if (action === 'base64-encode') setOutput(base64Encode(input));
      if (action === 'base64-decode') setOutput(base64Decode(input.trim()));
      if (action === 'url-encode') setOutput(encodeURIComponent(input));
      if (action === 'url-decode') setOutput(decodeURIComponent(input));
      if (action === 'html-encode') setOutput(escapeHtml(input));
      if (action === 'html-decode') setOutput(decodeHtml(input));
      if (action === 'binary-encode') setOutput(textToBinary(input));
      if (action === 'binary-decode') {
        if (!/^[01\s]+$/.test(input.trim())) throw new Error('Binary input can only contain 0, 1, and spaces.');
        setOutput(binaryToText(input));
      }
      if (action === 'ascii-codes') setOutput([...input].map((char) => char.charCodeAt(0)).join(' '));
      if (action === 'ascii-text') {
        const codes = input.split(/[\s,]+/).filter(Boolean).map(Number);
        if (codes.some((code) => Number.isNaN(code))) throw new Error('ASCII input should be numbers separated by spaces or commas.');
        setOutput(codes.map((code) => String.fromCharCode(code)).join(''));
      }
    } catch (error) {
      setNotice(error.message || 'Could not process that input.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-webpeaker-600 hover:text-webpeaker-900">
        <ArrowLeft size={16} /> Back to all tools
      </Link>

      <section className="mb-6 rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tool.bg} ${tool.color}`}>
            <Icon size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-webpeaker-600 dark:text-webpeaker-100">{tool.category}</p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">{tool.name}</h1>
            <p className="mt-2 max-w-2xl text-gray-500 dark:text-gray-400">{tool.description}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-100">Input</label>
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
            className="h-72 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-800 outline-none transition focus:border-webpeaker-500 focus:bg-white focus:ring-4 focus:ring-webpeaker-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
          {hasSecondaryInput && (
            <input
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
              placeholder={secondaryPlaceholder}
              className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-webpeaker-500 focus:ring-4 focus:ring-webpeaker-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <button
                key={action}
                type="button"
                onClick={() => run(action)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  index === 0 ? 'bg-webpeaker-600 text-white hover:bg-webpeaker-900' : 'border border-gray-200 bg-white text-gray-700 hover:border-webpeaker-200 hover:text-webpeaker-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100'
                }`}
              >
                <Play size={16} />
                {actionLabels[action]}
              </button>
            ))}
            <button type="button" onClick={() => run('clear')} className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
              <Trash2 size={16} /> Clear
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-100">Output</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => run('copy')} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:text-webpeaker-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
                <Clipboard size={16} /> Copy
              </button>
              <button type="button" onClick={() => setInput(output)} disabled={!output} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:text-webpeaker-700 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
                <RefreshCw size={16} /> Use
              </button>
            </div>
          </div>
          <pre className="h-[388px] overflow-auto whitespace-pre-wrap rounded-lg bg-gray-950 p-4 text-sm text-gray-100">
            {output || 'Output will appear here after you run an action.'}
          </pre>
          {notice && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-webpeaker-50 px-3 py-2 text-sm font-semibold text-webpeaker-700 dark:bg-webpeaker-900/35 dark:text-webpeaker-100">
              <Copy size={16} /> {notice}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
