import React, { useState } from'react';
import { motion } from'framer-motion';
import { Link } from'react-router-dom';
import { useAuth } from'../context/AuthContext';
import GlassCard from'../components/ui/GlassCard';
import GlassButton from'../components/ui/GlassButton';
import GlassInput from'../components/ui/GlassInput';
import { FiEdit2, FiStar, FiCalendar, FiClock, FiMapPin, FiDownload, FiEye, FiSearch, FiFilter, FiTrash2, FiBell, FiGift, FiCreditCard, FiHelpCircle, FiChevronRight, FiChevronLeft, FiMenu } from 'react-icons/fi';

const MOCK = {
 stats: { totalBookings: 12, upcomingBookings: 2, completedBookings: 9, cancelledBookings: 1, eventsAttended: 3, rewardPoints: 2450 },
 upcomingBookings: [
 { id:'BKG-7829-1X', type:'Movie', title:'Dune: Part Two', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Dune', venue:'IMAX, Mall of India', date:'25 July 2026', time:'19:30', seats:'F12, F13', status:'Confirmed' },
 { id:'BKG-9912-3Z', type:'Event', title:'Coldplay Live Concert', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Coldplay', venue:'Wembley Stadium', date:'12 Aug 2026', time:'18:00', seats:'VIP Standing', status:'Confirmed' }
 ],
 bookingHistory: [
 { id:'BKG-1123', title:'Kung Fu Panda 4', type:'Movie', date:'10 June 2026', status:'Completed', amount:'$24' },
 { id:'BKG-2234', title:'Godzilla x Kong', type:'Movie', date:'05 May 2026', status:'Completed', amount:'$18' },
 { id:'BKG-3345', title:'Standup Comedy Night', type:'Event', date:'20 April 2026', status:'Cancelled', amount:'$45' },
 { id:'BKG-4456', title:'The Fall Guy', type:'Movie', date:'15 March 2026', status:'Completed', amount:'$22' },
 ],
 favouriteMovies: [
 { id: 1, title:'Inception', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Inception', rating: 4.8, genre:'Sci-Fi' },
 { id: 2, title:'The Dark Knight', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Batman', rating: 4.9, genre:'Action' },
 { id: 3, title:'Interstellar', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Interstellar', rating: 4.7, genre:'Sci-Fi' }
 ],
 notifications: [
 { id: 1, type:'success', message:'Booking Confirmed for Dune: Part Two', date:'2 hours ago' },
 { id: 2, type:'offer', message:'Get 50% off on your next event booking! Use code EVENT50', date:'1 day ago' },
 { id: 3, type:'reminder', message:'Upcoming Show tomorrow: Coldplay Live Concert', date:'2 days ago' }
 ],
 coupons: [
 { code:'MOVIE20', desc:'20% off on movie tickets', points: 500 },
 { code:'POPCORNFREE', desc:'Free large popcorn combo', points: 1200 }
 ],
 recommendedMovies: [
 { id: 4, title:'Oppenheimer', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Oppenheimer', genre:'Drama' },
 { id: 5, title:'Tenet', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Tenet', genre:'Action' },
 { id: 6, title:'Dunkirk', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Dunkirk', genre:'War' },
 { id: 7, title:'Joker', poster:'https://placehold.co/300x450/1a1a1a/ffffff?text=Joker', genre:'Drama' },
 ],
 paymentMethods: [
 { id: 1, card:'Visa ending in 4242', expiry:'12/28' },
 { id: 2, card:'Mastercard ending in 8899', expiry:'04/27' }
 ]
};

const SectionHeader = ({ title, icon: Icon }) => (
 <div className="flex items-center gap-3 mb-6">
 <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-primary">
 <Icon size={24} />
 </div>
 <h2 className="text-2xl font-bold">{title}</h2>
 </div>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const [historySearch, setHistorySearch] = useState('');
  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      
      <div className="flex flex-1">
        <main className="flex-1 transition-all duration-300 p-4 md:p-8 flex flex-col gap-12">

 {/* 1. Welcome Card & Quick Stats */}
 <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <GlassCard className="p-8 flex flex-col items-center text-center justify-center relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent z-0 hidden"></div>
 <div className="relative z-10">
 <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4 border-4 border-primary shadow-lg overflow-hidden">
 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName ||'User'}`} alt="Profile" className="w-full h-full object-cover" />
 </div>
 <h2 className="text-3xl font-bold mb-1">{user?.fullName ||'User Name'}</h2>
 <p className="dark:text-gray-400 text-gray-500 mb-2">{user?.email ||'user@example.com'}</p>
 <div className="inline-block px-3 py-1 rounded-full bg-yellow-200 dark:bg-yellow-900/40 text-primary text-sm font-semibold mb-6">
 Gold Member since 2025
 </div>
 <Link to="/profile">
 <GlassButton className="w-full flex items-center justify-center gap-2">
 <FiEdit2 size={16} /> Edit Profile
 </GlassButton>
 </Link>
 </div>
 </GlassCard>

 <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
 {[
 { label:'Total Bookings', value: MOCK.stats.totalBookings, color:'text-blue-400' },
 { label:'Upcoming', value: MOCK.stats.upcomingBookings, color:'text-yellow-400' },
 { label:'Completed', value: MOCK.stats.completedBookings, color:'text-green-400' },
 { label:'Cancelled', value: MOCK.stats.cancelledBookings, color:'text-red-400' },
 ].map((stat, idx) => (
 <GlassCard key={idx} className="p-6 flex flex-col justify-center border-gray-800 hover:dark:border-gray-600 border-gray-400 transition-all hover:-translate-y-1">
 <p className="dark:text-gray-400 text-gray-500 text-sm mb-2">{stat.label}</p>
 <h3 className={`text-4xl font-bold ${stat.color}`}>{stat.value}</h3>
 </GlassCard>
 ))}
 </div>
 </section>

  {/* 3. Upcoming Bookings */}
  <section id="upcoming-bookings">
  <SectionHeader title="Upcoming Bookings" icon={FiCalendar} />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {MOCK.upcomingBookings.map((booking) => (
 <GlassCard key={booking.id} className="flex flex-col sm:flex-row gap-4 p-4 overflow-hidden relative group">
 <div className="absolute top-0 right-0 bg-yellow-200 dark:bg-yellow-900/40 text-primary px-3 py-1 rounded-bl-xl text-xs font-bold z-10">
 {booking.status}
 </div>
 <img src={booking.poster} alt={booking.title} className="w-full sm:w-32 h-48 sm:h-auto object-cover rounded-xl shadow-md" />
 <div className="flex-1 flex flex-col justify-between py-2">
 <div>
 <div className="text-xs dark:text-gray-400 text-gray-500 uppercase tracking-wider mb-1">{booking.type} • {booking.id}</div>
 <h3 className="text-xl font-bold mb-2">{booking.title}</h3>
 <div className="space-y-1 text-sm dark:text-gray-300 text-gray-600">
 <p className="flex items-center gap-2"><FiMapPin className="text-primary"/> {booking.venue}</p>
 <p className="flex items-center gap-2"><FiCalendar className="text-primary"/> {booking.date} at {booking.time}</p>
 <p className="flex items-center gap-2"><FiStar className="text-primary"/> Seats: {booking.seats}</p>
 </div>
 </div>
 <div className="flex flex-col sm:flex-row gap-2 mt-4">
 <GlassButton variant="primary" className="flex-1 text-sm py-2 flex items-center justify-center gap-2"><FiDownload/> Ticket</GlassButton>
 <GlassButton className="flex-1 text-sm py-2 flex items-center justify-center gap-2"><FiEye/> Details</GlassButton>
 </div>
 </div>
 </GlassCard>
 ))}
 </div>
 </section>

  {/* 4. Booking History */}
  <section id="history">
  <SectionHeader title="Booking History" icon={FiClock} />
 <GlassCard className="p-6">
 <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
 <GlassInput 
 icon={FiSearch} 
 placeholder="Search history..." 
 value={historySearch} 
 onChange={e => setHistorySearch(e.target.value)} 
 className="w-full md:w-64"
 />
 <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 hide-scrollbar">
 <GlassButton className="text-sm py-2 px-4 whitespace-nowrap"><FiFilter className="inline mr-2"/> All</GlassButton>
 <GlassButton className="text-sm py-2 px-4 whitespace-nowrap">Movies</GlassButton>
 <GlassButton className="text-sm py-2 px-4 whitespace-nowrap">Events</GlassButton>
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[600px]">
 <thead>
 <tr className="border-b dark:border-gray-700 border-gray-300 dark:text-gray-400 text-gray-500">
 <th className="p-4 font-medium">Booking ID</th>
 <th className="p-4 font-medium">Title</th>
 <th className="p-4 font-medium">Date</th>
 <th className="p-4 font-medium">Amount</th>
 <th className="p-4 font-medium">Status</th>
 </tr>
 </thead>
 <tbody>
 {MOCK.bookingHistory.filter(h => h.title.toLowerCase().includes(historySearch.toLowerCase())).map((item, idx) => (
 <tr key={idx} className="border-b border-gray-800 hover:dark:bg-gray-900 bg-gray-50 transition-colors">
 <td className="p-4 font-mono text-sm dark:text-gray-300 text-gray-600">{item.id}</td>
 <td className="p-4 font-bold">{item.title} <span className="text-xs text-gray-500 font-normal ml-2 px-2 py-0.5 rounded dark:bg-gray-800 bg-gray-100">{item.type}</span></td>
 <td className="p-4 dark:text-gray-300 text-gray-600">{item.date}</td>
 <td className="p-4 text-primary font-medium">{item.amount}</td>
 <td className="p-4">
 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status ==='Completed' ?'bg-green-500/20 text-green-400' :'bg-red-500/20 text-red-400'}`}>
 {item.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="flex justify-between items-center mt-6 text-sm dark:text-gray-400 text-gray-500">
 <span>Showing 1 to 4 of 12 entries</span>
 <div className="flex gap-2">
 <button className="p-2 dark:bg-gray-900 bg-gray-50 rounded hover:dark:bg-gray-800 bg-gray-100"><FiChevronLeft/></button>
 <button className="px-3 py-1 bg-primary text-primary-text rounded font-bold">1</button>
 <button className="px-3 py-1 dark:bg-gray-900 bg-gray-50 rounded hover:dark:bg-gray-800 bg-gray-100">2</button>
 <button className="px-3 py-1 dark:bg-gray-900 bg-gray-50 rounded hover:dark:bg-gray-800 bg-gray-100">3</button>
 <button className="p-2 dark:bg-gray-900 bg-gray-50 rounded hover:dark:bg-gray-800 bg-gray-100"><FiChevronRight/></button>
 </div>
 </div>
 </GlassCard>
 </section>



        </main>
      </div>
  </div>
  );
};

export default UserDashboard;
