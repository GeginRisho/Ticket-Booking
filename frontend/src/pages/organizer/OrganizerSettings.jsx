import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiLock, FiBell, FiMoon } from 'react-icons/fi';
import api from '../../services/api';

const OrganizerSettings = () => {
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      // Assuming a password change endpoint exists or we use settings endpoint
      const response = await api.put('/organizer/settings', { passwords });
      if (response.data?.success) {
        toast.success('Settings updated successfully');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900">Settings</h1>
        <p className="dark:text-gray-400 text-gray-600 mt-2">Manage your account security and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Password Section */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <FiLock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Change Password</h2>
              <p className="text-sm dark:text-gray-400 text-gray-500">Update your account password</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Current Password</label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <button 
                type="submit" 
                disabled={saving || !passwords.currentPassword || !passwords.newPassword}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><FiSave /> Update Password</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences Section - Read Only for UI */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <FiBell size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Notifications</h2>
              <p className="text-sm dark:text-gray-400 text-gray-500">Manage email and push notifications</p>
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer">
              <div>
                <p className="font-medium dark:text-white text-gray-900">Email Notifications</p>
                <p className="text-sm dark:text-gray-400 text-gray-500">Receive daily summaries and event updates</p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-primary cursor-pointer"></label>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrganizerSettings;
