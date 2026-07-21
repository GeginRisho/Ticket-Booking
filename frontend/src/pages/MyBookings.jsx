import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiActivity, FiSearch, FiStar, FiHeart, FiFileText } from 'react-icons/fi';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  useDocumentTitle('My Bookings & Passes', 'Manage your upcoming movie and event reservations.');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, completed, cancelled
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog Actions
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelTargetId) return;
    try {
      await cancelBooking(cancelTargetId);
      toast.success('Booking cancelled successfully!');
      setCancelTargetId(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleRateMovieSubmit = () => {
    toast.success(`Thank you for rating ${selectedRating} stars!`);
    setRatingTarget(null);
  };

  const handleDownloadTicket = (b) => {
    // Generate simple metadata file download for the ticket pass
    const isMovie = !!b.show_id;
    const title = isMovie ? b.show?.movie?.title : b.event_ticket?.event?.title;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(b, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Ticket_${title.replace(/\s+/g, '_')}_${b.booking_number}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Ticket details downloaded successfully!');
  };

  // Filter Logic
  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = bookings.filter(b => {
      const isMovie = !!b.show_id;
      const dateStr = isMovie ? b.show?.show_date : b.event_ticket?.event?.start_date;
      const showDate = dateStr ? new Date(dateStr) : null;
      const status = b.booking_status?.toLowerCase();

      // Tab match
      if (activeTab === 'upcoming') {
        return status === 'confirmed' && showDate && showDate >= today;
      } else if (activeTab === 'completed') {
        return status === 'confirmed' && showDate && showDate < today;
      } else if (activeTab === 'cancelled') {
        return status === 'cancelled';
      }
      return false;
    });

    // Search query match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return filtered.filter(b => {
        const isMovie = !!b.show_id;
        const title = isMovie ? b.show?.movie?.title : b.event_ticket?.event?.title;
        return title?.toLowerCase().includes(query) || b.booking_number?.toLowerCase().includes(query);
      });
    }

    return filtered;
  };

  const currentList = getFilteredBookings();

  const renderBookingCard = (b) => {
    const isMovie = !!b.show_id;
    const title = isMovie ? b.show?.movie?.title : b.event_ticket?.event?.title;
    const date = isMovie ? b.show?.show_date : b.event_ticket?.event?.start_date;
    const time = isMovie ? b.show?.start_time : b.event_ticket?.event?.start_time;
    const venue = isMovie ? b.show?.screen?.theatre?.theatre_name : b.event_ticket?.event?.venue;
    const bookingSeats = b.bookingSeats || b.booking_seats || [];
    const seatNumbers = bookingSeats.map(s => s.seat?.seat_number || s.seat_number || s.seat_id).filter(Boolean).join(', ');
    const seatsOrTickets = isMovie 
      ? `Seats: ${seatNumbers || (bookingSeats.length ? `${bookingSeats.length} Seats` : 'Reserved Seats')}`
      : `Quantity: ${b.event_ticket_quantity || 1}`;

    return (
      <Card key={b.id} className="p-6 border border-gray-200 rounded-3xl bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow gap-4 relative overflow-hidden">
        {/* Color Badge indicator */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isMovie ? 'bg-amber-400' : 'bg-purple-500'}`} />

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isMovie ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {isMovie ? 'Movie' : 'Event'}
              </span>
              <h3 className="text-lg font-black text-gray-900 mt-2 leading-tight line-clamp-1">{title}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: {b.booking_number}</p>
            </div>
            
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              b.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
              b.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {b.booking_status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-t border-gray-100 pt-4 font-semibold text-gray-600">
            <div>
              <p className="text-gray-400 uppercase text-[9px] font-black tracking-wider">Date & Time</p>
              <p className="font-bold text-gray-800 mt-1">{date} at {time}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase text-[9px] font-black tracking-wider">Venue / Theatre</p>
              <p className="font-bold text-gray-800 mt-1 truncate">{venue}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 uppercase text-[9px] font-black tracking-wider font-black">Tickets / Seats Allocation</p>
              <p className="font-bold text-gray-900 mt-1">{seatsOrTickets}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-gray-100 mt-2 pt-4">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-grow py-2 rounded-xl text-xs font-bold border border-gray-200" 
            onClick={() => setSelectedTicket(b)}
          >
            View Ticket
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            className="p-2 border border-gray-200 rounded-xl"
            title="Download Invoice"
            onClick={() => handleDownloadTicket(b)}
          >
            <FiFileText size={16} />
          </Button>

          {activeTab === 'upcoming' && b.booking_status === 'confirmed' && (
            <Button 
              variant="danger" 
              size="sm" 
              className="py-2 px-4 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white" 
              onClick={() => setCancelTargetId(b.id)}
            >
              Cancel
            </Button>
          )}

          {activeTab === 'completed' && (
            <Button 
              variant="primary" 
              size="sm" 
              className="py-2 px-4 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-500 text-gray-900" 
              onClick={() => setRatingTarget(b)}
            >
              Rate Show
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Bookings</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Review your current ticket allocations, view QR check-in passes, download receipts, and cancel bookings.
        </p>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 gap-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'upcoming', label: 'Upcoming Bookings' },
            { id: 'completed', label: 'Completed Shows' },
            { id: 'cancelled', label: 'Cancelled Bookings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3 sm:mb-0 max-w-xs w-full">
          <input
            type="text"
            placeholder="Search by movie/event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold px-4 py-2 pl-9 rounded-full border border-gray-200 text-gray-800 focus:outline-none focus:border-amber-400"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
        </div>
      </div>

      {/* Bookings Render */}
      {loading ? (
        <Loader type="card" count={3} />
      ) : currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map(b => renderBookingCard(b))}
        </div>
      ) : (
        <EmptyState
          title={`No ${activeTab} bookings found`}
          description={
            searchQuery 
              ? "Try adjusting your search query to find your bookings."
              : `You have no ${activeTab} bookings logged at the moment.`
          }
        />
      )}

      {/* Cancel Booking Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking?"
        description="Are you sure you want to cancel this ticket reservation? The refund will be initiated instantly according to terms."
        confirmLabel="Cancel Booking"
        isDanger
      />

      {/* Ticket Pass QR View Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Digital Entry Pass"
          size="sm"
        >
          <div className="flex flex-col items-center text-center p-4 space-y-6">
            <QRCodeSVG
              value={JSON.stringify({
                booking_number: selectedTicket.booking_number,
                user_id: user?.id,
                booking_id: selectedTicket.id
              })}
              size={180}
              className="bg-white p-2 border border-gray-200 rounded-2xl shadow-xs"
            />
            <div className="space-y-1">
              <h4 className="text-lg font-black text-gray-900">
                {selectedTicket.show?.movie?.title || selectedTicket.event_ticket?.event?.title}
              </h4>
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
                {selectedTicket.show?.show_date || selectedTicket.event_ticket?.event?.start_date} at {selectedTicket.show?.start_time || selectedTicket.event_ticket?.event?.start_time}
              </p>
              <p className="text-[11px] text-gray-400 font-medium">
                {selectedTicket.show?.screen?.theatre?.theatre_name || selectedTicket.event_ticket?.event?.venue}
              </p>
            </div>

            <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-semibold text-gray-700 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Pass Number</span>
                <span>{selectedTicket.booking_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tickets/Seats</span>
                <span className="text-gray-900 font-black">
                  {selectedTicket.show_id 
                    ? selectedTicket.booking_seats?.map(s => s.seat?.seat_number).join(', ')
                    : selectedTicket.event_ticket_quantity
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Paid</span>
                <span className="text-green-600 font-black">₹{selectedTicket.total_amount}</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full py-3 font-black text-xs bg-amber-400 text-gray-900 rounded-2xl"
              onClick={() => handleDownloadTicket(selectedTicket)}
            >
              Download Ticket JSON
            </Button>
          </div>
        </Modal>
      )}

      {/* Rate Show Modal */}
      {ratingTarget && (
        <Modal
          isOpen={!!ratingTarget}
          onClose={() => setRatingTarget(null)}
          title="Rate & Review Show"
          size="sm"
        >
          <div className="flex flex-col items-center text-center p-4 space-y-6">
            <p className="text-xs text-gray-500 font-semibold">
              How was your experience watching {ratingTarget.show?.movie?.title || ratingTarget.event_ticket?.event?.title}?
            </p>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="text-amber-400 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                >
                  <FiStar
                    size={36}
                    fill={star <= selectedRating ? '#FBBF24' : 'transparent'}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              className="w-full py-3 font-black text-xs bg-amber-400 text-gray-900 rounded-2xl"
              onClick={handleRateMovieSubmit}
            >
              Submit Rating
            </Button>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default MyBookings;
