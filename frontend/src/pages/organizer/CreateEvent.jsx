import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiUploadCloud, FiImage, FiMapPin, FiClock, FiDollarSign, FiTag } from 'react-icons/fi';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    banner: '',
    date: '',
    time: '',
    endTime: '',
    venue: '',
    address: '',
    city: '',
    state: '',
    country: '',
    price: '',
    totalTickets: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (status) => {
    if (!formData.title || !formData.date || !formData.time || !formData.venue) {
      return toast.error("Please fill in all required fields (Title, Date, Time, Venue)");
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, status };
      await api.post('/events', payload);
      toast.success(status === 'PUBLISHED' ? 'Event published successfully!' : 'Event saved as draft.');
      navigate('/organizer/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">Create New Event</h1>
        <p className="text-gray-500 dark:text-gray-400">Fill in the details below to publish your event to the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4 flex items-center gap-2">
              <FiTag className="text-primary" /> Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Event Title *</label>
                <GlassInput name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Summer Music Festival 2026" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Event Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white">
                  <option value="">Select a Category</option>
                  <option value="1">Music Concert</option>
                  <option value="2">Standup Comedy</option>
                  <option value="3">Tech Conference</option>
                  <option value="4">Art & Theatre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows="4"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white resize-none"
                  placeholder="Describe your event..."
                />
              </div>
            </div>
          </GlassCard>

          {/* Date & Time */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="text-primary" /> Date & Time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Event Date *</label>
                <GlassInput type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Start Time *</label>
                <GlassInput type="time" name="time" value={formData.time} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">End Time</label>
                <GlassInput type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
              </div>
            </div>
          </GlassCard>

          {/* Location / Venue */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="text-primary" /> Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Venue Name *</label>
                <GlassInput name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Madison Square Garden" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Address</label>
                <GlassInput name="address" value={formData.address} onChange={handleChange} placeholder="Street Address" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">City</label>
                  <GlassInput name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">State</label>
                  <GlassInput name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Country</label>
                  <GlassInput name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
                </div>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Column - Sidebar Config */}
        <div className="space-y-6">
          
          {/* Media */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4 flex items-center gap-2">
              <FiImage className="text-primary" /> Media
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Banner Image URL</label>
                <GlassInput name="banner" value={formData.banner} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-gray-500 mt-2">Provide a high-quality image URL for the event banner.</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                  <FiUploadCloud size={24} />
                </div>
                <p className="text-sm font-medium dark:text-gray-300 text-gray-700">Click to upload images</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </GlassCard>

          {/* Tickets */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-primary" /> Tickets
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Ticket Price ($)</label>
                <GlassInput type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Total Capacity</label>
                <GlassInput type="number" name="totalTickets" value={formData.totalTickets} onChange={handleChange} placeholder="e.g. 500" min="1" />
              </div>
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <GlassButton 
              onClick={() => handleSubmit('PUBLISHED')} 
              variant="primary" 
              className="w-full py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Publish Event'}
            </GlassButton>
            <GlassButton 
              onClick={() => handleSubmit('DRAFT')} 
              className="w-full py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              <FiSave className="inline mr-2" /> Save as Draft
            </GlassButton>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
