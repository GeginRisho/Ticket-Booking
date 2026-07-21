import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiCheck, FiTrash2, FiAlertCircle, FiFilm, FiPlusSquare, 
  FiDollarSign, FiHelpCircle, FiFilter, FiCheckCircle, FiX, FiInbox 
} from 'react-icons/fi';
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
  const [notifications, setNotifications] = useState(mockInitialNotifications);
  const [filterPriority, setFilterPriority] = useState('ALL');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifs = filterPriority === 'ALL'
    ? notifications
    : notifications.filter(n => n.priority === filterPriority);

  const handleMarkRead = (id, e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = (e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification removed');
  };

  const handleNotificationClick = (n) => {
    handleMarkRead(n.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 max-w-full sm:w-96 bg-white border border-border rounded-2xl shadow-2xl z-50 text-left overflow-hidden"
        role="dialog"
        aria-label="System Notifications Drawer"
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiBell size={18} className="text-primary font-bold" />
            <h4 className="font-extrabold text-sm text-text-primary">System Notifications</h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-danger text-white text-[10px] font-black rounded-full shadow-xs">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary font-extrabold hover:underline min-h-[36px] px-2 py-1 rounded focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                aria-label="Mark all notifications as read"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 text-text-secondary hover:bg-hover-bg rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close Notification Panel"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Priority Filter Bar */}
        <div className="px-4 py-2.5 border-b border-border bg-white flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-xs">
          <FiFilter size={14} className="text-text-secondary mr-1 shrink-0" />
          {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer shrink-0 min-h-[36px] flex items-center ${
                filterPriority === p
                  ? 'bg-amber-400 text-gray-900 shadow-xs'
                  : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
              }`}
              aria-label={`Filter notifications by ${p}`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Notification Items List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((n) => {
              const IconComponent = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    !n.read ? 'bg-amber-50/40 font-medium' : 'hover:bg-hover-bg/60'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(n)}
                >
                  <div className={`p-2.5 rounded-xl ${n.color} shrink-0 mt-0.5 shadow-xs`}>
                    <IconComponent size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-black text-text-primary truncate">{n.type}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                        n.priority === 'URGENT' ? 'bg-red-100 text-red-700 border border-red-200' :
                        n.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {n.priority}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed break-words">{n.message}</p>
                    <span className="text-[10px] text-text-secondary mt-1 block font-bold">{n.time}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0 ml-1">
                    {!n.read && (
                      <button
                        onClick={(e) => handleMarkRead(n.id, e)}
                        title="Mark as read"
                        className="p-2 text-primary hover:bg-primary/20 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label="Mark notification as read"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      title="Remove notification"
                      className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Remove notification"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-text-secondary flex flex-col items-center justify-center space-y-2">
              <FiInbox size={32} className="text-gray-300" />
              <p className="text-xs font-bold">
                {notifications.length === 0 
                  ? 'No notifications present' 
                  : `No notifications matching "${filterPriority}"`}
              </p>
            </div>
          )}
        </div>

        <div className="p-3 bg-gray-50 border-t border-border text-center text-[11px] font-bold text-text-secondary">
          TicketShow Operational Alert Center
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationsCenter;
