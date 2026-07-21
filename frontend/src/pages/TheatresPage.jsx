import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiInfo, FiAlertCircle } from 'react-icons/fi';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { getTheatres } from '../services/theatreService';
import { CITIES } from '../utils/constants';

const TheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
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
    const fetchTheatres = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTheatres({ state: selectedState, city: selectedCityName });
        setTheatres(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to fetch theatres. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTheatres();
  }, [selectedState, selectedCityName]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Cinema <span className="text-amber-500">Halls & Theatres</span></h1>
        <p className="text-gray-500">Discover venues and view showtimes in your ticketing region.</p>
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
      ) : theatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {theatres.map((theatre, idx) => (
            <motion.div
              key={theatre.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-xl text-gray-900 group-hover:text-amber-500">
                    {theatre.theatre_name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    theatre.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {theatre.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-500 font-semibold">
                  <p className="flex items-start gap-2">
                    <FiMapPin className="text-amber-500 mt-0.5 flex-shrink-0" size={14} />
                    <span>{theatre.address}</span>
                  </p>
                  {theatre.phone && (
                    <p className="flex items-center gap-2">
                      <FiPhone className="text-amber-500 flex-shrink-0" size={14} />
                      <span>{theatre.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-3xl">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-extrabold">
                  <FiInfo size={14} />
                  <span>Fully air conditioned & dolby surround</span>
                </div>
                <Link to={`/theatre/${theatre.id}`}>
                  <GlassButton variant="primary" className="font-black px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 text-xs shadow-xs hover:from-amber-500">
                    View Showtimes
                  </GlassButton>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl font-bold">No theatres found in this city.</p>
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
