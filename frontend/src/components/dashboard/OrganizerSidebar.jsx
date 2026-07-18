import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiList, FiPlusSquare, FiUser, FiSettings, FiLogOut, FiCalendar } from 'react-icons/fi';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: FiGrid, path: '/organizer/dashboard' },
  { label: 'My Events', icon: FiCalendar, path: '/organizer/events' },
  { label: 'Create Event', icon: FiPlusSquare, path: '/organizer/create-event' },
  { type: 'divider' },
  { label: 'Profile', icon: FiUser, path: '/organizer/profile' },
  { label: 'Settings', icon: FiSettings, path: '/organizer/settings' },
];

const OrganizerSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-64 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold tracking-tighter text-primary">
          Organizer<span className="dark:text-white text-gray-900">Panel</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item, idx) => {
            if (item.type === 'divider') {
              return <div key={`div-${idx}`} className="h-px bg-gray-200 dark:bg-gray-800 my-4 mx-2"></div>;
            }

            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <FiLogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default OrganizerSidebar;
