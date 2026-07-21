import React, { useState } from 'react';
import { FiBell, FiCheck, FiTrash2, FiAlertCircle, FiFilm, FiPlusSquare, FiDollarSign, FiHelpCircle, FiFilter, FiCheckCircle } from 'react-icons/fi';
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

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifs = filterPriority === 'ALL'
    ? notifications
    : notifications.filter(n => n.priority === filterPriority);

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification removed');
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white border border-border rounded-2xl shadow-2xl z-50 text-left overflow-hidden animate-scale-up">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gray-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiBell size={18} className="text-primary font-bold" />
          <h4 className="font-extrabold text-sm text-text-primary">System Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-danger text-white text-[10px] font-black rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-primary font-bold hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Priority Filter Bar */}
      <div className="px-4 py-2 border-b border-border bg-white flex items-center gap-1 overflow-x-auto text-xs">
        <FiFilter size={12} className="text-text-secondary mr-1" />
        {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterPriority === p
                ? 'bg-primary text-text-primary'
                : 'text-text-secondary hover:bg-hover-bg'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Notification Items List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => {
            const IconComponent = n.icon;
            return (
              <div
                key={n.id}
                className={`p-3.5 flex items-start gap-3 transition-colors ${
                  !n.read ? 'bg-amber-50/30 font-medium' : 'hover:bg-hover-bg/50'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${n.color} shrink-0 mt-0.5`}>
                  <IconComponent size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-text-primary truncate">{n.type}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                      n.priority === 'URGENT' ? 'bg-red-100 text-red-700 border border-red-200' :
                      n.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-text-secondary mt-1 block font-semibold">{n.time}</span>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      title="Mark as read"
                      className="p-1 text-primary hover:bg-primary/20 rounded cursor-pointer"
                    >
                      <FiCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    title="Remove"
                    className="p-1 text-text-secondary hover:text-danger hover:bg-red-50 rounded cursor-pointer"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-text-secondary text-xs font-medium">
            No notifications matching priority "<strong className="text-text-primary">{filterPriority}</strong>"
          </div>
        )}
      </div>

      <div className="p-2.5 bg-gray-50 border-t border-border text-center text-[11px] font-bold text-text-secondary">
        TicketShow Operational Alert Center
      </div>
    </div>
  );
};

export default NotificationsCenter;
