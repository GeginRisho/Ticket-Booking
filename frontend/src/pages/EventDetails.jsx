import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiAward, FiTag, FiUsers, FiDollarSign, FiInfo, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getEventDetails } from '../services/eventService';
import { createEventBooking } from '../services/bookingService';
import { validateCoupon } from '../services/couponService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await getEventDetails(id);
      const data = res.data?.event || res.event || res;
      setEvent(data);
      if (data.event_tickets && data.event_tickets.length > 0) {
        setSelectedTicket(data.event_tickets[0]);
      }
    } catch (err) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const toggleSeatSelection = (seatId, zoneName) => {
    const targetTicket = event.event_tickets?.find(
      t => t.ticket_type.toLowerCase() === zoneName.toLowerCase()
    );
    if (!targetTicket) {
      toast.error(`Pricing category for ${zoneName} not configured`);
      return;
    }

    if (selectedTicket && selectedTicket.id !== targetTicket.id && selectedSeats.length > 0) {
      toast.error(`Please select seats from the same zone: ${selectedTicket.ticket_type}`);
      return;
    }

    let nextSeats = [];
    if (selectedSeats.includes(seatId)) {
      nextSeats = selectedSeats.filter(s => s !== seatId);
    } else {
      const limit = targetTicket.booking_limit || 10;
      if (selectedSeats.length >= limit) {
        toast.error(`You can select a maximum of ${limit} tickets in a single order.`);
        return;
      }
      nextSeats = [...selectedSeats, seatId];
    }

    setSelectedSeats(nextSeats);
    setQuantity(nextSeats.length > 0 ? nextSeats.length : 1);
    setSelectedTicket(targetTicket);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim() || !selectedTicket) return;
    setCouponLoading(true);
    try {
      const totalAmount = parseFloat(selectedTicket.price) * quantity;
      const res = await validateCoupon(couponCode.toUpperCase(), totalAmount);
      const data = res.data || res;
      setAppliedCoupon(data);
      setDiscountAmount(data.discount_amount || 0);
      toast.success('Coupon applied successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon or criteria not met');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedTicket) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to buy event passes');
      return navigate('/login', { state: { from: { pathname: `/event/${id}` } } });
    }

    if (event.has_reserved_seating && selectedSeats.length === 0) {
      toast.error('Please select at least one seat from the venue map');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await createEventBooking({
        event_ticket_id: selectedTicket.id,
        quantity: parseInt(quantity, 10),
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : undefined,
        seat_ids: event.has_reserved_seating ? selectedSeats : undefined
      });
      const booking = res.data?.booking || res.booking || res;
      toast.success('Passes reserved successfully');
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete checkout');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <EmptyState title="Event not found" description="The requested event entry was not found." />
      </div>
    );
  }

  const basePrice = selectedTicket ? parseFloat(selectedTicket.price) : 0;
  const ticketTotal = basePrice * quantity;
  const grandTotal = Math.max(0, ticketTotal - discountAmount);

  // Parsing layouts
  const sections = event.seating_layout?.sections || [];
  const blockedSeats = event.seating_layout?.blockedSeats || [];
  const bookedSeats = event.booked_seats || [];

  return (
    <div className="bg-gray-50 min-h-screen text-text-primary text-left py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Columns (Event details, categories) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-200 bg-white">
              <img 
                src={event.banner || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1000'} 
                alt={event.title} 
                className="w-full h-48 sm:h-64 md:h-80 object-cover"
              />
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] uppercase tracking-wide">
                    {event.category?.category_name || 'Event'}
                  </span>
                  {event.has_reserved_seating && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-black text-[10px] uppercase tracking-wide">
                      Reserved Seating
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-gray-900">{event.title}</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-semibold text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-amber-500" />
                    <span>{new Date(event.start_date).toLocaleDateString()} at {event.time || '18:00'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-amber-500" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <FiAward className="text-amber-500" /> About the Event
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">{event.description}</p>
                </div>

                {/* Refund Rules Display */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <FiInfo className="text-amber-500" /> Cancellation Policy
                  </h3>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    {event.refund_policy_details?.non_refundable ?? false ? (
                      <p className="text-red-600 font-extrabold text-xs">⚠️ This event strictly enforces a non-refundable ticket purchase policy.</p>
                    ) : (
                      <div className="space-y-1 text-xs font-bold text-gray-600">
                        <p>• Cancellation window: Up to <span className="text-amber-600 font-black">{event.refund_policy_details?.cancellation_deadline ?? 24} hours</span> before showtime.</p>
                        <p>• Refund eligibility: <span className="text-green-600 font-black">{event.refund_policy_details?.refund_percentage ?? 100}% refund</span> will be processed.</p>
                        {(event.refund_policy_details?.automatic_refund ?? true) && <p>• Automatic refund: Eligible refunds are processed instantly.</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive seat visualizer for customers */}
            {event.has_reserved_seating && sections.length > 0 && (
              <div className="rounded-3xl p-6 sm:p-8 border border-gray-200 bg-white shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">Venue Seating Selection</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Select seats directly below. Max ticket limit applies.</p>
                  </div>
                  <span className="text-xs font-black text-amber-500">{selectedSeats.length} Selected</span>
                </div>

                {/* Seating color guides */}
                <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-amber-100 border border-amber-300 rounded" />
                    <span>VIP Zone (₹1499)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-blue-100 border border-blue-300 rounded" />
                    <span>Premium Zone (₹999)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-gray-100 border border-gray-300 rounded" />
                    <span>General Zone (₹499)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-gray-800 border border-gray-800 rounded text-white flex items-center justify-center font-extrabold">✕</span>
                    <span>Unavailable</span>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-3xl p-4 sm:p-6 bg-gray-50/50 space-y-6 max-h-[400px] overflow-auto">
                  {sections.map((section, sIdx) => {
                    const startCode = section.rowStart.charCodeAt(0) || 65;
                    const endCode = section.rowEnd.charCodeAt(0) || 66;
                    const rows = [];
                    for (let i = startCode; i <= endCode; i++) {
                      rows.push(String.fromCharCode(i));
                    }

                    return (
                      <div key={sIdx} className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">{section.name}</span>
                        <div className="space-y-1">
                          {rows.map(row => (
                            <div key={row} className="flex items-center gap-2">
                              <span className="w-5 text-[10px] font-black text-gray-400">{row}</span>
                              <div className="flex flex-wrap gap-1">
                                {Array.from({ length: section.seatsPerRow || 1 }).map((_, cIdx) => {
                                  const col = cIdx + 1;
                                  const seatId = `${section.name}-${row}-${col}`;
                                  const isBlocked = blockedSeats.includes(seatId);
                                  const isBooked = bookedSeats.includes(seatId);
                                  const isChosen = selectedSeats.includes(seatId);
                                  const isLocked = isBlocked || isBooked;

                                  return (
                                    <button
                                      type="button"
                                      key={col}
                                      disabled={isLocked}
                                      onClick={() => toggleSeatSelection(seatId, section.name)}
                                      className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all flex items-center justify-center cursor-pointer ${
                                        isLocked 
                                          ? 'bg-gray-800 text-gray-400 border-gray-800 cursor-not-allowed line-through' 
                                          : isChosen 
                                            ? 'bg-amber-400 text-gray-900 border-amber-500 font-extrabold shadow-sm' 
                                            : section.name === 'VIP Zone' 
                                              ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                                              : section.name === 'Premium Zone'
                                                ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                                                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Ticket selection & billing summary) */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3">Checkout Summary</h3>
              
              {/* If General Admission, display standard options selector */}
              {!event.has_reserved_seating && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Ticket Tier</label>
                  <div className="space-y-2">
                    {event.event_tickets?.map(ticket => (
                      <div 
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setAppliedCoupon(null);
                          setDiscountAmount(0);
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                          selectedTicket?.id === ticket.id
                            ? 'border-amber-400 bg-amber-50/20'
                            : 'border-gray-100 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start font-bold">
                          <div>
                            <h4 className="font-extrabold text-sm text-gray-800">{ticket.ticket_type}</h4>
                            <p className="text-[10px] text-gray-400 mt-1">Remaining: {ticket.available_quantity}</p>
                          </div>
                          <span className="font-black text-base text-gray-900">₹{ticket.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTicket && (
                <div className="space-y-6 pt-2">
                  {/* Quantity selector (Only for General Admission) */}
                  {!event.has_reserved_seating && (
                    <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wide">
                      <span className="text-gray-500">Number of tickets</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setQuantity(q => Math.max(1, q - 1)); setAppliedCoupon(null); setDiscountAmount(0); }}
                          className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center font-black text-base bg-white cursor-pointer hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-sm font-black text-gray-900">{quantity}</span>
                        <button 
                          onClick={() => { setQuantity(q => q + 1); setAppliedCoupon(null); setDiscountAmount(0); }}
                          className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center font-black text-base bg-white cursor-pointer hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reserved Seats List display */}
                  {event.has_reserved_seating && selectedSeats.length > 0 && (
                    <div className="p-3.5 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 text-left space-y-1">
                      <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Selected Zone & Seats</p>
                      <p className="text-gray-800 font-extrabold">{selectedTicket.ticket_type}</p>
                      <p className="text-amber-500 font-black tracking-wide text-xs">{selectedSeats.join(', ')}</p>
                    </div>
                  )}

                  {/* Promo Input */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      className="py-2 text-xs uppercase"
                    />
                    <Button type="submit" variant="secondary" className="text-xs shrink-0 py-2.5 px-4 font-bold border-gray-200" isLoading={couponLoading}>
                      Apply
                    </Button>
                  </form>

                  {/* Billing amounts */}
                  <div className="space-y-2.5 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-600">
                    <div className="flex justify-between">
                      <span>Pass Price (x {quantity})</span>
                      <span>₹{ticketTotal}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Applied Discount</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3 mt-3 text-gray-900">
                      <span className="font-extrabold uppercase tracking-wide text-xs">Total Amount</span>
                      <span className="text-xl font-black text-amber-500">₹{grandTotal}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full py-4 font-bold bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-2xl border-none shadow-xs text-xs uppercase tracking-wider"
                    isLoading={bookingLoading}
                    onClick={handleBook}
                  >
                    Confirm & Reserve Passes
                  </Button>
                </div>
              )}
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;
