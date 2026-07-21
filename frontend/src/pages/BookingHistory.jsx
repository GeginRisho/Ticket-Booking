import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiRefreshCw, FiPercent, FiDownload, FiSearch, FiFileText, FiCalendar } from 'react-icons/fi';
import { getMyBookings } from '../services/bookingService';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const BookingHistory = () => {
  const [activeTab, setActiveTab] = useState('payments'); // payments, refunds, coupons, invoices
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Failed to load your history logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDownloadInvoice = (b) => {
    const isMovie = !!b.show_id;
    const title = isMovie ? b.show?.movie?.title : b.event_ticket?.event?.title;
    
    const invoiceContent = {
      invoice_number: `INV-${b.booking_number.slice(3)}`,
      booking_number: b.booking_number,
      booking_date: b.booking_date,
      item: title,
      type: isMovie ? 'Movie Showtime' : 'Special Event',
      base_amount: b.total_amount + (b.discount || 0),
      discount: b.discount || 0,
      total_paid: b.total_amount,
      status: b.booking_status === 'confirmed' ? 'PAID' : (b.booking_status === 'cancelled' ? 'REFUNDED' : 'PENDING'),
      payment_gateway: 'Razorpay Mock Integration'
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoiceContent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Invoice_${b.booking_number}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Invoice ${invoiceContent.invoice_number} downloaded!`);
  };

  // Filter Logic based on tabs
  const getFilteredHistory = () => {
    const filtered = bookings.filter(b => {
      const status = b.booking_status?.toLowerCase();
      const hasDiscount = parseFloat(b.discount || 0) > 0;

      if (activeTab === 'payments') {
        return status === 'confirmed';
      } else if (activeTab === 'refunds') {
        return status === 'cancelled';
      } else if (activeTab === 'coupons') {
        return hasDiscount;
      } else if (activeTab === 'invoices') {
        // Show all completed or cancelled transactions that can have invoices
        return status === 'confirmed' || status === 'cancelled';
      }
      return false;
    });

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

  const list = getFilteredHistory();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial & Activity History</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Monitor your payments, track refunded tickets, view active coupon code usage, and download invoices.
        </p>
      </div>

      {/* Tabs / Filter Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 gap-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'payments', label: 'Payment History', icon: FiDollarSign },
            { id: 'refunds', label: 'Refund History', icon: FiRefreshCw },
            { id: 'coupons', label: 'Coupon Usage', icon: FiPercent },
            { id: 'invoices', label: 'Download Invoices', icon: FiDownload }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-500'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-3 sm:mb-0 max-w-xs w-full">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold px-4 py-2 pl-9 rounded-full border border-gray-200 text-gray-800 focus:outline-none focus:border-amber-400"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
        </div>
      </div>

      {/* List Output */}
      {loading ? (
        <Loader type="card" count={3} />
      ) : list.length > 0 ? (
        <div className="space-y-4">
          {list.map((b) => {
            const isMovie = !!b.show_id;
            const title = isMovie ? b.show?.movie?.title : b.event_ticket?.event?.title;
            const date = new Date(b.booking_date).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric'
            });

            return (
              <Card key={b.id} className="p-5 border border-gray-200 rounded-3xl bg-white shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">{b.booking_number}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500 font-semibold">{date}</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">{title}</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Allocation: {isMovie ? 'Movie Showtimes' : 'Special Event'}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                  {/* Tab specific pricing fields */}
                  {activeTab === 'payments' && (
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Amount Paid</p>
                      <p className="text-lg font-black text-green-600 mt-0.5">₹{b.total_amount}</p>
                    </div>
                  )}

                  {activeTab === 'refunds' && (
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Refund Issued</p>
                      <p className="text-lg font-black text-amber-500 mt-0.5">₹{b.total_amount}</p>
                      <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mt-1 inline-block uppercase">
                        Returned to source
                      </span>
                    </div>
                  )}

                  {activeTab === 'coupons' && (
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Discount Saved</p>
                      <p className="text-lg font-black text-purple-600 mt-0.5">₹{b.discount}</p>
                      <span className="text-[9px] font-mono font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg mt-1 inline-block tracking-widest">
                        PROMO
                      </span>
                    </div>
                  )}

                  {activeTab === 'invoices' && (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Invoice Sum</p>
                        <p className="text-base font-black text-gray-800 mt-0.5">₹{b.total_amount}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadInvoice(b)}
                        className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-2xl transition-colors border border-amber-100 cursor-pointer focus:outline-none flex items-center gap-1.5 font-bold text-xs"
                      >
                        <FiFileText size={16} />
                        <span>PDF Invoice</span>
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={`No log items found`}
          description={
            searchQuery 
              ? "Try adjusting your search filters to find specific transactions."
              : `Your ${activeTab} log history list is empty.`
          }
        />
      )}

    </div>
  );
};

export default BookingHistory;
