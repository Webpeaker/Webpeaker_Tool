import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans"> {/* background color add kiya */}
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[250px]">
        <Topbar />
        <main className="flex-1 mt-[70px] p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}