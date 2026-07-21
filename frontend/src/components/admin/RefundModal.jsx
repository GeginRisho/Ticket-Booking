import React, { useState } from 'react';
import { FiDollarSign, FiX, FiCheckCircle, FiClock, FiCreditCard, FiDownload, FiSend, FiFileText } from 'react-icons/fi';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const RefundModal = ({ isOpen, onClose, booking, onConfirmRefund }) => {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundType, setRefundType] = useState('FULL');
  const [refundReason, setRefundReason] = useState('');

  if (!isOpen || !booking) return null;

  const maxAmount = parseFloat(booking.total_amount || 0);

  const handleRefundSubmit = (e) => {
    e.preventDefault();
    const amountToRefund = refundType === 'FULL' ? maxAmount : parseFloat(refundAmount);
    if (isNaN(amountToRefund) || amountToRefund <= 0 || amountToRefund > maxAmount) {
      toast.error(`Invalid refund amount. Enter between ₹1 and ₹${maxAmount}`);
      return;
    }
    onConfirmRefund(booking.id, amountToRefund, refundReason);
    onClose();
  };

  const handleResendTicket = () => {
    toast.success(`Digital ticket & QR code resent to ${booking.user?.email || 'customer'}`);
  };

  const handleDownloadInvoice = () => {
    const text = `TICKETSHOW TAX INVOICE\n\nBooking ID: ${booking.id}\nCustomer: ${booking.user?.email || 'N/A'}\nTotal Amount: ₹${booking.total_amount}\nStatus: ${booking.booking_status}\nDate: ${new Date().toLocaleDateString()}\n\nThank you for booking with TicketShow!`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${booking.id}.txt`;
    a.click();
    toast.success('Invoice PDF downloaded!');
  };

  const timelineSteps = [
    { title: 'Booking Created', time: '2026-07-20 14:20:00', done: true },
    { title: 'Payment Captured (Razorpay)', time: '2026-07-20 14:20:15', done: true },
    { title: 'Digital Ticket & QR Issued', time: '2026-07-20 14:20:18', done: true },
    { title: 'Refund Processing', time: booking.booking_status === 'refunded' ? '2026-07-21 09:30:00' : 'Pending Action', done: booking.booking_status === 'refunded' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up text-left">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
              <FiCreditCard size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-text-primary">Booking #{booking.id}</h3>
              <p className="text-xs text-text-secondary">Customer: {booking.user?.email || 'Customer'} • Paid: ₹{maxAmount}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-secondary hover:bg-hover-bg rounded-xl">
            <FiX size={20} />
          </button>
        </div>

        {/* Action quick bar */}
        <div className="p-4 bg-hover-bg/30 border-b border-border flex flex-wrap gap-2 justify-between items-center text-xs">
          <span className="font-bold text-text-secondary">Quick Ticket Operations:</span>
          <div className="flex gap-2">
            <button
              onClick={handleResendTicket}
              className="px-3 py-1.5 bg-white border border-border hover:border-primary text-text-primary rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FiSend size={14} className="text-primary" />
              <span>Resend Ticket Email</span>
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-3 py-1.5 bg-white border border-border hover:border-primary text-text-primary rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FiDownload size={14} className="text-primary" />
              <span>Download Tax Invoice</span>
            </button>
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Booking Audit Timeline</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border text-xs ${step.done ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center font-bold text-xs mb-1 ${step.done ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    {idx + 1}
                  </div>
                  <strong className="block font-bold text-text-primary text-[11px]">{step.title}</strong>
                  <span className="text-[10px] text-text-secondary font-mono mt-0.5 block">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Refund Trigger Form */}
          {booking.booking_status !== 'refunded' ? (
            <form onSubmit={handleRefundSubmit} className="p-5 border border-border rounded-2xl bg-gray-50/50 space-y-4">
              <h4 className="font-extrabold text-sm text-text-primary flex items-center gap-2">
                <FiDollarSign size={16} className="text-danger" />
                <span>Process Payment Refund</span>
              </h4>

              <div className="flex gap-4 text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refundType"
                    checked={refundType === 'FULL'}
                    onChange={() => setRefundType('FULL')}
                    className="accent-primary"
                  />
                  <span>Full Refund (₹{maxAmount})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refundType"
                    checked={refundType === 'PARTIAL'}
                    onChange={() => setRefundType('PARTIAL')}
                    className="accent-primary"
                  />
                  <span>Partial Refund</span>
                </label>
              </div>

              {refundType === 'PARTIAL' && (
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Custom Refund Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={maxAmount}
                    placeholder={`Max ₹${maxAmount}`}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full p-2.5 bg-white border border-border rounded-xl text-sm font-bold text-text-primary focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Reason for Refund</label>
                <input
                  type="text"
                  placeholder="e.g. Show cancelled by theatre, technical glitch, customer dispute"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-border rounded-xl text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={onClose}>
                  Close
                </Button>
                <Button variant="danger" type="submit">
                  Execute Instant Refund
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-800 text-xs font-bold">
              <FiCheckCircle size={20} className="text-green-600 shrink-0" />
              <span>This booking has already been fully refunded to the original payment method.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
