import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('webpeaker-theme') === 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('webpeaker-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen bg-[#fbfbfd] font-sans text-gray-950 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col lg:ml-[260px]">
        <Topbar
          isDarkMode={isDarkMode}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onToggleDarkMode={() => setIsDarkMode((value) => !value)}
        />
        <main className="mt-[132px] flex-1 overflow-x-hidden px-4 py-5 sm:px-6 lg:mt-[72px] lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
