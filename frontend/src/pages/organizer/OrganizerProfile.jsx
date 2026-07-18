import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiImage } from 'react-icons/fi';
import api from '../../services/api'; // Or your configured axios instance

const OrganizerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    organizer_name: '',
    organization_name: '',
    email: '',
    phone: '',
    address: '',
    profile_image: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/organizer/profile');
        if (response.data?.success && response.data?.data) {
          const profile = response.data.data;
          setFormData({
            organizer_name: profile.organizer_name || '',
            organization_name: profile.organization_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            profile_image: profile.profile_image || ''
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/organizer/profile', formData);
      if (response.data?.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900">Organizer Profile</h1>
        <p className="dark:text-gray-400 text-gray-600 mt-2">Manage your public organizer details and contact information.</p>
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-primary/20 shrink-0">
              {formData.profile_image ? (
                <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiUser size={32} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Profile Image URL</label>
              <div className="relative">
                <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  name="profile_image"
                  value={formData.profile_image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Organizer Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  name="organizer_name"
                  value={formData.organizer_name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Organization Name</label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  placeholder="Company or Group Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full business address"
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><FiSave /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerProfile;
