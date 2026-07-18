import React, { useState, useEffect } from'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from'recharts';
import { FiTrendingUp, FiUsers, FiFilm, FiActivity, FiAlertCircle } from'react-icons/fi';
import GlassCard from'../components/ui/GlassCard';
import { cn } from'../utils/cn';
import { getDashboardStats } from'../services/adminService';

const AdminDashboard = () => {
 const [stats, setStats] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 const fetchStats = async () => {
 setLoading(true);
 try {
 const res = await getDashboardStats();
 setStats(res.data || res);
 } catch (err) {
 setError('Failed to load dashboard data. Endpoint might be missing.');
 } finally {
 setLoading(false);
 }
 };
 fetchStats();
 }, []);

 const StatCard = ({ title, value, icon: Icon, trend }) => (
 <GlassCard className="p-6 flex items-center justify-between">
 <div>
 <p className="text-text-gray text-sm mb-1">{title}</p>
 <h3 className="text-3xl font-bold">{value}</h3>
 <p className="text-success text-sm mt-2 flex items-center gap-1">
 <FiTrendingUp /> {trend}
 </p>
 </div>
 <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 flex items-center justify-center text-primary">
 <Icon size={28} />
 </div>
 </GlassCard>
 );

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 if (error || !stats) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
 <FiAlertCircle size={48} className="text-red-500 mb-4" />
 <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
 <p className="dark:text-gray-400 text-gray-500 mb-6 max-w-md">{error}</p>
 <p className="text-sm text-gray-500 border border-gray-700 bg-gray-800/50 p-4 rounded-xl">
 Note: Backend endpoint GET /api/admin/dashboard-stats is currently not implemented.
 </p>
 </div>
 );
 }

 const { overview, revenueData, bookingsData, recentBookings } = stats;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold mb-2">Overview</h1>
 <p className="text-text-gray">Welcome back, Admin! Here's what's happening today.</p>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <StatCard title="Total Revenue" value={overview?.totalRevenue ||"₹0"} icon={FiTrendingUp} trend={overview?.revenueTrend ||"+0%"} />
 <StatCard title="Total Users" value={overview?.totalUsers ||"0"} icon={FiUsers} trend={overview?.userTrend ||"+0%"} />
 <StatCard title="Active Movies" value={overview?.activeMovies ||"0"} icon={FiFilm} trend={overview?.movieTrend ||"+0"} />
 <StatCard title="Bookings Today" value={overview?.bookingsToday ||"0"} icon={FiActivity} trend={overview?.bookingsTrend ||"+0%"} />
 </div>

 {/* Charts Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <GlassCard>
 <h3 className="text-xl font-bold mb-6">Revenue Analytics</h3>
 <div className="h-80 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={revenueData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#FFD54A" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#FFD54A" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <XAxis dataKey="name" stroke="#AFAFAF" />
 <YAxis stroke="#AFAFAF" />
 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
 <Tooltip 
 contentStyle={{ backgroundColor:'rgba(11,11,15,0.9)', borderColor:'rgba(255,255,255,0.1)', borderRadius:'12px' }}
 />
 <Area type="monotone" dataKey="revenue" stroke="#FFD54A" fillOpacity={1} fill="url(#colorRevenue)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </GlassCard>

 <GlassCard>
 <h3 className="text-xl font-bold mb-6">Weekly Bookings</h3>
 <div className="h-80 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={bookingsData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
 <XAxis dataKey="name" stroke="#AFAFAF" />
 <YAxis stroke="#AFAFAF" />
 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
 <Tooltip 
 contentStyle={{ backgroundColor:'rgba(11,11,15,0.9)', borderColor:'rgba(255,255,255,0.1)', borderRadius:'12px' }}
 cursor={{ fill:'rgba(255,255,255,0.05)' }}
 />
 <Bar dataKey="bookings" fill="#FFD54A" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </GlassCard>
 </div>

 {/* Recent Bookings Table */}
 <GlassCard>
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-xl font-bold">Recent Bookings</h3>
 <button className="text-primary hover:underline text-sm font-medium">View All</button>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-glass-border text-text-gray">
 <th className="pb-4 font-medium px-4">Transaction ID</th>
 <th className="pb-4 font-medium px-4">User</th>
 <th className="pb-4 font-medium px-4">Movie / Event</th>
 <th className="pb-4 font-medium px-4">Amount</th>
 <th className="pb-4 font-medium px-4 text-right">Status</th>
 </tr>
 </thead>
 <tbody>
 {(recentBookings || []).map((booking, idx) => (
 <tr key={idx} className="border-b border-glass-border/50 hover:dark:bg-gray-900 bg-gray-50 transition-colors">
 <td className="py-4 px-4 font-mono text-sm">{booking.id || booking.transactionId}</td>
 <td className="py-4 px-4">{booking.user}</td>
 <td className="py-4 px-4">{booking.movie}</td>
 <td className="py-4 px-4 font-bold">{booking.amount}</td>
 <td className="py-4 px-4 text-right">
 <span className={cn(
"px-3 py-1 rounded-full text-xs font-bold",
 booking.status ==='Success' &&"bg-success/20 text-success border border-success/30",
 booking.status ==='Pending' &&"bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
 booking.status ==='Failed' &&"bg-danger/20 text-danger border border-danger/30"
 )}>
 {booking.status}
 </span>
 </td>
 </tr>
 ))}
 {(!recentBookings || recentBookings.length === 0) && (
 <tr>
 <td colSpan="5" className="py-8 text-center text-gray-500">
 No recent bookings found.
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

export default AdminDashboard;
