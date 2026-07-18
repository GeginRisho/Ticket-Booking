import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiFilm, FiCalendar, FiDollarSign, FiPlusSquare, 
  FiPercent, FiCreditCard, FiTrendingUp, FiActivity, FiUser, FiEye, FiTrash2, FiPlus
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { getDashboardStats } from '../../services/dashboardService';
import { getMovies, createMovie, deleteMovie } from '../../services/movieService';
import { getCoupons, createCoupon, deleteCoupon } from '../../services/couponService';
import { getTheatres, updateTheatreStatus } from '../../services/theatreService';
import { getEvents, deleteEvent } from '../../services/eventService';
import { refundPayment } from '../../services/paymentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  
  // Dashboard Analytics States
  const [stats, setStats] = useState(null);

  // Entities lists
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [events, setEvents] = useState([]);
  const [coupons, setCoupons] = useState([]);
  
  // Modals / Actions
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [refundTargetId, setRefundTargetId] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Form inputs
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', poster: '', banner: '', language: '',
    genre: '', duration: '', age_rating: 'U', release_date: '', status: 'now_showing'
  });
  
  const [couponForm, setCouponForm] = useState({
    coupon_code: '', discount_type: 'percentage', discount_value: '',
    min_order_amount: '', max_discount_amount: '', expiry_date: '', usage_limit: ''
  });

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, theatresRes, eventsRes, couponsRes] = await Promise.all([
        getDashboardStats(),
        getMovies(),
        getTheatres(),
        getEvents(),
        getCoupons()
      ]);
      
      setStats(statsRes.data || statsRes);
      setMovies(moviesRes.data?.movies || moviesRes.movies || moviesRes || []);
      setTheatres(theatresRes.data || theatresRes || []);
      setEvents(eventsRes.data || eventsRes || []);
      setCoupons(couponsRes.data || couponsRes || []);
    } catch (err) {
      toast.error('Failed to load administration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await createMovie({
        ...movieForm,
        duration: parseInt(movieForm.duration, 10)
      });
      toast.success('Movie created successfully');
      setIsAddMovieOpen(false);
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    try {
      await deleteMovie(id);
      toast.success('Movie deleted successfully');
      loadAllAdminData();
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await createCoupon({
        ...couponForm,
        discount_value: parseFloat(couponForm.discount_value),
        min_order_amount: parseFloat(couponForm.min_order_amount),
        max_discount_amount: couponForm.max_discount_amount ? parseFloat(couponForm.max_discount_amount) : null,
        usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit, 10) : null
      });
      toast.success('Coupon created successfully');
      setIsAddCouponOpen(false);
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted');
      loadAllAdminData();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleUpdateTheatreStatus = async (id, status) => {
    try {
      await updateTheatreStatus(id, status);
      toast.success(`Theatre marked as ${status}`);
      loadAllAdminData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleRefund = async () => {
    try {
      await refundPayment(refundTargetId, {
        amount: parseFloat(refundAmount),
        reason: refundReason
      });
      toast.success('Refund processed successfully');
      setRefundTargetId(null);
      setRefundAmount('');
      setRefundReason('');
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund processing failed');
    }
  };

  // Chart Mappings using Real statistics
  const getBookingChartData = () => {
    if (!stats?.bookings) return [];
    return [
      { name: 'Confirmed', count: stats.bookings.confirmed },
      { name: 'Pending', count: stats.bookings.pending },
      { name: 'Cancelled', count: stats.bookings.cancelled },
      { name: 'Failed', count: stats.bookings.failed }
    ];
  };

  const COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#9CA3AF'];

  if (loading) {
    return <Loader type="chart" />;
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary">Admin Control Center</h1>
        <p className="text-sm text-text-secondary mt-1">
          Perform administrative actions, manage catalog entities, approve listings, and trigger refunds.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-2 hide-scrollbar">
        {[
          { id: 'analytics', label: 'Analytics', icon: FiTrendingUp },
          { id: 'movies', label: 'Movies', icon: FiFilm },
          { id: 'theatres', label: 'Theatres Approval', icon: FiPlusSquare },
          { id: 'coupons', label: 'Coupons', icon: FiPercent }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TABS CONTAINER */}
      <div className="space-y-6">
        {/* ANALYTICS PANEL */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Revenue', value: `₹${stats?.revenue || 0}`, icon: FiDollarSign, bg: 'bg-green-50 text-green-600' },
                { title: 'Total Bookings', value: stats?.bookings?.total || 0, icon: FiCreditCard, bg: 'bg-amber-50 text-amber-600' },
                { title: 'Active Users', value: stats?.users?.active || 0, icon: FiUsers, bg: 'bg-blue-50 text-blue-600' },
                { title: 'Active Theatres', value: stats?.theatres?.active || 0, icon: FiPlusSquare, bg: 'bg-purple-50 text-purple-600' }
              ].map((card, idx) => (
                <Card key={idx} className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${card.bg}`}>
                    <card.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-black text-text-primary mt-1">{card.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-bold text-lg text-text-primary mb-6">Booking Distribution</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBookingChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FFC107" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-lg text-text-primary mb-6">User/Theatre/Event Summary</h3>
                <div className="h-72 flex items-center justify-center">
                  <div className="w-full max-w-sm space-y-4">
                    {[
                      { name: 'Users (Active/Total)', value: `${stats?.users?.active}/${stats?.users?.total}`, color: 'bg-blue-500' },
                      { name: 'Theatres (Active/Total)', value: `${stats?.theatres?.active}/${stats?.theatres?.total}`, color: 'bg-purple-500' },
                      { name: 'Events (Active/Total)', value: `${stats?.events?.active}/${stats?.events?.total}`, color: 'bg-green-500' }
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-hover-bg/30 px-4 py-3 rounded-2xl border border-border">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${row.color}`} />
                          <span className="font-semibold text-sm text-text-secondary">{row.name}</span>
                        </div>
                        <span className="font-bold text-sm text-text-primary">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Bookings table */}
            <Card>
              <h3 className="font-bold text-lg text-text-primary mb-6">Recent Bookings Log</h3>
              <Table
                headers={['Booking ID', 'User Email', 'Total Amount', 'Status']}
                data={stats?.recentBookings || []}
                renderRow={(b) => (
                  <tr key={b.id}>
                    <td className="px-6 py-4 font-semibold text-sm truncate max-w-[120px]">{b.id}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{b.user?.email || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-sm text-text-primary">₹{b.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        b.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {b.booking_status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )}
              />
            </Card>
          </div>
        )}

        {/* MOVIES PANEL */}
        {activeTab === 'movies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-text-primary">Movies List</h3>
              <Button onClick={() => setIsAddMovieOpen(true)} className="flex items-center gap-1.5">
                <FiPlus size={16} />
                <span>Add Movie</span>
              </Button>
            </div>

            <Table
              headers={['Poster', 'Movie Title', 'Genre', 'Duration', 'Actions']}
              data={movies}
              renderRow={(m) => (
                <tr key={m.id}>
                  <td className="px-6 py-4">
                    <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded-lg border border-border" />
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">{m.title}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{m.genre}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{m.duration} mins</td>
                  <td className="px-6 py-4">
                    <Button variant="danger" size="sm" onClick={() => handleDeleteMovie(m.id)}>
                      <FiTrash2 size={14} />
                    </Button>
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* THEATRES PANEL */}
        {activeTab === 'theatres' && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-text-primary">Theatre Approval Queue</h3>
            <Table
              headers={['Theatre Name', 'Location', 'City ID', 'Status', 'Actions']}
              data={theatres}
              renderRow={(t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 font-bold text-sm">{t.theatre_name}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{t.address}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary truncate max-w-[120px]">{t.city_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {t.status === 'pending' && (
                      <Button variant="primary" size="sm" onClick={() => handleUpdateTheatreStatus(t.id, 'active')}>
                        Approve
                      </Button>
                    )}
                    {t.status === 'active' && (
                      <Button variant="danger" size="sm" onClick={() => handleUpdateTheatreStatus(t.id, 'pending')}>
                        Suspend
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* COUPONS PANEL */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-text-primary">Active Promotional Coupons</h3>
              <Button onClick={() => setIsAddCouponOpen(true)} className="flex items-center gap-1.5">
                <FiPlus size={16} />
                <span>Create Coupon</span>
              </Button>
            </div>

            <Table
              headers={['Code', 'Type', 'Value', 'Min Order', 'Actions']}
              data={coupons}
              renderRow={(c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 font-bold text-sm tracking-wider">{c.coupon_code}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary uppercase">{c.discount_type}</td>
                  <td className="px-6 py-4 text-sm font-bold">{c.discount_value}{c.discount_type === 'percentage' ? '%' : ' INR'}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">₹{c.min_order_amount}</td>
                  <td className="px-6 py-4">
                    <Button variant="danger" size="sm" onClick={() => handleDeleteCoupon(c.id)}>
                      <FiTrash2 size={14} />
                    </Button>
                  </td>
                </tr>
              )}
            />
          </div>
        )}
      </div>

      {/* Add Movie Modal */}
      <Modal isOpen={isAddMovieOpen} onClose={() => setIsAddMovieOpen(false)} title="Add New Movie" size="lg">
        <form onSubmit={handleCreateMovie} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
          <Input label="Language" value={movieForm.language} onChange={e => setMovieForm({...movieForm, language: e.target.value})} required />
          <Input label="Genre" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} required />
          <Input label="Duration (mins)" type="number" value={movieForm.duration} onChange={e => setMovieForm({...movieForm, duration: e.target.value})} required />
          <Input label="Poster URL" value={movieForm.poster} onChange={e => setMovieForm({...movieForm, poster: e.target.value})} required />
          <Input label="Banner URL" value={movieForm.banner} onChange={e => setMovieForm({...movieForm, banner: e.target.value})} required />
          <Input label="Release Date (YYYY-MM-DD)" value={movieForm.release_date} onChange={e => setMovieForm({...movieForm, release_date: e.target.value})} required />
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">Age Rating</label>
            <select 
              value={movieForm.age_rating} 
              onChange={e => setMovieForm({...movieForm, age_rating: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
            >
              <option value="U">U (Universal)</option>
              <option value="UA">UA (Parental Guidance)</option>
              <option value="A">A (Adult Only)</option>
            </select>
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input label="Description" value={movieForm.description} onChange={e => setMovieForm({...movieForm, description: e.target.value})} required />
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddMovieOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Movie</Button>
          </div>
        </form>
      </Modal>

      {/* Add Coupon Modal */}
      <Modal isOpen={isAddCouponOpen} onClose={() => setIsAddCouponOpen(false)} title="Create Promo Coupon" size="md">
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <Input label="Coupon Code" value={couponForm.coupon_code} onChange={e => setCouponForm({...couponForm, coupon_code: e.target.value.toUpperCase()})} required />
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">Discount Type</label>
            <select 
              value={couponForm.discount_type} 
              onChange={e => setCouponForm({...couponForm, discount_type: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (INR)</option>
            </select>
          </div>
          <Input label="Discount Value" type="number" value={couponForm.discount_value} onChange={e => setCouponForm({...couponForm, discount_value: e.target.value})} required />
          <Input label="Min Order Amount" type="number" value={couponForm.min_order_amount} onChange={e => setCouponForm({...couponForm, min_order_amount: e.target.value})} required />
          <Input label="Expiry Date (YYYY-MM-DD)" value={couponForm.expiry_date} onChange={e => setCouponForm({...couponForm, expiry_date: e.target.value})} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddCouponOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
