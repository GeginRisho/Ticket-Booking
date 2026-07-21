import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiHeart, FiUser, FiBell, FiGrid, FiCalendar, FiActivity, FiPercent, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import { getWishlist, removeFromWishlist } from '../../services/wishlistService';
import { updateProfile, changePassword } from '../../services/authService';
import { getNotifications, markRead } from '../../services/notificationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user, updateUser, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPathname = () => {
    const path = location.pathname;
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/upcoming')) return 'upcoming';
    if (path.includes('/history')) return 'history';
    if (path.includes('/wishlist')) return 'wishlist';
    if (path.includes('/notifications')) return 'notifications';
    if (path.includes('/offers')) return 'offers';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPathname());

  useEffect(() => {
    setActiveTab(getTabFromPathname());
  }, [location.pathname]);
  
  // States
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile States
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Dialog Actions
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, wishlistRes, notificationsRes] = await Promise.all([
        getMyBookings().catch(err => { console.error("Error fetching bookings:", err); return []; }),
        getWishlist().catch(err => { console.error("Error fetching wishlist:", err); return []; }),
        getNotifications().catch(err => { console.error("Error fetching notifications:", err); return []; })
      ]);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      setWishlist(Array.isArray(wishlistRes) ? wishlistRes : []);
      setNotifications(Array.isArray(notificationsRes) ? notificationsRes : []);
    } catch (err) {
      toast.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ full_name: fullName, phone });
      updateUser(res.data?.user || res.user || { ...user, full_name: fullName, phone });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleRemoveWishlist = async (id) => {
    try {
      await removeFromWishlist(id);
      setWishlist(prev => prev.filter(w => w.id !== id));
      toast.success('Item removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTargetId) return;
    try {
      await cancelBooking(cancelTargetId);
      toast.success('Booking cancelled successfully');
      setCancelTargetId(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const getUpcomingBookings = () => {
    return bookings.filter(b => {
      const dateStr = b.show?.show_date || b.event_ticket?.event?.start_date;
      if (!dateStr) return false;
      const showDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return b.booking_status === 'confirmed' && showDate >= today;
    });
  };

  const getHistoryBookings = () => {
    return bookings.filter(b => {
      const dateStr = b.show?.show_date || b.event_ticket?.event?.start_date;
      if (!dateStr) return true;
      const showDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return b.booking_status === 'cancelled' || showDate < today;
    });
  };

  const renderBookingCard = (b) => {
    const isMovie = !!b.show_id;
    const title = isMovie ? b.show?.movie?.title : b.event_ticket?.event?.title;
    const date = isMovie ? b.show?.show_date : b.event_ticket?.event?.start_date;
    const time = isMovie ? b.show?.start_time : b.event_ticket?.event?.start_time;
    const venue = isMovie ? b.show?.screen?.theatre?.theatre_name : b.event_ticket?.event?.venue;
    const seatsOrTickets = isMovie 
      ? `Seats: ${b.booking_seats?.map(s => s.seat?.seat_number).join(', ')}`
      : `Qty: ${b.event_ticket_quantity}`;

    return (
      <Card key={b.id} className="relative flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isMovie ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {isMovie ? 'Movie' : 'Event'}
              </span>
              <h3 className="text-xl font-bold text-text-primary mt-2">{title}</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              b.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
              b.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {b.booking_status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
            <div>
              <p className="text-text-secondary font-semibold">Date & Time</p>
              <p className="font-bold text-text-primary mt-0.5">{date} at {time}</p>
            </div>
            <div>
              <p className="text-text-secondary font-semibold">Venue</p>
              <p className="font-bold text-text-primary mt-0.5">{venue}</p>
            </div>
            <div className="col-span-2">
              <p className="text-text-secondary font-semibold">Allocations</p>
              <p className="font-bold text-text-primary mt-0.5">{seatsOrTickets}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border mt-6 pt-4">
          <Button variant="secondary" size="sm" className="flex-1 flex justify-center" onClick={() => setSelectedTicket(b)}>
            View Ticket
          </Button>
          {b.booking_status === 'confirmed' && (
            <Button variant="danger" size="sm" onClick={() => setCancelTargetId(b.id)}>
              Cancel
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary">
          Welcome back, {user?.full_name || 'Customer'}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your bookings, ticket QR codes, reviews, and favorites.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border overflow-x-auto gap-2 hide-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: FiGrid },
          { id: 'profile', label: 'Profile', icon: FiUser },
          { id: 'bookings', label: 'My Bookings', icon: FiClock },
          { id: 'upcoming', label: 'Upcoming Shows', icon: FiCalendar },
          { id: 'history', label: 'Booking History', icon: FiActivity },
          { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
          { id: 'notifications', label: 'Notifications', icon: FiBell },
          { id: 'offers', label: 'Offers', icon: FiPercent },
          { id: 'settings', label: 'Settings', icon: FiSettings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(tab.id === 'overview' ? '/dashboard' : `/dashboard/${tab.id}`);
            }}
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

      {/* Tab Panels */}
      {loading ? (
        <Loader type="card" count={3} />
      ) : (
        <div className="space-y-6">
          {/* OVERVIEW PANEL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4 bg-white border border-border p-6 rounded-3xl shadow-sm">
                  <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
                    <FiClock size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Bookings</p>
                    <p className="text-2xl font-black text-text-primary mt-1">{bookings.length}</p>
                  </div>
                </Card>
                <Card className="flex items-center gap-4 bg-white border border-border p-6 rounded-3xl shadow-sm">
                  <div className="p-4 rounded-2xl bg-red-50 text-red-600">
                    <FiHeart size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider font-extrabold">Wishlisted Items</p>
                    <p className="text-2xl font-black text-text-primary mt-1">{wishlist.length}</p>
                  </div>
                </Card>
                <Card className="flex items-center gap-4 bg-white border border-border p-6 rounded-3xl shadow-sm">
                  <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                    <FiBell size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider font-extrabold">Notifications</p>
                    <p className="text-2xl font-black text-text-primary mt-1">{notifications.length}</p>
                  </div>
                </Card>
              </div>

              {/* Recent Booking Activity */}
              <Card className="bg-white border border-border rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-lg text-text-primary mb-6">Recent Ticket Purchases</h3>
                {bookings.length > 0 ? (
                  <div className="divide-y divide-border/60">
                    {bookings.slice(0, 3).map(b => {
                      const isMovie = !!b.show_id;
                      const title = isMovie ? b.show?.movie?.title : b.event_ticket?.event?.title;
                      return (
                        <div key={b.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                          <div>
                            <p className="font-bold text-sm text-text-primary">{title}</p>
                            <p className="text-xs text-text-secondary mt-0.5">Booking ID: {b.id}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            b.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {b.booking_status.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState title="No bookings found" description="Browse movies and events to make your first booking." />
                )}
              </Card>
            </div>
          )}

          {/* BOOKINGS PANEL */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {bookings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bookings.map(b => renderBookingCard(b))}
                </div>
              ) : (
                <EmptyState
                  title="No bookings yet"
                  description="You have not booked any shows or events yet. Browse our movies lists and event catalogs!"
                />
              )}
            </div>
          )}

          {/* UPCOMING SHOWS PANEL */}
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-text-primary">Upcoming Booked Shows</h3>
              {getUpcomingBookings().length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getUpcomingBookings().map(b => renderBookingCard(b))}
                </div>
              ) : (
                <EmptyState title="No upcoming shows" description="You don't have any upcoming reserved tickets. Book some now!" />
              )}
            </div>
          )}

          {/* HISTORY PANEL */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-text-primary">Booking History & Log</h3>
              {getHistoryBookings().length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getHistoryBookings().map(b => renderBookingCard(b))}
                </div>
              ) : (
                <EmptyState title="No booking logs" description="You have no historical transactions." />
              )}
            </div>
          )}

          {/* WISHLIST PANEL */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map(w => {
                    const item = w.movie || w.event;
                    const type = w.movie ? 'Movie' : 'Event';
                    const linkPath = w.movie ? `/movie/${w.movie.id}` : `/event/${w.event.id}`;
                    return (
                      <Card key={w.id} className="flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-border">
                        <div>
                          <img src={item.poster || 'https://placehold.co/300x450'} alt={item.title} className="h-44 w-full object-cover rounded-xl border border-border" />
                          <h4 className="font-bold text-lg text-text-primary mt-4 line-clamp-1">{item.title}</h4>
                          <span className="text-xs text-text-secondary mt-1 block uppercase font-extrabold tracking-wider">{type} | {item.genre}</span>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                          <Button variant="primary" size="sm" className="flex-grow flex justify-center text-xs" onClick={() => navigate(linkPath)}>
                            Book Tickets
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleRemoveWishlist(w.id)}>
                            Remove
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Your Wishlist is empty"
                  description="Save shows or events that you are interested in, and they will appear here."
                />
              )}
            </div>
          )}

          {/* PROFILE PANEL */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Details Form */}
              <Card className="bg-white border border-border">
                <h3 className="font-bold text-lg text-text-primary mb-6">Personal Profile Details</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  <Input label="Email Address" value={user?.email || ''} disabled />
                  <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                  <Button type="submit" className="w-full">Update Info</Button>
                </form>
              </Card>

              {/* Password update */}
              <Card className="bg-white border border-border">
                <h3 className="font-bold text-lg text-text-primary mb-6">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                  <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  <Button type="submit" className="w-full" variant="secondary">Update Password</Button>
                </form>
              </Card>
            </div>
          )}

          {/* NOTIFICATIONS PANEL */}
          {activeTab === 'notifications' && (
            <Card className="bg-white border border-border p-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-lg text-text-primary mb-6">Notification Hub</h3>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-4 p-4 bg-hover-bg/30 rounded-2xl border border-border/50">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary h-fit">
                        <FiBell size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{n.message}</p>
                        <span className="text-xs text-text-secondary block mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No notifications"
                  description="You are all caught up! You will see booking notifications and coupons alert updates here."
                />
              )}
            </Card>
          )}

          {/* OFFERS PANEL */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 p-6 rounded-3xl shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-2xl font-black uppercase tracking-wider">Exclusive Promo Coupons</h3>
                <p className="text-xs font-semibold mt-1">Unlock massive discounts on movie showtimes and concert events.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { code: 'WELCOME50', desc: 'Flat 50% discount on your first ticket booking.', limit: 'First-time users' },
                  { code: 'GOLDEN20', desc: 'Get 20% off on premium lounge or VIP recliner seating layouts.', limit: 'Min. booking ₹500' },
                  { code: 'FLAT100', desc: 'Flat ₹100 cash back on tickets and convenience charges.', limit: 'Valid for events' }
                ].map(coupon => (
                  <Card key={coupon.code} className="bg-white border border-border p-6 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 font-mono font-bold text-xs rounded-lg tracking-widest">{coupon.code}</span>
                      <p className="font-bold text-sm text-text-primary mt-4">{coupon.desc}</p>
                      <p className="text-xs text-text-secondary mt-1">{coupon.limit}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS PANEL */}
          {activeTab === 'settings' && (
            <Card className="bg-white border border-border p-6 rounded-3xl shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-lg text-text-primary">Account Preferences</h3>
                <p className="text-xs text-text-secondary mt-1">Adjust notification delivery, toggle dark layout previews, and manage roles.</p>
              </div>
              <div className="space-y-4 max-w-md border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-text-primary">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded-lg" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-text-primary">SMS Booking Alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded-lg" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-text-primary">Dark Mode Preview</span>
                  <input type="checkbox" className="w-4 h-4 accent-primary rounded-lg" />
                </div>
                {/* Developer Role Switcher Tool */}
                <div className="border-t border-border pt-6 mt-6">
                  <span className="block font-bold text-xs text-text-secondary uppercase tracking-wider">Developer Tool: Switch active role</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Customer', 'Theatre Owner', 'Event Organizer', 'Admin', 'Super Admin'].map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          const paths = {
                            'Customer': '/dashboard',
                            'Theatre Owner': '/theatre/dashboard',
                            'Event Organizer': '/organizer/dashboard',
                            'Admin': '/admin/dashboard',
                            'Super Admin': '/super-admin/dashboard'
                          };
                          navigate(paths[r]);
                        }}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                          user?.role === r || user?.role?.role_name === r
                            ? 'bg-primary text-text-primary border-primary font-extrabold'
                            : 'bg-white text-text-secondary hover:border-text-primary'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Confirm cancel dialog */}
      <ConfirmDialog
        isOpen={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking?"
        description="Are you sure you want to cancel this booking? A refund will be issued according to refund terms."
        confirmLabel="Cancel Booking"
        isDanger
      />

      {/* QR Ticket View Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Digital Ticket Pass"
          size="sm"
        >
          <div className="flex flex-col items-center text-center p-4 space-y-6">
            <QRCodeSVG
              value={JSON.stringify({
                booking_id: selectedTicket.id,
                user_id: user?.id,
                show_id: selectedTicket.show_id
              })}
              size={180}
              className="bg-white p-2 border border-border rounded-xl"
            />
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-text-primary">
                {selectedTicket.show?.movie?.title || selectedTicket.event_ticket?.event?.title}
              </h4>
              <p className="text-sm text-text-secondary font-semibold">
                {selectedTicket.show?.show_date || selectedTicket.event_ticket?.event?.start_date} at {selectedTicket.show?.start_time || selectedTicket.event_ticket?.event?.start_time}
              </p>
              <p className="text-xs text-text-secondary max-w-xs">
                {selectedTicket.show?.screen?.theatre?.theatre_name || selectedTicket.event_ticket?.event?.venue}
              </p>
            </div>
            
            <div className="w-full bg-hover-bg p-4 rounded-xl border border-border/50 text-sm space-y-2 text-left">
              <div className="flex justify-between font-semibold">
                <span>Pass ID</span>
                <span className="text-text-secondary truncate max-w-[150px]">{selectedTicket.id}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Seats/Tickets</span>
                <span className="text-text-secondary">
                  {selectedTicket.show_id 
                    ? selectedTicket.booking_seats?.map(s => s.seat?.seat_number).join(', ')
                    : selectedTicket.event_ticket_quantity
                  }
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerDashboard;
