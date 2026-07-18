import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiHeart, FiUser, FiBell } from 'react-icons/fi';
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
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  
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
        getMyBookings(),
        getWishlist(),
        getNotifications()
      ]);
      setBookings(bookingsRes.data || bookingsRes || []);
      setWishlist(wishlistRes.data || wishlistRes || []);
      setNotifications(notificationsRes.data || notificationsRes || []);
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
          { id: 'bookings', label: 'My Bookings', icon: FiClock },
          { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
          { id: 'profile', label: 'Profile Settings', icon: FiUser },
          { id: 'notifications', label: 'Notifications', icon: FiBell }
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

      {/* Tab Panels */}
      {loading ? (
        <Loader type="card" count={3} />
      ) : (
        <div className="space-y-6">
          {/* BOOKINGS PANEL */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {bookings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bookings.map(b => {
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
                          </div>

                          <div className="text-sm bg-hover-bg/30 p-3 rounded-xl border border-border/40">
                            <span className="font-semibold text-text-secondary">Details: </span>
                            <span className="font-bold text-text-primary">{seatsOrTickets}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                          {b.booking_status === 'confirmed' && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedTicket(b)}
                              >
                                View Ticket
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setCancelTargetId(b.id)}
                              >
                                Cancel Booking
                              </Button>
                            </>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No bookings yet"
                  description="You don't have any bookings. Explore our latest movies and events to book your tickets!"
                  actionLabel="Browse Movies"
                  onActionClick={() => navigate('/')}
                />
              )}
            </div>
          )}

          {/* WISHLIST PANEL */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlist.map(w => {
                    const item = w.movie || w.event;
                    if (!item) return null;
                    const isMovie = !!w.movie_id;

                    return (
                      <Card key={w.id} className="flex flex-col justify-between" hoverable>
                        <div>
                          <div className="h-48 rounded-2xl bg-gray-200 overflow-hidden relative">
                            <img
                              src={item.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-text-primary">
                              {isMovie ? 'Movie' : 'Event'}
                            </span>
                          </div>
                          <h4 className="font-bold text-lg text-text-primary mt-4 line-clamp-1">{item.title}</h4>
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex gap-2 mt-6">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-grow"
                            onClick={() => navigate(isMovie ? `/movie/${item.id}` : `/event/${item.id}`)}
                          >
                            Book Now
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveWishlist(w.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Wishlist is empty"
                  description="Keep track of movies and events you want to attend by clicking the favorite heart button!"
                />
              )}
            </div>
          )}

          {/* PROFILE PANEL */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile details */}
              <Card>
                <h3 className="text-lg font-bold text-text-primary mb-6">Profile Settings</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                  />
                  <div className="pt-2">
                    <Button type="submit" variant="primary">Save Changes</Button>
                  </div>
                </form>
              </Card>

              {/* Password details */}
              <Card>
                <h3 className="text-lg font-bold text-text-primary mb-6">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <div className="pt-2">
                    <Button type="submit" variant="primary">Update Password</Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* NOTIFICATIONS PANEL */}
          {activeTab === 'notifications' && (
            <Card>
              <h3 className="text-lg font-bold text-text-primary mb-6">My Notifications</h3>
              {notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.map(n => (
                    <div key={n.id} className="py-4 flex items-start gap-3">
                      <div className={`p-2 rounded-full mt-0.5 ${
                        n.read_status ? 'bg-gray-100 text-gray-500' : 'bg-primary/20 text-primary'
                      }`}>
                        <FiBell size={18} />
                      </div>
                      <div className="flex-grow">
                        <p className={`text-sm ${!n.read_status ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
                          {n.message}
                        </p>
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
