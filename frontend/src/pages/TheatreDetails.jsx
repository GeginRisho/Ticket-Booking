import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiCalendar, FiClock, FiVideo, FiShield, FiAlertCircle } from 'react-icons/fi';
import { getTheatreDetails } from '../services/theatreService';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';

const TheatreDetails = () => {
  const { id } = useParams();
  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTheatreDetails(id);
        const dataObj = res?.data || res;
        setTheatre(dataObj?.theatre || dataObj);
      } catch (err) {
        setError('Failed to load theatre details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (error || !theatre) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <FiAlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">{error || 'Theatre not found'}</h2>
        <Link to="/theatres" className="text-amber-500 font-bold hover:underline">
          Back to all theatres
        </Link>
      </div>
    );
  }

  const shows = theatre.shows || [];

  return (
    <div className="min-h-screen bg-gray-50 text-left">
      {/* Header Panel */}
      <div className="bg-white border-b border-gray-200 py-10 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-600 font-extrabold text-[10px] uppercase tracking-wider">
            ★ PREMIUM THEATRE PARTNER
          </span>
          
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 tracking-tight">
            {theatre.theatre_name}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 text-xs font-semibold text-gray-500">
            <p className="flex items-center gap-1.5"><FiMapPin className="text-amber-500" /> {theatre.address}</p>
            {theatre.phone && (
              <p className="flex items-center gap-1.5"><FiPhone className="text-amber-500" /> {theatre.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Showtimes & Movies */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Current Showtimes</h2>
            
            {shows.length > 0 ? (
              <div className="space-y-6">
                {shows.map((show) => (
                  <Card key={show.id} className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5">
                      <h3 className="font-black text-lg text-gray-900">{show.movie?.title || 'Featured Movie'}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                        <span className="flex items-center gap-1"><FiCalendar /> {new Date(show.show_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><FiClock /> {show.show_time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><FiVideo /> Screen {show.screen_number || 1}</span>
                      </div>
                    </div>

                    <Link to={`/book-seat/${show.id}`}>
                      <button className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-black rounded-xl text-xs shadow-sm transition-all whitespace-nowrap cursor-pointer">
                        Book Seats
                      </button>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white border border-gray-200 rounded-3xl shadow-sm text-gray-500 font-semibold">
                No shows scheduled for today. Check back later!
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Venue Info</h2>
            
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Ticketing Support</p>
                <p className="text-xs text-gray-700 font-bold">M-Ticket / Box Office pick-up supported</p>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-3">
                <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Facilities available</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-600">
                  <div className="flex items-center gap-1.5"><FiShield className="text-emerald-500" /> Air Conditioning</div>
                  <div className="flex items-center gap-1.5"><FiShield className="text-emerald-500" /> Dolby Surround</div>
                  <div className="flex items-center gap-1.5"><FiShield className="text-emerald-500" /> Snack Bar</div>
                  <div className="flex items-center gap-1.5"><FiShield className="text-emerald-500" /> Parking Area</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TheatreDetails;
