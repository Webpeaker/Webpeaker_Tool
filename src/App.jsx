import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calculator from './pages/tools/Calculator';
import TextFormatter from './pages/tools/TextFormatter'; 
import TextDesigner from './pages/tools/TextDesigner';
import QRGenerator from './pages/tools/QRGenerator'; 
import JSONFormatter from './pages/tools/JsonFormatter';
import UnitConverter from './pages/tools/UnitConverter';
import PasswordGen from './pages/tools/PasswordGen';
import LoremIpsum from './pages/tools/LoremIpsum';
import ColorPicker from './pages/tools/ColorPicker';
import CaseConverter from './pages/tools/CaseConverter';
import Base64Tool from './pages/tools/Base64Tool';
import UrlEncoder from './pages/tools/UrlEncoder';
import WordCounter from './pages/tools/WordCounter';
import UniversalTool from './pages/tools/UniversalTool';
import { categoryToolRoutes } from './pages/tools/categoryToolRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tools/calculator" element={<Calculator />} />
          <Route path="tools/text-formatter" element={<TextFormatter />} />
          <Route path="tools/text-designer" element={<TextDesigner />} />
          <Route path="tools/qr-generator" element={<QRGenerator />} />
          <Route path="tools/json-formatter" element={<JSONFormatter />} />
          <Route path="tools/json-formatter-and-validator" element={<JSONFormatter />} />
          <Route path="tools/unit-converter" element={<UnitConverter />} />
          <Route path="tools/password-generator" element={<PasswordGen />} />
          <Route path="tools/lorem-ipsum-generator" element={<LoremIpsum />} />
          <Route path="tools/color-picker" element={<ColorPicker />} />
          <Route path="tools/case-converter" element={<CaseConverter />} />
          <Route path="tools/base64" element={<Base64Tool />} />
          <Route path="tools/base64-encode-decode" element={<Base64Tool />} />
          <Route path="tools/url-encoder" element={<UrlEncoder />} />
          <Route path="tools/url-encode-decode" element={<UrlEncoder />} />
          <Route path="tools/word-counter" element={<WordCounter />} />
          <Route path="tools/word-character-counter" element={<WordCounter />} />
          {categoryToolRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="tools/:slug" element={<UniversalTool />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
