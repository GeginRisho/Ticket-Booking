import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiBell, FiMapPin, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const navLinks = [
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

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

  const rawRole = user?.role?.role_name || user?.role;
  const userRole = rawRole === 'Owner' ? 'Theatre Owner' : (rawRole === 'Organizer' ? 'Event Organizer' : rawRole);

  const dashboardPath = userRole === 'Super Admin'
    ? '/super-admin/dashboard'
    : userRole === 'Admin'
      ? '/admin/dashboard'
      : userRole === 'Theatre Owner'
        ? '/owner/dashboard'
        : '/customer/dashboard';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent bg-white text-gray-900',
        isScrolled ? 'border-gray-200 shadow-md py-3' : 'py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-black tracking-tighter text-amber-500 flex items-center">
            Ticket<span className="text-gray-900">Show</span>
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              'text-xs uppercase tracking-wider font-extrabold transition-colors hover:text-amber-500',
              location.pathname === '/' ? 'text-amber-500' : 'text-gray-600'
            )}
          >
            Home
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-xs uppercase tracking-wider font-extrabold transition-colors hover:text-amber-500',
                location.pathname.startsWith(link.path) ? 'text-amber-500' : 'text-gray-600'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Search */}
          <form onSubmit={handleNavSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={navSearch}
              onChange={e => setNavSearch(e.target.value)}
              className="bg-gray-100 text-xs font-semibold px-4 py-2 pl-9 rounded-full border border-gray-200 text-gray-800 focus:outline-none focus:border-amber-400 w-36 focus:w-48 transition-all"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          </form>

          {/* Location Dropdown */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
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

          {/* User Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/wishlist" className="p-2 text-gray-600 hover:text-amber-500 transition-colors" title="My Wishlist">
                <FiHeart size={18} />
              </Link>
              <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-amber-500 transition-colors" title="Notifications">
                <FiBell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-amber-100 hover:text-amber-600 text-gray-800 rounded-xl border border-gray-200 transition-colors font-black text-xs cursor-pointer"
                >
                  <FiUser />
                  <span>Profile ▼</span>
                </button>
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden text-xs font-extrabold text-gray-700">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-50 hover:text-amber-500 border-b border-gray-100"
                      >
                        My Profile
                      </Link>
                      <Link 
                        to="/customer/dashboard" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-50 hover:text-amber-500 border-b border-gray-100"
                      >
                        My Bookings
                      </Link>
                      <Link 
                        to="/wishlist" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-50 hover:text-amber-500 border-b border-gray-100"
                      >
                        Wishlist
                      </Link>
                      
                      {userRole === 'Theatre Owner' && (
                        <Link 
                          to="/owner/dashboard" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="block px-4 py-3 hover:bg-gray-50 hover:text-amber-500 border-b border-gray-100 text-amber-600"
                        >
                          Theatre Dashboard
                        </Link>
                      )}
                      {userRole === 'Admin' && (
                        <Link 
                          to="/admin/dashboard" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="block px-4 py-3 hover:bg-gray-50 hover:text-amber-500 border-b border-gray-100 text-amber-600"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      {userRole === 'Super Admin' && (
                        <>
                          <Link 
                            to="/super-admin/dashboard" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="block px-4 py-3 hover:bg-gray-50 hover:text-amber-500 border-b border-gray-100 text-amber-600"
                          >
                            Super Admin Dashboard
                          </Link>
                          <Link 
                            to="/owner/dashboard" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="block px-4 py-3 hover:bg-gray-50 hover:text-amber-500 border-b border-gray-100 text-amber-600"
                          >
                            Theatre Dashboard
                          </Link>
                        </>
                      )}
                      
                      <Link 
                        to="/profile" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-50 hover:text-amber-500 border-b border-gray-100"
                      >
                        Settings
                      </Link>
                      
                      <button 
                        onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 font-extrabold"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
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

        {/* MOBILE LAYOUT & HAMBURGER */}
        <div className="lg:hidden flex items-center gap-3">
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
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col font-black text-sm text-left">
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

              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-amber-500 py-1">
                Home
              </Link>
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
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-amber-500 py-1">
                    My Profile
                  </Link>
                  <Link to="/customer/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-amber-500 py-1">
                    My Bookings
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-amber-500 py-1">
                    Wishlist
                  </Link>
                  
                  {userRole === 'Theatre Owner' && (
                    <Link to="/owner/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-amber-600 py-1">
                      Theatre Dashboard
                    </Link>
                  )}
                  {userRole === 'Admin' && (
                    <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-amber-600 py-1">
                      Admin Dashboard
                    </Link>
                  )}
                  {userRole === 'Super Admin' && (
                    <>
                      <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-amber-600 py-1">
                        Super Admin Dashboard
                      </Link>
                      <Link to="/owner/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-amber-600 py-1">
                        Theatre Dashboard
                      </Link>
                    </>
                  )}

                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full py-2.5 text-center text-red-500 bg-red-50 rounded-xl">
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
  );
};

export default Navbar;
