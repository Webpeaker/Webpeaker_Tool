import { useState } from 'react';
import { Paintbrush } from 'lucide-react';

export default function TextDesigner() {
  const [text, setText] = useState('WebPeaker');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <div className="bg-pink-100 text-pink-500 p-2 rounded-xl">
             <Paintbrush size={24} />
          </div>
          Text Designer
        </h1>
        <p className="text-gray-500">Add beautiful styles and spacing to your ordinary text.</p>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something cool..."
          className="w-full p-4 mb-6 border border-gray-200 rounded-xl focus:outline-none focus:border-webpeaker-500"
        />

        <div className="grid gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Spaced Out</p>
            <p className="text-xl font-medium text-gray-800 tracking-[0.3em]">{text}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Thick & Bold</p>
            <p className="text-2xl font-black text-gray-900">{text}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Lowercase Aesthetic</p>
            <p className="text-lg text-gray-600 font-serif italic">{text.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}