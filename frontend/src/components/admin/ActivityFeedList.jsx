import React, { useState, useEffect } from 'react';
import { FiActivity, FiCreditCard, FiPlusCircle, FiCheckCircle, FiDollarSign, FiPercent, FiTrash2, FiHelpCircle, FiRadio } from 'react-icons/fi';
import Card from '../ui/Card';

const initialActivityLogs = [
  { id: 'act1', type: 'Ticket Booked', actor: 'Aarav Patel', action: 'booked 3 seats for Avatar: Fire and Ash at PVR Phoenix', time: 'Just now', icon: FiCreditCard, color: 'text-green-600 bg-green-50' },
  { id: 'act2', type: 'Movie Added', actor: 'PVR Owner (Rajesh)', action: 'submitted new show listing for "Inception 2"', time: '2 mins ago', icon: FiPlusCircle, color: 'text-blue-600 bg-blue-50' },
  { id: 'act3', type: 'Theatre Approved', actor: 'Super Admin', action: 'approved Cinepolis Forum South onboarding application', time: '5 mins ago', icon: FiCheckCircle, color: 'text-amber-600 bg-amber-50' },
  { id: 'act4', type: 'Refund Completed', actor: 'Admin Lead', action: 'issued ₹1,250 refund for Booking #BK-90482', time: '12 mins ago', icon: FiDollarSign, color: 'text-red-600 bg-red-50' },
  { id: 'act5', type: 'Coupon Created', actor: 'Super Admin', action: 'created promotional coupon code FESTIVAL50 (50% OFF)', time: '18 mins ago', icon: FiPercent, color: 'text-purple-600 bg-purple-50' },
  { id: 'act6', type: 'Movie Deleted', actor: 'Admin Operational', action: 'deleted archived movie listing "Old Classic 1990"', time: '30 mins ago', icon: FiTrash2, color: 'text-gray-600 bg-gray-50' },
  { id: 'act7', type: 'Ticket Resolved', actor: 'Support Bot', action: 'resolved customer query #T-882 (Seat refund inquiry)', time: '45 mins ago', icon: FiHelpCircle, color: 'text-teal-600 bg-teal-50' },
];

const ActivityFeedList = () => {
  const [activities, setActivities] = useState(initialActivityLogs);

  // Auto add realistic mock activity items every 15 seconds to demonstrate live feed
  useEffect(() => {
    const timer = setInterval(() => {
      const liveItems = [
        { type: 'Ticket Booked', actor: 'Priya S.', action: 'booked 2 tickets for IMAX 3D show', icon: FiCreditCard, color: 'text-green-600 bg-green-50' },
        { type: 'Support Ticket', actor: 'Rahul V.', action: 'submitted feedback on payment gateway', icon: FiHelpCircle, color: 'text-teal-600 bg-teal-50' },
        { type: 'Movie Approved', actor: 'Admin Team', action: 'approved upcoming release "Gladiator 2"', icon: FiCheckCircle, color: 'text-amber-600 bg-amber-50' }
      ];
      const randomItem = liveItems[Math.floor(Math.random() * liveItems.length)];
      const newEntry = {
        id: 'act_' + Date.now(),
        ...randomItem,
        time: 'Just now'
      };
      setActivities(prev => [newEntry, ...prev.slice(0, 9)]);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <FiActivity size={20} className="text-primary" />
            <span>Live Platform Activity Feed</span>
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">Real-time audit events across customers, theatre owners, and admins.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-700 font-extrabold bg-green-50 border border-green-200 px-3 py-1 rounded-full">
          <FiRadio size={14} className="animate-ping" />
          <span>Live Stream Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((act) => {
          const IconComp = act.icon;
          return (
            <div key={act.id} className="flex items-start gap-3.5 p-3 rounded-2xl border border-border/60 hover:bg-hover-bg/30 transition-all">
              <div className={`p-2.5 rounded-xl ${act.color} shrink-0 mt-0.5`}>
                <IconComp size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary">{act.actor}</span>
                  <span className="text-[10px] text-text-secondary font-mono">{act.time}</span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{act.action}</p>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full shrink-0">
                {act.type}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityFeedList;
