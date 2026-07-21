import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMapPin, FiCreditCard, FiLock, FiTrash2, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { updateProfile, changePassword } from '../services/authService';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for Personal Details
  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || user?.mobile || '');
  const [dob, setDob] = useState('1995-08-15');
  const [gender, setGender] = useState('Male');

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Addresses Mock States
  const [addresses, setAddresses] = useState([
    { id: '1', label: 'HOME', name: 'John Doe', details: '123 Manhattan Ave, Apt 4B, New York, NY 10001', phone: '+1 234 567 8900' }
  ]);

  // Payment Mock States
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'VISA', number: '**** **** **** 4242', holder: 'John Doe', expiry: '12/28', isDefault: true }
  ]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateProfile({ full_name: fullName, phone });
      updateUser(res.data?.user || res.user || { ...user, full_name: fullName, phone });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: Are you absolutely sure you want to permanently delete your account? This action cannot be undone.')) {
      toast.success('Account deletion request submitted');
      handleLogout();
    }
  };

  const handleAddAddress = () => {
    const newAddr = {
      id: Date.now().toString(),
      label: 'WORK',
      name: fullName,
      details: '456 Business Blvd, Suite 100, New York, NY 10010',
      phone: phone || '+1 234 567 8900'
    };
    setAddresses([...addresses, newAddr]);
    toast.success('Mock address added!');
  };

  const handleAddCard = () => {
    const newCard = {
      id: Date.now().toString(),
      type: 'MASTERCARD',
      number: '**** **** **** 9876',
      holder: fullName,
      expiry: '09/30',
      isDefault: false
    };
    setPaymentMethods([...paymentMethods, newCard]);
    toast.success('Mock payment card added!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Manage your personal details, saved cards, billing addresses, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Avatar & Quick Actions */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 text-center border border-gray-200 rounded-3xl bg-white shadow-sm flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 bg-gray-50 flex items-center justify-center">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName || 'User'}`}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-black text-lg text-gray-900 leading-tight">{fullName || 'User Profile'}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">MEMBER</p>
          </Card>

          <Card className="p-6 border border-gray-200 rounded-3xl bg-white shadow-sm">
            <h3 className="font-black text-base text-gray-900 mb-4 flex items-center gap-2 text-red-600">
              <FiTrash2 /> Danger Zone
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl text-sm transition-all focus:outline-none cursor-pointer shadow-sm"
            >
              Delete Account
            </button>
          </Card>
        </div>

        {/* Right Column: Edit Profile & Password Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Personal Details */}
          <Card className="p-6 md:p-8 border border-gray-200 rounded-3xl bg-white shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
              <FiUser className="text-amber-500" /> Personal Details
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div className="flex flex-col mb-4">
                <label className="text-xs font-extrabold text-gray-500 uppercase mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white text-sm font-semibold transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-black rounded-2xl shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Save Profile Changes'}
              </Button>
            </form>
          </Card>

          {/* Saved Addresses */}
          <Card className="p-6 md:p-8 border border-gray-200 rounded-3xl bg-white shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
              <FiMapPin className="text-amber-500" /> Saved Addresses
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 relative">
                  <span className="absolute top-4 right-4 text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {addr.label}
                  </span>
                  <h4 className="font-black text-sm text-gray-800 mb-1">{addr.name}</h4>
                  <p className="text-xs text-gray-600 font-semibold mb-1">{addr.details}</p>
                  <p className="text-xs text-gray-400 font-semibold">Phone: {addr.phone}</p>
                </div>
              ))}
              <button
                onClick={handleAddAddress}
                className="border border-dashed border-gray-300 rounded-2xl p-4 flex items-center justify-center gap-2 text-xs font-extrabold text-gray-500 hover:text-amber-500 hover:border-amber-500 hover:bg-amber-50/10 transition-all cursor-pointer focus:outline-none"
              >
                <FiMapPin />
                <span>Add Mock Address</span>
              </button>
            </div>
          </Card>

          {/* Saved Payment Methods */}
          <Card className="p-6 md:p-8 border border-gray-200 rounded-3xl bg-white shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
              <FiCreditCard className="text-amber-500" /> Saved Payment Methods
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 relative flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-black text-gray-400 tracking-wider">
                      {method.type}
                    </span>
                    <h4 className="font-black text-sm text-gray-800 tracking-widest mt-1">{method.number}</h4>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      {method.holder} | Expires {method.expiry}
                    </p>
                  </div>
                  {method.isDefault && (
                    <span className="text-[9px] font-black bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddCard}
                className="border border-dashed border-gray-300 rounded-2xl p-4 flex items-center justify-center gap-2 text-xs font-extrabold text-gray-500 hover:text-amber-500 hover:border-amber-500 hover:bg-amber-50/10 transition-all cursor-pointer focus:outline-none"
              >
                <FiCreditCard />
                <span>Add Mock Payment Method</span>
              </button>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="p-6 md:p-8 border border-gray-200 rounded-3xl bg-white shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
              <FiLock className="text-amber-500" /> Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                className="w-full py-3 border border-gray-300 hover:bg-gray-50 text-gray-800 font-black rounded-2xl shadow-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Account Password'}
              </Button>
            </form>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default UserProfile;
