import React, { useState, useEffect } from'react';
import { Link, useLocation, useNavigate } from'react-router-dom';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiSun, FiMoon } from'react-icons/fi';
import { motion, AnimatePresence } from'framer-motion';
import { cn } from'../../utils/cn';
import { useAuth } from'../../context/AuthContext';
import { useTheme } from'../../context/ThemeContext';
import UserSidebar from '../dashboard/UserSidebar';
import { toast } from'react-hot-toast';

const navLinks = [
 { name:'Movies', path:'/movies' },
 { name:'Events', path:'/events' },
 { name:'Theatres', path:'/theatres' },
];

const Navbar = () => {
 const [isScrolled, setIsScrolled] = useState(false);
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 const location = useLocation();
 const navigate = useNavigate();
 const { isAuthenticated, user, logout } = useAuth();
 const { theme, toggleTheme } = useTheme();

 useEffect(() => {
 const handleScroll = () => {
 setIsScrolled(window.scrollY > 20);
 };
 window.addEventListener('scroll', handleScroll);
 return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 useEffect(() => {
 setIsDrawerOpen(false);
 }, [location.pathname]);

 const handleLogout = async () => {
 await logout();
 toast.success('Logged out successfully');
 navigate('/');
 };

  const isDashboardRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/profile');
  const showSidebar = isAuthenticated && isDashboardRoute;

 return (
 <>
  <header
  className={cn(
  'fixed top-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
  showSidebar ? 'md:left-72 left-0' : 'left-0',
  isScrolled ?'bg-secondary/90 backdrop-blur-md border-border shadow-lg py-4' :'bg-transparent py-6'
  )}
  >
 <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
  <div className="flex items-center gap-4">
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="md:hidden p-2 -ml-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <FiMenu size={24} />
      </button>
    <Link to="/" className={cn("text-2xl font-bold tracking-tighter text-primary", isAuthenticated ? "md:hidden" : "")}>
    Ticket<span className="dark:text-white text-gray-900">Show</span>
    </Link>
  </div>

 {/* Desktop Nav */}
 <nav className="hidden md:flex items-center gap-8">
 {navLinks.map((link) => (
 <Link
 key={link.path}
 to={link.path}
 className={cn(
'text-sm font-medium transition-colors hover:text-primary',
 location.pathname.startsWith(link.path) ?'text-primary' :'dark:text-gray-300 text-gray-600'
 )}
 >
 {link.name}
 </Link>
 ))}
 
 {/* Partner with Us Dropdown */}
 <div className="relative group cursor-pointer">
   <div className="text-sm font-medium dark:text-gray-300 text-gray-600 hover:text-primary transition-colors py-2 flex items-center gap-1">
     Partner with Us
     <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
   </div>
   <div className="absolute left-0 top-full w-56 bg-white dark:bg-gray-900/95 border dark:border-gray-700 border-gray-300 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-left scale-95 group-hover:scale-100">
     <div className="px-2 py-2 flex flex-col gap-1">
       <Link to="/register" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:dark:bg-gray-800 hover:bg-gray-100 text-sm transition-colors dark:text-white text-gray-900 font-medium">
         Become an Event Organizer
       </Link>
       <Link to="/register" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:dark:bg-gray-800 hover:bg-gray-100 text-sm transition-colors dark:text-white text-gray-900 font-medium">
         Become a Theatre Owner
       </Link>
       <div className="h-px dark:bg-gray-800 bg-gray-200 my-1"></div>
       <Link to="/login" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:dark:bg-gray-800 hover:bg-gray-100 text-sm transition-colors dark:text-white text-gray-900 font-medium">
         Partner Login
       </Link>
     </div>
   </div>
 </div>
 </nav>

  {/* Desktop Actions */}
  <div className="hidden md:flex items-center gap-4">
  <button onClick={toggleTheme} className="text-text-secondary hover:text-primary transition-colors p-2">
  {theme ==='dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
  </button>
  
  <Link to="/search" className="flex items-center gap-2 bg-input px-4 py-2 rounded-full border border-border text-text-secondary hover:border-primary transition-colors">
    <FiSearch size={16} />
    <span className="text-sm">Search...</span>
  </Link>

  <button className="relative text-text-secondary hover:text-primary transition-colors p-2">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary rounded-full"></span>
  </button>
  {isAuthenticated ? (
  <div className="relative group">
  <div className="flex items-center gap-2 cursor-pointer py-2">
  <div className="w-9 h-9 rounded-full overflow-hidden bg-card border border-border">
  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName ||'User'}`} alt="avatar" className="w-full h-full object-cover" />
  </div>
  </div>
 
 {/* Dropdown Menu */}
 <div className="absolute right-0 top-full w-56 bg-gray-900/95 border dark:border-gray-700 border-gray-300 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right scale-95 group-hover:scale-100">
 <div className="p-2 border-b border-gray-800 mb-1">
 <p className="text-xs dark:text-gray-400 text-gray-500 px-3">{user?.email}</p>
 </div>
 <div className="px-2 pb-2 flex flex-col gap-1">
 <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:dark:bg-gray-800 bg-gray-100 text-sm transition-colors dark:text-white text-gray-900 font-medium">
 Dashboard
 </Link>
 <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:dark:bg-gray-800 bg-gray-100 text-sm transition-colors dark:text-white text-gray-900 font-medium">
 Profile Settings
 </Link>
  {user?.role === 'theatre_owner' && (
  <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-yellow-200 dark:bg-yellow-900/40 text-sm transition-colors text-primary font-medium">
  Admin Dashboard
  </Link>
  )}
  {user?.role === 'event_organizer' && (
  <Link to="/organizer/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-yellow-200 dark:bg-yellow-900/40 text-sm transition-colors text-primary font-medium">
  Organizer Dashboard
  </Link>
  )}
 <div className="h-px dark:bg-gray-800 bg-gray-100 my-1"></div>
 <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500/20 text-sm transition-colors text-red-500 font-medium">
 <FiLogOut /> Logout
 </button>
 </div>
 </div>
 </div>
 ) : (
 <Link
 to="/login"
 className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
 >
 <FiUser /> Sign In
 </Link>
 )}
 </div>

 {/* Mobile Menu Toggle */}
 <div className="md:hidden flex items-center gap-2">
 <button onClick={toggleTheme} className="dark:text-gray-300 text-gray-600 p-2">
 {theme ==='dark' ? <FiSun size={24} /> : <FiMoon size={24} />}
 </button>
 </div>
 </div>
 </header>

  {/* Global Drawer (Mobile) & Permanent Sidebar (Desktop if Auth) */}
  <UserSidebar isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} isAuthenticated={isAuthenticated} showPermanent={showSidebar} />
  </>
 );
};

export default Navbar;
