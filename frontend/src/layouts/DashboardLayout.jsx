import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiGrid, FiFilm, FiUsers, FiDollarSign, FiSettings, FiMenu, FiX, FiLogOut, 
  FiHeart, FiBell, FiUser, FiCalendar, FiPlusSquare, FiPercent, FiCreditCard,
  FiChevronDown
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllRead } from '../services/notificationService';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const userRole = user?.role?.role_name || user?.role || 'Customer';
  const email = user?.email || '';
  const fullName = user?.full_name || 'Guest User';

  // Load notifications from backend
  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      // Backend response might wrap inside data or be direct array
      const items = data.data || data;
      setNotifications(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 45s for fresh messages
    const timer = setInterval(fetchNotifs, 45000);
    return () => clearInterval(timer);
  }, []);

  // Handle outside click closures
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  // Define sidebar items based on User roles
  const getSidebarLinks = () => {
    switch (userRole) {
      case 'Admin':
        return [
          { name: 'Analytics', icon: FiGrid, path: '/dashboard/admin' },
          { name: 'Users', icon: FiUsers, path: '/dashboard/admin/users' },
          { name: 'Movies', icon: FiFilm, path: '/dashboard/admin/movies' },
          { name: 'Events', icon: FiCalendar, path: '/dashboard/admin/events' },
          { name: 'Theatres', icon: FiPlusSquare, path: '/dashboard/admin/theatres' },
          { name: 'Bookings', icon: FiCreditCard, path: '/dashboard/admin/bookings' },
          { name: 'Coupons', icon: FiPercent, path: '/dashboard/admin/coupons' },
          { name: 'Settings', icon: FiSettings, path: '/dashboard/admin/settings' }
        ];
      case 'Theatre Owner':
        return [
          { name: 'Dashboard', icon: FiGrid, path: '/dashboard/theatre-owner' },
          { name: 'Movies', icon: FiFilm, path: '/dashboard/theatre-owner/movies' },
          { name: 'Shows', icon: FiCalendar, path: '/dashboard/theatre-owner/shows' },
          { name: 'Bookings', icon: FiCreditCard, path: '/dashboard/theatre-owner/bookings' },
          { name: 'Revenue', icon: FiDollarSign, path: '/dashboard/theatre-owner/revenue' }
        ];
      case 'Event Organizer':
        return [
          { name: 'Dashboard', icon: FiGrid, path: '/dashboard/organizer' },
          { name: 'Events', icon: FiCalendar, path: '/dashboard/organizer/events' },
          { name: 'Participants', icon: FiUsers, path: '/dashboard/organizer/participants' },
          { name: 'Revenue', icon: FiDollarSign, path: '/dashboard/organizer/revenue' }
        ];
      case 'Customer':
      default:
        return [
          { name: 'Dashboard', icon: FiGrid, path: '/dashboard/customer' },
          { name: 'My Bookings', icon: FiCreditCard, path: '/dashboard/customer/bookings' },
          { name: 'My Wishlist', icon: FiHeart, path: '/dashboard/customer/wishlist' },
          { name: 'Notifications', icon: FiBell, path: '/dashboard/customer/notifications' },
          { name: 'Profile', icon: FiUser, path: '/dashboard/customer/profile' }
        ];
    }
  };

  const links = getSidebarLinks();
  const unreadCount = notifications.filter(n => !n.read_status).length;

  // Breadcrumb generator
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return (
      <div className="flex items-center gap-1 text-xs font-semibold text-text-secondary">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        {paths.map((p, idx) => {
          const pathUrl = `/${paths.slice(0, idx + 1).join('/')}`;
          const label = p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ');
          const isLast = idx === paths.length - 1;
          return (
            <React.Fragment key={idx}>
              <span className="text-border">/</span>
              {isLast ? (
                <span className="text-text-primary">{label}</span>
              ) : (
                <Link to={pathUrl} className="hover:text-primary transition-colors">{label}</Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand logo */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold tracking-tighter text-primary">
          Ticket<span className="text-text-primary">Show</span>
        </Link>
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1 rounded-full hover:bg-hover-bg text-text-secondary"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group focus-visible:ring-2 focus-visible:ring-primary",
                isActive 
                  ? "bg-primary text-text-primary font-bold shadow-sm" 
                  : "text-text-secondary hover:bg-hover-bg hover:text-text-primary"
              )}
              onClick={() => setIsMobileOpen(false)}
            >
              <link.icon size={18} className={cn("transition-colors", isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary")} />
              <span className="text-sm font-semibold">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Log out footer */}
      <div className="p-4 border-t border-border bg-gray-50/50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-danger hover:bg-red-50 transition-colors w-full px-4 py-3 rounded-xl font-semibold text-sm focus-visible:ring-2 focus-visible:ring-danger"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar (Left shell) */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-40 bg-white border-r border-border shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Left shell slide-out) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 z-50 bg-white shadow-2xl border-r border-border flex flex-col md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Right Content Frame */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-border sticky top-0 z-35 flex items-center justify-between px-6 shadow-sm">
          {/* Hamburger toggle */}
          <button 
            aria-label="Toggle Navigation SidebarMenu"
            className="md:hidden text-text-primary p-1 rounded-full hover:bg-hover-bg transition-colors"
            onClick={() => setIsMobileOpen(true)}
          >
            <FiMenu size={24} />
          </button>

          {/* Breadcrumb section */}
          <div className="hidden sm:block">
            {getBreadcrumbs()}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="p-2 text-text-secondary hover:bg-hover-bg hover:text-text-primary rounded-full relative transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-lg p-4 z-50 text-left"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <h4 className="font-bold text-sm text-text-primary">Notifications</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto mt-2 divide-y divide-border/60">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={cn("py-3 text-xs", !n.read_status && "font-semibold text-text-primary")}>
                            <p>{n.message}</p>
                            <span className="text-[10px] text-text-secondary mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-text-secondary text-center py-6">No new notifications.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-hover-bg rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold text-sm">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-text-primary leading-tight">{fullName}</p>
                  <p className="text-[10px] text-text-secondary leading-none">{userRole}</p>
                </div>
                <FiChevronDown size={14} className="text-text-secondary hidden lg:block" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-lg py-2 z-50 text-left"
                  >
                    <div className="px-4 py-2 border-b border-border lg:hidden">
                      <p className="text-sm font-bold text-text-primary">{fullName}</p>
                      <p className="text-xs text-text-secondary">{userRole}</p>
                    </div>
                    <Link 
                      to={userRole === 'Customer' ? '/dashboard/customer/profile' : `/dashboard/${userRole.toLowerCase().replace(' ', '-')}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-hover-bg font-semibold"
                    >
                      <FiUser size={16} />
                      <span>My Profile</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 font-semibold w-full text-left"
                    >
                      <FiLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
