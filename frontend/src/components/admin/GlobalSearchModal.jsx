import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiX, FiFilm, FiPlusSquare, FiUser, FiCreditCard, 
  FiPercent, FiHelpCircle, FiCalendar, FiClock, FiCornerDownLeft, FiAlertCircle 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const mockSearchDatabase = [
  { id: 'm1', type: 'Movie', title: 'Avatar: Fire and Ash', subtitle: 'Action/Sci-Fi • Now Showing', path: '/admin/movies', icon: FiFilm },
  { id: 'm2', type: 'Movie', title: 'Inception 2', subtitle: 'Sci-Fi/Thriller • Coming Soon', path: '/admin/movies', icon: FiFilm },
  { id: 'm3', type: 'Movie', title: 'Jawan Reloaded', subtitle: 'Action • Ended', path: '/admin/movies', icon: FiFilm },
  { id: 't1', type: 'Theatre', title: 'PVR IMAX Phoenix Mall', subtitle: 'Mumbai • 8 Screens • Active', path: '/admin/theatres', icon: FiPlusSquare },
  { id: 't2', type: 'Theatre', title: 'Cinepolis Forum South', subtitle: 'Bangalore • 6 Screens • Pending', path: '/admin/applications', icon: FiPlusSquare },
  { id: 'o1', type: 'Theatre Owner', title: 'Rajesh Sharma (PVR Ltd)', subtitle: 'rajesh@pvr.com • 14 Theatres', path: '/super-admin/owners', icon: FiUser },
  { id: 'c1', type: 'Customer', title: 'Aarav Patel', subtitle: 'aarav@gmail.com • 24 Bookings', path: '/admin/customers', icon: FiUser },
  { id: 'c2', type: 'Customer', title: 'Priya Sharma', subtitle: 'priya@gmail.com • 16 Bookings', path: '/admin/customers', icon: FiUser },
  { id: 'b1', type: 'Booking', title: 'Booking #BK-90482', subtitle: 'Avatar • ₹1,250 • Confirmed', path: '/admin/bookings', icon: FiCreditCard },
  { id: 'cp1', type: 'Coupon', title: 'FESTIVAL50', subtitle: '50% OFF • Valid till Aug 2026', path: '/admin/coupons', icon: FiPercent },
  { id: 'st1', type: 'Support Ticket', title: 'Ticket #T-882 (Seat Refund)', subtitle: 'Urgent • Open', path: '/admin/support', icon: FiHelpCircle },
  { id: 'e1', type: 'Event', title: 'A.R. Rahman Live Concert', subtitle: 'Stadium • 12,000 Tickets', path: '/admin/events', icon: FiCalendar },
  { id: 'e2', type: 'Event', title: 'Standup Comedy Special', subtitle: 'Auditorium • 1,500 Tickets', path: '/admin/events', icon: FiCalendar },
  { id: 'a1', type: 'Admin', title: 'Super Admin Operational Center', subtitle: 'super@ticketshow.com • Full Access', path: '/super-admin/admins', icon: FiUser }
];

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('adminRecentSearches');
    return saved ? JSON.parse(saved) : ['Avatar', 'PVR IMAX', 'Aarav Patel', 'FESTIVAL50'];
  });
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredResults = query.trim()
    ? mockSearchDatabase.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectResult = (item) => {
    const updatedRecents = [item.title, ...recentSearches.filter(s => s !== item.title)].slice(0, 5);
    setRecentSearches(updatedRecents);
    localStorage.setItem('adminRecentSearches', JSON.stringify(updatedRecents));
    navigate(item.path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 md:pt-20 bg-gray-900/60 backdrop-blur-xs px-3 sm:px-4 overflow-y-auto"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Global Search Modal"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto sm:my-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="p-3.5 sm:p-4 border-b border-border flex items-center gap-3">
            <FiSearch size={22} className="text-primary font-bold shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Movies, Events, Theatres, Owners, Customers, Bookings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full min-h-[44px] bg-transparent border-none text-sm sm:text-base font-semibold text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-0"
              aria-label="Search Query Input"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-2 text-text-secondary hover:text-text-primary rounded-full shrink-0"
                aria-label="Clear search"
              >
                <FiX size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl text-text-secondary hover:bg-hover-bg transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close search dialog"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Search Results / Recents Container */}
          <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto p-4 space-y-4 text-left">
            {query.trim() === '' ? (
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-text-secondary uppercase tracking-wider mb-3">
                  <FiClock size={14} />
                  <span>Recent Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(term)}
                      className="px-3.5 py-2 bg-gray-50 hover:bg-primary/20 text-text-primary text-xs font-bold rounded-xl transition-all border border-border cursor-pointer min-h-[40px] flex items-center"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-black text-text-secondary uppercase tracking-wider block mb-1">
                  Matching Results ({filteredResults.length})
                </span>
                {filteredResults.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-primary/30 hover:bg-amber-50/40 transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSelectResult(item)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-amber-400 transition-all shrink-0">
                          <ItemIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-extrabold text-sm text-text-primary truncate">{item.title}</p>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary truncate">{item.subtitle}</p>
                        </div>
                      </div>
                      <FiCornerDownLeft size={16} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-text-secondary flex flex-col items-center justify-center space-y-2">
                <FiAlertCircle size={32} className="text-gray-300" />
                <p className="text-sm font-bold">No results found for "<strong className="text-text-primary">{query}</strong>"</p>
                <p className="text-xs text-gray-400">Try searching for movies, theatre names, customer emails, or booking codes.</p>
              </div>
            )}
          </div>

          {/* Footer shortcuts helper */}
          <div className="p-3 bg-gray-50 border-t border-border flex items-center justify-between text-xs text-text-secondary font-semibold">
            <div className="flex items-center gap-3 flex-wrap">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold">ESC</kbd> to close</span>
              <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold">Ctrl + K</kbd> to toggle</span>
            </div>
            <span className="hidden sm:inline">TicketShow Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalSearchModal;
