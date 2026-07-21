import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiFilm, FiPlusSquare, FiUser, FiCreditCard, FiPercent, FiHelpCircle, FiCalendar, FiClock, FiCornerDownLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const mockSearchDatabase = [
  { id: 'm1', type: 'Movie', title: 'Avatar: Fire and Ash', subtitle: 'Action/Sci-Fi • Now Showing', path: '/admin/movies', icon: FiFilm },
  { id: 'm2', type: 'Movie', title: 'Inception 2', subtitle: 'Sci-Fi/Thriller • Coming Soon', path: '/admin/movies', icon: FiFilm },
  { id: 'm3', type: 'Movie', title: 'Jawan Reloaded', subtitle: 'Action • Ended', path: '/admin/movies', icon: FiFilm },
  { id: 't1', type: 'Theatre', title: 'PVR IMAX Phoenix Mall', subtitle: 'Mumbai • 8 Screens • Active', path: '/admin/theatres', icon: FiPlusSquare },
  { id: 't2', type: 'Theatre', title: 'Cinepolis Forum South', subtitle: 'Bangalore • 6 Screens • Pending', path: '/admin/applications', icon: FiPlusSquare },
  { id: 'o1', type: 'Theatre Owner', title: 'Rajesh Sharma (PVR Ltd)', subtitle: 'rajesh@pvr.com • 14 Theatres', path: '/super-admin/owners', icon: FiUser },
  { id: 'c1', type: 'Customer', title: 'Aarav Patel', subtitle: 'aarav@gmail.com • 24 Bookings', path: '/admin/customers', icon: FiUser },
  { id: 'b1', type: 'Booking', title: 'Booking #BK-90482', subtitle: 'Avatar • ₹1,250 • Confirmed', path: '/admin/bookings', icon: FiCreditCard },
  { id: 'cp1', type: 'Coupon', title: 'FESTIVAL50', subtitle: '50% OFF • Valid till Aug 2026', path: '/admin/coupons', icon: FiPercent },
  { id: 'st1', type: 'Support Ticket', title: 'Ticket #T-882 (Seat Refund)', subtitle: 'Urgent • Open', path: '/admin/support', icon: FiHelpCircle },
  { id: 'e1', type: 'Event', title: 'A.R. Rahman Live Concert', subtitle: 'Stadium • 12,000 Tickets', path: '/admin/events', icon: FiCalendar },
  { id: 'a1', type: 'Admin', title: 'Super Admin Operational Center', subtitle: 'super@ticketshow.com • Full Access', path: '/super-admin/admins', icon: FiUser }
];

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('adminRecentSearches');
    return saved ? JSON.parse(saved) : ['Avatar', 'PVR IMAX', 'FESTIVAL50'];
  });
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

  if (!isOpen) return null;

  const filteredResults = query.trim()
    ? mockSearchDatabase.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectResult = (item) => {
    // Add to recent searches
    const updatedRecents = [item.title, ...recentSearches.filter(s => s !== item.title)].slice(0, 5);
    setRecentSearches(updatedRecents);
    localStorage.setItem('adminRecentSearches', JSON.stringify(updatedRecents));
    navigate(item.path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-gray-900/60 backdrop-blur-xs px-4">
      <div className="bg-white border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <FiSearch size={22} className="text-primary font-bold" />
          <input
            type="text"
            placeholder="Search Movies, Theatres, Owners, Bookings, Coupons, Support Tickets, Admins... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none text-base font-semibold text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-hover-bg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Search Results / Recents Container */}
        <div className="max-h-[420px] overflow-y-auto p-4 space-y-4 text-left">
          {query.trim() === '' ? (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                <FiClock size={14} />
                <span>Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-hover-bg text-text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-all border border-border cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Matching Entities ({filteredResults.length})
              </span>
              {filteredResults.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-primary/30 hover:bg-hover-bg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-text-primary transition-all">
                        <ItemIcon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-text-primary">{item.title}</p>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">{item.subtitle}</p>
                      </div>
                    </div>
                    <FiCornerDownLeft size={16} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-text-secondary text-sm font-medium">
              No matching entity found for "<strong className="text-text-primary">{query}</strong>"
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 bg-gray-50 border-t border-border flex items-center justify-between text-xs text-text-secondary font-medium">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold">ESC</kbd> to close</span>
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold">Ctrl + K</kbd> to toggle</span>
          </div>
          <span>TicketShow Enterprise Search</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
