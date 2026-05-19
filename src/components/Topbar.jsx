import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Heart, Grid } from 'lucide-react';
import { tools } from '../data/tools';

export default function Topbar({ isDarkMode, onToggleDarkMode }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return tools
      .filter((tool) => `${tool.name} ${tool.category} ${tool.description}`.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [query]);

  const submitSearch = (event) => {
    event.preventDefault();
    if (matches[0]) {
      navigate(matches[0].path);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <header className="fixed right-0 top-0 z-20 flex h-[72px] w-[calc(100%-260px)] items-center justify-between border-b border-gray-100 bg-white px-8 transition-colors dark:border-gray-800 dark:bg-gray-950">
      <form
        onSubmit={submitSearch}
        className="relative flex w-[420px] items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:border-webpeaker-500 focus-within:ring-4 focus-within:ring-webpeaker-100 dark:border-gray-800 dark:bg-gray-900 dark:focus-within:ring-webpeaker-900/40"
      >
        <Search size={18} className="text-gray-400 mr-2" />
        <input 
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
          type="text" 
          placeholder="Search tools..." 
          className="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 dark:text-gray-100"
        />
        {isFocused && query.trim() && (
          <div className="absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-lg border border-gray-100 bg-white py-2 shadow-xl shadow-gray-200/70 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/30">
            {matches.length > 0 ? (
              matches.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={`${tool.categoryId}-${tool.id}`}
                    to={tool.path}
                    onClick={() => setQuery('')}
                    className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-webpeaker-50 dark:hover:bg-gray-800"
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tool.bg} ${tool.color}`}>
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-gray-900 dark:text-gray-100">{tool.name}</span>
                      <span className="block truncate text-xs font-medium text-gray-400">{tool.category}</span>
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm font-semibold text-gray-500">No tools found.</div>
            )}
          </div>
        )}
      </form>

      <div className="flex items-center gap-6 text-sm font-bold text-gray-700 dark:text-gray-200">
        <button className="flex items-center gap-2 rounded-lg border-0 bg-transparent p-0 transition-colors hover:text-webpeaker-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-webpeaker-500 dark:hover:text-webpeaker-100" type="button" onClick={onToggleDarkMode}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
        <button className="flex items-center gap-2 rounded-lg border-0 bg-transparent p-0 transition-colors hover:text-webpeaker-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-webpeaker-500 dark:hover:text-webpeaker-100" type="button">
          <Heart size={18} /> Favorites
        </button>
        <button className="flex items-center gap-2 rounded-lg border-0 bg-[#6832e3] px-5 py-2.5 text-white shadow-lg shadow-webpeaker-100 transition-colors hover:bg-webpeaker-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-webpeaker-500 dark:shadow-none" type="button">
          <Grid size={18} /> Explore All Tools
        </button>
      </div>
    </header>
  );
}
