import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiMonitor, FiCheck, FiAlertCircle, FiPercent } from 'react-icons/fi';
import { getShowSeats, createMovieBooking } from '../services/bookingService';
import { validateCoupon } from '../services/couponService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const SeatBooking = () => {
  useDocumentTitle('Select Seats', 'Choose your preferred cinema seats, apply coupon codes, and reserve tickets.');
  const { id } = useParams(); // Showtime ID
  const navigate = useNavigate();
  
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]); // Array of seat objects
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const res = await getShowSeats(id);
      // Backend response returns directly the mapped array or wraps inside data
      const list = res.data?.seats || res.seats || res || [];
      setSeats(list);
    } catch (err) {
      toast.error('Failed to load show seat configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [id]);

  const toggleSeatSelection = (seat) => {
    if (!seat.is_available) return;
    
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats(prev => [...prev, seat]);
    }
    // Reset coupon on seat changes
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(couponCode.toUpperCase(), ticketTotal);
      const data = res.data || res;
      setAppliedCoupon(data);
      setDiscountAmount(data.discount_amount || 0);
      toast.success(`Coupon applied successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon or criteria not met');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await createMovieBooking({
        show_id: id,
        seat_ids: selectedSeats.map(s => s.id),
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : undefined
      });
      const booking = res.data?.booking || res.booking || res;
      toast.success('Seats locked successfully! Processing payment.');
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete reservation. Some seats might be taken.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  // Group seats by row letter for visual rendering
  // seat_number is like "A-1", "B-12" etc
  const groupedSeats = {};
  seats.forEach(seat => {
    const row = seat.seat_number.split('-')[0] || 'A';
    if (!groupedSeats[row]) {
      groupedSeats[row] = [];
    }
    groupedSeats[row].push(seat);
  });

  // Sort seats inside each row numerically
  Object.keys(groupedSeats).forEach(row => {
    groupedSeats[row].sort((a, b) => {
      const aCol = parseInt(a.seat_number.split('-')[1] || 0, 10);
      const bCol = parseInt(b.seat_number.split('-')[1] || 0, 10);
      return aCol - bCol;
    });
  });

  const sortedRows = Object.keys(groupedSeats).sort();

  // Pricing calculations
  const ticketTotal = selectedSeats.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);
  const convenienceFee = selectedSeats.length * 30;
  const grandTotal = Math.max(0, ticketTotal + convenienceFee - discountAmount);

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl text-left py-12 bg-background text-text-primary">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Seat Map Layout */}
        <div className="flex-grow">
          <Card className="p-8 overflow-x-auto">
            {/* Screen heading representation */}
            <div className="mb-16 text-center">
              <div className="flex justify-center mb-2">
                <FiMonitor size={32} className="text-text-secondary" />
              </div>
              <div className="h-2 w-3/4 mx-auto bg-gradient-to-b from-primary to-transparent rounded-t-full opacity-60 shadow-xs" />
              <p className="text-center text-text-secondary mt-4 text-xs font-bold tracking-[0.5em] uppercase">
                All eyes this way (Screen)
              </p>
            </div>

            {/* Dynamic Seating grid layout */}
            <div className="min-w-[650px] space-y-4">
              {sortedRows.map(row => (
                <div key={row} className="flex justify-center items-center gap-3">
                  <div className="w-8 font-bold text-sm text-text-secondary text-center">{row}</div>
                  
                  <div className="flex gap-2">
                    {(() => {
                      const rowSeats = groupedSeats[row];
                      const cols = rowSeats.map(s => parseInt(s.seat_number.split('-')[1] || 0, 10));
                      const maxCol = Math.max(...cols, 0);

                      return Array.from({ length: maxCol }).map((_, cIdx) => {
                        const colNum = cIdx + 1;
                        const seat = rowSeats.find(s => parseInt(s.seat_number.split('-')[1] || 0, 10) === colNum);

                        if (!seat) {
                          // Dynamic Aisle / Empty space gap
                          return <div key={`empty-${colNum}`} className="w-8 h-8 flex-shrink-0" />;
                        }

                        const isSelected = selectedSeats.some(s => s.id === seat.id);

                        return (
                          <button
                            key={seat.id}
                            disabled={!seat.is_available}
                            onClick={() => toggleSeatSelection(seat)}
                            title={`${seat.seat_number} (${seat.seat_type}) - ₹${seat.price}`}
                            className={`w-8 h-8 rounded-t-xl rounded-b-md transition-all duration-200 border text-[10px] font-bold flex-shrink-0 flex items-center justify-center ${
                              !seat.is_available 
                                ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-40 line-through' 
                                : isSelected
                                  ? 'bg-amber-400 border-amber-500 text-text-primary transform scale-110 shadow-md font-extrabold'
                                  : seat.seat_type?.toLowerCase() === 'vip'
                                    ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-700'
                                    : seat.seat_type?.toLowerCase() === 'recliner'
                                      ? 'bg-purple-50 border-purple-300 hover:bg-purple-100 text-purple-700'
                                      : seat.seat_type?.toLowerCase() === 'couple'
                                        ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 text-yellow-700'
                                        : seat.seat_type?.toLowerCase() === 'wheelchair'
                                          ? 'bg-teal-50 border-teal-300 hover:bg-teal-100 text-teal-700'
                                          : 'bg-white border-border hover:bg-amber-50 text-text-primary'
                            }`}
                          >
                            {isSelected ? <FiCheck className="mx-auto" size={14} /> : colNum}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  <div className="w-8 font-bold text-sm text-text-secondary text-center">{row}</div>
                </div>
              ))}
            </div>

            {/* Seating map legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-border text-[11px] font-bold text-text-secondary">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-white border border-border"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-amber-400 border border-amber-500"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-gray-100 border border-gray-200 opacity-40 line-through"></div>
                <span>Booked / Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-blue-50 border border-blue-300"></div>
                <span>VIP Seats</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-purple-50 border border-purple-300"></div>
                <span>Recliner Seats</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-yellow-50 border border-yellow-300"></div>
                <span>Couple Seats</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-teal-50 border border-teal-300"></div>
                <span>Accessible Seats</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Selections & Billing Summaries */}
        <div className="w-full lg:w-[360px] flex-shrink-0">
          <Card className="sticky top-24 space-y-6">
            <h3 className="text-xl font-bold text-text-primary border-b border-border pb-4">Seating summary</h3>

            {selectedSeats.length > 0 ? (
              <div className="space-y-6">
                {/* Tickets list */}
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-text-secondary">Selected Seats ({selectedSeats.length})</span>
                  <span className="font-extrabold text-text-primary">{selectedSeats.map(s => s.seat_number).join(', ')}</span>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <Input
                    placeholder="Enter Promo Code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="py-2.5 text-xs uppercase"
                  />
                  <Button type="submit" variant="secondary" className="text-xs shrink-0 py-2.5 px-4" isLoading={couponLoading}>
                    Apply
                  </Button>
                </form>

                {/* applied coupon discount display */}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs bg-green-50 text-green-700 p-2.5 rounded-xl border border-green-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <FiPercent />
                      <span>{appliedCoupon.coupon_code} Applied</span>
                    </span>
                    <span className="font-extrabold">-₹{discountAmount}</span>
                  </div>
                )}

                {/* Checkout pricing details */}
                <div className="space-y-2 border-t border-border pt-4 text-sm font-semibold">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tickets Charge</span>
                    <span className="text-text-primary">₹{ticketTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Convenience Charge (+₹30/seat)</span>
                    <span className="text-text-primary">₹{convenienceFee}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-base border-t border-border pt-3 mt-3">
                    <span className="font-bold text-text-primary">Grand Total</span>
                    <span className="text-2xl font-black text-primary">₹{grandTotal}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full py-4 text-base font-bold shadow-sm mt-4"
                  isLoading={checkoutLoading}
                  onClick={handleCheckout}
                >
                  Confirm & Reserve
                </Button>
              </div>
            ) : (
              <div className="text-center py-10 text-text-secondary space-y-4">
                <div className="w-16 h-16 bg-hover-bg rounded-full flex items-center justify-center mx-auto text-primary">
                  <FiMonitor size={24} />
                </div>
                <p className="text-sm">Please tap on the available seats on map to reserve your tickets.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;
