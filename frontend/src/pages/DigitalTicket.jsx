import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiCalendar, FiMapPin, FiPrinter, FiArrowRight } from 'react-icons/fi';
import { getBookingDetails } from '../services/bookingService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const DigitalTicket = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const res = await getBookingDetails(id);
      setBooking(res.data?.booking || res.booking || res);
    } catch (err) {
      toast.error('Failed to load ticket info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handlePrint = () => {
    window.print();
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <EmptyState
          title="Ticket not found"
          description="We couldn't retrieve the tickets for this reference ID."
          actionLabel="Go Home"
          onActionClick={() => navigate('/')}
        />
      </div>
    );
  }

  const isMovie = !!booking.show_id;
  const title = isMovie ? booking.show?.movie?.title : booking.event_ticket?.event?.title;
  const date = isMovie ? booking.show?.show_date : booking.event_ticket?.event?.start_date;
  const time = isMovie ? booking.show?.start_time : booking.event_ticket?.event?.start_time;
  const venue = isMovie ? booking.show?.screen?.theatre?.theatre_name : booking.event_ticket?.event?.venue;
  const address = isMovie ? booking.show?.screen?.theatre?.address : booking.event_ticket?.event?.address;
  const screen = isMovie ? booking.show?.screen?.screen_name : 'General Entry';
  const seatsOrTickets = isMovie 
    ? `Seats: ${booking.booking_seats?.map(s => s.seat?.seat_number).join(', ')}`
    : `Qty: ${booking.event_ticket_quantity} Passes`;

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-2xl text-left py-12 bg-background text-text-primary print:bg-white print:p-0">
      <div className="space-y-6 print:space-y-0">
        
        {/* Success header (hide on print) */}
        <div className="text-center space-y-2 print:hidden">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <FiCheckCircle size={28} />
          </div>
          <h2 className="text-3xl font-black text-text-primary">Booking Confirmed!</h2>
          <p className="text-sm text-text-secondary">Your ticket passes are ready. Present the QR code at the entrance.</p>
        </div>

        {/* Printable Ticket Pass Layout */}
        <Card className="p-8 border border-border shadow-md rounded-[28px] relative overflow-hidden bg-white print:border-0 print:shadow-none print:p-0">
          {/* Decorative side ticket notches (CSS design) */}
          <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border border-border print:hidden" />
          <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border border-border print:hidden" />

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 pb-8 border-b border-dashed border-border">
            {/* Info details */}
            <div className="space-y-4 text-center md:text-left">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isMovie ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {isMovie ? 'Movie Admission' : 'Event Entry Pass'}
              </span>
              <h1 className="text-3xl font-black text-text-primary leading-tight mt-2">{title}</h1>
              
              <div className="space-y-2 text-sm font-semibold text-text-secondary">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FiCalendar className="text-primary" />
                  <span>{date} at {time}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FiMapPin className="text-primary" />
                  <span>{venue} ({screen})</span>
                </div>
              </div>
            </div>

            {/* QR Code SVG */}
            <div className="flex flex-col items-center bg-gray-50 border border-border rounded-2xl p-4 shrink-0 shadow-xs">
              <QRCodeSVG
                value={JSON.stringify({
                  booking_id: booking.id,
                  show_id: booking.show_id,
                  seats: isMovie ? booking.booking_seats?.map(s => s.seat_id) : undefined
                })}
                size={120}
              />
              <span className="text-[10px] font-bold tracking-widest text-text-secondary mt-2">SCAN ENTRY</span>
            </div>
          </div>

          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-semibold text-text-secondary">
            <div>
              <p className="uppercase text-xs tracking-wider font-bold">Booking Reference</p>
              <p className="font-extrabold text-text-primary mt-1 text-base truncate">{booking.id}</p>
            </div>
            <div>
              <p className="uppercase text-xs tracking-wider font-bold">Selected Passes/Seats</p>
              <p className="font-extrabold text-text-primary mt-1 text-base">{seatsOrTickets}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="uppercase text-xs tracking-wider font-bold">Venue Address</p>
              <p className="text-text-primary mt-1 font-medium leading-relaxed">{address}</p>
            </div>
          </div>

          {/* Pricing detail items */}
          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center text-sm font-bold">
            <span className="text-text-secondary">Billing Amount (Paid)</span>
            <span className="text-2xl font-black text-primary">₹{booking.total_amount}</span>
          </div>
        </Card>

        {/* Action Triggers (hide on print) */}
        <div className="flex gap-4 justify-center pt-2 print:hidden">
          <Button onClick={handlePrint} variant="secondary" className="flex items-center gap-2">
            <FiPrinter />
            <span>Print Pass</span>
          </Button>
          <Link to="/dashboard/customer">
            <Button variant="primary" className="flex items-center gap-1.5 font-bold">
              <span>Go to Dashboard</span>
              <FiArrowRight />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DigitalTicket;
