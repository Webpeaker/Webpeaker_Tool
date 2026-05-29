import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export default function UnitConverter() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  
  const handleConvert = (e) => {
    const val = e.target.value;
    setValue(val);
    // Simple basic conversion (Meters to Kilometers as example)
    if(val) {
      setResult(String(val / 1000));
    } else {
      setResult('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <div className="bg-orange-100 text-orange-500 p-2 rounded-xl">
             <ArrowLeftRight size={24} />
          </div>
          Unit Converter
        </h1>
        <p className="text-gray-500">Convert between different units of measurement.</p>
      </div>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 max-w-xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Meters (m)</label>
            <input 
              type="number" 
              value={value}
              onChange={handleConvert}
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-webpeaker-500 font-medium text-lg"
              placeholder="0"
            />
          </div>
          
          <div className="pt-6 text-gray-400">
            <ArrowLeftRight size={24} />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kilometers (km)</label>
            <input 
              type="text" 
              readOnly
              value={result}
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-medium text-lg"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}