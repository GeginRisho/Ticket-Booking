import React, { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const mockRejectionTemplates = [
  'GST or Business License document expired or unreadable.',
  'PAN details do not match bank account holder name.',
  'Incomplete business address or missing jurisdiction details.',
  'Failed background verification check for cinema operations.',
  'Duplicate application detected for this trade name.'
];

const RejectionReasonModal = ({ isOpen, onClose, entityName, onConfirm }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please enter or select a rejection reason');
      return;
    }
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up text-left">
        <div className="p-6 border-b border-border bg-red-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-danger font-bold text-lg">
            <FiAlertTriangle size={22} />
            <h3>Reject Application for {entityName || 'Entity'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-secondary hover:bg-hover-bg rounded-xl">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-text-secondary">
            A formal rejection reason is mandatory. The applicant will receive an automated email notification containing this feedback.
          </p>

          {/* Preset templates */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Quick Rejection Reason Templates</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {mockRejectionTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(template)}
                  className="w-full text-left p-2 rounded-xl text-xs font-medium text-text-primary bg-hover-bg/40 hover:bg-primary/20 hover:border-primary border border-border transition-all cursor-pointer"
                >
                  • {template}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Custom Feedback & Reason *</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail the exact reason for rejection or missing document requirements..."
              className="w-full p-3 bg-white border border-border rounded-xl text-sm font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionReasonModal;
