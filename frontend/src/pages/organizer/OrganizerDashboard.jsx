import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiCheckCircle, FiEdit2, FiEye, FiActivity, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <GlassCard className="p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", colorClass)}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold dark:text-white text-gray-900">{value}</h3>
    </div>
  </GlassCard>
);

const OrganizerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          api.get('/organizer/stats'),
          api.get('/organizer/events')
        ]);
        setStats(statsRes.data.stats);
        setRecentEvents(eventsRes.data.events.slice(0, 5)); // Just show recent 5
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">Organizer Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your events and track performance.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/organizer/events" 
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View My Events
          </Link>
          <Link 
            to="/organizer/create-event" 
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
          >
            + Create New Event
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Events" 
          value={stats?.totalEvents || 0} 
          icon={FiCalendar} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Published Events" 
          value={stats?.publishedEvents || 0} 
          icon={FiCheckCircle} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Draft Events" 
          value={stats?.draftEvents || 0} 
          icon={FiEdit2} 
          colorClass="bg-yellow-500" 
        />
        <StatCard 
          title="Tickets Sold" 
          value={stats?.totalTicketsSold || 0} 
          icon={FiActivity} 
          colorClass="bg-purple-500" 
        />
      </div>

      {/* Recent Events Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold dark:text-white text-gray-900">Recent Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Event Name</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Venue</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0">
                        {event.banner ? (
                          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiCalendar size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold dark:text-white text-gray-900 line-clamp-1">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.EventCategory?.name || 'Uncategorized'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                    {event.venue}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      event.status === 'PUBLISHED' 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    )}>
                      {event.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                        <FiEye size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-500/10">
                        <FiEdit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No events found. Start by creating a new event!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default OrganizerDashboard;
