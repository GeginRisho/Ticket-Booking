import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiAward, FiTag, FiUsers, FiDollarSign } from 'react-icons/fi';
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

    setBookingLoading(true);
    try {
      const res = await createEventBooking({
        event_ticket_id: selectedTicket.id,
        quantity: parseInt(quantity, 10),
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : undefined
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

  return (
    <div className="bg-background min-h-screen text-text-primary text-left py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns (Event details, categories) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl overflow-hidden shadow-xs border border-border bg-white">
              <img 
                src={event.banner || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000'} 
                alt={event.title} 
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="p-8 space-y-6">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-xs">
                  {event.category?.category_name || 'Event'}
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">{event.title}</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-text-secondary">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-primary" />
                    <span>{event.start_date} at {event.start_time || '18:00'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-primary" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-6">
                  <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                    <FiAward className="text-primary" /> Event Description
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Ticket Packages selection & checkout) */}
          <div className="space-y-6">
            <Card className="space-y-6 shadow-sm border border-border">
              <h3 className="text-xl font-bold border-b border-border pb-4">Select Tickets</h3>
              
              {/* Ticket packages selection list */}
              <div className="space-y-3">
                {event.event_tickets?.map(ticket => (
                  <div 
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setAppliedCoupon(null);
                      setDiscountAmount(0);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedTicket?.id === ticket.id
                        ? 'border-primary bg-hover-bg'
                        : 'border-border/60 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-text-primary">{ticket.ticket_type}</h4>
                        <p className="text-[10px] text-text-secondary mt-1">Available Qty: {ticket.available_quantity - (ticket.sold || 0)}</p>
                      </div>
                      <span className="font-black text-base text-text-primary">₹{ticket.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket && (
                <div className="space-y-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-text-secondary">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => { setQuantity(q => Math.max(1, q - 1)); setAppliedCoupon(null); setDiscountAmount(0); }}
                        className="w-8 h-8 rounded-xl border border-border flex items-center justify-center font-bold text-lg bg-white"
                      >
                        -
                      </button>
                      <span className="text-base font-extrabold">{quantity}</span>
                      <button 
                        onClick={() => { setQuantity(q => q + 1); setAppliedCoupon(null); setDiscountAmount(0); }}
                        className="w-8 h-8 rounded-xl border border-border flex items-center justify-center font-bold text-lg bg-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Promo Input */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      placeholder="Promo Code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      className="py-2 text-xs uppercase"
                    />
                    <Button type="submit" variant="secondary" className="text-xs shrink-0 py-2 px-4" isLoading={couponLoading}>
                      Apply
                    </Button>
                  </form>

                  {/* Billing amounts */}
                  <div className="space-y-2 border-t border-border pt-4 text-xs font-semibold text-text-secondary">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{ticketTotal}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Discount</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm border-t border-border pt-3 mt-3 text-text-primary">
                      <span className="font-bold">Grand Total</span>
                      <span className="text-xl font-black text-primary">₹{grandTotal}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full py-3.5 font-bold"
                    isLoading={bookingLoading}
                    onClick={handleBook}
                  >
                    Book Event passes
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
