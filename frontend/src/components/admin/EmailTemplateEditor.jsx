import React, { useState } from 'react';
import { FiMail, FiEye, FiEdit2, FiSave, FiCode } from 'react-icons/fi';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const mockTemplates = [
  {
    id: 't_welcome',
    name: 'Welcome Email',
    subject: 'Welcome to TicketShow, {{customer_name}}!',
    body: `<div style="font-family: sans-serif; padding: 20px; background: #f9fafb;">
  <h2 style="color: #FFC107;">Welcome to TicketShow!</h2>
  <p>Hi {{customer_name}},</p>
  <p>Thank you for joining TicketShow. Discover upcoming blockbuster movies, live concerts, and exclusive theatre offers in your city.</p>
  <a href="https://ticketshow.com/movies" style="background: #FFC107; color: #111; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Explore Movies</a>
</div>`
  },
  {
    id: 't_booking',
    name: 'Booking Confirmation Email',
    subject: 'Booking Confirmed - {{movie_title}} (Ticket #{{booking_id}})',
    body: `<div style="font-family: sans-serif; padding: 20px; background: #fff; border: 1px solid #eee;">
  <h2 style="color: #10B981;">Your Booking is Confirmed! 🎉</h2>
  <p>Movie: <strong>{{movie_title}}</strong></p>
  <p>Theatre: <strong>{{theatre_name}}</strong></p>
  <p>Showtime: {{show_time}} | Seats: {{seat_numbers}}</p>
  <p>Total Paid: ₹{{total_amount}}</p>
  <p>Scan your attached QR code at the entrance turnstile.</p>
</div>`
  },
  {
    id: 't_refund',
    name: 'Refund Completed Email',
    subject: 'Refund Issued for Booking #{{booking_id}}',
    body: `<div style="font-family: sans-serif; padding: 20px; background: #fff;">
  <h2 style="color: #EF4444;">Refund Initiated</h2>
  <p>Dear {{customer_name}},</p>
  <p>Your refund of <strong>₹{{refund_amount}}</strong> for Booking #{{booking_id}} has been processed back to your original payment method.</p>
  <p>Reference: {{refund_transaction_id}}</p>
</div>`
  },
  {
    id: 't_approval',
    name: 'Theatre Owner Approval Email',
    subject: 'Congratulations! Your Theatre Owner Account is Active',
    body: `<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #fff;">
  <h2 style="color: #FBBF24;">Application Approved!</h2>
  <p>Dear {{owner_name}},</p>
  <p>Your application for <strong>{{business_name}}</strong> has been verified and approved by Super Admin.</p>
  <p>You can now log in to your Theatre Partner Dashboard to set up screens, shows, and pricing.</p>
</div>`
  }
];

const EmailTemplateEditor = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0]);
  const [subject, setSubject] = useState(mockTemplates[0].subject);
  const [body, setBody] = useState(mockTemplates[0].body);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSave = () => {
    toast.success(`Template "${selectedTemplate.name}" saved successfully!`);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <FiMail size={22} className="text-primary" />
            <span>System Email Templates Manager</span>
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Custom HTML transactional email templates with live dynamic variables preview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-1.5"
          >
            {previewMode ? <FiCode size={16} /> : <FiEye size={16} />}
            <span>{previewMode ? 'Edit Code' : 'Live Preview'}</span>
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-1.5">
            <FiSave size={16} />
            <span>Save Template</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Templates Sidebar List */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-text-secondary uppercase">Select Template</label>
          <div className="space-y-1 bg-white border border-border rounded-2xl p-2 shadow-sm">
            {mockTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                  selectedTemplate.id === t.id
                    ? 'bg-primary text-text-primary font-black shadow-xs'
                    : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
                }`}
              >
                <FiMail size={16} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 space-y-1">
            <strong className="block font-extrabold">Available Template Variables:</strong>
            <p className="font-mono text-[10px] text-amber-800">
              &#123;&#123;customer_name&#125;&#125;, &#123;&#123;booking_id&#125;&#125;, &#123;&#123;movie_title&#125;&#125;, &#123;&#123;theatre_name&#125;&#125;, &#123;&#123;total_amount&#125;&#125;, &#123;&#123;owner_name&#125;&#125;
            </p>
          </div>
        </div>

        {/* Editor & Preview Area */}
        <div className="lg:col-span-3 space-y-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 bg-hover-bg/20 border border-border rounded-xl text-sm font-bold text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {!previewMode ? (
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">HTML Email Template Source Code</label>
              <textarea
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-4 font-mono text-xs bg-slate-900 text-amber-400 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Rendered Email Live Preview</label>
              <div className="p-6 border border-border rounded-2xl bg-gray-50 min-h-[300px]">
                <div
                  dangerouslySetInnerHTML={{
                    __html: body
                      .replace(/{{customer_name}}/g, 'Aarav Patel')
                      .replace(/{{booking_id}}/g, 'BK-90482')
                      .replace(/{{movie_title}}/g, 'Avatar: Fire and Ash')
                      .replace(/{{theatre_name}}/g, 'PVR Phoenix IMAX')
                      .replace(/{{show_time}}/g, '7:30 PM Today')
                      .replace(/{{seat_numbers}}/g, 'E12, E13')
                      .replace(/{{total_amount}}/g, '1,250')
                      .replace(/{{owner_name}}/g, 'Rajesh Sharma')
                      .replace(/{{business_name}}/g, 'Rex Cinemas Ltd')
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
