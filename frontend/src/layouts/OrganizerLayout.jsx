import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiBell, FiSearch, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import OrganizerSidebar from '../components/dashboard/OrganizerSidebar';

const OrganizerLayout = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Basic mobile menu state (optional for now, mainly focusing on desktop per requirements but good to have)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
      {/* Sidebar */}
      <OrganizerSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FiMenu size={24} />
            </button>
            <div className="relative hidden md:block w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-primary transition-colors">
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button className="relative p-2 text-gray-500 hover:text-primary transition-colors">
              <FiBell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold dark:text-white text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">Event Organizer</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 border border-primary/30">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {/* Background effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;
