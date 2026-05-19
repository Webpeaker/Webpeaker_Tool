import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark } from 'lucide-react';
import { categories } from '../data/tools';

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[250px] bg-white h-screen fixed left-0 top-0 z-30 border-r border-gray-100 overflow-y-auto flex flex-col custom-scrollbar pb-6">
      <div className="p-6 sticky top-0 bg-white z-10">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <div className="bg-webpeaker-600 text-white p-1.5 rounded-lg">W</div>
          WebPeaker
        </Link>
      </div>

      <div className="px-4">
        <Link 
          to="/" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${
            location.pathname === '/' ? 'bg-webpeaker-50 text-webpeaker-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Home size={20} />
          Home
        </Link>

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Categories
        </div>
        
       
<ul className="space-y-1">
  {categories.map((cat) => {
    const CatIcon = cat.icon; 
    
    return (
      <li key={cat.id}>
        <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-webpeaker-600 transition-colors">
          {CatIcon && <CatIcon size={18} />}
          {cat.name}
        </Link>
      </li>
    );
  })}
</ul>

        
        <div className="mt-8 mx-2 bg-webpeaker-50 p-4 rounded-2xl border border-webpeaker-100">
          <div className="flex items-center gap-2 text-webpeaker-600 font-semibold mb-2">
            <Bookmark size={18} />
            Bookmark Tools
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Press Ctrl+D to bookmark your favorite tools for quick access anytime.
          </p>
        </div>
      </div>
    </aside>
  );
}