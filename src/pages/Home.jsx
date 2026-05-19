import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { categories, tools } from '../data/tools';
import ToolCard from '../components/ToolCard';

function HeroArt() {
  return (
    <div className="relative hidden min-h-[260px] items-center justify-center lg:flex">
      <div className="absolute right-4 top-2 h-44 w-44 rounded-full bg-webpeaker-100 blur-3xl" />
      <div className="absolute bottom-8 right-0 h-24 w-24 rounded-full bg-blue-100 blur-2xl" />

      <div className="absolute left-6 top-12 rotate-[-14deg] rounded-lg bg-emerald-400 p-3 text-2xl font-black text-white shadow-xl">T</div>
      <div className="absolute right-12 top-6 rotate-[14deg] rounded-lg bg-blue-500 p-3 font-mono text-xl font-black text-white shadow-xl">&lt;/&gt;</div>
      <div className="absolute left-2 bottom-16 rotate-[-18deg] rounded-lg bg-orange-400 p-3 font-black text-white shadow-xl">IMG</div>

      <div className="relative mt-10 h-32 w-72 rounded-[18px] bg-webpeaker-600 shadow-[0_24px_55px_rgba(104,50,227,0.28)]">
        <div className="absolute -top-16 left-8 h-20 w-56 rounded-t-[18px] border-b border-purple-500 bg-webpeaker-500 shadow-lg">
          <div className="absolute left-5 top-6 h-11 w-9 rounded-md bg-gray-700">
            <div className="mx-auto mt-2 h-3 w-5 rounded-sm bg-gray-500" />
            <div className="mx-auto mt-2 grid w-6 grid-cols-2 gap-1">
              <span className="h-1.5 rounded-sm bg-orange-300" />
              <span className="h-1.5 rounded-sm bg-orange-300" />
              <span className="h-1.5 rounded-sm bg-orange-300" />
              <span className="h-1.5 rounded-sm bg-orange-300" />
            </div>
          </div>
          <div className="absolute left-20 top-1 h-20 w-5 rotate-[8deg] rounded-full bg-gray-300" />
          <div className="absolute left-[116px] top-4 h-24 w-5 rotate-[4deg] rounded-full bg-amber-400" />
          <div className="absolute right-10 top-2 h-24 w-7 rotate-[12deg] rounded-md bg-orange-300" />
        </div>
        <div className="absolute left-1/2 top-8 flex h-16 w-20 -translate-x-1/2 items-center justify-center rounded-b-xl rounded-t-sm bg-[#5525c8] text-4xl font-black text-white">W</div>
        <div className="absolute bottom-4 left-5 right-5 h-3 rounded-full bg-purple-800/30" />
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesSearch = !normalized || `${tool.name} ${tool.category} ${tool.description}`.toLowerCase().includes(normalized);
      const matchesCategory = activeCategory === 'all' || tool.categoryId === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, query]);

  const popularTools = tools.filter((tool) => tool.isPopular).slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="relative mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-[#faf8ff] via-[#f7f1ff] to-[#efe7ff] px-5 py-7 shadow-[0_8px_35px_rgba(104,50,227,0.06)] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:shadow-none sm:px-7 sm:py-8 lg:mb-8 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(104,50,227,0.14),transparent_55%)] sm:w-1/2" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_470px]">
          <div className="min-w-0">
            <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-normal text-gray-950 dark:text-white sm:text-5xl lg:text-[52px]">
              All-in-One <br />
              <span className="text-webpeaker-600">Web Tools</span> Platform
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-300 sm:text-base sm:leading-7 lg:mt-6">
              Fast, free and easy-to-use online tools for everyday tasks.
              <br />
              No sign-up required. <span className="font-bold text-webpeaker-600">100% free</span> to use!
            </p>

            <div className="mt-6 flex w-full max-w-[540px] items-center rounded-lg border border-webpeaker-500 bg-white px-4 py-3 shadow-sm transition-all focus-within:ring-4 focus-within:ring-webpeaker-100 dark:bg-gray-950 dark:focus-within:ring-webpeaker-900/40 sm:px-5 sm:py-4 lg:mt-7">
              <Search className="mr-3 shrink-0 text-gray-500 dark:text-gray-400 sm:mr-4" size={22} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search any tool..."
                className="min-w-0 w-full bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 sm:text-base"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Trending:</span>
              {['Text Formatter', 'QR Generator', 'Image Compressor', 'Calculator'].map((tag) => (
                <span key={tag} className="rounded-md bg-white/80 px-3 py-1.5 text-xs font-bold text-webpeaker-600 shadow-sm dark:bg-gray-950 dark:text-webpeaker-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <HeroArt />
        </div>
      </section>

      <section className="mb-7">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-3 text-lg font-black text-gray-950 dark:text-white sm:text-xl">
            <TrendingUp className="text-webpeaker-600" size={22} /> Popular Tools
          </h2>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActiveCategory('all');
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:border-webpeaker-200 hover:text-webpeaker-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 sm:w-auto"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mb-7">
        <h2 className="mb-4 text-lg font-black text-gray-950 dark:text-white sm:text-xl">Browse by Category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.slice(0, 15).map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(isActive ? 'all' : cat.id)}
                className={`flex min-w-0 items-center gap-4 rounded-lg border bg-white p-4 text-left shadow-[0_8px_30px_rgba(17,24,39,0.03)] transition dark:bg-gray-900 dark:shadow-none ${
                  isActive ? 'border-webpeaker-500 ring-4 ring-webpeaker-100 dark:ring-webpeaker-900/40' : 'border-gray-100 hover:border-webpeaker-100 dark:border-gray-800 dark:hover:border-webpeaker-900'
                }`}
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${cat.bg} ${cat.color}`}>
                  <CatIcon size={24} strokeWidth={1.9} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-gray-950 dark:text-gray-100">{cat.name}</span>
                  <span className="mt-1 block text-xs font-semibold text-gray-400 dark:text-gray-500">{cat.count}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-950 dark:text-white sm:text-xl">All Utility Tools</h2>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Showing {filteredTools.length} of {tools.length} tools.
            </p>
          </div>
          {(query || activeCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveCategory('all');
              }}
              className="w-full rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-500 shadow-sm hover:text-webpeaker-600 dark:bg-gray-900 dark:text-gray-300 dark:shadow-none sm:w-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {filteredTools.map((tool) => (
              <ToolCard key={`${tool.categoryId}-${tool.id}`} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-100 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:p-10">
            <p className="font-bold text-gray-800 dark:text-gray-100">No matching tools found.</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try searching for text, image, JSON, PDF, password, URL, CSS, API, or date.</p>
            <Link to="/" onClick={() => setQuery('')} className="mt-4 inline-flex rounded-lg bg-webpeaker-600 px-4 py-2 text-sm font-bold text-white">
              Reset search
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
