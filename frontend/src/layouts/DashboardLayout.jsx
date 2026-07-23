import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiGrid, FiFilm, FiUsers, FiDollarSign, FiSettings, FiMenu, FiX, FiLogOut, 
  FiHeart, FiBell, FiUser, FiCalendar, FiPlusSquare, FiPercent, FiCreditCard,
  FiChevronDown, FiActivity, FiLayout, FiSearch, FiSliders, FiShield, FiDatabase,
  FiTrendingUp, FiFolder, FiMail, FiTerminal
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllRead } from '../services/notificationService';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

import ImpersonateBanner from '../components/admin/ImpersonateBanner';
import GlobalSearchModal from '../components/admin/GlobalSearchModal';
import NotificationsCenter from '../components/admin/NotificationsCenter';

import ErrorBoundary from '../components/ui/ErrorBoundary';

const DashboardLayout = () => {
  const { user, logout, isImpersonating, compactMode } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const userRole = user?.role?.role_name || user?.role || 'Customer';
  const email = user?.email || '';
  const fullName = user?.full_name || user?.name || 'Guest User';

  // Role Access Enforcement Security Check
  useEffect(() => {
    if (userRole === 'Customer') {
      toast.error('Access Restricted: Admin or Owner privileges required.');
      navigate('/', { replace: true });
      return;
    }

    if (location.pathname.startsWith('/super-admin') && userRole !== 'Super Admin') {
      toast.error('Access Restricted: Super Admin permissions required.');
      navigate(userRole === 'Admin' ? '/admin/dashboard' : (userRole === 'Theatre Owner' ? '/theatre/dashboard' : '/'), { replace: true });
    } else if (location.pathname.startsWith('/admin') && userRole !== 'Admin' && userRole !== 'Super Admin') {
      toast.error('Access Restricted: Admin permissions required.');
      navigate(userRole === 'Theatre Owner' ? '/theatre/dashboard' : '/', { replace: true });
    } else if (location.pathname.startsWith('/theatre') && userRole !== 'Theatre Owner' && userRole !== 'Super Admin') {
      toast.error('Access Restricted: Theatre Owner permissions required.');
      navigate(userRole === 'Admin' ? '/admin/dashboard' : '/', { replace: true });
    }
  }, [location.pathname, userRole, navigate]);

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

  // Define sidebar items based on User roles
  const getSidebarLinks = () => {
    switch (userRole) {
      case 'Super Admin':
        return [
          { name: 'Dashboard Overview', icon: FiGrid, path: '/super-admin/dashboard' },
          { name: 'Theatre Applications', icon: FiPlusSquare, path: '/admin/applications' },
          { name: 'Theatre Management', icon: FiLayout, path: '/admin/theatres' },
          { name: 'Screens', icon: FiLayout, path: '/admin/screens' },
          { name: 'Shows', icon: FiCalendar, path: '/admin/shows' },
          { name: 'Movie Catalog', icon: FiFilm, path: '/admin/movies' },
          { name: 'Event Management', icon: FiCalendar, path: '/admin/events' },
          { name: 'Bookings & Refunds', icon: FiCreditCard, path: '/admin/bookings' },
          { name: 'Customer Directory', icon: FiUsers, path: '/admin/customers' },
          { name: 'Coupon Management', icon: FiPercent, path: '/admin/coupons' },
          { name: 'Reports & Exports', icon: FiActivity, path: '/admin/reports' },
          { name: 'Support Center', icon: FiMail, path: '/admin/support' },
          { name: 'Platform Analytics & BI', icon: FiTrendingUp, path: '/super-admin/bi-dashboard' },
          { name: 'Manage Admins', icon: FiUsers, path: '/super-admin/admins' },
          { name: 'Theatre Owners (Impersonate)', icon: FiUser, path: '/super-admin/owners' },
          { name: 'Roles & Matrix', icon: FiShield, path: '/super-admin/roles' },
          { name: 'System Configuration', icon: FiSettings, path: '/super-admin/platform-config' },
          { name: 'Homepage CMS', icon: FiLayout, path: '/super-admin/cms' },
          { name: 'Advertisements', icon: FiPercent, path: '/super-admin/ads' },
          { name: 'Payments & Payouts', icon: FiDollarSign, path: '/super-admin/payments' },
          { name: 'Audit Logs', icon: FiActivity, path: '/super-admin/audit-logs' },
          { name: 'Notifications Center', icon: FiBell, path: '/super-admin/notifications' },
          { name: 'Database & Backups', icon: FiDatabase, path: '/super-admin/database' },
          { name: 'Active Sessions', icon: FiUsers, path: '/super-admin/sessions' },
          { name: 'Platform Health', icon: FiActivity, path: '/super-admin/platform-health' },
          { name: 'Activity Stream', icon: FiActivity, path: '/super-admin/activity-feed' },
          { name: 'Media File Library', icon: FiFolder, path: '/super-admin/file-manager' },
          { name: 'Email Templates', icon: FiMail, path: '/super-admin/email-templates' },
          { name: 'System Logs', icon: FiTerminal, path: '/super-admin/system-logs' },
          { name: 'Customizer & Feature Flags', icon: FiSliders, path: '/super-admin/customizer' }
        ];
      case 'Admin':
        return [
          { name: 'Dashboard Overview', icon: FiGrid, path: '/admin/dashboard' },
          { name: 'Theatre Applications', icon: FiPlusSquare, path: '/admin/applications' },
          { name: 'Theatres', icon: FiLayout, path: '/admin/theatres' },
          { name: 'Screens', icon: FiLayout, path: '/admin/screens' },
          { name: 'Shows', icon: FiCalendar, path: '/admin/shows' },
          { name: 'Movies Catalog', icon: FiFilm, path: '/admin/movies' },
          { name: 'Live Events', icon: FiCalendar, path: '/admin/events' },
          { name: 'Bookings & Refunds', icon: FiCreditCard, path: '/admin/bookings' },
          { name: 'Customers', icon: FiUsers, path: '/admin/customers' },
          { name: 'Coupons', icon: FiPercent, path: '/admin/coupons' },
          { name: 'Reports & Analytics', icon: FiActivity, path: '/admin/reports' },
          { name: 'Support Tickets', icon: FiMail, path: '/admin/support' },
          { name: 'Admin Settings', icon: FiSettings, path: '/admin/settings' }
        ];
      case 'Theatre Owner':
        return [
          { name: 'Dashboard', icon: FiGrid, path: '/theatre/dashboard' },
          { name: 'My Theatres', icon: FiPlusSquare, path: '/theatre/dashboard/theatres' },
          { name: 'Screens & Seat Layout', icon: FiLayout, path: '/theatre/dashboard/screens' },
          { name: 'Movies Catalog', icon: FiFilm, path: '/theatre/dashboard/movies' },
          { name: 'Showtimes', icon: FiCalendar, path: '/theatre/dashboard/shows' },
          { name: 'Bookings', icon: FiCreditCard, path: '/theatre/dashboard/bookings' },
          { name: 'Food & Beverage', icon: FiGrid, path: '/theatre/dashboard/food-beverage' },
          { name: 'Staff Management', icon: FiUsers, path: '/theatre/dashboard/staff' },
          { name: 'Coupons & Offers', icon: FiPercent, path: '/theatre/dashboard/promotions' },
          { name: 'Customer Reviews', icon: FiHeart, path: '/theatre/dashboard/reviews' },
          { name: 'Reports & Revenue', icon: FiDollarSign, path: '/theatre/dashboard/revenue' },
          { name: 'Audit Logs', icon: FiActivity, path: '/theatre/dashboard/audit-logs' },
          { name: 'Profile & Settings', icon: FiUser, path: '/theatre/dashboard/profile' }
        ];
      case 'Event Organizer':
        return [
          { name: 'Dashboard', icon: FiGrid, path: '/organizer/dashboard' },
          { name: 'Events', icon: FiCalendar, path: '/organizer/events' },
          { name: 'Ticket Sales', icon: FiCreditCard, path: '/organizer/ticket-sales' },
          { name: 'Bookings', icon: FiUsers, path: '/organizer/bookings' },
          { name: 'Coupons', icon: FiPercent, path: '/organizer/coupons' },
          { name: 'Reports', icon: FiActivity, path: '/organizer/reports' },
          { name: 'Revenue', icon: FiDollarSign, path: '/organizer/revenue' },
          { name: 'Profile', icon: FiUser, path: '/organizer/profile' }
        ];
      case 'Customer':
      default:
        return [
          { name: 'Dashboard Overview', icon: FiGrid, path: '/dashboard' },
          { name: 'Profile', icon: FiUser, path: '/dashboard/profile' },
          { name: 'My Bookings', icon: FiCreditCard, path: '/dashboard/bookings' },
          { name: 'Upcoming Shows', icon: FiCalendar, path: '/dashboard/upcoming' },
          { name: 'Booking History', icon: FiActivity, path: '/dashboard/history' },
          { name: 'Wishlist', icon: FiHeart, path: '/dashboard/wishlist' },
          { name: 'Notifications', icon: FiBell, path: '/dashboard/notifications' },
          { name: 'Offers', icon: FiPercent, path: '/offers' },
          { name: 'Settings', icon: FiSettings, path: '/dashboard/settings' }
        ];
    }
  };

  const links = getSidebarLinks();
  const isTheatreOwner = userRole === 'Theatre Owner';

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
                <span className="text-text-primary font-bold">{label}</span>
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
    <div className={cn("flex flex-col h-full", isTheatreOwner ? "bg-slate-950 text-white" : "bg-white")}>
      {/* Brand logo */}
      <div className={cn("p-5 border-b flex items-center justify-between", isTheatreOwner ? "border-slate-800" : "border-border")}>
        <Link to="/" className={cn("text-2xl font-extrabold tracking-tighter flex items-center gap-1.5", isTheatreOwner ? "text-amber-400" : "text-primary")}>
          <span>Ticket</span><span className={isTheatreOwner ? "text-white" : "text-text-primary"}>Show</span>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/30">
            {userRole === 'Super Admin' ? 'Super' : (userRole === 'Admin' ? 'Admin' : 'Partner')}
          </span>
        </Link>
        <button 
          onClick={() => setIsMobileOpen(false)}
          className={cn("md:hidden p-1 rounded-full", isTheatreOwner ? "hover:bg-slate-900 text-slate-400" : "hover:bg-hover-bg text-text-secondary")}
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-grow px-3 py-4 space-y-0.5 overflow-y-auto hide-scrollbar text-left">
        {links.map((link) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-primary",
                isActive 
                  ? isTheatreOwner 
                    ? "bg-amber-400 text-gray-950 font-black shadow-sm"
                    : "bg-primary text-text-primary font-black shadow-sm" 
                  : isTheatreOwner
                    ? "text-slate-400 hover:bg-slate-900 hover:text-white"
                    : "text-text-secondary hover:bg-hover-bg hover:text-text-primary font-semibold"
              )}
              onClick={() => setIsMobileOpen(false)}
            >
              <link.icon size={17} className={cn("shrink-0 transition-colors", isActive ? isTheatreOwner ? "text-gray-950" : "text-text-primary" : isTheatreOwner ? "text-slate-400 group-hover:text-white" : "text-text-secondary group-hover:text-text-primary")} />
              <span className="text-xs tracking-tight">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Log out footer */}
      <div className={cn("p-4 border-t", isTheatreOwner ? "border-slate-800 bg-slate-950" : "border-border bg-gray-50/50")}>
        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 transition-colors w-full px-4 py-2.5 rounded-xl font-bold text-xs focus-visible:ring-2 cursor-pointer",
            isTheatreOwner 
              ? "text-red-400 hover:bg-slate-900 focus-visible:ring-red-400" 
              : "text-danger hover:bg-red-50 focus-visible:ring-danger"
          )}
        >
          <FiLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const getProfileLink = () => {
    if (userRole === 'Super Admin') return '/super-admin/profile';
    if (userRole === 'Admin') return '/admin/profile';
    if (userRole === 'Theatre Owner') return '/theatre/dashboard/profile';
    if (userRole === 'Event Organizer') return '/organizer/profile';
    return '/profile';
  };

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", compactMode && "text-xs")}>
      {/* Impersonation top notification banner */}
      <ImpersonateBanner />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Desktop Sidebar (Left shell) */}
        <aside className={cn("hidden md:flex flex-col w-64 fixed inset-y-0 z-40 border-r shadow-sm", isTheatreOwner ? "bg-slate-950 border-slate-900" : "bg-white border-border")}>
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
                className={cn("fixed inset-y-0 left-0 w-64 z-50 shadow-2xl border-r flex flex-col md:hidden", isTheatreOwner ? "bg-slate-950 border-slate-900" : "bg-white border-border")}
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Right Content Frame */}
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
          {/* Top Navbar */}
          <header className="h-16 bg-white border-b border-border sticky top-0 z-35 flex items-center justify-between px-4 sm:px-6 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Hamburger toggle */}
              <button 
                aria-label="Toggle Navigation Sidebar Menu"
                className="md:hidden text-text-primary p-2 rounded-2xl hover:bg-hover-bg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                onClick={() => setIsMobileOpen(true)}
              >
                <FiMenu size={22} />
              </button>

              {/* Breadcrumb section */}
              <div className="hidden sm:block">
                {getBreadcrumbs()}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              {/* Global Search Ctrl + K Trigger Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 bg-hover-bg/60 border border-border px-3 py-2 rounded-2xl text-xs font-bold text-text-secondary hover:border-primary transition-all cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Open Global Search"
              >
                <FiSearch size={16} className="text-primary" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white border border-border rounded-md text-[10px] font-black text-text-primary shadow-xs">
                  Ctrl + K
                </kbd>
              </button>

              {/* Notifications Menu Dropdown */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNotificationsOpen(!isNotificationsOpen);
                  }}
                  className="p-2.5 text-text-secondary hover:bg-hover-bg hover:text-text-primary rounded-2xl relative transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Toggle Notifications"
                >
                  <FiBell size={20} />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-white animate-pulse" />
                </button>

                <NotificationsCenter
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex items-center gap-2 p-1.5 hover:bg-hover-bg rounded-2xl transition-all text-left cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="User Profile Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-900 font-extrabold text-sm shadow-xs">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-extrabold text-text-primary leading-tight">{fullName}</p>
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
                      className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-xl py-2 z-50 text-left"
                    >
                      <div className="px-4 py-2 border-b border-border lg:hidden">
                        <p className="text-sm font-bold text-text-primary">{fullName}</p>
                        <p className="text-xs text-text-secondary">{userRole}</p>
                      </div>
                      <Link 
                        to={getProfileLink()}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-hover-bg font-semibold min-h-[44px]"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser size={16} />
                        <span>My Profile</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50 font-semibold w-full text-left cursor-pointer min-h-[44px]"
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
          <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto overflow-x-hidden">
            <ErrorBoundary fallbackMessage="An issue occurred rendering this dashboard panel. Navigate to another section using the sidebar navigation.">
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Global Search Shortcut Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
