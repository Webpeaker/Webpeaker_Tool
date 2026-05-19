import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('webpeaker-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('webpeaker-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen bg-[#fbfbfd] font-sans text-gray-950 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[260px]">
        <Topbar isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode((value) => !value)} />
        <main className="flex-1 mt-[72px] px-8 py-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
