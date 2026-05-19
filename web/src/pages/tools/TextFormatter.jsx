import { useState } from 'react';
import { Type, Copy, Trash2 } from 'lucide-react';

export default function TextFormatter() {
  const [text, setText] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert('Text copied!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <div className="bg-blue-100 text-blue-500 p-2 rounded-xl">
             <Type size={24} />
          </div>
          Text Formatter
        </h1>
        <p className="text-gray-500">Format, transform and modify your text effortlessly.</p>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setText(text.toUpperCase())} className="bg-webpeaker-50 text-webpeaker-600 px-4 py-2 rounded-lg font-medium hover:bg-webpeaker-100 transition">UPPERCASE</button>
          <button onClick={() => setText(text.toLowerCase())} className="bg-webpeaker-50 text-webpeaker-600 px-4 py-2 rounded-lg font-medium hover:bg-webpeaker-100 transition">lowercase</button>
          <div className="flex-1"></div>
          <button onClick={handleCopy} className="text-gray-500 hover:text-gray-700 p-2"><Copy size={20} /></button>
          <button onClick={() => setText('')} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
        </div>
        
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-webpeaker-500 focus:ring-2 focus:ring-webpeaker-100 resize-none custom-scrollbar"
        ></textarea>
        
        <div className="mt-4 text-sm text-gray-400 font-medium">
          Character Count: {text.length} | Word Count: {text.split(/\s+/).filter(word => word.length > 0).length}
        </div>
      </div>
    </div>
  );
}