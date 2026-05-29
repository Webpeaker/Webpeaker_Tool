import { tools, categories } from '../data/tools';
import ToolCard from '../components/ToolCard';
import { TrendingUp} from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-webpeaker-50 to-purple-50 rounded-3xl p-10 mb-10 flex items-center justify-between border border-webpeaker-100 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
            All-in-One <br/>
            <span className="text-webpeaker-600">Web Tools</span> Platform
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Fast, free and easy-to-use online tools for everyday tasks. <br/>
            No sign-up required. <span className="font-bold text-webpeaker-600">100% free</span> to use!
          </p>
          
          <div className="flex items-center bg-white rounded-full p-2 shadow-lg shadow-webpeaker-100/50 w-full max-w-md">
             <input type="text" placeholder="Search any tool..." className="flex-1 px-4 outline-none text-gray-700 bg-transparent" />
             <button className="bg-webpeaker-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-webpeaker-900 transition-colors">Search</button>
          </div>

          <div className="flex items-center gap-3 mt-6 text-sm">
            <span className="text-gray-500 font-medium">Trending:</span>
            {['Text Formatter', 'QR Generator', 'Image Compressor', 'Calculator'].map(tag => (
              <span key={tag} className="bg-white px-3 py-1 rounded-full text-webpeaker-600 font-medium text-xs border border-webpeaker-100">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Tools Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-webpeaker-600" size={24} /> Popular Tools
        </h2>
        <button className="text-sm font-medium text-gray-500 border border-gray-200 px-4 py-1.5 rounded-full hover:bg-white transition-colors">View all</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {tools.slice(0, 6).map((tool, idx) => (
          <ToolCard key={idx} tool={tool} />
        ))}
      </div>

      {/* Browse by Category Section (NEW) */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          Browse by Category
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div 
                key={cat.id} 
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-webpeaker-100 transition-all cursor-pointer flex items-center gap-4 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-105 transition-transform`}>
                  {CatIcon && <CatIcon size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}