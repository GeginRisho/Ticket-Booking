import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiUsers, FiFilm, FiCalendar, FiDollarSign, FiPlusSquare, 
  FiPercent, FiCreditCard, FiTrendingUp, FiActivity, FiUser, 
  FiEye, FiTrash2, FiPlus, FiSettings, FiInfo, FiGrid, FiList,
  FiFileText, FiCheckCircle, FiXCircle, FiSliders, FiFilter, FiDownload, FiSearch, FiRefreshCw, FiCheckSquare
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
import { 
  getOrganizers, getOrganizerDetails, updateOrganizerStatus, 
  getOrganizerEvents, getOrganizerPerformance, approveEvent, rejectEvent 
} from '../../services/adminService';
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
    if (path.includes('/organizers')) return 'organizers';
    if (path.includes('/event-approvals')) return 'event-approvals';
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
  
  // Organizer details
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [organizerPerf, setOrganizerPerf] = useState(null);
  const [organizerEvts, setOrganizerEvts] = useState([]);
  const [organizerSearch, setOrganizerSearch] = useState('');
  const [organizerStatusFilter, setOrganizerStatusFilter] = useState('ALL');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedItems, setSelectedItems] = useState([]);

  // Movie Subtab Filter
  const [movieFilter, setMovieFilter] = useState('ALL');

  // Modals / Inspectors
  const [inspectDocApp, setInspectDocApp] = useState(null);
  const [rejectTargetApp, setRejectTargetApp] = useState(null);
  const [rejectTargetOrganizer, setRejectTargetOrganizer] = useState(null);
  const [rejectTargetEvent, setRejectTargetEvent] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
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
      const [statsRes, moviesRes, theatresRes, eventsRes, couponsRes, organizersRes] = await Promise.all([
        getDashboardStats().catch(() => null),
        getMovies().catch(() => ({ movies: [] })),
        getTheatres().catch(() => []),
        getEvents({ status: 'all' }).catch(() => []),
        getCoupons().catch(() => []),
        getOrganizers().catch(() => [])
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
      setMovies(Array.isArray(mList) && mList.length > 0 ? mList : []);

      const tList = theatresRes.data || theatresRes || [];
      setTheatres(Array.isArray(tList) && tList.length > 0 ? tList : []);

      setEvents(eventsRes.data || eventsRes || []);
      setCoupons(couponsRes.data || couponsRes || []);
      setOrganizers(organizersRes);
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

  // Organizer status modifications
  const handleOrganizerStatus = async (orgId, status, reason = '') => {
    try {
      await updateOrganizerStatus(orgId, status, reason);
      toast.success(`Organizer status updated to ${status === 'active' ? 'Approved' : status}`);
      setRejectTargetOrganizer(null);
      loadData();
    } catch (err) {
      toast.error('Failed to change organizer status');
    }
  };

  // Inspect Organizer performance details
  const handleInspectOrganizer = async (org) => {
    try {
      const details = await getOrganizerDetails(org.id);
      const performance = await getOrganizerPerformance(org.id);
      const eventsList = await getOrganizerEvents(org.id);
      
      setSelectedOrganizer(details);
      setOrganizerPerf(performance);
      setOrganizerEvts(eventsList);
    } catch (err) {
      toast.error('Failed to load organizer analytics');
    }
  };

  // Event approval workflow
  const handleApproveEvent = async (id) => {
    try {
      await approveEvent(id);
      toast.success('Event approved and ready to be published!');
      loadData();
    } catch (err) {
      toast.error('Failed to approve event');
    }
  };

  const handleRejectEventConfirm = async (e) => {
    e.preventDefault();
    if (!rejectTargetEvent) return;
    try {
      await rejectEvent(rejectTargetEvent.id, rejectionReasonText);
      toast.success('Event rejected and reset to Draft.');
      setRejectTargetEvent(null);
      setRejectionReasonText('');
      loadData();
    } catch (err) {
      toast.error('Failed to reject event');
    }
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
    { id: 'applications', label: 'Owner Onboarding', icon: FiPlusSquare, count: applications.filter(a => a.status !== 'Approved').length },
    { id: 'organizers', label: 'Event Organizers', icon: FiUsers, count: organizers.filter(o => o.status === 'pending').length },
    { id: 'event-approvals', label: 'Event Approvals', icon: FiCheckSquare, count: events.filter(e => e.status === 'pending_approval').length },
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

  if (loading) {
    return <Loader type="chart" />;
  }

  // Filter organizers
  const filteredOrganizers = organizers.filter(org => {
    const matchesStatus = organizerStatusFilter === 'ALL' ? true : org.status === organizerStatusFilter;
    const matchesSearch = organizerSearch ? (
      (org.full_name && org.full_name.toLowerCase().includes(organizerSearch.toLowerCase())) ||
      (org.company_name && org.company_name.toLowerCase().includes(organizerSearch.toLowerCase())) ||
      (org.email && org.email.toLowerCase().includes(organizerSearch.toLowerCase()))
    ) : true;
    return matchesStatus && matchesSearch;
  });

  // Filter events pending approval
  const pendingApprovalEvents = events.filter(e => e.status === 'pending_approval');

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-left">Platform Governance Center</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Manage theatre and organizer approvals, configure movies catalog, refund ticket checkouts, and review platform telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadData} className="flex items-center gap-1.5 font-bold text-xs border border-gray-200 rounded-xl px-4 py-2.5">
            <FiRefreshCw size={14} />
            <span>Sync Live Data</span>
          </Button>
        </div>
      </div>

      {/* Tabs sub navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 hide-scrollbar py-1">
        {adminTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(`/admin/${tab.id === 'analytics' ? 'dashboard' : tab.id}`);
            }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap min-h-[44px] focus-visible:ring-2 focus-visible:ring-amber-500 relative ${
              activeTab === tab.id
                ? 'border-amber-400 text-amber-500'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="absolute top-1.5 right-1 w-4 h-4 text-[9px] font-black rounded-full bg-red-500 text-white flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TABS CONTENT VIEW SWITCH */}
      <ErrorBoundary fallbackMessage="The selected Admin control panel view encountered a rendering issue. Switch to another tab to continue.">
        <div className="space-y-6">
          
          {/* TAB 1: KPI OVERVIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Gross Revenue', value: `₹${stats.revenue.toLocaleString()}`, sub: 'Ticket sales volume' },
                  { title: 'Active Members', value: stats.users.active.toLocaleString(), sub: 'Registered customers' },
                  { title: 'Active Theatres', value: stats.theatres.active, sub: 'Approved movie houses' },
                  { title: 'Active Events', value: stats.events.active, sub: 'Approved live schedules' }
                ].map((kpi, idx) => (
                  <Card key={idx} className="space-y-2 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.title}</p>
                    <p className="text-2xl font-black text-gray-900 mt-2">{kpi.value}</p>
                    <span className="text-[10px] text-gray-500 font-semibold mt-2 inline-block">{kpi.sub}</span>
                  </Card>
                ))}
              </div>

              {/* Bookings curve */}
              <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                <h3 className="font-black text-base text-gray-900 mb-6 uppercase tracking-wider">Weekly Bookings Curve</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={Object.entries(stats.bookings.byDay || {}).map(([day, val]) => ({ day, bookings: val }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} fontWeight={700} />
                      <YAxis stroke="#9CA3AF" fontSize={10} fontWeight={700} />
                      <Tooltip />
                      <Area type="monotone" dataKey="bookings" stroke="#FFC107" fill="#FEF3C7" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: OWNER APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-4 rounded-3xl shadow-sm flex justify-between items-center gap-4">
                <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">Onboarding Applications</h3>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleBulkApprove} disabled={selectedItems.length === 0}>
                    Bulk Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleBulkReject} disabled={selectedItems.length === 0}>
                    Bulk Reject
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-500 uppercase">
                      <th className="px-6 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === applications.length && applications.length > 0}
                          onChange={() => handleToggleSelectAll(applications)}
                          className="accent-amber-500"
                        />
                      </th>
                      <th className="px-6 py-3">Business & Owner</th>
                      <th className="px-6 py-3">GST & PAN</th>
                      <th className="px-6 py-3">City & Address</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-600">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(app.id)}
                            onChange={() => toggleSelectItem(app.id)}
                            className="accent-amber-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-sm text-gray-900">{app.business_name}</p>
                          <p className="text-gray-400">{app.owner_name} • {app.email}</p>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-700">
                          <p>GST: {app.gst}</p>
                          <p className="text-gray-400">PAN: {app.pan}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{app.address}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            app.status.startsWith('Rejected') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => setInspectDocApp(app)}
                            className="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-amber-500 text-gray-800 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <FiFileText size={14} className="text-amber-500" />
                            <span>Docs</span>
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

          {/* TAB 3: EVENT ORGANIZERS APPROVALS & MODERATION */}
          {activeTab === 'organizers' && (
            <div className="space-y-6">
              {/* Search organizer filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-gray-200 p-4 rounded-3xl shadow-sm">
                <div className="relative col-span-2">
                  <FiSearch className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search Organizers by Company / Name..."
                    value={organizerSearch}
                    onChange={e => setOrganizerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                  />
                </div>

                <div>
                  <select
                    value={organizerStatusFilter}
                    onChange={e => setOrganizerStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="pending">Pending Approval</option>
                    <option value="active">Approved (Active)</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center justify-end font-bold text-xs text-gray-400 pr-2">
                  {filteredOrganizers.length} organizer accounts found
                </div>
              </div>

              {/* Table */}
              <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                {filteredOrganizers.length > 0 ? (
                  <Table
                    headers={['Company & Representative', 'GST/PAN Details', 'License Details', 'Registration Status', 'Actions']}
                    data={filteredOrganizers}
                    renderRow={(org) => (
                      <tr key={org.id}>
                        <td className="px-6 py-4 text-xs font-bold text-gray-900">
                          <p className="text-sm font-black text-gray-800">{org.company_name}</p>
                          <p className="text-gray-400 mt-0.5">{org.full_name} • {org.email} • {org.phone}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-700">
                          <p>GST: {org.gst_number || 'N/A'}</p>
                          <p className="text-gray-400">PAN: {org.pan_number || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                          <p>License: {org.business_license || 'N/A'}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{org.city?.city_name || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                            org.status === 'active' ? 'bg-green-100 text-green-700' :
                            org.status === 'pending' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
                            org.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {org.status === 'active' ? 'Approved' : org.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-1.5">
                          <Button variant="secondary" size="sm" onClick={() => handleInspectOrganizer(org)}>
                            View Analytics
                          </Button>
                          
                          {org.status === 'pending' && (
                            <>
                              <Button variant="primary" size="sm" onClick={() => handleOrganizerStatus(org.id, 'active')}>
                                Approve
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => setRejectTargetOrganizer(org)}>
                                Reject
                              </Button>
                            </>
                          )}

                          {org.status === 'active' && (
                            <Button variant="danger" size="sm" onClick={() => handleOrganizerStatus(org.id, 'suspended')}>
                              Suspend
                            </Button>
                          )}

                          {org.status === 'suspended' && (
                            <Button variant="success" size="sm" onClick={() => handleOrganizerStatus(org.id, 'active')}>
                              Reactivate
                            </Button>
                          )}
                        </td>
                      </tr>
                    )}
                  />
                ) : (
                  <EmptyState
                    title="No organizers found"
                    description="No registered event organizer profiles match the filter options."
                  />
                )}
              </Card>
            </div>
          )}

          {/* TAB 4: EVENT APPROVALS WORKFLOW */}
          {activeTab === 'event-approvals' && (
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">Pending Event Approval Workflow</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{pendingApprovalEvents.length} Events pending</span>
              </div>

              {pendingApprovalEvents.length > 0 ? (
                <Table
                  headers={['Cover Banner', 'Event Title & Organizer', 'Venue & capacity', 'Proposed Start', 'Actions']}
                  data={pendingApprovalEvents}
                  renderRow={(evt) => (
                    <tr key={evt.id}>
                      <td className="px-6 py-4">
                        <img src={evt.poster || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200'} alt={evt.title} className="w-14 h-10 object-cover rounded-xl border border-gray-200" />
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-900">
                        <p className="text-sm font-black text-gray-800">{evt.title}</p>
                        <p className="text-amber-500 font-extrabold mt-0.5">Category: {evt.category?.category_name || 'Concert'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                        <p className="font-bold">{evt.venue}</p>
                        <p className="text-gray-400 text-[10px] mt-0.5">Seating capacity: {evt.capacity || 100} entries</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {new Date(evt.start_date).toLocaleDateString()} | {evt.time || '18:00'}
                      </td>
                      <td className="px-6 py-4 flex gap-1.5">
                        <Button variant="success" size="sm" onClick={() => handleApproveEvent(evt.id)}>
                          Approve event
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setRejectTargetEvent(evt)}>
                          Reject event
                        </Button>
                      </td>
                    </tr>
                  )}
                />
              ) : (
                <EmptyState
                  title="All events approved!"
                  description="No event proposals are currently waiting for administrative review."
                />
              )}
            </Card>
          )}

          {/* THEATRE MANAGEMENT TAB */}
          {activeTab === 'theatres' && (
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
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
                        movieFilter === st ? 'bg-amber-400 text-text-primary font-black' : 'text-text-secondary hover:bg-hover-bg'
                      }`}
                    >
                      {st === 'ALL' ? 'All Movies' : st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                <Button onClick={() => setIsAddMovieOpen(true)} className="flex items-center gap-1.5 font-bold text-xs bg-amber-400 text-gray-900 rounded-xl px-4 py-2">
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
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-black text-xs rounded-full uppercase">
                        {m.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={!!m.featured} onChange={() => toggleMovieFeatured(m.id)} className="w-4 h-4 accent-amber-500" />
                    </td>
                    <td className="px-6 py-4 flex gap-1.5">
                      <Button variant="danger" size="sm" onClick={() => handleDeleteMovieSubmit(m.id)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* LIVE EVENTS TAB */}
          {activeTab === 'events' && (
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-lg text-text-primary mb-6">Live Event Listings</h3>
              <Table
                headers={['Preview', 'Event Title', 'Venue & City', 'Date', 'Capacity', 'Status']}
                data={events}
                renderRow={(e) => (
                  <tr key={e.id}>
                    <td className="px-6 py-4">
                      <img src={e.poster} alt={e.title} className="w-14 h-10 object-cover rounded-xl border border-gray-200" />
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-text-primary">{e.title}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">{e.venue}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">{new Date(e.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs font-bold text-amber-500">{e.capacity || 100} slots</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                        e.status === 'published' || e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {e.status === 'active' ? 'PUBLISHED' : e.status}
                      </span>
                    </td>
                  </tr>
                )}
              />
            </Card>
          )}

          {/* BOOKINGS & REFUNDS TAB */}
          {activeTab === 'bookings' && (
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-lg text-text-primary mb-6">Platform Transactions Logs</h3>
              <Table
                headers={['Booking ID', 'User Email', 'Paid Amount', 'Status', 'Actions']}
                data={stats?.recentBookings || []}
                renderRow={(b) => (
                  <tr key={b.id}>
                    <td className="px-6 py-4 font-mono font-bold text-xs">{b.id || b.booking_number}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{b.user?.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-extrabold text-text-primary">₹{b.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        b.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {b.booking_status === 'confirmed' && (
                        <Button variant="secondary" size="sm" onClick={() => setRefundTargetBooking(b)}>
                          Issue Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                )}
              />
            </Card>
          )}

          {/* CUSTOMER MANAGEMENT TAB */}
          {activeTab === 'customers' && (
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-lg text-text-primary mb-6">All Customers</h3>
              <Table
                headers={['Customer Name', 'Email Address', 'Mobile Number', 'Bookings', 'Status', 'Actions']}
                data={customers}
                renderRow={(c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 font-bold text-sm text-text-primary">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{c.email}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{c.phone}</td>
                    <td className="px-6 py-4 text-sm font-bold">{c.bookingsCount} bookings</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant={c.status === 'Active' ? 'danger' : 'success'} size="sm" onClick={() => toggleCustomerStatus(c.id)}>
                        {c.status === 'Active' ? 'Block Account' : 'Unblock'}
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </Card>
          )}

          {/* SUPPORT QUEUE TAB */}
          {activeTab === 'support' && (
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-lg text-text-primary mb-6">Support Ticket Queue</h3>
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
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm max-w-md">
              <h3 className="font-extrabold text-lg text-text-primary mb-6">Operational Settings</h3>
              <div className="space-y-4">
                <Input label="Platform Name" value="TicketShow Enterprise Operations" readOnly />
                <Input label="Convenience Fee (%)" value="10" readOnly />
                <Button onClick={() => toast.success('Settings updated')}>Save Settings</Button>
              </div>
            </Card>
          )}

        </div>
      </ErrorBoundary>

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

      {/* Organizer Rejection Modal */}
      <Modal isOpen={!!rejectTargetOrganizer} onClose={() => setRejectTargetOrganizer(null)} title="Reject Organizer Application">
        {rejectTargetOrganizer && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const reason = e.target.reason.value;
            handleOrganizerStatus(rejectTargetOrganizer.id, 'rejected', reason);
          }} className="space-y-4">
            <p className="text-xs font-bold text-gray-500">Provide feedback reason explaining why the profile registration request is rejected. This will be notified to the partner.</p>
            <div className="flex flex-col text-left">
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-1">Rejection Reason</label>
              <textarea name="reason" rows="3" className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setRejectTargetOrganizer(null)}>Cancel</Button>
              <Button type="submit" variant="danger">Confirm Rejection</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Event Rejection Modal */}
      <Modal isOpen={!!rejectTargetEvent} onClose={() => setRejectTargetEvent(null)} title="Reject Event Proposal">
        {rejectTargetEvent && (
          <form onSubmit={handleRejectEventConfirm} className="space-y-4">
            <p className="text-xs font-bold text-gray-500">Explain the reason for rejecting event "{rejectTargetEvent.title}". This reset status to Draft, letting the organizer edit and resubmit.</p>
            <div className="flex flex-col text-left">
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-1">Rejection Reason</label>
              <textarea value={rejectionReasonText} onChange={e => setRejectionReasonText(e.target.value)} rows="3" className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setRejectTargetEvent(null)}>Cancel</Button>
              <Button type="submit" variant="danger">Reject Event</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Organizer details Inspector Modal */}
      <Modal isOpen={!!selectedOrganizer} onClose={() => setSelectedOrganizer(null)} title="Organizer Profile & Performance Review" size="lg">
        {selectedOrganizer && (
          <div className="space-y-6 text-left font-semibold text-gray-600 text-sm">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <img 
                src={selectedOrganizer.company_logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'} 
                alt="Logo" 
                className="w-16 h-16 object-cover rounded-full border border-amber-400 bg-white" 
              />
              <div>
                <h4 className="font-black text-lg text-gray-900">{selectedOrganizer.company_name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{selectedOrganizer.full_name} • {selectedOrganizer.email} • {selectedOrganizer.phone}</p>
              </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-4 gap-3 bg-amber-50/20 border border-amber-100/50 p-4 rounded-2xl">
              <div className="text-center border-r border-gray-100">
                <span className="text-[9px] text-gray-400 uppercase font-black block">Events</span>
                <span className="text-base font-black text-gray-800">{organizerPerf?.eventsCreated || 0}</span>
              </div>
              <div className="text-center border-r border-gray-100">
                <span className="text-[9px] text-gray-400 uppercase font-black block">Tickets Sold</span>
                <span className="text-base font-black text-gray-800">{organizerPerf?.ticketsSold || 0}</span>
              </div>
              <div className="text-center border-r border-gray-100">
                <span className="text-[9px] text-gray-400 uppercase font-black block">Gross revenue</span>
                <span className="text-base font-black text-amber-500">₹{organizerPerf?.revenue || 0}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-gray-400 uppercase font-black block">Rating</span>
                <span className="text-base font-black text-gray-800">{organizerPerf?.averageRating || 0} ★</span>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Onboarding Documents & details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="font-extrabold text-[10px] text-gray-400 block uppercase">GST Number</span>
                  <span className="font-bold text-gray-800">{selectedOrganizer.gst_number || 'N/A'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="font-extrabold text-[10px] text-gray-400 block uppercase">PAN Number</span>
                  <span className="font-bold text-gray-800">{selectedOrganizer.pan_number || 'N/A'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="font-extrabold text-[10px] text-gray-400 block uppercase">License Details</span>
                  <span className="font-bold text-gray-800">{selectedOrganizer.business_license || 'N/A'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="font-extrabold text-[10px] text-gray-400 block uppercase">Bank Account</span>
                  <span className="font-bold text-gray-800">{selectedOrganizer.bank_account || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Active Events catalog */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Organizer's Event Listings</h5>
              {organizerEvts.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {organizerEvts.map((e, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <div>
                        <p className="text-xs font-black text-gray-800">{e.title}</p>
                        <p className="text-[9px] text-gray-400">{e.venue} | {new Date(e.start_date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg uppercase">{e.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">No events created by this organizer yet</div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setSelectedOrganizer(null)}>Close inspector</Button>
            </div>
          </div>
        )}
      </Modal>

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
