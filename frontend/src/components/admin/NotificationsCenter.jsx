import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiCheck, FiTrash2, FiAlertCircle, FiFilm, FiPlusSquare, 
  FiDollarSign, FiHelpCircle, FiFilter, FiCheckCircle, FiX, FiInbox 
} from 'react-icons/fi';
import { getNotifications, markAllRead, markRead } from '../../services/notificationService';
import toast from 'react-hot-toast';

const mockInitialNotifications = [
  { id: 'n1', type: 'New Theatre Application', message: 'Cinepolis Forum South submitted business license & GST details for review.', priority: 'HIGH', time: '10 mins ago', read: false, icon: FiPlusSquare, color: 'text-amber-600 bg-amber-50' },
  { id: 'n2', type: 'Movie Approval Request', message: 'Theatre Owner added "Inception: Resurrected" for approval.', priority: 'MEDIUM', time: '25 mins ago', read: false, icon: FiFilm, color: 'text-blue-600 bg-blue-50' },
  { id: 'n3', type: 'Refund Request', message: 'Customer Aarav Patel requested refund ₹1,250 for Booking #BK-90482.', priority: 'URGENT', time: '1 hour ago', read: false, icon: FiDollarSign, color: 'text-red-600 bg-red-50' },
  { id: 'n4', type: 'Payment Failed', message: 'Gateway webhook reported failed payment attempt on Razorpay transaction #rzp_0942.', priority: 'HIGH', time: '2 hours ago', read: true, icon: FiAlertCircle, color: 'text-orange-600 bg-orange-50' },
  { id: 'n5', type: 'Server Warning', message: 'Database query response latency exceeded 450ms threshold on host db-primary-01.', priority: 'URGENT', time: '3 hours ago', read: false, icon: FiAlertCircle, color: 'text-purple-600 bg-purple-50' },
  { id: 'n6', type: 'Support Ticket', message: 'Ticket #T-882 escalated to High Priority by Customer.', priority: 'HIGH', time: '4 hours ago', read: true, icon: FiHelpCircle, color: 'text-cyan-600 bg-cyan-50' },
  { id: 'n7', type: 'New Booking Milestone', message: 'Daily platform booking threshold crossed 5,000 tickets today!', priority: 'LOW', time: '5 hours ago', read: true, icon: FiCheckCircle, color: 'text-green-600 bg-green-50' },
];

const NotificationsCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      if (data && data.length > 0) {
        // Map database attributes to expected fields
        const formatted = data.map(n => ({
          id: n.id,
          type: n.title,
          message: n.message,
          priority: n.type === 'sold_out' || n.type === 'low_availability' ? 'HIGH' : 'MEDIUM',
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: n.is_read,
          icon: n.type === 'sold_out' ? FiInbox : (n.type === 'booking' ? FiCheckCircle : FiBell),
          color: n.type === 'sold_out' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'
        }));
        setNotifications(formatted);
      } else {
        setNotifications(mockInitialNotifications);
      }
    } catch (err) {
      console.warn("Failed to fetch notification API, falling back to mocks", err);
      setNotifications(mockInitialNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await markRead(id);
    } catch (err) {
      console.warn("Failed to sync read status with backend", err);
    }
  };

  const handleMarkAllRead = async (e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
    try {
      await markAllRead();
    } catch (err) {
      console.warn("Failed to sync read-all status with backend", err);
    }
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification removed');
  };

  const handleNotificationClick = (n) => {
    handleMarkRead(n.id);
  };

  // Redundant scrollbar styles
  const scrollbarStyle = (
    <style>{`
      .custom-thin-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-thin-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-thin-scrollbar::-webkit-scrollbar-thumb {
        background: #E5E7EB;
        border-radius: 9999px;
      }
      .custom-thin-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #D1D5DB;
      }
    `}</style>
  );

  const renderContent = () => (
    <div className="flex flex-col h-full bg-white select-none">
      {scrollbarStyle}
      
      {/* HEADER SECTION */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <FiBell size={18} className="text-amber-500 font-bold" />
          <h4 className="font-extrabold text-base text-gray-900">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-400 text-gray-900 text-[10px] font-black rounded-full shadow-xs">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-amber-500 font-extrabold hover:text-amber-600 min-h-[36px] px-2 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              aria-label="Mark all notifications as read"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Close Panel"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* BODY LIST SECTION */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-thin-scrollbar divide-y divide-gray-50 bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-xs font-bold flex flex-col items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-amber-500" />
            <span>Syncing notifications...</span>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => {
            const IconComponent = n.icon || FiBell;
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 flex items-start gap-3.5 transition-all cursor-pointer relative group ${
                  !n.read ? 'bg-amber-50/20 font-medium' : 'hover:bg-gray-50/70'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(n)}
              >
                <div className={`p-2.5 rounded-2xl ${n.color || 'text-amber-600 bg-amber-50'} shrink-0 mt-0.5 shadow-xs`}>
                  <IconComponent size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black text-gray-900 truncate pr-2">{n.type}</span>
                    <span className="text-[10px] font-semibold text-gray-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed break-words text-left">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {n.read ? (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black rounded-md uppercase tracking-wider">Read</span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-amber-400 text-gray-900 text-[9px] font-black rounded-md uppercase tracking-wider animate-pulse">New</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-1.5">
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkRead(n.id, e)}
                      title="Mark as read"
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400"
                      aria-label="Mark notification as read"
                    >
                      <FiCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(n.id, e)}
                    title="Remove notification"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-400"
                    aria-label="Remove notification"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center space-y-2">
            <FiInbox size={36} className="text-gray-300" />
            <p className="text-xs font-black">No alerts present</p>
          </div>
        )}
      </div>

      {/* FOOTER SECTION */}
      <div className="p-3 bg-gray-50/80 border-t border-gray-100 text-center sticky bottom-0 z-10 shrink-0">
        <button 
          onClick={onClose}
          className="text-xs font-black text-gray-800 hover:text-amber-500 transition-colors uppercase tracking-wider py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded text-center w-full"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isMobile ? (
        <>
          {/* Mobile Backdrop shadow layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden"
          />
          {/* Mobile Bottom Sheet Menu Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 h-[90vh] bg-white rounded-t-[24px] shadow-2xl flex flex-col z-50 md:hidden overflow-hidden"
            role="dialog"
            aria-label="System Notifications Drawer"
          >
            {/* Top Swiping Indicator Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 shrink-0" onClick={onClose} />
            <div className="flex-grow overflow-hidden">
              {renderContent()}
            </div>
          </motion.div>
        </>
      ) : (
        /* Desktop Popover Menu Dropdown Container */
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-3 w-[400px] max-h-[600px] bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 text-left flex flex-col overflow-hidden"
          role="dialog"
          aria-label="System Notifications List"
        >
          {renderContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsCenter;
