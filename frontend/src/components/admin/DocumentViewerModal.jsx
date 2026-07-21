import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiXCircle, FiFileText, FiImage, FiCreditCard, FiMapPin, FiClock, FiShield } from 'react-icons/fi';
import Button from '../ui/Button';

const DocumentViewerModal = ({ isOpen, onClose, application, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState('documents');

  if (!isOpen || !application) return null;

  const docs = [
    { title: 'GST Certificate', number: application.gst || '27AABCU9603R1ZN', status: 'VERIFIED', type: 'PDF Document', size: '1.4 MB' },
    { title: 'PAN Card', number: application.pan || 'AABCU9603R', status: 'VERIFIED', type: 'Image JPG', size: '840 KB' },
    { title: 'Business License', number: application.license || 'BL-2026-90482', status: 'PENDING', type: 'PDF Document', size: '2.1 MB' },
    { title: 'Identity Proof (Aadhaar/Passport)', number: '**** **** 8842', status: 'VERIFIED', type: 'PDF Document', size: '1.1 MB' },
  ];

  const bankDetails = {
    accountName: application.business_name || application.owner_name || 'Rex Cinemas Private Ltd',
    accountNumber: 'XXXX-XXXX-9904',
    bankName: 'HDFC Bank Ltd',
    ifscCode: 'HDFC0000240',
    branch: 'Bandra West, Mumbai'
  };

  const images = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80',
    'https://images.unsplash.com/photo-1586899028174-e7098604235b?w=800&q=80'
  ];

  const timelineHistory = [
    { title: 'Application Submitted', date: application.submitted_date || '2026-07-18', user: application.owner_name || 'Owner', note: 'Uploaded initial business credentials' },
    { title: 'Automated KYC Audit', date: '2026-07-19', user: 'System Bot', note: 'GST & PAN verified via NSDL API' },
    { title: 'Document Verification', date: '2026-07-20', user: 'Admin Reviewer', note: 'License & bank details checked' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-border rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-up text-left">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gray-50/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-extrabold text-text-primary">{application.business_name || application.owner_name}</h3>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full uppercase border border-amber-200">
                {application.status || 'Pending Verification'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Owner: <strong>{application.owner_name}</strong> • Email: {application.email} • Phone: {application.phone || '+91 9876543210'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-text-secondary hover:bg-hover-bg rounded-xl">
            <FiX size={22} />
          </button>
        </div>

        {/* Sub-tabs header */}
        <div className="flex border-b border-border px-6 bg-white gap-4 text-xs font-bold">
          {[
            { id: 'documents', label: 'KYC Documents', icon: FiFileText },
            { id: 'bank', label: 'Bank & Financials', icon: FiCreditCard },
            { id: 'images', label: 'Theatre Pictures', icon: FiImage },
            { id: 'address', label: 'Business Location', icon: FiMapPin },
            { id: 'history', label: 'Audit Timeline', icon: FiClock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3.5 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary text-text-primary font-black'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-6">
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docs.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-border bg-hover-bg/20 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <FiFileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-text-primary">{doc.title}</h4>
                        <p className="text-xs text-text-secondary font-mono mt-0.5">{doc.number}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-secondary pt-2 border-t border-border/60">
                    <span>{doc.type} ({doc.size})</span>
                    <button onClick={() => window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')} className="text-primary font-bold hover:underline">
                      Preview Document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <FiShield size={24} className="text-amber-400" />
                <div>
                  <h4 className="font-bold text-base text-amber-400">Verified Bank Settlement Details</h4>
                  <p className="text-xs text-slate-400">Direct payouts will be settled to this verified business account.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Account Holder</span>
                  <strong className="text-sm font-extrabold">{bankDetails.accountName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Account Number</span>
                  <strong className="text-sm font-mono">{bankDetails.accountNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Bank Name</span>
                  <strong className="text-sm font-extrabold">{bankDetails.bankName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">IFSC Code</span>
                  <strong className="text-sm font-mono text-amber-400">{bankDetails.ifscCode}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="group relative rounded-2xl overflow-hidden border border-border h-40">
                  <img src={img} alt="Theatre Venue" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    View Full Image
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'address' && (
            <div className="p-5 border border-border rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <FiMapPin size={18} />
                <span>Registered Business & Theatre Location</span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed font-semibold">
                {application.address || 'Plot 45, Commercial Hub, Linking Road, Bandra West, Mumbai, Maharashtra - 400050'}
              </p>
              <div className="text-xs text-text-secondary pt-2 border-t border-border">
                GST Jurisdiction: Mumbai West Region • State Code: 27
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 border-l-2 border-primary/30 pl-4">
              {timelineHistory.map((item, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white" />
                  <div className="flex items-center justify-between text-xs">
                    <strong className="font-bold text-text-primary text-sm">{item.title}</strong>
                    <span className="text-text-secondary font-mono">{item.date}</span>
                  </div>
                  <p className="text-xs text-text-secondary">By: {item.user}</p>
                  <p className="text-xs text-text-primary bg-hover-bg/50 p-2 rounded-lg mt-1 border border-border/50">{item.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 border-t border-border bg-gray-50 flex items-center justify-between">
          <Button variant="secondary" onClick={onClose}>
            Close Inspection
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="danger"
              className="flex items-center gap-1.5"
              onClick={() => {
                onClose();
                if (onReject) onReject(application);
              }}
            >
              <FiXCircle size={16} />
              <span>Reject Application</span>
            </Button>
            <Button
              variant="primary"
              className="flex items-center gap-1.5"
              onClick={() => {
                onClose();
                if (onApprove) onApprove(application);
              }}
            >
              <FiCheckCircle size={16} />
              <span>Approve & Create Account</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
