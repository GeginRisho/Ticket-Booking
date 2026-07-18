import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { useAuth } from'../context/AuthContext';
import GlassCard from'../components/ui/GlassCard';
import GlassButton from'../components/ui/GlassButton';
import GlassInput from'../components/ui/GlassInput';
import { FiUser, FiSettings, FiSliders, FiMapPin, FiCreditCard, FiShield, FiCamera, FiLock, FiSmartphone, FiMonitor, FiMoon, FiSun, FiDownload, FiTrash2 } from'react-icons/fi';
import { updateProfile, changePassword } from'../services/authService';
import { useTheme } from'../context/ThemeContext';
import { toast } from'react-hot-toast';

const TABS = [
 { id:'personal', label:'Personal Info', icon: FiUser },
 { id:'account', label:'Account Settings', icon: FiSettings },
 { id:'preferences', label:'Preferences', icon: FiSliders },
 { id:'addresses', label:'Addresses', icon: FiMapPin },
 { id:'payment', label:'Payment Methods', icon: FiCreditCard },
 { id:'privacy', label:'Privacy', icon: FiShield },
];

const UserProfile = () => {
 const { user, updateUser } = useAuth();
 const { theme, toggleTheme } = useTheme();
 const [activeTab, setActiveTab] = useState('personal');
 const darkMode = theme ==='dark';
 const [isSaving, setIsSaving] = useState(false);

 // Form States
 const [formData, setFormData] = useState({
 fullName: user?.fullName ||'',
 email: user?.email ||'',
 mobile: user?.mobile ||'',
 dob:'1995-08-15',
 gender:'Male',
 city:'New York',
 state:'NY',
 country:'USA'
 });

 const [passwordData, setPasswordData] = useState({
 currentPassword:'',
 newPassword:'',
 confirmNewPassword:''
 });

 const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
 const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

 const handleSaveProfile = async () => {
 setIsSaving(true);
 try {
 const data = await updateProfile({
 fullName: formData.fullName,
 mobile: formData.mobile
 });
 updateUser(data.user);
 toast.success('Profile updated successfully');
 } catch (error) {
 toast.error(error.response?.data?.message ||'Failed to update profile');
 } finally {
 setIsSaving(false);
 }
 };

 const handleUpdatePassword = async () => {
 if (passwordData.newPassword !== passwordData.confirmNewPassword) {
 return toast.error('New passwords do not match');
 }
 
 setIsSaving(true);
 try {
 await changePassword({
 currentPassword: passwordData.currentPassword,
 newPassword: passwordData.newPassword
 });
 toast.success('Password updated successfully');
 setPasswordData({ currentPassword:'', newPassword:'', confirmNewPassword:'' });
 } catch (error) {
 toast.error(error.response?.data?.message ||'Failed to update password');
 } finally {
 setIsSaving(false);
 }
 };

 return (
 <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 container mx-auto flex flex-col md:flex-row gap-8">
 
 {/* Sidebar Navigation */}
 <div className="w-full md:w-64 flex-shrink-0">
 <GlassCard className="p-4 sticky top-28">
 <div className="flex flex-col gap-2">
 {TABS.map(tab => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${isActive ? 'bg-primary text-primary-text shadow-lg shadow-primary/20' : 'dark:text-gray-400 text-gray-500 hover:dark:bg-gray-900 bg-gray-50 hover:dark:text-white text-gray-900'}`}
 >
 <Icon size={18} />
 {tab.label}
 </button>
 );
 })}
 </div>
 </GlassCard>
 </div>

 {/* Main Content Area */}
 <div className="flex-1 min-w-0">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 >
 {/* TAB 1: Personal Information */}
 {activeTab ==='personal' && (
 <GlassCard className="p-6 md:p-8">
 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
 <FiUser className="text-primary" /> Personal Information
 </h2>
 
 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
 <div className="relative group cursor-pointer">
 <div className="w-32 h-32 rounded-full overflow-hidden border-4 dark:border-gray-700 border-gray-300 group-hover:border-primary transition-colors">
 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName ||'User'}`} alt="Profile" className="w-full h-full object-cover dark:bg-gray-800 bg-white" />
 </div>
 <div className="absolute inset-0 dark:bg-gray-900 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 <FiCamera size={24} className="dark:text-white text-gray-900" />
 </div>
 </div>
 <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
 <GlassInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
 <GlassInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} disabled />
 <GlassInput label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleInputChange} />
 <GlassInput label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
 <div className="flex flex-col">
 <label className="text-sm font-medium dark:text-gray-300 text-gray-600 mb-2">Gender</label>
 <select name="gender" value={formData.gender} onChange={handleInputChange} className="dark:bg-gray-900 bg-gray-50 border dark:border-gray-700 border-gray-300 rounded-xl px-4 py-3 dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors appearance-none">
 <option className="dark:bg-gray-900 bg-gray-50">Male</option>
 <option className="dark:bg-gray-900 bg-gray-50">Female</option>
 <option className="dark:bg-gray-900 bg-gray-50">Other</option>
 </select>
 </div>
 <GlassInput label="City" name="city" value={formData.city} onChange={handleInputChange} />
 <GlassInput label="Country" name="country" value={formData.country} onChange={handleInputChange} />
 </div>
 
 <div className="flex justify-end gap-4">
 <GlassButton className="px-6">Cancel</GlassButton>
 <GlassButton variant="primary" className="px-6 text-black" onClick={handleSaveProfile} disabled={isSaving}>
 {isSaving ?'Saving...' :'Save Changes'}
 </GlassButton>
 </div>
 </GlassCard>
 )}

 {/* TAB 2: Account Settings */}
 {activeTab ==='account' && (
 <div className="space-y-6">
 <GlassCard className="p-6 md:p-8">
 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
 <FiLock className="text-primary" /> Change Password
 </h2>
 <div className="grid grid-cols-1 gap-4 max-w-md mb-6">
 <GlassInput type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Current Password" />
 <GlassInput type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="New Password" />
 <GlassInput type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} placeholder="Confirm New Password" />
 </div>
 <GlassButton variant="primary" className="text-black" onClick={handleUpdatePassword} disabled={isSaving}>
 {isSaving ?'Updating...' :'Update Password'}
 </GlassButton>
 </GlassCard>

 <GlassCard className="p-6 md:p-8">
 <h2 className="text-xl font-bold mb-6">Security & Sessions</h2>
 
 <div className="flex items-center justify-between p-4 border dark:border-gray-700 border-gray-300 rounded-xl mb-4 dark:bg-gray-900 bg-gray-50">
 <div>
 <h4 className="font-bold flex items-center gap-2"><FiSmartphone className="text-primary"/> Two-Step Verification</h4>
 <p className="text-sm dark:text-gray-400 text-gray-500">Add an extra layer of security to your account.</p>
 </div>
 <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider">Disabled</span>
 </div>

 <h4 className="font-bold mt-8 mb-4">Active Sessions</h4>
 <div className="flex items-center justify-between p-4 border border-yellow-300 dark:border-yellow-700 rounded-xl mb-2 bg-yellow-50 dark:bg-yellow-900/20">
 <div className="flex items-center gap-4">
 <div className="p-2 bg-yellow-200 dark:bg-yellow-900/40 text-primary rounded-lg"><FiMonitor size={20}/></div>
 <div>
 <h4 className="font-bold text-sm">Mac OS • Chrome</h4>
 <p className="text-xs dark:text-gray-400 text-gray-500">New York, USA • Current Session</p>
 </div>
 </div>
 <span className="text-xs text-primary font-bold">Active Now</span>
 </div>
 </GlassCard>
 </div>
 )}

 {/* TAB 3: Preferences */}
 {activeTab ==='preferences' && (
 <GlassCard className="p-6 md:p-8">
 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
 <FiSliders className="text-primary" /> App Preferences
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
 <div>
 <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-2">Preferred Language</label>
 <select className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-700 border-gray-300 rounded-xl px-4 py-3 dark:text-white text-gray-900 focus:outline-none focus:border-primary appearance-none">
 <option className="dark:bg-gray-900 bg-gray-50">English (US)</option>
 <option className="dark:bg-gray-900 bg-gray-50">Spanish</option>
 <option className="dark:bg-gray-900 bg-gray-50">French</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-2">Preferred City</label>
 <select className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-700 border-gray-300 rounded-xl px-4 py-3 dark:text-white text-gray-900 focus:outline-none focus:border-primary appearance-none">
 <option className="dark:bg-gray-900 bg-gray-50">New York</option>
 <option className="dark:bg-gray-900 bg-gray-50">London</option>
 <option className="dark:bg-gray-900 bg-gray-50">Mumbai</option>
 </select>
 </div>
 </div>

 <div className="mb-8">
 <h4 className="font-bold mb-4">Favourite Genres</h4>
 <div className="flex flex-wrap gap-2">
 {['Action','Comedy','Drama','Sci-Fi','Horror','Romance','Thriller','Animation'].map(genre => (
 <button key={genre} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${['Action','Sci-Fi'].includes(genre) ?'bg-yellow-200 dark:bg-yellow-900/40 border-primary text-primary' :'dark:bg-gray-900 bg-gray-50 dark:border-gray-700 border-gray-300 dark:text-gray-300 text-gray-600 hover:dark:bg-gray-800 bg-gray-100'}`}>
 {genre}
 </button>
 ))}
 </div>
 </div>

 <div className="mb-8 p-4 border dark:border-gray-700 border-gray-300 rounded-xl flex items-center justify-between dark:bg-gray-900 bg-gray-50">
 <div className="flex items-center gap-3">
 <div className="p-2 dark:bg-gray-800 bg-gray-100 rounded-lg">{darkMode ? <FiMoon/> : <FiSun/>}</div>
 <div>
 <h4 className="font-bold">Dark Mode</h4>
 <p className="text-xs dark:text-gray-400 text-gray-500">Toggle dark theme appearance</p>
 </div>
 </div>
 <button 
 onClick={toggleTheme}
 className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ?'bg-primary' :'bg-gray-400'}`}
 >
 <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${darkMode ?'translate-x-7' :'translate-x-1'}`}></div>
 </button>
 </div>

 <GlassButton variant="primary" className="text-black">Save Preferences</GlassButton>
 </GlassCard>
 )}

 {/* TAB 4: Addresses */}
 {activeTab ==='addresses' && (
 <GlassCard className="p-6 md:p-8">
 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
 <FiMapPin className="text-primary" /> Saved Addresses
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="border dark:border-gray-700 border-gray-300 rounded-xl p-5 dark:bg-gray-900 bg-gray-50 relative group">
 <span className="absolute top-4 right-4 text-xs font-bold bg-yellow-200 dark:bg-yellow-900/40 text-primary px-2 py-1 rounded">HOME</span>
 <h3 className="font-bold text-lg mb-2">John Doe</h3>
 <p className="text-sm dark:text-gray-400 text-gray-500 mb-4 line-clamp-2">123 Manhattan Ave, Apt 4B<br/>New York, NY 10001, United States</p>
 <p className="text-sm dark:text-gray-400 text-gray-500 mb-4">Phone: +1 234 567 8900</p>
 <div className="flex gap-2">
 <button className="text-sm text-primary hover:underline">Edit</button>
 <button className="text-sm text-red-500 hover:underline">Remove</button>
 </div>
 </div>

 <button className="border border-dashed dark:border-gray-600 border-gray-400 rounded-xl p-5 flex flex-col items-center justify-center dark:text-gray-400 text-gray-500 hover:dark:text-white text-gray-900 hover:border-primary hover:bg-yellow-50 dark:bg-yellow-900/20 transition-all min-h-[160px]">
 <FiMapPin size={32} className="mb-2" />
 <span className="font-medium">Add New Address</span>
 </button>
 </div>
 </GlassCard>
 )}

 {/* TAB 5: Payment Methods */}
 {activeTab ==='payment' && (
 <GlassCard className="p-6 md:p-8">
 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
 <FiCreditCard className="text-primary" /> Payment Methods
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Mock Card */}
 <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border dark:border-gray-700 border-gray-300 overflow-hidden shadow-xl">
 <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/30 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
 <div className="flex justify-between items-start mb-8">
 <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
 <span className="text-blue-900 font-bold italic">VISA</span>
 </div>
 <span className="px-2 py-1 dark:bg-gray-800 bg-gray-100 rounded text-xs">Default</span>
 </div>
 <h3 className="text-xl font-mono tracking-widest mb-2">**** **** **** 4242</h3>
 <div className="flex justify-between text-xs dark:text-gray-400 text-gray-500 uppercase tracking-wider">
 <span>John Doe</span>
 <span>12/28</span>
 </div>
 </div>

 <button className="border border-dashed dark:border-gray-600 border-gray-400 rounded-2xl p-6 flex flex-col items-center justify-center dark:text-gray-400 text-gray-500 hover:dark:text-white text-gray-900 hover:border-primary hover:bg-yellow-50 dark:bg-yellow-900/20 transition-all min-h-[180px]">
 <FiCreditCard size={32} className="mb-2" />
 <span className="font-medium">Add New Card</span>
 </button>
 </div>
 </GlassCard>
 )}

 {/* TAB 6: Privacy */}
 {activeTab ==='privacy' && (
 <GlassCard className="p-6 md:p-8">
 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
 <FiShield className="text-primary" /> Privacy & Data
 </h2>
 
 <div className="space-y-6">
 <div className="p-6 border dark:border-gray-700 border-gray-300 rounded-xl dark:bg-gray-900 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h4 className="font-bold flex items-center gap-2"><FiDownload className="text-blue-400"/> Download Your Data</h4>
 <p className="text-sm dark:text-gray-400 text-gray-500 mt-1 max-w-md">Get a copy of your personal data, booking history, and preferences associated with your account.</p>
 </div>
 <GlassButton className="whitespace-nowrap">Request Data</GlassButton>
 </div>

 <div className="p-6 border border-red-500/20 rounded-xl bg-red-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h4 className="font-bold text-red-500 flex items-center gap-2"><FiTrash2 /> Delete Account</h4>
 <p className="text-sm text-red-400/80 mt-1 max-w-md">Permanently delete your account and all associated data. This action cannot be undone.</p>
 </div>
 <button className="px-6 py-2 bg-red-500 dark:text-white text-gray-900 font-bold rounded-full hover:bg-red-600 transition-colors whitespace-nowrap shadow-lg shadow-red-500/20">
 Delete Account
 </button>
 </div>
 </div>
 </GlassCard>
 )}
 </motion.div>
 </AnimatePresence>
 </div>

 </div>
 );
};

export default UserProfile;
