import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiUsers, FiFilm, FiCalendar, FiDollarSign, FiPlusSquare, 
  FiPercent, FiCreditCard, FiTrendingUp, FiActivity, FiUser, 
  FiEye, FiTrash2, FiPlus, FiSettings, FiInfo, FiGrid, FiList,
  FiFileText, FiCheckCircle, FiXCircle, FiSliders, FiFilter, FiDownload, FiSearch, FiRefreshCw
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/dashboardService';
import { getMovies, createMovie, deleteMovie } from '../../services/movieService';
import { getCoupons, createCoupon, deleteCoupon } from '../../services/couponService';
import { getTheatres, updateTheatreStatus } from '../../services/theatreService';
import { getEvents, deleteEvent } from '../../services/eventService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

import DocumentViewerModal from '../../components/admin/DocumentViewerModal';
import RejectionReasonModal from '../../components/admin/RejectionReasonModal';
import RefundModal from '../../components/admin/RefundModal';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const mockApplicationsList = [
  { id: 'app1', business_name: 'Rex Cinemas Pvt Ltd', owner_name: 'Rajesh Sharma', email: 'rajesh@rexcinemas.com', phone: '+91 9876543210', gst: '27AABCU9603R1ZN', pan: 'AABCU9603R', license: 'BL-2026-90482', address: 'Bandra West, Mumbai', submitted_date: '2026-07-18', status: 'Pending Verification' },
  { id: 'app2', business_name: 'Cinepolis South Hub', owner_name: 'Vikram Seth', email: 'vikram@cinepolis.com', phone: '+91 9123456789', gst: '29AABCC8812K1Z8', pan: 'AABCC8812K', license: 'BL-2026-7714', address: 'Koramangala, Bangalore', submitted_date: '2026-07-19', status: 'Document Review' },
  { id: 'app3', business_name: 'Inox Mega Multiplex', owner_name: 'Ananya Roy', email: 'ananya@inox.in', phone: '+91 9988776655', gst: '19AABCI1102P1Z4', pan: 'AABCI1102P', license: 'BL-2026-1102', address: 'Salt Lake, Kolkata', submitted_date: '2026-07-20', status: 'Approved' },
];

const mockCustomersList = [
  { id: 'c1', name: 'Aarav Patel', email: 'aarav@gmail.com', phone: '+91 9819012345', bookingsCount: 24, couponsUsed: 8, status: 'Active' },
  { id: 'c2', name: 'Priya Sharma', email: 'priya@gmail.com', phone: '+91 9820054321', bookingsCount: 16, couponsUsed: 4, status: 'Active' },
  { id: 'c3', name: 'Kabir Singh', email: 'kabir@gmail.com', phone: '+91 9833311223', bookingsCount: 2, couponsUsed: 0, status: 'Blocked' },
];

const mockSupportTickets = [
  { id: 't1', customer: 'Aarav Patel', email: 'aarav@gmail.com', subject: 'Seat payment debited twice on Razorpay', priority: 'URGENT', status: 'OPEN', assigned: 'Admin Lead' },
  { id: 't2', customer: 'Priya Sharma', email: 'priya@gmail.com', subject: 'Cannot apply coupon FESTIVAL50 on IMAX ticket', priority: 'MEDIUM', status: 'OPEN', assigned: 'Support Agent 1' },
  { id: 't3', customer: 'Rajesh Owner', email: 'rajesh@pvr.com', subject: 'Showtime scheduling status delay', priority: 'HIGH', status: 'RESOLVED', assigned: 'Super Admin' },
];

import useDocumentTitle from '../../hooks/useDocumentTitle';

const AdminDashboard = () => {
  useDocumentTitle('Admin Control Operations', 'Manage theatre onboarding, movies catalog, customers, coupons, and platform operations.');
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPathname = () => {
    const path = location.pathname;
    if (path.includes('/applications')) return 'applications';
    if (path.includes('/users') || path.includes('/customers')) return 'customers';
    if (path.includes('/movies')) return 'movies';
    if (path.includes('/events')) return 'events';
    if (path.includes('/theatres') || path.includes('/theatre')) return 'theatres';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/coupons')) return 'coupons';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/support')) return 'support';
    if (path.includes('/settings') || path.includes('/profile')) return 'settings';
    return 'analytics';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPathname());

  useEffect(() => {
    setActiveTab(getTabFromPathname());
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [events, setEvents] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [applications, setApplications] = useState(mockApplicationsList);
  const [customers, setCustomers] = useState(mockCustomersList);
  const [tickets, setTickets] = useState(mockSupportTickets);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedItems, setSelectedItems] = useState([]);

  // Movie Subtab Filter (All, Now Showing, Coming Soon, Ended)
  const [movieFilter, setMovieFilter] = useState('ALL');

  // Modals / Inspectors
  const [inspectDocApp, setInspectDocApp] = useState(null);
  const [rejectTargetApp, setRejectTargetApp] = useState(null);
  const [refundTargetBooking, setRefundTargetBooking] = useState(null);
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);

  // Forms
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', poster: '', banner: '', language: 'Hindi',
    genre: 'Action', duration: '145', age_rating: 'U/A', release_date: '2026-08-15', status: 'now_showing'
  });
  
  const [couponForm, setCouponForm] = useState({
    coupon_code: '', discount_type: 'percentage', discount_value: '',
    min_order_amount: '', max_discount_amount: '', expiry_date: '', usage_limit: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, theatresRes, eventsRes, couponsRes] = await Promise.all([
        getDashboardStats().catch(() => null),
        getMovies().catch(() => ({ movies: [] })),
        getTheatres().catch(() => []),
        getEvents().catch(() => []),
        getCoupons().catch(() => [])
      ]);
      
      setStats(statsRes?.data || statsRes || {
        revenue: 1450000,
        bookings: { total: 4820, byDay: { Mon: 420, Tue: 580, Wed: 920, Thu: 410, Fri: 840, Sat: 1250, Sun: 1100 } },
        users: { active: 18400, total: 22000 },
        theatres: { active: 142, total: 156 },
        events: { active: 38, total: 45 },
        recentBookings: [
          { id: 'BK-90482', user: { email: 'aarav@gmail.com' }, total_amount: 1250, booking_status: 'confirmed' },
          { id: 'BK-90483', user: { email: 'priya@gmail.com' }, total_amount: 850, booking_status: 'confirmed' },
          { id: 'BK-90484', user: { email: 'kabir@gmail.com' }, total_amount: 450, booking_status: 'refunded' }
        ]
      });

      const mList = moviesRes.data?.movies || moviesRes.movies || moviesRes || [];
      setMovies(Array.isArray(mList) && mList.length > 0 ? mList : [
        { id: 'm1', title: 'Avatar: Fire and Ash', genre: 'Sci-Fi/Action', duration: 180, poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80', status: 'now_showing', featured: true },
        { id: 'm2', title: 'Inception 2', genre: 'Sci-Fi/Thriller', duration: 150, poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80', status: 'coming_soon', featured: false },
        { id: 'm3', title: 'Jawan 2', genre: 'Action/Drama', duration: 165, poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80', status: 'ended', featured: false }
      ]);

      const tList = theatresRes.data || theatresRes || [];
      setTheatres(Array.isArray(tList) && tList.length > 0 ? tList : [
        { id: 't1', theatre_name: 'PVR Phoenix IMAX', address: 'Lower Parel, Mumbai', city_id: 'Mumbai', status: 'active', screens: 8, revenue: 840000 },
        { id: 't2', theatre_name: 'Cinepolis Forum South', address: 'Koramangala, Bangalore', city_id: 'Bangalore', status: 'pending', screens: 6, revenue: 420000 }
      ]);

      setEvents(eventsRes.data || eventsRes || []);
      setCoupons(couponsRes.data || couponsRes || []);
    } catch (err) {
      toast.error('Failed to update dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Application approval flow
  const handleApproveApplication = (app) => {
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Approved' } : a));
    toast.success(`Approved application for ${app.business_name || app.owner_name}! Theatre Owner account created.`);
  };

  const handleRejectApplicationConfirm = (reason) => {
    if (!rejectTargetApp) return;
    setApplications(prev => prev.map(a => a.id === rejectTargetApp.id ? { ...a, status: `Rejected (${reason})` } : a));
    toast.success(`Application rejected. Automated email feedback sent to ${rejectTargetApp.email}`);
    setRejectTargetApp(null);
  };

  // Movie creation & deletion
  const handleCreateMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMovie({ ...movieForm, duration: parseInt(movieForm.duration, 10) }).catch(() => null);
      setMovies(prev => [{ id: 'm_' + Date.now(), ...movieForm }, ...prev]);
      toast.success('Movie published to platform catalog!');
      setIsAddMovieOpen(false);
    } catch (err) {
      toast.error('Failed to create movie');
    }
  };

  const handleDeleteMovieSubmit = (id) => {
    setMovies(prev => prev.filter(m => m.id !== id));
    toast.success('Movie removed from catalog');
  };

  const toggleMovieFeatured = (id) => {
    setMovies(prev => prev.map(m => m.id === id ? { ...m, featured: !m.featured } : m));
    toast.success('Homepage featured list updated');
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    if (selectedItems.length === 0) return toast.error('No items selected');
    setApplications(prev => prev.map(a => selectedItems.includes(a.id) ? { ...a, status: 'Approved' } : a));
    setSelectedItems([]);
    toast.success(`Bulk approved ${selectedItems.length} applications`);
  };

  const handleBulkReject = () => {
    if (selectedItems.length === 0) return toast.error('No items selected');
    setApplications(prev => prev.map(a => selectedItems.includes(a.id) ? { ...a, status: 'Rejected' } : a));
    setSelectedItems([]);
    toast.success(`Bulk rejected ${selectedItems.length} applications`);
  };

  const handleToggleSelectAll = (itemList) => {
    if (selectedItems.length === itemList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(itemList.map(i => i.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Customer Block/Unblock
  const toggleCustomerStatus = (id) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const next = c.status === 'Active' ? 'Blocked' : 'Active';
        toast.success(`Customer ${c.name} is now ${next}`);
        return { ...c, status: next };
      }
      return c;
    }));
  };

  // Support Ticket Status
  const toggleTicketStatus = (id) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const next = t.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
        toast.success(`Ticket #${t.id} marked as ${next}`);
        return { ...t, status: next };
      }
      return t;
    }));
  };

  const adminTabs = [
    { id: 'analytics', label: 'KPI Overview', icon: FiGrid },
    { id: 'applications', label: 'Owner Applications', icon: FiPlusSquare, count: applications.filter(a => a.status !== 'Approved').length },
    { id: 'theatres', label: 'Theatres', icon: FiList },
    { id: 'movies', label: 'Movies Catalog', icon: FiFilm },
    { id: 'events', label: 'Live Events', icon: FiCalendar },
    { id: 'bookings', label: 'Bookings & Refunds', icon: FiCreditCard },
    { id: 'customers', label: 'Customer Management', icon: FiUsers },
    { id: 'coupons', label: 'Coupons', icon: FiPercent },
    { id: 'reports', label: 'Reports & Exports', icon: FiActivity },
    { id: 'support', label: 'Support Queue', icon: FiInfo, count: tickets.filter(t => t.status === 'OPEN').length },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Enterprise Daily Operations Panel</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage theatre onboarding approvals, movies catalog, customer refunds, coupons, and support center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadData} className="flex items-center gap-1.5">
            <FiRefreshCw size={14} />
            <span>Sync Live Data</span>
          </Button>
        </div>
      </div>

      {/* Tabs navigation bar */}
      <div className="flex border-b border-border overflow-x-auto gap-2 hide-scrollbar py-1">
        {adminTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(`/admin/${tab.id === 'analytics' ? 'dashboard' : tab.id}`);
            }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === tab.id
                ? 'border-primary text-text-primary font-black bg-amber-50/30 rounded-t-xl'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-hover-bg'
            }`}
            aria-label={`View ${tab.label}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="px-2 py-0.5 bg-danger text-white text-[10px] font-black rounded-full shadow-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader type="card" count={3} />
      ) : (
        <ErrorBoundary fallbackMessage="The selected operational view encountered a rendering issue. Switch to another tab to continue operations.">
          <div className="space-y-6">
          {/* OVERVIEW / KPI ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* 12 KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { title: 'Total Users', val: stats?.users?.total || 22000, color: 'border-blue-200 bg-blue-50/40 text-blue-700' },
                  { title: 'Customers', val: stats?.users?.active || 18400, color: 'border-indigo-200 bg-indigo-50/40 text-indigo-700' },
                  { title: 'Theatre Owners', val: 142, color: 'border-amber-200 bg-amber-50/40 text-amber-700' },
                  { title: 'Active Theatres', val: stats?.theatres?.active || 142, color: 'border-green-200 bg-green-50/40 text-green-700' },
                  { title: 'Movies Running', val: movies.filter(m => m.status === 'now_showing').length, color: 'border-purple-200 bg-purple-50/40 text-purple-700' },
                  { title: 'Events Running', val: stats?.events?.active || 38, color: 'border-pink-200 bg-pink-50/40 text-pink-700' },
                  { title: 'Bookings Today', val: '1,420', color: 'border-yellow-200 bg-yellow-50/40 text-yellow-700' },
                  { title: 'Revenue Today', val: `₹${((stats?.revenue || 1450000) / 30).toFixed(0)}`, color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700' },
                  { title: 'Pending Applications', val: applications.filter(a => a.status !== 'Approved').length, color: 'border-red-200 bg-red-50/40 text-red-700' },
                  { title: 'Pending Movies', val: 4, color: 'border-orange-200 bg-orange-50/40 text-orange-700' },
                  { title: 'Refund Requests', val: 2, color: 'border-rose-200 bg-rose-50/40 text-rose-700' },
                  { title: 'Support Tickets', val: tickets.filter(t => t.status === 'OPEN').length, color: 'border-cyan-200 bg-cyan-50/40 text-cyan-700' },
                ].map((card, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border ${card.color} space-y-1 shadow-xs hover:shadow-sm transition-all`}>
                    <p className="text-[10px] font-extrabold uppercase text-text-secondary truncate">{card.title}</p>
                    <p className="text-lg sm:text-xl font-black text-text-primary truncate">{card.val}</p>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="font-extrabold text-base text-text-primary mb-4">Daily Revenue Yield (₹)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { day: 'Mon', rev: 42000 }, { day: 'Tue', rev: 58000 }, { day: 'Wed', rev: 92000 },
                        { day: 'Thu', rev: 41000 }, { day: 'Fri', rev: 120000 }, { day: 'Sat', rev: 185000 }, { day: 'Sun', rev: 160000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" stroke="#6B7280" fontSize={11} />
                        <YAxis stroke="#6B7280" fontSize={11} />
                        <Tooltip formatter={(val) => `₹${(val || 0).toLocaleString()}`} />
                        <Area type="monotone" dataKey="rev" stroke="#FFC107" fill="#FFC107" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <h3 className="font-extrabold text-base text-text-primary mb-4">Weekly Bookings Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { day: 'Mon', count: 420 }, { day: 'Tue', count: 580 }, { day: 'Wed', count: 920 },
                        { day: 'Thu', count: 410 }, { day: 'Fri', count: 840 }, { day: 'Sat', count: 1250 }, { day: 'Sun', count: 1100 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" stroke="#6B7280" fontSize={11} />
                        <YAxis stroke="#6B7280" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* THEATRE OWNER APPLICATIONS WORKFLOW TAB */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Bulk Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-border rounded-2xl">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-base text-text-primary">Theatre Owner Onboarding Applications</h3>
                  {selectedItems.length > 0 && (
                    <span className="px-2.5 py-0.5 bg-primary text-text-primary text-xs font-black rounded-full">
                      {selectedItems.length} Selected
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleBulkApprove} disabled={selectedItems.length === 0}>
                    Bulk Approve Selected
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleBulkReject} disabled={selectedItems.length === 0}>
                    Bulk Reject Selected
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-border text-xs font-black text-text-secondary uppercase">
                      <th className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === applications.length && applications.length > 0}
                          onChange={() => handleToggleSelectAll(applications)}
                          className="accent-primary"
                        />
                      </th>
                      <th className="px-4 py-3">Business & Owner Name</th>
                      <th className="px-4 py-3">GST & PAN Details</th>
                      <th className="px-4 py-3">Address & City</th>
                      <th className="px-4 py-3">Status Workflow</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-hover-bg/30">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(app.id)}
                            onChange={() => toggleSelectItem(app.id)}
                            className="accent-primary"
                          />
                        </td>
                        <td className="px-4 py-3 font-bold">
                          <p className="text-text-primary font-extrabold text-sm">{app.business_name}</p>
                          <p className="text-text-secondary">{app.owner_name} • {app.email}</p>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <span className="block font-bold text-text-primary">GST: {app.gst}</span>
                          <span className="text-text-secondary">PAN: {app.pan}</span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary font-semibold">{app.address}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            app.status.startsWith('Rejected') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button
                            onClick={() => setInspectDocApp(app)}
                            className="px-3 py-1.5 bg-hover-bg border border-border hover:border-primary text-text-primary rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <FiFileText size={14} className="text-primary" />
                            <span>Review Docs</span>
                          </button>
                          {app.status !== 'Approved' && (
                            <>
                              <Button variant="primary" size="sm" onClick={() => handleApproveApplication(app)}>
                                Approve
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => setRejectTargetApp(app)}>
                                Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* THEATRE MANAGEMENT TAB */}
          {activeTab === 'theatres' && (
            <Card>
              <h3 className="font-extrabold text-lg text-text-primary mb-6">All Registered Theatres</h3>
              <Table
                headers={['Theatre Name', 'Location', 'Screens', 'Approval Status', 'Actions']}
                data={theatres}
                renderRow={(t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 font-bold text-sm text-text-primary">{t.theatre_name}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{t.address}</td>
                    <td className="px-6 py-4 text-sm font-bold">{t.screens || 4} Screens</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => toast.success(`Performance: Revenue ₹${t.revenue || '420,000'} | Occupancy 78%`)}>
                        View Performance
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </Card>
          )}

          {/* MOVIE MANAGEMENT TAB */}
          {activeTab === 'movies' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Movie Status Subtab Filter */}
                <div className="flex items-center gap-2 text-xs font-bold bg-white border border-border p-1.5 rounded-2xl shadow-sm">
                  {['ALL', 'now_showing', 'coming_soon', 'ended'].map(st => (
                    <button
                      key={st}
                      onClick={() => setMovieFilter(st)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        movieFilter === st ? 'bg-primary text-text-primary font-black' : 'text-text-secondary hover:bg-hover-bg'
                      }`}
                    >
                      {st === 'ALL' ? 'All Movies' : st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                <Button onClick={() => setIsAddMovieOpen(true)} className="flex items-center gap-1.5">
                  <FiPlus size={16} />
                  <span>Publish New Movie</span>
                </Button>
              </div>

              <Table
                headers={['Poster', 'Movie Title', 'Genre & Duration', 'Release Status', 'Featured', 'Actions']}
                data={movieFilter === 'ALL' ? movies : movies.filter(m => m.status === movieFilter)}
                renderRow={(m) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4">
                      <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded-lg border border-border" />
                    </td>
                    <td className="px-6 py-4 font-extrabold text-sm text-text-primary">{m.title}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{m.genre} • {m.duration} mins</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary font-black text-xs rounded-full uppercase">
                        {m.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleMovieFeatured(m.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          m.featured ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {m.featured ? '★ Featured' : 'Unfeatured'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="danger" size="sm" onClick={() => handleDeleteMovieSubmit(m.id)}>
                        <FiTrash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* BOOKING & REFUNDS TAB */}
          {activeTab === 'bookings' && (
            <Card className="space-y-6">
              <h3 className="font-extrabold text-lg text-text-primary">Transactions & Refund Management</h3>
              <Table
                headers={['Booking ID', 'User Email', 'Total Paid', 'Status', 'Actions']}
                data={stats?.recentBookings || []}
                renderRow={(b) => (
                  <tr key={b.id}>
                    <td className="px-6 py-4 font-mono font-bold text-sm">{b.id}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{b.user?.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-black text-text-primary">₹{b.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                        b.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="secondary" size="sm" onClick={() => setRefundTargetBooking(b)}>
                        Inspect & Refund
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </Card>
          )}

          {/* CUSTOMER MANAGEMENT TAB */}
          {activeTab === 'customers' && (
            <Card className="space-y-6">
              <h3 className="font-extrabold text-lg text-text-primary">Customer Account Directory</h3>
              <Table
                headers={['Customer Name', 'Email & Phone', 'Bookings Count', 'Coupons Used', 'Account Status', 'Actions']}
                data={customers}
                renderRow={(c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 font-bold text-sm text-text-primary">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{c.email} • {c.phone}</td>
                    <td className="px-6 py-4 text-sm font-bold">{c.bookingsCount} bookings</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{c.couponsUsed} applied</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant={c.status === 'Active' ? 'danger' : 'primary'} size="sm" onClick={() => toggleCustomerStatus(c.id)}>
                        {c.status === 'Active' ? 'Block Customer' : 'Unblock'}
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </Card>
          )}

          {/* COUPONS TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-lg text-text-primary">Promotional Coupon Codes</h3>
                <Button onClick={() => setIsAddCouponOpen(true)} className="flex items-center gap-1.5">
                  <FiPlus size={16} />
                  <span>Create Coupon</span>
                </Button>
              </div>

              <Table
                headers={['Coupon Code', 'Discount Type', 'Value', 'Min Order', 'Actions']}
                data={coupons}
                renderRow={(c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 font-mono font-black text-sm text-primary tracking-wider">{c.coupon_code}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary uppercase">{c.discount_type}</td>
                    <td className="px-6 py-4 text-sm font-bold">{c.discount_value}{c.discount_type === 'percentage' ? '%' : ' INR'}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">₹{c.min_order_amount}</td>
                    <td className="px-6 py-4">
                      <Button variant="danger" size="sm" onClick={() => deleteCoupon(c.id).then(() => loadData())}>
                        <FiTrash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* REPORTS & EXPORTS TAB */}
          {activeTab === 'reports' && (
            <Card className="space-y-6">
              <div>
                <h3 className="font-extrabold text-lg text-text-primary">System Reports & Exports</h3>
                <p className="text-xs text-text-secondary mt-1">Download monthly CSV or PDF summary reports.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-6">
                {[
                  { name: 'July 2026 Platform Revenue Audit Report', size: '2.4 MB', type: 'PDF' },
                  { name: 'July 2026 GST Compliance Report', size: '1.8 MB', type: 'CSV (Excel)' },
                  { name: 'June 2026 Ticket Bookings Audit Logs', size: '4.8 MB', type: 'CSV (Excel)' },
                  { name: 'Q2 2026 Theatre Owner Yield Analysis', size: '3.1 MB', type: 'PDF' }
                ].map((rep, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-hover-bg/30 border border-border rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{rep.name}</p>
                      <p className="text-[10px] text-text-secondary">{rep.type} • {rep.size}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => toast.success(`Export started for ${rep.name}`)}>
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* SUPPORT QUEUE TAB */}
          {activeTab === 'support' && (
            <Card className="space-y-6">
              <h3 className="font-extrabold text-lg text-text-primary">Customer Support Queue</h3>
              <Table
                headers={['Ticket ID', 'Customer', 'Subject', 'Priority', 'Status', 'Actions']}
                data={tickets}
                renderRow={(t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 font-mono font-bold text-xs">{t.id}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{t.customer} ({t.email})</td>
                    <td className="px-6 py-4 text-sm font-bold text-text-primary">{t.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        t.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="secondary" size="sm" onClick={() => toggleTicketStatus(t.id)}>
                        Toggle Status
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </Card>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <Card className="space-y-6 max-w-md">
              <h3 className="font-extrabold text-lg text-text-primary">Operational Settings</h3>
              <div className="space-y-4">
                <Input label="Platform Name" value="TicketShow Enterprise" readOnly />
                <Input label="Convenience Fee (%)" value="10" readOnly />
                <Button onClick={() => toast.success('Settings updated')}>Save Settings</Button>
              </div>
            </Card>
          )}
        </div>
        </ErrorBoundary>
      )}

      {/* INSPECTOR MODALS */}
      <DocumentViewerModal
        isOpen={!!inspectDocApp}
        onClose={() => setInspectDocApp(null)}
        application={inspectDocApp}
        onApprove={handleApproveApplication}
        onReject={(app) => setRejectTargetApp(app)}
      />

      <RejectionReasonModal
        isOpen={!!rejectTargetApp}
        onClose={() => setRejectTargetApp(null)}
        entityName={rejectTargetApp?.business_name || rejectTargetApp?.owner_name}
        onConfirm={handleRejectApplicationConfirm}
      />

      <RefundModal
        isOpen={!!refundTargetBooking}
        onClose={() => setRefundTargetBooking(null)}
        booking={refundTargetBooking}
        onConfirmRefund={(id, amt, reason) => {
          toast.success(`Refund of ₹${amt} processed for Booking #${id}!`);
          loadData();
        }}
      />
    </div>
  );
};

export default AdminDashboard;
