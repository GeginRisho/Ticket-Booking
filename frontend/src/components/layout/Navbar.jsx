import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiBell, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Movies', path: '/movies' },
  { name: 'Events', path: '/events' },
  { name: 'Theatres', path: '/theatres' },
  { name: 'Offers', path: '/offers' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' }
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('selectedCity') || CITIES[0]?.id || ''
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    localStorage.setItem('selectedCity', cityId);
    window.dispatchEvent(new Event('cityChanged'));
    const cityName = CITIES.find(c => c.id === cityId)?.city_name || '';
    toast.success(`Location set to ${cityName}`);
  };

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/search?query=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const dashboardPath = user?.role === 'Super Admin' || user?.role === 'Admin'
    ? '/dashboard/admin'
    : user?.role === 'Theatre Owner'
      ? '/dashboard/theatre-owner'
      : user?.role === 'Event Organizer'
        ? '/dashboard/organizer'
        : '/dashboard/customer';

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent bg-white text-gray-900',
          isScrolled ? 'border-gray-200 shadow-md py-3' : 'py-4'
        )}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-black tracking-tighter text-amber-500 flex items-center">
              Ticket<span className="text-gray-900">Show</span>
            </Link>

            {/* City Dropdown */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
              <FiMapPin className="text-amber-500" size={14} />
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="bg-transparent border-0 font-extrabold text-xs text-gray-700 focus:ring-0 focus:outline-none cursor-pointer pr-2"
              >
                {CITIES.map(city => (
                  <option key={city.id} value={city.id} className="text-gray-800">
                    {city.city_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-xs uppercase tracking-wider font-extrabold transition-colors hover:text-amber-500',
                  (link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path))
                    ? 'text-amber-500'
                    : 'text-gray-600'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleNavSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies, events..."
                value={navSearch}
                onChange={e => setNavSearch(e.target.value)}
                className="bg-gray-100 text-xs font-semibold px-4 py-2 pl-9 rounded-full border border-gray-200 text-gray-800 focus:outline-none focus:border-amber-400 w-44 focus:w-56 transition-all"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </form>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard/customer/wishlist" className="p-2 text-gray-600 hover:text-amber-500 transition-colors" title="My Wishlist">
                  <FiHeart size={18} />
                </Link>
                <Link to="/dashboard/customer/notifications" className="relative p-2 text-gray-600 hover:text-amber-500 transition-colors" title="Notifications">
                  <FiBell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
                </Link>
                <Link to={dashboardPath} className="flex items-center gap-1.5 text-xs font-black bg-gray-100 hover:bg-amber-100 hover:text-amber-600 text-gray-800 px-3.5 py-2 rounded-xl border border-gray-200 transition-colors">
                  <FiUser /> Dashboard
                </Link>
                <button onClick={handleLogout} className="text-xs font-black text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-xs font-extrabold text-gray-700 hover:text-amber-500 transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="text-xs font-black bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 py-2 rounded-xl shadow-xs transition-all">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Toggle Menu (Mobile) */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile city selector */}
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="bg-transparent border-0 font-extrabold text-xs text-gray-700 focus:ring-0 focus:outline-none cursor-pointer pr-1"
            >
              {CITIES.map(city => (
                <option key={city.id} value={city.id}>
                  📍 {city.city_name.slice(0,3)}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4 flex flex-col font-black text-sm">
                <form onSubmit={handleNavSearchSubmit} className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search movies, events..."
                    value={navSearch}
                    onChange={e => setNavSearch(e.target.value)}
                    className="w-full bg-gray-100 text-xs font-semibold px-4 py-2.5 pl-9 rounded-xl border border-gray-200 text-gray-800"
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </form>

                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-amber-500 py-1"
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="h-px bg-gray-100 my-2" />

                {isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <Link to="/dashboard/customer/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-amber-500 py-1">
                      My Wishlist
                    </Link>
                    <Link to="/dashboard/customer/notifications" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-amber-500 py-1">
                      Notifications
                    </Link>
                    <Link to={dashboardPath} onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2 text-center rounded-xl bg-gray-100 text-gray-800 border border-gray-200">
                      Dashboard
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full py-2 text-center text-red-500 bg-red-50 rounded-xl">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2.5 text-center text-gray-700 border border-gray-200 rounded-xl">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-2.5 text-center bg-amber-400 text-gray-900 rounded-xl">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
