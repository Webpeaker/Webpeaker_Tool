import { 
  Calculator, Type, QrCode, Image, FileJson, ArrowLeftRight, 
  Settings, Code, Video, Clock, FileText, ShieldCheck, DollarSign,TrendingUp, Braces
} from 'lucide-react';
export const categories = [
  { id: 'calc', name: 'Calculator', icon: Calculator, count: '15+ Tools', color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'text', name: 'Text Tools', icon: Type, count: '20+ Tools', color: 'text-purple-500', bg: 'bg-purple-100' },
  { id: 'design', name: 'Design Tools', icon: Image, count: '15+ Tools', color: 'text-pink-500', bg: 'bg-pink-100' },
  { id: 'dev', name: 'Developer Tools', icon: Code, count: '30+ Tools', color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'image', name: 'Image Tools', icon: Image, count: '20+ Tools', color: 'text-orange-500', bg: 'bg-orange-100' },
  { id: 'seo', name: 'SEO Tools', icon: TrendingUp, count: '25+ Tools', color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'youtube', name: 'YouTube Tools', icon: Video, count: '10+ Tools', color: 'text-red-500', bg: 'bg-red-100' },
  { id: 'unit', name: 'Unit Converter', icon: ArrowLeftRight, count: '18+ Tools', color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'qr', name: 'QR & Barcode', icon: QrCode, count: '8+ Tools', color: 'text-purple-500', bg: 'bg-purple-100' },
  { id: 'json', name: 'JSON Tools', icon: FileJson, count: '10+ Tools', color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'time', name: 'Time & Date', icon: Clock, count: '12+ Tools', color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'file', name: 'File Tools', icon: FileText, count: '15+ Tools', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { id: 'security', name: 'Security Tools', icon: ShieldCheck, count: '10+ Tools', color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'finance', name: 'Finance Tools', icon: DollarSign, count: '12+ Tools', color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 'other', name: 'Other Tools', icon: Settings, count: '20+ Tools', color: 'text-gray-500', bg: 'bg-gray-100' }
];
export const tools = [
  {
    id: 'calculator',
    name: 'Calculator',
    path: '/tools/calculator',
    category: 'Calculator',
    icon: Calculator,
    description: 'Perform basic and advanced calculations easily.',
    isPopular: true
  },
  {
    id: 'text-formatter',
    name: 'Text Formatter',
    path: '/tools/text-formatter',
    category: 'Text Tools',
    icon: Type,
    description: 'Format, transform and modify your text effortlessly.',
    isPopular: true
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    path: '/tools/qr-generator',
    category: 'QR & Barcode',
    icon: QrCode,
    description: 'Generate custom QR codes for your links and text.',
    isPopular: true
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    path: '/tools/json-formatter',
    category: 'Developer Tools',
    icon: Braces,
    description: 'Format and validate your JSON data instantly.',
    isPopular: true
  }
];