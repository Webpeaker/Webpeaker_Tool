import { useState } from 'react';
import { QrCode } from 'lucide-react';

export default function QRGenerator() {
  const [url, setUrl] = useState('');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <div className="bg-purple-100 text-purple-500 p-2 rounded-xl">
             <QrCode size={24} />
          </div>
          QR Code Generator
        </h1>
        <p className="text-gray-500">Generate custom QR codes for your links and text instantly.</p>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center">
        <div className="w-full max-w-md mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter URL or Text</label>
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-webpeaker-500 focus:ring-2 focus:ring-webpeaker-100"
          />
        </div>

        <div className="w-64 h-64 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50 overflow-hidden p-4">
          {url ? (
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`} 
              alt="QR Code" 
              className="w-full h-full object-contain"
            />
          ) : (
            <p className="text-gray-400 text-sm text-center">Your QR code will<br/>appear here</p>
          )}
        </div>
      </div>
    </div>
  );
}