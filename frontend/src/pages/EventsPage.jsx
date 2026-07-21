import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiFilter, FiAlertCircle } from 'react-icons/fi';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { getEvents } from '../services/eventService';
import { CITIES } from '../utils/constants';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(['All', 'Concert', 'Sports', 'Standup Comedy', 'Theatre Play', 'Music Festival', 'Workshops']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedState, setSelectedState] = useState(localStorage.getItem('selectedState') || '');
  const [selectedCityName, setSelectedCityName] = useState(() => {
    const cityId = localStorage.getItem('selectedCity') || '';
    const cityObj = CITIES.find(c => c.id === cityId);
    return cityObj ? cityObj.city_name : '';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const cityId = localStorage.getItem('selectedCity') || '';
      const cityObj = CITIES.find(c => c.id === cityId);
      setSelectedCityName(cityObj ? cityObj.city_name : '');
      setSelectedState(localStorage.getItem('selectedState') || '');
    };
    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEvents({ state: selectedState, city: selectedCityName });
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to fetch events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedState, selectedCityName]);

  const filteredEvents = activeCategory === 'All'
    ? events
    : events.filter(e => e.category?.category_name === activeCategory);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Explore <span className="text-amber-500">Events</span></h1>
          <p className="text-gray-500">Live experiences, concerts, sports, comedy shows, and plays.</p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
          <FiFilter className="text-amber-500 mr-2 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-black transition-all ${
                activeCategory === cat
                  ? 'bg-amber-400 text-gray-900 shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FiAlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-xl font-bold">{error}</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, idx) => {
            const price = event.event_tickets?.[0]?.price || '499';
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                className="group relative rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="h-48 bg-gray-100 overflow-hidden relative">
                  <img
                    src={event.banner || 'https://placehold.co/600x400?text=Event+Banner'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 bg-amber-400 text-gray-900 px-3 py-1 rounded-full text-xs font-black shadow-md">
                    {event.category?.category_name || 'Event'}
                  </span>
                </div>
                
                <div className="p-6 space-y-4 flex-grow">
                  <h3 className="font-black text-xl text-gray-900 line-clamp-1 group-hover:text-amber-500 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-xs text-gray-500 font-semibold">
                    <p className="flex items-center gap-1.5"><FiCalendar className="text-amber-500" /> {new Date(event.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="flex items-center gap-1.5"><FiMapPin className="text-amber-500" /> {event.venue}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-3xl">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-extrabold">Price starts at</p>
                    <p className="font-black text-lg text-gray-900">₹{price}</p>
                  </div>
                  <Link to={`/event/${event.id}`}>
                    <GlassButton variant="primary" className="font-black px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 text-xs shadow-xs hover:from-amber-500">
                      Book Now
                    </GlassButton>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl font-bold">No events found in this city.</p>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
