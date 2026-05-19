import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calculator from './pages/tools/Calculator';
import TextFormatter from './pages/tools/TextFormatter'; 
import TextDesigner from './pages/tools/TextDesigner';
import QRGenerator from './pages/tools/QRGenerator'; 
import JSONFormatter from './pages/tools/JsonFormatter';
import UnitConverter from './pages/tools/UnitConverter';
import UniversalTool from './pages/tools/UniversalTool';

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
          <Route path="tools/unit-converter" element={<UnitConverter />} />
          <Route path="tools/:slug" element={<UniversalTool />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
