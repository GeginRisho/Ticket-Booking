import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Your message was delivered successfully! Our support desk will reach out soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-screen text-left text-gray-900 bg-background">
      <div className="max-w-5xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Contact <span className="text-amber-500">TicketShow</span> Support
          </h1>
          <p className="text-gray-600 font-semibold">
            Have questions about ticket cancellations, payment refunds, or listing a show? Get in touch with us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-extrabold text-xl mb-4 text-gray-800">Support Desk</h3>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                  <FiPhone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-500">Phone Hotline</h4>
                  <p className="font-black text-gray-900 text-sm mt-0.5">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                  <FiMail size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-500">Email Address</h4>
                  <p className="font-black text-gray-900 text-sm mt-0.5">support@ticketshow.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-500">Corporate HQ</h4>
                  <p className="font-bold text-gray-900 text-sm mt-0.5 leading-relaxed">
                    123 Ticketing Hub, Maker Chambers,<br />Nariman Point, Mumbai,<br />Maharashtra 400021
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl p-6 shadow-md text-gray-900 space-y-2">
              <h4 className="font-black text-lg">Partner Inquiries</h4>
              <p className="text-xs font-semibold leading-relaxed">
                Are you a screen developer or event group coordinator? Create a Partner account today from the login portal to list listings immediately.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <h3 className="font-extrabold text-2xl mb-6 text-gray-800 flex items-center gap-2">
              <FiMessageSquare className="text-amber-500" /> Send a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-gray-500 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-amber-400 focus:bg-white text-sm font-semibold text-gray-800 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-gray-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-amber-400 focus:bg-white text-sm font-semibold text-gray-800 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-500 uppercase">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-amber-400 focus:bg-white text-sm font-semibold text-gray-800 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-500 uppercase">Message Body</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-amber-400 focus:bg-white text-sm font-semibold text-gray-800 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {submitting ? 'Delivering...' : (
                  <>
                    <FiSend />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
