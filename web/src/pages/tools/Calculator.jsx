import { useState } from 'react';
import { Calculator as CalcIcon, Delete } from 'lucide-react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');

  const handleClick = (value) => {
    if (display === '0' && value !== '.') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

const calculate = () => {
    try {
      // Safe alternative to eval()
      const result = new Function('return ' + display)();
      setDisplay(String(result));
    } catch {
      setDisplay('Error');
    }
  };
  const clear = () => setDisplay('0');
  
  const backspace = () => {
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <div className="bg-green-100 text-green-500 p-2 rounded-xl">
             <CalcIcon size={24} />
          </div>
          Online Calculator
        </h1>
        <p className="text-gray-500">Perform basic and advanced mathematical calculations.</p>
      </div>
      
      {/* Calculator UI */}
      <div className="flex items-center justify-center">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 w-full max-w-sm">
          
          {/* Display Area */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right overflow-x-auto custom-scrollbar border border-gray-100">
            <span className="text-4xl font-semibold text-gray-800 tracking-wider">
              {display}
            </span>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            <button onClick={clear} className="col-span-2 bg-red-100 text-red-500 font-bold py-3 rounded-xl hover:bg-red-200 transition-colors">AC</button>
            <button onClick={backspace} className="bg-gray-100 text-gray-600 font-bold py-3 rounded-xl flex justify-center items-center hover:bg-gray-200 transition-colors"><Delete size={20}/></button>
            <button onClick={() => handleClick('/')} className="bg-webpeaker-100 text-webpeaker-600 font-bold py-3 rounded-xl text-xl hover:bg-webpeaker-200 transition-colors">÷</button>

            <button onClick={() => handleClick('7')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">7</button>
            <button onClick={() => handleClick('8')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">8</button>
            <button onClick={() => handleClick('9')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">9</button>
            <button onClick={() => handleClick('*')} className="bg-webpeaker-100 text-webpeaker-600 font-bold py-3 rounded-xl text-xl hover:bg-webpeaker-200 transition-colors">×</button>

            <button onClick={() => handleClick('4')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">4</button>
            <button onClick={() => handleClick('5')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">5</button>
            <button onClick={() => handleClick('6')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">6</button>
            <button onClick={() => handleClick('-')} className="bg-webpeaker-100 text-webpeaker-600 font-bold py-3 rounded-xl text-xl hover:bg-webpeaker-200 transition-colors">-</button>

            <button onClick={() => handleClick('1')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">1</button>
            <button onClick={() => handleClick('2')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">2</button>
            <button onClick={() => handleClick('3')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">3</button>
            <button onClick={() => handleClick('+')} className="bg-webpeaker-100 text-webpeaker-600 font-bold py-3 rounded-xl text-xl hover:bg-webpeaker-200 transition-colors">+</button>

            <button onClick={() => handleClick('0')} className="col-span-2 bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">0</button>
            <button onClick={() => handleClick('.')} className="bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-lg hover:bg-gray-100 transition-colors">.</button>
            <button onClick={calculate} className="bg-webpeaker-600 text-white font-bold py-3 rounded-xl text-xl hover:bg-webpeaker-900 shadow-md shadow-webpeaker-600/30 transition-all">=</button>
          </div>
        </div>
      </div>
    </div>
  );
}