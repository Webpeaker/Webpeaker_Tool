import RemoveSpacesDuplicates from './text/RemoveSpacesDuplicates';
import TextSorter from './text/TextSorter';
import FindReplace from './text/FindReplace';
import ReverseText from './text/ReverseText';
import BulkTextReplaceTool from './text/BulkTextReplaceTool';
import ClipboardHistoryManager from './text/ClipboardHistoryManager';
import MarkdownEditorWithPreview from './text/MarkdownEditorWithPreview';
import EmailExtractorFromText from './text/EmailExtractorFromText';
import PhoneNumberExtractor from './text/PhoneNumberExtractor';
import TextEncodingDetector from './text/TextEncodingDetector';
import UnicodeConverter from './text/UnicodeConverter';
import CaseStyleConverter from './text/CaseStyleConverter';
import HtmlCssJsBeautifier from './developer/HtmlCssJsBeautifier';
import CodeMinifier from './developer/CodeMinifier';
import RegexTester from './developer/RegexTester';
import UuidGenerator from './developer/UuidGenerator';
import CodeDiffChecker from './developer/CodeDiffChecker';
import GraphqlQueryTester from './developer/GraphqlQueryTester';
import LogFileParser from './developer/LogFileParser';
import JavaScriptObfuscator from './developer/JavaScriptObfuscator';
import JavaScriptDeobfuscator from './developer/JavaScriptDeobfuscator';
import HtmlSizeAnalyzer from './developer/HtmlSizeAnalyzer';
import CssCriticalPathGenerator from './developer/CssCriticalPathGenerator';
import JsonSchemaGenerator from './developer/JsonSchemaGenerator';
import JsonPathTester from './developer/JsonPathTester';
import XmlFormatter from './developer/XmlFormatter';
import YamlFormatter from './developer/YamlFormatter';
import SqlQueryFormatter from './developer/SqlQueryFormatter';
import RegexPatternGenerator from './developer/RegexPatternGenerator';
import RegexReplaceTool from './developer/RegexReplaceTool';
import CodeSnippetBeautifier from './developer/CodeSnippetBeautifier';
import CodeLineCounter from './developer/CodeLineCounter';
import HtmlTableGenerator from './developer/HtmlTableGenerator';
import JsonMergeTool from './developer/JsonMergeTool';
import JsonSplitTool from './developer/JsonSplitTool';
import HtmlEncodeDecode from './encoding/HtmlEncodeDecode';
import BinaryText from './encoding/BinaryText';
import AsciiConverter from './encoding/AsciiConverter';

export const categoryToolRoutes = [
  { path: 'tools/remove-spaces-duplicates', element: <RemoveSpacesDuplicates /> },
  { path: 'tools/text-sorter', element: <TextSorter /> },
  { path: 'tools/find-replace', element: <FindReplace /> },
  { path: 'tools/reverse-text', element: <ReverseText /> },
  { path: 'tools/bulk-text-replace-tool', element: <BulkTextReplaceTool /> },
  { path: 'tools/clipboard-history-manager', element: <ClipboardHistoryManager /> },
  { path: 'tools/markdown-editor-with-preview', element: <MarkdownEditorWithPreview /> },
  { path: 'tools/email-extractor-from-text', element: <EmailExtractorFromText /> },
  { path: 'tools/phone-number-extractor', element: <PhoneNumberExtractor /> },
  { path: 'tools/text-encoding-detector', element: <TextEncodingDetector /> },
  { path: 'tools/unicode-converter', element: <UnicodeConverter /> },
  { path: 'tools/case-style-converter', element: <CaseStyleConverter /> },
  { path: 'tools/html-css-js-beautifier', element: <HtmlCssJsBeautifier /> },
  { path: 'tools/code-minifier', element: <CodeMinifier /> },
  { path: 'tools/regex-tester', element: <RegexTester /> },
  { path: 'tools/uuid-generator', element: <UuidGenerator /> },
  { path: 'tools/code-diff-checker', element: <CodeDiffChecker /> },
  { path: 'tools/graphql-query-tester', element: <GraphqlQueryTester /> },
  { path: 'tools/log-file-parser', element: <LogFileParser /> },
  { path: 'tools/javascript-obfuscator', element: <JavaScriptObfuscator /> },
  { path: 'tools/javascript-deobfuscator', element: <JavaScriptDeobfuscator /> },
  { path: 'tools/html-size-analyzer', element: <HtmlSizeAnalyzer /> },
  { path: 'tools/css-critical-path-generator', element: <CssCriticalPathGenerator /> },
  { path: 'tools/json-schema-generator', element: <JsonSchemaGenerator /> },
  { path: 'tools/json-path-tester', element: <JsonPathTester /> },
  { path: 'tools/xml-formatter', element: <XmlFormatter /> },
  { path: 'tools/yaml-formatter', element: <YamlFormatter /> },
  { path: 'tools/sql-query-formatter', element: <SqlQueryFormatter /> },
  { path: 'tools/regex-pattern-generator', element: <RegexPatternGenerator /> },
  { path: 'tools/regex-replace-tool', element: <RegexReplaceTool /> },
  { path: 'tools/code-snippet-beautifier', element: <CodeSnippetBeautifier /> },
  { path: 'tools/code-line-counter', element: <CodeLineCounter /> },
  { path: 'tools/html-table-generator', element: <HtmlTableGenerator /> },
  { path: 'tools/json-merge-tool', element: <JsonMergeTool /> },
  { path: 'tools/json-split-tool', element: <JsonSplitTool /> },
  { path: 'tools/html-encode-decode', element: <HtmlEncodeDecode /> },
  { path: 'tools/binary-text', element: <BinaryText /> },
  { path: 'tools/ascii-converter', element: <AsciiConverter /> },
];
