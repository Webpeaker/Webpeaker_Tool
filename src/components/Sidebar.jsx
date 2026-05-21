import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Home, X } from 'lucide-react';
import { categories } from '../data/tools';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const activeCategory = new URLSearchParams(location.search).get('category');
  const closeOnMobile = () => {
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-gray-950/45 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] max-w-[82vw] flex-col overflow-y-auto border-r border-gray-100 bg-white pb-5 shadow-[1px_0_0_rgba(17,24,39,0.02)] transition-transform duration-300 dark:border-gray-800 dark:bg-gray-950 lg:z-30 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="sticky top-0 z-10 bg-white px-7 py-5 transition-colors dark:bg-gray-950">
        <Link to="/" onClick={closeOnMobile} className="flex items-center gap-3 text-2xl font-black tracking-tight text-gray-950 dark:text-white">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6832e3] text-xl font-black text-white shadow-lg shadow-webpeaker-100">W</div>
          <span className="min-w-0 truncate">Web<span className="text-webpeaker-600">Peaker</span></span>
        </Link>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="absolute right-4 top-6 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="px-5">
        <Link 
          to="/" 
          onClick={closeOnMobile}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition-colors ${
            location.pathname === '/' && !activeCategory ? 'bg-webpeaker-50 text-webpeaker-600 dark:bg-webpeaker-900/35 dark:text-webpeaker-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white'
          }`}
        >
          <Home size={20} />
          Home
        </Link>

        <div className="mb-3 mt-7 px-4 text-sm font-semibold text-gray-400 dark:text-gray-500">
          Categories
        </div>

        <ul className="space-y-1">
          {categories.slice(0, 16).map((cat) => {
            const CatIcon = cat.icon; 
            const isActive = activeCategory === cat.id;

            return (
              <li key={cat.id}>
                <Link
                  to={`/?category=${cat.id}`}
                  onClick={closeOnMobile}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-webpeaker-50 text-webpeaker-600 dark:bg-webpeaker-900/35 dark:text-webpeaker-100' : 'text-gray-600 hover:bg-gray-50 hover:text-webpeaker-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-webpeaker-100'
                  }`}
                >
                  {CatIcon && <CatIcon size={18} strokeWidth={1.8} />}
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mx-1 mt-8 rounded-lg border border-webpeaker-100 bg-webpeaker-50 p-4 dark:border-webpeaker-900/60 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 font-bold text-webpeaker-600 dark:text-webpeaker-100">
            <Bookmark size={18} />
            Bookmark Tools
          </div>
          <p className="text-xs text-gray-500 leading-relaxed dark:text-gray-400">
            Press Ctrl+D to bookmark your favorite tools for quick access anytime.
          </p>
        </div>
      </nav>
    </aside>
    </>
  );
}
