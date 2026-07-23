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

  const getNavLinks = () => {
    return [
      { name: 'Home', path: '/' },
      { name: 'Movies', path: '/movies' },
      { name: 'Events', path: '/events' },
      { name: 'Theatres', path: '/theatres' },
      { name: 'Offers', path: '/offers' },
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' }
    ];
  };

  const [citiesList, setCitiesList] = useState(CITIES);

  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('selectedCity') || CITIES[0]?.id || ''
  );
  
  const [selectedState, setSelectedState] = useState(
    localStorage.getItem('selectedState') || CITIES.find(c => c.id === (localStorage.getItem('selectedCity') || CITIES[0]?.id))?.state || 'Maharashtra'
  );

  const statesList = Array.from(new Set(citiesList.map(c => c.state))).sort();
  const filteredCities = citiesList.filter(c => c.state === selectedState);

  useEffect(() => {
    // Seed initial local storage if empty
    if (!localStorage.getItem('selectedCity')) {
      localStorage.setItem('selectedCity', CITIES[0]?.id || '');
    }
    if (!localStorage.getItem('selectedState')) {
      localStorage.setItem('selectedState', CITIES.find(c => c.id === (CITIES[0]?.id))?.state || 'Maharashtra');
    }

    const loadCities = async () => {
      try {
        const { getCachedCities } = await import('../../services/locationService');
        const list = await getCachedCities();
        if (list && list.length > 0) {
          setCitiesList(list);
          
          // Re-sync states and cities based on loaded cities
          const currentCityId = localStorage.getItem('selectedCity') || list[0]?.id;
          const currentCityObj = list.find(c => c.id === currentCityId);
          if (currentCityObj) {
            setSelectedCity(currentCityId);
            setSelectedState(currentCityObj.state);
          }
        }
      } catch (err) {
        console.error('Failed to load cities in Navbar:', err);
      }
    };
    loadCities();

    // Listen for custom clearLocationCache event if other components clear it
    const handleLocationRefresh = () => {
      loadCities();
    };
    window.addEventListener('locationChanged', handleLocationRefresh);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('locationChanged', handleLocationRefresh);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setSelectedState(stateName);
    localStorage.setItem('selectedState', stateName);

    // Find first city in this state
    const firstCity = citiesList.find(c => c.state === stateName);
    if (firstCity) {
      setSelectedCity(firstCity.id);
      localStorage.setItem('selectedCity', firstCity.id);
    }
    window.dispatchEvent(new Event('locationChanged'));
    toast.success(`State set to ${stateName}`);
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    localStorage.setItem('selectedCity', cityId);
    
    // Auto-sync state if city changed
    const cityObj = citiesList.find(c => c.id === cityId);
    if (cityObj) {
      setSelectedState(cityObj.state);
      localStorage.setItem('selectedState', cityObj.state);
    }

    window.dispatchEvent(new Event('locationChanged'));
    toast.success(`City set to ${cityObj?.city_name || ''}`);
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
        ? '/theatre/dashboard'
        : userRole === 'Event Organizer'
          ? '/organizer/dashboard'
          : '/dashboard';

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
          {getNavLinks().map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-xs uppercase tracking-wider font-extrabold transition-colors hover:text-amber-500',
                location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path)) ? 'text-amber-500' : 'text-gray-600'
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

          {/* State Dropdown */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
            <span className="text-[9px] uppercase text-gray-400 font-black px-1">State</span>
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="bg-transparent border-0 font-extrabold text-xs text-gray-700 focus:ring-0 focus:outline-none cursor-pointer pr-2"
            >
              {statesList.map(st => (
                <option key={st} value={st} className="text-gray-800">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
            <FiMapPin className="text-amber-500" size={14} />
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="bg-transparent border-0 font-extrabold text-xs text-gray-700 focus:ring-0 focus:outline-none cursor-pointer pr-2"
            >
              {filteredCities.map(city => (
                <option key={city.id} value={city.id} className="text-gray-800">
                  {city.city_name}
                </option>
              ))}
            </select>
          </div>

          {/* User Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/bookings" className="text-xs uppercase tracking-wider font-extrabold text-gray-600 hover:text-amber-500 transition-colors">
                My Bookings
              </Link>
              <Link to="/history" className="text-xs uppercase tracking-wider font-extrabold text-gray-600 hover:text-amber-500 transition-colors">
                History
              </Link>
              <Link to="/profile" className="text-xs uppercase tracking-wider font-extrabold text-gray-600 hover:text-amber-500 transition-colors">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-wider font-extrabold text-red-500 hover:text-red-600 transition-colors cursor-pointer focus:outline-none"
              >
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

        {/* MOBILE LAYOUT & HAMBURGER */}
        <div className="lg:hidden flex items-center gap-3">
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="bg-transparent border-0 font-extrabold text-xs text-gray-700 focus:ring-0 focus:outline-none cursor-pointer pr-1 w-14"
          >
            {statesList.map(st => (
              <option key={st} value={st}>
                {st.slice(0, 3)}
              </option>
            ))}
          </select>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="bg-transparent border-0 font-extrabold text-xs text-gray-700 focus:ring-0 focus:outline-none cursor-pointer pr-1 w-14"
          >
            {filteredCities.map(city => (
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

              {getNavLinks().map((link) => (
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
                  <Link to="/bookings" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-amber-500 py-1">
                    My Bookings
                  </Link>
                  <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-amber-500 py-1">
                    History
                  </Link>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-amber-500 py-1">
                    Profile
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full py-2.5 text-center text-red-500 bg-red-50 rounded-xl focus:outline-none">
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
