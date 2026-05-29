import { Search, Moon, Heart, Grid } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-[70px] bg-white fixed top-0 right-0 w-[calc(100%-250px)] z-20 border-b border-gray-100 px-8 flex items-center justify-between">
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-96 focus-within:ring-2 ring-webpeaker-100 transition-all">
        <Search size={18} className="text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search tools... (Ctrl + /)" 
          className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
        <button className="flex items-center gap-2 hover:text-webpeaker-600 transition-colors">
          <Moon size={18} /> Dark
        </button>
        <button className="flex items-center gap-2 hover:text-webpeaker-600 transition-colors">
          <Heart size={18} /> Favorites
        </button>
        <button className="bg-webpeaker-600 hover:bg-webpeaker-900 text-white px-5 py-2 rounded-full flex items-center gap-2 transition-colors shadow-md shadow-webpeaker-100">
          <Grid size={18} /> Explore All Tools
        </button>
      </div>
    </header>
  );
}