import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import {
  FiGrid, FiUser, FiCalendar, FiClock, FiFilm, FiStar, FiBookmark,
  FiThumbsUp, FiDollarSign, FiGift, FiTag, FiBell, FiCreditCard,
  FiMapPin, FiMessageSquare, FiDownload, FiActivity, FiHelpCircle,
  FiSettings, FiLogOut, FiX, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const MENU_ITEMS = [
  { type: 'divider', label: 'Explore' },
  { id: 'movies', label: 'Movies', icon: FiFilm, type: 'link', path: '/movies' },
  { id: 'events', label: 'Events', icon: FiGrid, type: 'link', path: '/events' },
  { id: 'theatres', label: 'Theatres', icon: FiMapPin, type: 'link', path: '/theatres' },
  { type: 'divider', label: 'Partner with Us' },
  { id: 'partner-event', label: 'Become an Event Organizer', icon: FiUser, type: 'link', path: '/register' },
  { id: 'partner-theatre', label: 'Become a Theatre Owner', icon: FiUser, type: 'link', path: '/register' },
  { id: 'partner-login', label: 'Partner Login', icon: FiUser, type: 'link', path: '/login' },
  { type: 'divider', label: 'Dashboard' },
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid, type: 'scroll' },
  { id: 'profile', label: 'My Profile', icon: FiUser, type: 'link', path: '/profile' },
  { type: 'divider', label: 'My Bookings' },
  { id: 'upcoming-bookings', label: 'Upcoming Bookings', icon: FiCalendar, type: 'scroll' },
  { id: 'history', label: 'Booking History', icon: FiClock, type: 'scroll' },
  { id: 'download-tickets', label: 'Download Tickets', icon: FiDownload, type: 'toast', message: 'Ticketing system coming soon' },
  { type: 'divider', label: 'My Lists' },
  { id: 'favourites', label: 'Favourite Movies', icon: FiFilm, type: 'scroll' },
  { id: 'favourite-events', label: 'Favourite Events', icon: FiStar, type: 'scroll' },
  { id: 'watchlist', label: 'Watchlist', icon: FiBookmark, type: 'toast', message: 'Watchlist feature coming soon' },
  { id: 'recommended', label: 'Recommended', icon: FiThumbsUp, type: 'scroll' },
  { type: 'divider', label: 'Wallet & Offers' },
  { id: 'wallet', label: 'Wallet', icon: FiDollarSign, type: 'toast', message: 'Wallet feature coming soon' },
  { id: 'rewards', label: 'Rewards', icon: FiGift, type: 'scroll' },
  { id: 'offers', label: 'Offers & Coupons', icon: FiTag, type: 'scroll' },
  { type: 'divider', label: 'Account' },
  { id: 'notifications', label: 'Notifications', icon: FiBell, type: 'scroll' },
  { id: 'payment-methods', label: 'Payment Methods', icon: FiCreditCard, type: 'scroll' },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin, type: 'toast', message: 'Address management available in Profile' },
  { id: 'reviews', label: 'Reviews & Ratings', icon: FiMessageSquare, type: 'toast', message: 'Reviews feature coming soon' },
  { id: 'activity', label: 'Activity History', icon: FiActivity, type: 'toast', message: 'Activity logs coming soon' },
  { type: 'divider', label: 'More' },
  { id: 'help', label: 'Help & Support', icon: FiHelpCircle, type: 'scroll' },
  { id: 'settings', label: 'Settings', icon: FiSettings, type: 'link', path: '/profile' },
  { id: 'logout', label: 'Logout', icon: FiLogOut, type: 'action' },
];

const UserSidebar = ({ isOpen, setIsOpen, isAuthenticated, showPermanent }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [activeId, setActiveId] = React.useState('dashboard');

  const handleItemClick = async (item) => {
    setIsOpen(false);
    
    if (item.type === 'action' && item.id === 'logout') {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
      return;
    }

    if (item.type === 'link') {
      navigate(item.path);
      return;
    }

    if (item.type === 'toast') {
      toast(item.message, { icon: 'ℹ️' });
      return;
    }

    if (item.type === 'scroll') {
      setActiveId(item.id);
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
        // Wait for render then scroll
        setTimeout(() => {
          const el = document.getElementById(item.id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        const el = document.getElementById(item.id);
        if (el) {
          // Offset for header
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (item.id === 'dashboard') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar pb-24">
      <div className="px-4 py-6">
        {MENU_ITEMS.map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <div key={idx} className="mt-6 mb-2 px-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          }

          const isActive = activeId === item.id;
          const isDanger = item.id === 'logout';

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "flex items-center w-full px-3 py-2.5 mb-1 rounded-xl transition-all duration-200 group gap-3",
                isActive 
                  ? "bg-primary text-white font-semibold shadow-md" 
                  : isDanger
                    ? "text-danger hover:bg-danger/10"
                    : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"
              )}
            >
              <item.icon size={20} className={cn(
                "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-white" : isDanger ? "text-danger" : "text-text-placeholder group-hover:text-primary"
              )} />
              
              <span className="truncate text-sm font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar (Only if Authenticated) */}
      {showPermanent && (
        <div className="hidden md:flex flex-col fixed inset-y-0 left-0 w-72 z-[40] bg-sidebar border-r border-border shadow-2xl">
          <div className="h-24 flex items-center px-6 border-b border-border bg-sidebar">
            <span className="text-2xl font-bold tracking-tighter text-primary">
              Ticket<span className="dark:text-white text-gray-900">Show</span>
            </span>
          </div>
          <SidebarContent />
        </div>
      )}

      {/* Global Sidebar Drawer (Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`fixed inset-y-0 left-0 w-72 z-[60] bg-sidebar border-r border-border flex flex-col shadow-2xl ${showPermanent ? 'md:hidden' : ''}`}
          >
            {/* Drawer Header */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-border bg-sidebar">
              <span className="text-2xl font-bold tracking-tighter text-primary">
                Ticket<span className="dark:text-white text-gray-900">Show</span>
              </span>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className={`fixed inset-0 bg-black/60 z-[50] ${showPermanent ? 'md:hidden' : ''}`}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default UserSidebar;
