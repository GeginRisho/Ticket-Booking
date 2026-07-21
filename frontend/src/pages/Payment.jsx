import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiAlertTriangle, FiCreditCard } from 'react-icons/fi';
import { getBookingDetails } from '../services/bookingService';
import { createPaymentOrder, verifyPayment } from '../services/paymentService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

const Payment = () => {
  const { id } = useParams(); // Booking ID
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const res = await getBookingDetails(id);
      setBooking(res.data?.booking || res.booking || res);
    } catch (err) {
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      // 1. Create a Razorpay order from the backend payment service
      const orderRes = await createPaymentOrder(id);
      const order = orderRes.data?.payment || orderRes.payment || orderRes;
      
      // 2. Perform verification - in local sandbox/mock testing, the service automatically
      // uses signature verification mock overrides. We submit mock verification params to the verify endpoint.
      const verificationPayload = {
        booking_id: id,
        razorpay_order_id: order.id || 'order_mock_123',
        razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(7),
        razorpay_signature: 'mock_signature',
        payment_method: 'card'
      };

      await verifyPayment(verificationPayload);
      toast.success('Payment completed successfully!');
      navigate(`/ticket/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed. Try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <FiAlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-text-primary">Order not found</h2>
        <p className="text-sm text-text-secondary mt-1">Please go back and select tickets again.</p>
      </div>
    );
  }

  const isMovie = !!booking.show_id;
  const title = isMovie ? booking.show?.movie?.title : booking.event_ticket?.event?.title;
  const theatreName = isMovie ? booking.show?.screen?.theatre?.theatre_name : booking.event_ticket?.event?.venue;
  const screenName = isMovie ? booking.show?.screen?.screen_name : 'General Entry';
  const showDate = isMovie ? booking.show?.show_date : booking.event_ticket?.event?.start_date;
  const showTime = isMovie ? booking.show?.start_time : booking.event_ticket?.event?.start_time;
  const bookingSeats = booking.bookingSeats || booking.booking_seats || [];
  const quantity = isMovie ? (bookingSeats.length || 1) : (booking.event_ticket_quantity || 1);
  const seatNumbers = bookingSeats.map(s => s.seat?.seat_number || s.seat_number || s.seat_id).filter(Boolean).join(', ');
  const seatDetails = seatNumbers || (bookingSeats.length ? `${bookingSeats.length} Seats Selected` : 'Reserved Seats');

  const totalVal = parseFloat(booking.total_amount || 0);
  const convenienceFee = quantity * 30;
  const basePrice = Math.max(0, totalVal - convenienceFee);

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-lg text-left py-16 bg-background text-text-primary">
      <Card className="p-8 space-y-6 shadow-md border-t-4 border-t-primary">
        <div className="text-center space-y-2 pb-6 border-b border-border">
          <div className="w-12 h-12 bg-amber-50 text-primary rounded-full flex items-center justify-center mx-auto shadow-xs">
            <FiCreditCard size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary">Payment Checkout</h2>
          <p className="text-xs text-text-secondary">Complete your reservation purchase securely</p>
        </div>

        {/* Invoice details */}
        <div className="space-y-3.5 text-sm font-semibold">
          <div className="flex justify-between items-start">
            <span className="text-text-secondary">{isMovie ? 'Movie Title' : 'Event Title'}</span>
            <span className="text-text-primary text-right max-w-[200px] truncate font-bold">{title || 'Ticket Show'}</span>
          </div>

          {theatreName && (
            <div className="flex justify-between items-start">
              <span className="text-text-secondary">Theatre & Screen</span>
              <span className="text-text-primary text-right max-w-[220px] truncate">{theatreName} ({screenName})</span>
            </div>
          )}

          {showDate && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Date & Showtime</span>
              <span className="text-text-primary">{showDate} at {showTime}</span>
            </div>
          )}

          {isMovie && (
            <div className="flex justify-between items-start">
              <span className="text-text-secondary">Allocated Seats</span>
              <span className="text-amber-600 font-extrabold text-right max-w-[200px] truncate">{seatDetails}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-text-secondary">Ticket Quantity</span>
            <span className="text-text-primary">{quantity} ticket(s)</span>
          </div>

          <div className="border-t border-dashed border-border pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-text-secondary">
              <span>Ticket Base Subtotal</span>
              <span>₹{basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Convenience & GST Taxes</span>
              <span>₹{convenienceFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-base border-t border-border pt-4 mt-2">
            <span className="font-bold text-text-primary">Total Payable Amount</span>
            <span className="text-3xl font-black text-primary">₹{totalVal.toFixed(2)}</span>
          </div>
        </div>

        {/* Security badges */}
        <div className="bg-gray-50 border border-border/80 rounded-xl p-4 flex items-start gap-3">
          <FiShield className="text-green-600 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-xs font-bold text-text-primary">Secure Mock Sandbox Gateway</p>
            <p className="text-[10px] text-text-secondary mt-0.5">
              Testing mode active. Razorpay checkout completes instantly using test accounts.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full py-4 text-base font-bold flex items-center justify-center gap-2"
          isLoading={paying}
          onClick={handlePayment}
        >
          <span>Pay Securely ₹{booking.total_amount}</span>
        </Button>
      </Card>
    </div>
  );
};

export default Payment;
